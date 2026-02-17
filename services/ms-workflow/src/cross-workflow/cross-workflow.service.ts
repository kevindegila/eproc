import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EngineService } from '../engine/engine.service';

@Injectable()
export class CrossWorkflowService {
  private readonly logger = new Logger(CrossWorkflowService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly engineService: EngineService,
  ) {}

  /**
   * Suspend all active workflow instances for a given entity.
   * Used when a cross-cutting event (e.g., recours) blocks all related workflows.
   */
  async suspendByEntity(
    entityType: string,
    entityId: string,
    actorId: string,
    reason?: string,
  ) {
    const instances = await this.prisma.workflowInstance.findMany({
      where: { entityType, entityId, status: 'ACTIVE' },
    });

    if (instances.length === 0) {
      throw new NotFoundException(
        `Aucune instance active pour ${entityType}:${entityId}`,
      );
    }

    const results = [];
    for (const instance of instances) {
      const result = await this.engineService.suspend(instance.id, actorId, reason);
      results.push(result);
    }

    this.logger.log(
      'Suspension en cascade: %d instance(s) pour %s:%s',
      results.length,
      entityType,
      entityId,
    );

    return {
      message: `${results.length} instance(s) suspendue(s)`,
      instances: results,
    };
  }

  /**
   * Resume all suspended workflow instances for a given entity.
   */
  async resumeByEntity(
    entityType: string,
    entityId: string,
    actorId: string,
  ) {
    const instances = await this.prisma.workflowInstance.findMany({
      where: { entityType, entityId, status: 'SUSPENDED' },
    });

    if (instances.length === 0) {
      throw new NotFoundException(
        `Aucune instance suspendue pour ${entityType}:${entityId}`,
      );
    }

    const results = [];
    for (const instance of instances) {
      const result = await this.engineService.resume(instance.id, actorId);
      results.push(result);
    }

    this.logger.log(
      'Reprise en cascade: %d instance(s) pour %s:%s',
      results.length,
      entityType,
      entityId,
    );

    return {
      message: `${results.length} instance(s) reprise(s)`,
      instances: results,
    };
  }

  /**
   * Cancel all active/suspended instances for an entity.
   * Used on entity deletion or major cancellation events.
   */
  async cancelByEntity(
    entityType: string,
    entityId: string,
    actorId: string,
    reason?: string,
  ) {
    const instances = await this.prisma.workflowInstance.findMany({
      where: {
        entityType,
        entityId,
        status: { in: ['ACTIVE', 'SUSPENDED'] },
      },
    });

    if (instances.length === 0) {
      throw new NotFoundException(
        `Aucune instance active ou suspendue pour ${entityType}:${entityId}`,
      );
    }

    const results = [];
    for (const instance of instances) {
      const result = await this.engineService.cancel(instance.id, actorId, reason);
      results.push(result);
    }

    this.logger.log(
      'Annulation en cascade: %d instance(s) pour %s:%s',
      results.length,
      entityType,
      entityId,
    );

    return {
      message: `${results.length} instance(s) annulée(s)`,
      instances: results,
    };
  }

  /**
   * Get all workflow instances linked to an entity (all statuses).
   */
  async getEntityWorkflows(entityType: string, entityId: string) {
    const instances = await this.prisma.workflowInstance.findMany({
      where: { entityType, entityId },
      include: {
        currentNode: { select: { code: true, label: true, nodeType: true } },
        definition: { select: { id: true, name: true, version: true } },
        _count: { select: { events: true } },
      },
      orderBy: { startedAt: 'desc' },
    });

    return instances;
  }

  /**
   * Cascade: when a parent workflow completes, start a child workflow.
   */
  async cascadeStart(
    parentInstanceId: string,
    childEntityType: string,
    childEntityId: string,
    actorId: string,
    procedureType?: string,
    context?: Record<string, unknown>,
  ) {
    const parent = await this.prisma.workflowInstance.findUnique({
      where: { id: parentInstanceId },
    });

    if (!parent) {
      throw new NotFoundException('Instance parente non trouvée');
    }

    if (parent.status !== 'COMPLETED') {
      throw new BadRequestException(
        'L\'instance parente doit être COMPLETED pour déclencher un workflow enfant',
      );
    }

    const childInstance = await this.engineService.start({
      entityType: childEntityType,
      entityId: childEntityId,
      procedureType,
      actorId,
      context: {
        ...context,
        parentWorkflowInstanceId: parentInstanceId,
        parentEntityType: parent.entityType,
        parentEntityId: parent.entityId,
      },
    });

    this.logger.log(
      'Cascade: parent=%s -> enfant=%s (%s:%s)',
      parentInstanceId,
      childInstance.id,
      childEntityType,
      childEntityId,
    );

    return childInstance;
  }
}
