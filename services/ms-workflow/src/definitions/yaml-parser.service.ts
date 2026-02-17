import { Injectable, BadRequestException } from '@nestjs/common';
import * as yaml from 'js-yaml';
import { z } from 'zod';

const NodeTypeEnum = z.enum(['START', 'ACTION', 'DECISION', 'LOOP', 'SYSTEM', 'END']);

const YamlNodeSchema = z.object({
  code: z.string().min(1),
  label: z.string().min(1),
  type: NodeTypeEnum,
  mandatory: z.boolean().optional().default(false),
  assignee_role: z.string().optional(),
  sla_hours: z.number().int().positive().optional(),
  position_x: z.number().int().optional().default(0),
  position_y: z.number().int().optional().default(0),
  triggers: z.record(z.unknown()).optional(),
  config: z.record(z.unknown()).optional(),
});

const GuardExpressionSchema = z.object({
  field: z.string(),
  operator: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'not_in', 'contains', 'regex']),
  value: z.unknown(),
}).optional();

const YamlTransitionSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  action: z.string().min(1),
  label: z.string().min(1),
  guard: z.union([GuardExpressionSchema, z.array(GuardExpressionSchema)]).optional(),
  mandatory: z.boolean().optional().default(false),
  requires_comment: z.boolean().optional().default(false),
  requires_signature: z.boolean().optional().default(false),
  requires_attachment: z.boolean().optional().default(false),
});

const WorkflowYamlSchema = z.object({
  nodes: z.array(YamlNodeSchema).min(2, 'Le workflow doit contenir au moins 2 nœuds (START et END)'),
  transitions: z.array(YamlTransitionSchema).min(1, 'Le workflow doit contenir au moins 1 transition'),
});

export type ParsedNode = z.infer<typeof YamlNodeSchema>;
export type ParsedTransition = z.infer<typeof YamlTransitionSchema>;
export interface ParsedWorkflow {
  nodes: ParsedNode[];
  transitions: ParsedTransition[];
}

@Injectable()
export class YamlParserService {
  parse(yamlContent: string): ParsedWorkflow {
    let raw: unknown;
    try {
      raw = yaml.load(yamlContent);
    } catch (err) {
      throw new BadRequestException(`YAML invalide: ${(err as Error).message}`);
    }

    const result = WorkflowYamlSchema.safeParse(raw);
    if (!result.success) {
      const errors = result.error.issues.map(
        (i) => `${i.path.join('.')}: ${i.message}`,
      );
      throw new BadRequestException({
        message: 'Validation du workflow YAML échouée',
        errors,
      });
    }

    const parsed = result.data;
    this.validateStructure(parsed);
    return parsed;
  }

  private validateStructure(workflow: ParsedWorkflow): void {
    const nodeCodes = new Set(workflow.nodes.map((n) => n.code));

    // Must have exactly one START and at least one END
    const startNodes = workflow.nodes.filter((n) => n.type === 'START');
    const endNodes = workflow.nodes.filter((n) => n.type === 'END');

    if (startNodes.length !== 1) {
      throw new BadRequestException('Le workflow doit contenir exactement un nœud START');
    }
    if (endNodes.length < 1) {
      throw new BadRequestException('Le workflow doit contenir au moins un nœud END');
    }

    // Validate transitions reference existing nodes
    for (const t of workflow.transitions) {
      if (!nodeCodes.has(t.from)) {
        throw new BadRequestException(`Transition référence un nœud source inexistant: "${t.from}"`);
      }
      if (!nodeCodes.has(t.to)) {
        throw new BadRequestException(`Transition référence un nœud cible inexistant: "${t.to}"`);
      }
    }

    // Ensure no transitions originate from END nodes
    const endCodes = new Set(endNodes.map((n) => n.code));
    for (const t of workflow.transitions) {
      if (endCodes.has(t.from)) {
        throw new BadRequestException(`Aucune transition ne peut partir d'un nœud END: "${t.from}"`);
      }
    }

    // Ensure START has at least one outgoing transition
    const startCode = startNodes[0].code;
    const startOutgoing = workflow.transitions.filter((t) => t.from === startCode);
    if (startOutgoing.length < 1) {
      throw new BadRequestException('Le nœud START doit avoir au moins une transition sortante');
    }
  }
}
