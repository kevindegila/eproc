import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { YamlParserService } from './yaml-parser.service';
import { TemplateResolverService, LockRule } from './template-resolver.service';
import { CreateDefinitionDto } from './dto/create-definition.dto';
import { UpdateDefinitionDto } from './dto/update-definition.dto';
import { NodeType, Prisma } from '../../generated/prisma';
import { buildPaginatedResponse } from '@eproc/shared-utils';

@Injectable()
export class DefinitionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly yamlParser: YamlParserService,
    private readonly templateResolver: TemplateResolverService,
  ) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    entityType?: string;
    procedureType?: string;
    isActive?: boolean;
    isTemplate?: boolean;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.entityType) where.entityType = query.entityType;
    if (query.procedureType) where.procedureType = query.procedureType;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.isTemplate !== undefined) where.isTemplate = query.isTemplate;

    const [definitions, total] = await Promise.all([
      this.prisma.workflowDefinition.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: { select: { nodes: true, transitions: true, instances: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.workflowDefinition.count({ where }),
    ]);

    return buildPaginatedResponse(definitions, total, page, limit);
  }

  async findOne(id: string) {
    const definition = await this.prisma.workflowDefinition.findUnique({
      where: { id },
      include: {
        nodes: { orderBy: { createdAt: 'asc' } },
        transitions: {
          include: { fromNode: true, toNode: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!definition) {
      throw new NotFoundException('Définition de workflow non trouvée');
    }

    return definition;
  }

  async create(dto: CreateDefinitionDto) {
    // If templateId is provided, delegate to the template resolver
    if (dto.templateId) {
      return this.templateResolver.createOverride(
        dto.templateId,
        dto.organisationId!,
      );
    }

    const parsed = this.yamlParser.parse(dto.yamlContent);
    const isTemplate = dto.lockRule != null;
    const lockRule = dto.lockRule ?? null;

    // Check for existing active definition with same key
    const existing = await this.prisma.workflowDefinition.findFirst({
      where: {
        entityType: dto.entityType,
        procedureType: dto.procedureType ?? null,
        organisationId: dto.organisationId ?? null,
        isActive: true,
      },
      orderBy: { version: 'desc' },
    });

    const version = existing ? existing.version + 1 : 1;

    return this.prisma.$transaction(async (tx) => {
      const definition = await tx.workflowDefinition.create({
        data: {
          name: dto.name,
          entityType: dto.entityType,
          procedureType: dto.procedureType,
          organisationId: dto.organisationId,
          yamlContent: dto.yamlContent,
          isActive: dto.isActive ?? true,
          version,
          isTemplate,
          lockRule: lockRule ? (lockRule as unknown as Prisma.InputJsonValue) : undefined,
        },
      });

      // Create nodes
      const nodeMap = new Map<string, string>();
      for (const node of parsed.nodes) {
        const created = await tx.workflowNode.create({
          data: {
            definitionId: definition.id,
            code: node.code,
            label: node.label,
            nodeType: node.type as NodeType,
            isMandatory: node.mandatory,
            assigneeRole: node.assignee_role,
            slaHours: node.sla_hours,
            isLocked: this.templateResolver.isNodeLocked(
              node.type,
              node.assignee_role ?? null,
              lockRule,
            ),
            positionX: node.position_x,
            positionY: node.position_y,
            triggers: (node.triggers as Prisma.InputJsonValue) ?? undefined,
            config: (node.config as Prisma.InputJsonValue) ?? undefined,
          },
        });
        nodeMap.set(node.code, created.id);
      }

      // Create transitions
      for (const transition of parsed.transitions) {
        const fromNodeId = nodeMap.get(transition.from);
        const toNodeId = nodeMap.get(transition.to);

        if (!fromNodeId || !toNodeId) {
          throw new BadRequestException(
            `Nœuds référencés introuvables: ${transition.from} -> ${transition.to}`,
          );
        }

        await tx.workflowTransition.create({
          data: {
            definitionId: definition.id,
            fromNodeId,
            toNodeId,
            action: transition.action,
            label: transition.label,
            guardExpression: (transition.guard as Prisma.InputJsonValue) ?? undefined,
            isMandatory: transition.mandatory,
            requiresComment: transition.requires_comment,
            requiresSignature: transition.requires_signature,
            requiresAttachment: transition.requires_attachment,
          },
        });
      }

      // Deactivate previous version if creating a new active one
      if (existing && (dto.isActive ?? true)) {
        await tx.workflowDefinition.update({
          where: { id: existing.id },
          data: { isActive: false },
        });
      }

      return this.findOneWithTx(tx, definition.id);
    });
  }

  async update(id: string, dto: UpdateDefinitionDto) {
    const existing = await this.findOne(id);

    // If YAML changed, re-parse and rebuild nodes/transitions
    if (dto.yamlContent) {
      const parsed = this.yamlParser.parse(dto.yamlContent);

      // If this is an override, validate locked nodes are preserved
      if (existing.templateId) {
        await this.templateResolver.validateOverride(parsed, existing.templateId);
      }

      const lockRule = existing.lockRule as LockRule | null;

      return this.prisma.$transaction(async (tx) => {
        // Check mandatory nodes are preserved
        const mandatoryNodes = existing.nodes.filter((n) => n.isMandatory);
        for (const mandatory of mandatoryNodes) {
          const stillPresent = parsed.nodes.find((n) => n.code === mandatory.code);
          if (!stillPresent) {
            throw new ConflictException(
              `Le nœud obligatoire "${mandatory.code}" (${mandatory.label}) ne peut pas être supprimé`,
            );
          }
        }

        // Delete old non-mandatory structure and recreate
        await tx.workflowTransition.deleteMany({ where: { definitionId: id } });
        await tx.workflowNode.deleteMany({ where: { definitionId: id } });

        // Recreate nodes
        const nodeMap = new Map<string, string>();
        for (const node of parsed.nodes) {
          const created = await tx.workflowNode.create({
            data: {
              definitionId: id,
              code: node.code,
              label: node.label,
              nodeType: node.type as NodeType,
              isMandatory: node.mandatory,
              assigneeRole: node.assignee_role,
              slaHours: node.sla_hours,
              isLocked: this.templateResolver.isNodeLocked(
                node.type,
                node.assignee_role ?? null,
                lockRule,
              ),
              positionX: node.position_x,
              positionY: node.position_y,
              triggers: (node.triggers as Prisma.InputJsonValue) ?? undefined,
              config: (node.config as Prisma.InputJsonValue) ?? undefined,
            },
          });
          nodeMap.set(node.code, created.id);
        }

        // Recreate transitions
        for (const transition of parsed.transitions) {
          await tx.workflowTransition.create({
            data: {
              definitionId: id,
              fromNodeId: nodeMap.get(transition.from)!,
              toNodeId: nodeMap.get(transition.to)!,
              action: transition.action,
              label: transition.label,
              guardExpression: (transition.guard as Prisma.InputJsonValue) ?? undefined,
              isMandatory: transition.mandatory,
              requiresComment: transition.requires_comment,
              requiresSignature: transition.requires_signature,
              requiresAttachment: transition.requires_attachment,
            },
          });
        }

        // Update definition metadata
        await tx.workflowDefinition.update({
          where: { id },
          data: {
            name: dto.name,
            yamlContent: dto.yamlContent,
            isActive: dto.isActive,
          },
        });

        return this.findOneWithTx(tx, id);
      });
    }

    // Simple metadata update (no YAML change)
    await this.prisma.workflowDefinition.update({
      where: { id },
      data: {
        name: dto.name,
        isActive: dto.isActive,
      },
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    const definition = await this.findOne(id);

    // Check if any active instances exist
    const activeInstances = await this.prisma.workflowInstance.count({
      where: { definitionId: id, status: 'ACTIVE' },
    });

    if (activeInstances > 0) {
      throw new ConflictException(
        `Impossible de supprimer: ${activeInstances} instance(s) active(s) utilisent cette définition`,
      );
    }

    await this.prisma.workflowDefinition.delete({ where: { id } });
    return { message: `Définition "${definition.name}" supprimée avec succès` };
  }

  /**
   * List available templates.
   */
  async findTemplates(query: { page?: number; limit?: number; entityType?: string }) {
    return this.findAll({ ...query, isTemplate: true });
  }

  /**
   * Resolve the effective (merged) definition for an override.
   */
  async resolveEffective(overrideId: string) {
    return this.templateResolver.resolveEffective(overrideId);
  }

  private async findOneWithTx(tx: Prisma.TransactionClient, id: string) {
    return tx.workflowDefinition.findUniqueOrThrow({
      where: { id },
      include: {
        nodes: { orderBy: { createdAt: 'asc' } },
        transitions: {
          include: { fromNode: true, toNode: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }
}
