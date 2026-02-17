import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma';
import { GuardEvaluatorService, GuardExpression } from './guard-evaluator.service';
import { KafkaService, WorkflowKafkaEvent } from '../kafka/kafka.service';
import { StartWorkflowDto } from './dto/start-workflow.dto';
import { TransitionWorkflowDto } from './dto/transition-workflow.dto';

@Injectable()
export class EngineService {
  private readonly logger = new Logger(EngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly guardEvaluator: GuardEvaluatorService,
    private readonly kafka: KafkaService,
  ) {}

  /**
   * Start a new workflow instance
   */
  async start(dto: StartWorkflowDto) {
    // Resolve definition
    let definitionId = dto.definitionId;

    if (!definitionId) {
      const definition = await this.prisma.workflowDefinition.findFirst({
        where: {
          entityType: dto.entityType,
          procedureType: dto.procedureType ?? null,
          organisationId: dto.organisationId ?? null,
          isActive: true,
        },
        orderBy: { version: 'desc' },
      });

      if (!definition) {
        throw new NotFoundException(
          `Aucune définition de workflow active pour entityType="${dto.entityType}" procedureType="${dto.procedureType ?? 'null'}"`,
        );
      }
      definitionId = definition.id;
    }

    // Find START node
    const startNode = await this.prisma.workflowNode.findFirst({
      where: { definitionId, nodeType: 'START' },
    });

    if (!startNode) {
      throw new BadRequestException('La définition de workflow ne contient pas de nœud START');
    }

    // Check for existing active instance
    const existingInstance = await this.prisma.workflowInstance.findFirst({
      where: {
        entityType: dto.entityType,
        entityId: dto.entityId,
        status: 'ACTIVE',
      },
    });

    if (existingInstance) {
      throw new ConflictException(
        `Une instance de workflow active existe déjà pour ${dto.entityType}:${dto.entityId}`,
      );
    }

    // Find first transition from START to advance immediately
    const firstTransition = await this.prisma.workflowTransition.findFirst({
      where: { definitionId, fromNodeId: startNode.id },
      include: { toNode: true },
    });

    const targetNode = firstTransition ? firstTransition.toNode : startNode;

    const instance = await this.prisma.$transaction(async (tx) => {
      const inst = await tx.workflowInstance.create({
        data: {
          definitionId,
          organisationId: dto.organisationId,
          entityType: dto.entityType,
          entityId: dto.entityId,
          currentNodeId: targetNode.id,
          status: 'ACTIVE',
          context: (dto.context as Prisma.InputJsonValue) ?? undefined,
        },
        include: {
          currentNode: true,
          definition: true,
        },
      });

      // Record start event
      await tx.workflowEvent.create({
        data: {
          instanceId: inst.id,
          fromNodeId: startNode.id,
          toNodeId: targetNode.id,
          transitionId: firstTransition?.id,
          action: 'WORKFLOW_STARTED',
          actorId: dto.actorId,
          ipAddress: dto.ipAddress,
        },
      });

      return inst;
    });

    await this.kafka.emit({
      eventType: 'WORKFLOW_STARTED',
      instanceId: instance.id,
      definitionId: instance.definitionId,
      entityType: instance.entityType,
      entityId: instance.entityId,
      fromNodeCode: startNode.code,
      toNodeCode: targetNode.code,
      action: 'WORKFLOW_STARTED',
      actorId: dto.actorId,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(
      'Workflow démarré: instance=%s entity=%s:%s node=%s',
      instance.id,
      dto.entityType,
      dto.entityId,
      targetNode.code,
    );

    return instance;
  }

  /**
   * Execute a transition on a workflow instance
   */
  async transition(instanceId: string, dto: TransitionWorkflowDto) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      include: {
        currentNode: true,
        definition: true,
      },
    });

    if (!instance) {
      throw new NotFoundException('Instance de workflow non trouvée');
    }

    if (instance.status !== 'ACTIVE') {
      throw new BadRequestException(
        `L'instance est en statut "${instance.status}", seules les instances ACTIVE peuvent transitionner`,
      );
    }

    if (!instance.currentNode) {
      throw new BadRequestException('L\'instance n\'a pas de nœud courant');
    }

    // Find matching transition
    const transitions = await this.prisma.workflowTransition.findMany({
      where: {
        definitionId: instance.definitionId,
        fromNodeId: instance.currentNodeId!,
        action: dto.action,
      },
      include: { toNode: true },
    });

    if (transitions.length === 0) {
      throw new BadRequestException(
        `Aucune transition "${dto.action}" disponible depuis le nœud "${instance.currentNode.code}"`,
      );
    }

    // Merge instance context with provided context
    const mergedContext: Record<string, unknown> = {
      ...(instance.context as Record<string, unknown> | null),
      ...dto.context,
    };

    // Evaluate guards to find the matching transition
    let matchedTransition = transitions[0];
    if (transitions.length > 1) {
      const guarded = transitions.find((t) =>
        this.guardEvaluator.evaluate(
          t.guardExpression as GuardExpression | GuardExpression[] | null,
          mergedContext,
        ),
      );
      if (!guarded) {
        throw new BadRequestException(
          'Aucune transition ne satisfait les conditions de garde pour le contexte fourni',
        );
      }
      matchedTransition = guarded;
    } else {
      // Single transition — still validate guard
      const guardOk = this.guardEvaluator.evaluate(
        matchedTransition.guardExpression as GuardExpression | GuardExpression[] | null,
        mergedContext,
      );
      if (!guardOk) {
        throw new BadRequestException(
          'Les conditions de garde ne sont pas satisfaites pour cette transition',
        );
      }
    }

    // Validate requirements
    if (matchedTransition.requiresComment && !dto.comment) {
      throw new BadRequestException('Un commentaire est requis pour cette transition');
    }
    if (matchedTransition.requiresSignature && !dto.signatureId) {
      throw new BadRequestException('Une signature est requise pour cette transition');
    }
    if (matchedTransition.requiresAttachment && (!dto.attachments || dto.attachments.length === 0)) {
      throw new BadRequestException('Au moins une pièce jointe est requise pour cette transition');
    }

    const toNode = matchedTransition.toNode;
    const isEnd = toNode.nodeType === 'END';
    const isLoop = toNode.nodeType === 'LOOP';

    const updated = await this.prisma.$transaction(async (tx) => {
      // Create immutable event
      await tx.workflowEvent.create({
        data: {
          instanceId,
          fromNodeId: instance.currentNodeId!,
          toNodeId: toNode.id,
          transitionId: matchedTransition.id,
          action: dto.action,
          actorId: dto.actorId,
          comment: dto.comment,
          attachments: (dto.attachments as Prisma.InputJsonValue) ?? undefined,
          signatureId: dto.signatureId,
          ipAddress: dto.ipAddress,
        },
      });

      // Update instance
      return tx.workflowInstance.update({
        where: { id: instanceId },
        data: {
          currentNodeId: toNode.id,
          status: isEnd ? 'COMPLETED' : 'ACTIVE',
          completedAt: isEnd ? new Date() : undefined,
          loopCount: isLoop ? { increment: 1 } : undefined,
          context: dto.context ? (mergedContext as Prisma.InputJsonValue) : undefined,
        },
        include: {
          currentNode: true,
          definition: true,
        },
      });
    });

    const eventType: WorkflowKafkaEvent['eventType'] = isEnd
      ? 'WORKFLOW_COMPLETED'
      : 'WORKFLOW_TRANSITIONED';

    await this.kafka.emit({
      eventType,
      instanceId,
      definitionId: instance.definitionId,
      entityType: instance.entityType,
      entityId: instance.entityId,
      fromNodeCode: instance.currentNode.code,
      toNodeCode: toNode.code,
      action: dto.action,
      actorId: dto.actorId,
      timestamp: new Date().toISOString(),
      metadata: dto.context,
    });

    this.logger.log(
      'Transition: instance=%s %s -> %s (action=%s)',
      instanceId,
      instance.currentNode.code,
      toNode.code,
      dto.action,
    );

    return updated;
  }

  /**
   * Suspend a workflow instance
   */
  async suspend(instanceId: string, actorId: string, reason?: string) {
    const instance = await this.getInstance(instanceId);

    if (instance.status !== 'ACTIVE') {
      throw new BadRequestException('Seules les instances ACTIVE peuvent être suspendues');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.workflowEvent.create({
        data: {
          instanceId,
          fromNodeId: instance.currentNodeId,
          action: 'WORKFLOW_SUSPENDED',
          actorId,
          comment: reason,
        },
      });

      return tx.workflowInstance.update({
        where: { id: instanceId },
        data: { status: 'SUSPENDED' },
        include: { currentNode: true, definition: true },
      });
    });

    await this.kafka.emit({
      eventType: 'WORKFLOW_SUSPENDED',
      instanceId,
      definitionId: instance.definitionId,
      entityType: instance.entityType,
      entityId: instance.entityId,
      action: 'WORKFLOW_SUSPENDED',
      actorId,
      timestamp: new Date().toISOString(),
    });

    return updated;
  }

  /**
   * Resume a suspended workflow instance
   */
  async resume(instanceId: string, actorId: string) {
    const instance = await this.getInstance(instanceId);

    if (instance.status !== 'SUSPENDED') {
      throw new BadRequestException('Seules les instances SUSPENDED peuvent être reprises');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.workflowEvent.create({
        data: {
          instanceId,
          fromNodeId: instance.currentNodeId,
          action: 'WORKFLOW_RESUMED',
          actorId,
        },
      });

      return tx.workflowInstance.update({
        where: { id: instanceId },
        data: { status: 'ACTIVE' },
        include: { currentNode: true, definition: true },
      });
    });

    await this.kafka.emit({
      eventType: 'WORKFLOW_RESUMED',
      instanceId,
      definitionId: instance.definitionId,
      entityType: instance.entityType,
      entityId: instance.entityId,
      action: 'WORKFLOW_RESUMED',
      actorId,
      timestamp: new Date().toISOString(),
    });

    return updated;
  }

  /**
   * Cancel a workflow instance
   */
  async cancel(instanceId: string, actorId: string, reason?: string) {
    const instance = await this.getInstance(instanceId);

    if (instance.status === 'COMPLETED' || instance.status === 'CANCELLED') {
      throw new BadRequestException(`L'instance est déjà en statut "${instance.status}"`);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.workflowEvent.create({
        data: {
          instanceId,
          fromNodeId: instance.currentNodeId,
          action: 'WORKFLOW_CANCELLED',
          actorId,
          comment: reason,
        },
      });

      return tx.workflowInstance.update({
        where: { id: instanceId },
        data: { status: 'CANCELLED', completedAt: new Date() },
        include: { currentNode: true, definition: true },
      });
    });

    await this.kafka.emit({
      eventType: 'WORKFLOW_CANCELLED',
      instanceId,
      definitionId: instance.definitionId,
      entityType: instance.entityType,
      entityId: instance.entityId,
      action: 'WORKFLOW_CANCELLED',
      actorId,
      timestamp: new Date().toISOString(),
    });

    return updated;
  }

  /**
   * Get current state of a workflow instance
   */
  async getCurrentState(instanceId: string) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      include: {
        currentNode: true,
        definition: { select: { id: true, name: true, entityType: true } },
      },
    });

    if (!instance) {
      throw new NotFoundException('Instance de workflow non trouvée');
    }

    // Get available transitions from current node
    const availableTransitions = instance.currentNodeId
      ? await this.prisma.workflowTransition.findMany({
          where: {
            definitionId: instance.definitionId,
            fromNodeId: instance.currentNodeId,
          },
          include: { toNode: true },
        })
      : [];

    return {
      ...instance,
      availableTransitions: availableTransitions.map((t) => ({
        action: t.action,
        label: t.label,
        toNode: t.toNode.code,
        toNodeLabel: t.toNode.label,
        requiresComment: t.requiresComment,
        requiresSignature: t.requiresSignature,
        requiresAttachment: t.requiresAttachment,
        hasGuard: !!t.guardExpression,
      })),
    };
  }

  /**
   * Get complete event history for a workflow instance
   */
  async getHistory(instanceId: string) {
    await this.getInstance(instanceId);

    return this.prisma.workflowEvent.findMany({
      where: { instanceId },
      include: {
        fromNode: { select: { code: true, label: true } },
        toNode: { select: { code: true, label: true } },
        transition: { select: { action: true, label: true } },
      },
      orderBy: { timestamp: 'asc' },
    });
  }

  /**
   * Find instances by entity
   */
  async findByEntity(entityType: string, entityId: string) {
    return this.prisma.workflowInstance.findMany({
      where: { entityType, entityId },
      include: {
        currentNode: true,
        definition: { select: { id: true, name: true } },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  /**
   * Find tasks (instances at a specific node role) for the DNCMP queue or other roles.
   */
  async findTasks(query: {
    assigneeRole?: string;
    status?: string;
    organisationId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.WorkflowInstanceWhereInput = {
      status: (query.status as 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'SUSPENDED') ?? 'ACTIVE',
      ...(query.organisationId ? { organisationId: query.organisationId } : {}),
      ...(query.assigneeRole
        ? { currentNode: { assigneeRole: query.assigneeRole } }
        : {}),
    };

    const [instances, total] = await Promise.all([
      this.prisma.workflowInstance.findMany({
        where,
        skip,
        take: limit,
        include: {
          currentNode: true,
          definition: { select: { id: true, name: true, entityType: true, organisationId: true } },
        },
        orderBy: { startedAt: 'desc' },
      }),
      this.prisma.workflowInstance.count({ where }),
    ]);

    return {
      data: instances.map((inst) => ({
        instanceId: inst.id,
        entityType: inst.entityType,
        entityId: inst.entityId,
        organisationId: inst.organisationId,
        currentNode: inst.currentNode
          ? {
              code: inst.currentNode.code,
              label: inst.currentNode.label,
              assigneeRole: inst.currentNode.assigneeRole,
            }
          : null,
        definitionName: inst.definition.name,
        startedAt: inst.startedAt,
        status: inst.status,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async getInstance(instanceId: string) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: instanceId },
    });

    if (!instance) {
      throw new NotFoundException('Instance de workflow non trouvée');
    }

    return instance;
  }
}
