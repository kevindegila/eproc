import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { YamlParserService, ParsedWorkflow } from './yaml-parser.service';
import { NodeType, Prisma } from '../../generated/prisma';

export interface LockRule {
  lock_when_role_in: string[];
}

@Injectable()
export class TemplateResolverService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly yamlParser: YamlParserService,
  ) {}

  /**
   * Determine if a node should be locked based on the lock rule.
   * START and END nodes are always locked.
   */
  isNodeLocked(
    nodeType: string,
    assigneeRole: string | null | undefined,
    lockRule: LockRule | null,
  ): boolean {
    if (nodeType === 'START' || nodeType === 'END') return true;
    if (!lockRule || !assigneeRole) return false;
    return lockRule.lock_when_role_in.includes(assigneeRole);
  }

  /**
   * Create an override definition from a template for a specific organisation.
   * Copies the template's nodes and transitions, marking locked nodes.
   */
  async createOverride(templateId: string, organisationId: string) {
    const template = await this.prisma.workflowDefinition.findUnique({
      where: { id: templateId },
      include: {
        nodes: { orderBy: { createdAt: 'asc' } },
        transitions: {
          include: { fromNode: true, toNode: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Template non trouvé');
    }

    if (!template.isTemplate) {
      throw new ConflictException('La définition spécifiée n\'est pas un template');
    }

    const lockRule = template.lockRule as LockRule | null;

    // Check for existing active override for this org
    const existing = await this.prisma.workflowDefinition.findFirst({
      where: {
        templateId,
        organisationId,
        isActive: true,
      },
      orderBy: { version: 'desc' },
    });

    const version = existing ? existing.version + 1 : 1;

    return this.prisma.$transaction(async (tx) => {
      // Deactivate previous override if exists
      if (existing) {
        await tx.workflowDefinition.update({
          where: { id: existing.id },
          data: { isActive: false },
        });
      }

      const override = await tx.workflowDefinition.create({
        data: {
          name: `${template.name} — Override`,
          entityType: template.entityType,
          procedureType: template.procedureType,
          organisationId,
          yamlContent: template.yamlContent,
          isActive: true,
          version,
          isTemplate: false,
          templateId,
          templateVersion: template.version,
          lockRule: template.lockRule ?? undefined,
        },
      });

      // Copy nodes with isLocked computed
      const nodeMap = new Map<string, string>();
      for (const node of template.nodes) {
        const created = await tx.workflowNode.create({
          data: {
            definitionId: override.id,
            code: node.code,
            label: node.label,
            nodeType: node.nodeType,
            isMandatory: node.isMandatory,
            assigneeRole: node.assigneeRole,
            slaHours: node.slaHours,
            isLocked: this.isNodeLocked(node.nodeType, node.assigneeRole, lockRule),
            positionX: node.positionX,
            positionY: node.positionY,
            triggers: node.triggers ?? undefined,
            config: node.config ?? undefined,
          },
        });
        nodeMap.set(node.id, created.id);
      }

      // Copy transitions
      for (const transition of template.transitions) {
        const fromNodeId = nodeMap.get(transition.fromNodeId);
        const toNodeId = nodeMap.get(transition.toNodeId);
        if (!fromNodeId || !toNodeId) continue;

        await tx.workflowTransition.create({
          data: {
            definitionId: override.id,
            fromNodeId,
            toNodeId,
            action: transition.action,
            label: transition.label,
            guardExpression: transition.guardExpression ?? undefined,
            isMandatory: transition.isMandatory,
            requiresComment: transition.requiresComment,
            requiresSignature: transition.requiresSignature,
            requiresAttachment: transition.requiresAttachment,
          },
        });
      }

      return tx.workflowDefinition.findUniqueOrThrow({
        where: { id: override.id },
        include: {
          nodes: { orderBy: { createdAt: 'asc' } },
          transitions: {
            include: { fromNode: true, toNode: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    });
  }

  /**
   * Validate that an override respects locked nodes from the template.
   * - All locked nodes must be present and unchanged (code, label, type, assigneeRole)
   * - No new locked nodes may be added by the AC
   */
  async validateOverride(parsed: ParsedWorkflow, templateId: string) {
    const template = await this.prisma.workflowDefinition.findUnique({
      where: { id: templateId },
      include: {
        nodes: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!template) {
      throw new NotFoundException('Template parent non trouvé');
    }

    const lockRule = template.lockRule as LockRule | null;

    // Identify locked nodes in the template
    const lockedTemplateNodes = template.nodes.filter((n) =>
      this.isNodeLocked(n.nodeType, n.assigneeRole, lockRule),
    );

    // Check all locked nodes are present and unchanged
    for (const locked of lockedTemplateNodes) {
      const match = parsed.nodes.find((n) => n.code === locked.code);
      if (!match) {
        throw new ConflictException(
          `Le noeud verrouillé "${locked.code}" (${locked.label}) ne peut pas être supprimé`,
        );
      }
      if (match.label !== locked.label) {
        throw new ConflictException(
          `Le libellé du noeud verrouillé "${locked.code}" ne peut pas être modifié`,
        );
      }
      if (match.type !== locked.nodeType) {
        throw new ConflictException(
          `Le type du noeud verrouillé "${locked.code}" ne peut pas être modifié`,
        );
      }
      if ((match.assignee_role ?? null) !== (locked.assigneeRole ?? null)) {
        throw new ConflictException(
          `Le rôle assigné du noeud verrouillé "${locked.code}" ne peut pas être modifié`,
        );
      }
    }

    // Check that no new locked nodes have been added
    const lockedCodes = new Set(lockedTemplateNodes.map((n) => n.code));
    for (const node of parsed.nodes) {
      if (lockedCodes.has(node.code)) continue;
      if (this.isNodeLocked(node.type, node.assignee_role ?? null, lockRule)) {
        throw new ConflictException(
          `Le noeud "${node.code}" aurait un rôle verrouillé (${node.assignee_role}). Seul l'administrateur peut ajouter des noeuds de contrôle.`,
        );
      }
    }
  }

  /**
   * Resolve the effective definition by merging template locked nodes
   * with override editable nodes and all transitions from the override.
   */
  async resolveEffective(overrideId: string) {
    const override = await this.prisma.workflowDefinition.findUnique({
      where: { id: overrideId },
      include: {
        nodes: { orderBy: { createdAt: 'asc' } },
        transitions: {
          include: { fromNode: true, toNode: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!override) {
      throw new NotFoundException('Override non trouvé');
    }

    if (!override.templateId) {
      // Not an override — return as-is
      return override;
    }

    const template = await this.prisma.workflowDefinition.findUnique({
      where: { id: override.templateId },
      include: {
        nodes: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!template) {
      throw new NotFoundException('Template parent non trouvé');
    }

    const lockRule = template.lockRule as LockRule | null;

    // Build effective node list:
    // - locked nodes from the template (current version)
    // - editable nodes from the override
    const templateLockedNodes = template.nodes.filter((n) =>
      this.isNodeLocked(n.nodeType, n.assigneeRole, lockRule),
    );
    const templateLockedCodes = new Set(templateLockedNodes.map((n) => n.code));

    const overrideEditableNodes = override.nodes.filter(
      (n) => !templateLockedCodes.has(n.code),
    );

    const effectiveNodes = [...templateLockedNodes, ...overrideEditableNodes];

    return {
      ...override,
      nodes: effectiveNodes,
      // Transitions always from the override
      transitions: override.transitions,
    };
  }
}
