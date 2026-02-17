/**
 * WorkflowTestRunner — In-memory workflow engine for integration tests.
 *
 * Loads a real YAML definition, parses it with Zod validation,
 * and simulates the full engine lifecycle (start, transition, suspend,
 * resume, cancel) with guard evaluation, requirement validation,
 * SLA tracking, Kafka event capture, and cross-workflow references.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { z } from 'zod';

// ─── Guard Evaluator (real logic, copied from service) ─────
export interface GuardExpression {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'contains' | 'regex';
  value: unknown;
}

function resolveField(field: string, context: Record<string, unknown>): unknown {
  const parts = field.split('.');
  let current: unknown = context;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function evaluateGuardExpr(expr: GuardExpression, context: Record<string, unknown>): boolean {
  const actual = resolveField(expr.field, context);
  const expected = expr.value;
  switch (expr.operator) {
    case 'eq': return actual === expected;
    case 'neq': return actual !== expected;
    case 'gt': return typeof actual === 'number' && typeof expected === 'number' && actual > expected;
    case 'gte': return typeof actual === 'number' && typeof expected === 'number' && actual >= expected;
    case 'lt': return typeof actual === 'number' && typeof expected === 'number' && actual < expected;
    case 'lte': return typeof actual === 'number' && typeof expected === 'number' && actual <= expected;
    case 'in': return Array.isArray(expected) && expected.includes(actual);
    case 'not_in': return Array.isArray(expected) && !expected.includes(actual);
    case 'contains': return typeof actual === 'string' && typeof expected === 'string' && actual.includes(expected);
    case 'regex':
      if (typeof actual !== 'string' || typeof expected !== 'string') return false;
      try { return new RegExp(expected).test(actual); } catch { return false; }
    default: return false;
  }
}

function evaluateGuard(
  guard: GuardExpression | GuardExpression[] | null | undefined,
  context: Record<string, unknown>,
): boolean {
  if (!guard) return true;
  const expressions = Array.isArray(guard) ? guard : [guard];
  return expressions.every((expr) => !expr || !expr.field || evaluateGuardExpr(expr, context));
}

// ─── YAML Schema (matches yaml-parser.service.ts) ──────────
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
  nodes: z.array(YamlNodeSchema).min(2),
  transitions: z.array(YamlTransitionSchema).min(1),
});

type ParsedNode = z.infer<typeof YamlNodeSchema>;
type ParsedTransition = z.infer<typeof YamlTransitionSchema>;

// ─── Types ─────────────────────────────────────────────────
export type InstanceStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'SUSPENDED';

export interface WorkflowEvent {
  id: string;
  fromNodeCode: string;
  toNodeCode?: string;
  action: string;
  actorId: string;
  comment?: string;
  attachments?: string[];
  signatureId?: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

export interface KafkaEvent {
  eventType: string;
  instanceId: string;
  entityType: string;
  entityId: string;
  fromNodeCode?: string;
  toNodeCode?: string;
  action: string;
  actorId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface TransitionOptions {
  actorId?: string;
  comment?: string;
  signatureId?: string;
  attachments?: string[];
  context?: Record<string, unknown>;
  ipAddress?: string;
}

export interface AvailableTransition {
  action: string;
  label: string;
  toNodeCode: string;
  toNodeType: string;
  requiresComment: boolean;
  requiresSignature: boolean;
  requiresAttachment: boolean;
  hasGuard: boolean;
  guardSatisfied: boolean;
}

export interface CrossWorkflowRef {
  nodeCode: string;
  action: 'SUSPEND' | 'RESUME' | 'RESUME_OR_CANCEL' | 'CASCADE_START';
  targetEntityType: string;
}

// ─── WorkflowTestRunner ───────────────────────────────────
export class WorkflowTestRunner {
  readonly name: string;
  readonly nodes: ParsedNode[];
  readonly transitions: ParsedTransition[];
  readonly nodeMap: Map<string, ParsedNode>;

  // Instance state
  instanceId: string;
  currentNodeCode: string;
  status: InstanceStatus;
  context: Record<string, unknown>;
  loopCount: number;
  events: WorkflowEvent[];
  kafkaEvents: KafkaEvent[];
  entityType: string;
  entityId: string;
  startedAt: Date | null;
  completedAt: Date | null;

  // Cross-workflow tracking
  crossWorkflowActions: CrossWorkflowRef[];

  private eventCounter: number;

  constructor(yamlPath: string) {
    const content = fs.readFileSync(yamlPath, 'utf-8');
    const raw = yaml.load(content);
    const result = WorkflowYamlSchema.parse(raw);

    this.name = path.basename(yamlPath, '.yaml');
    this.nodes = result.nodes;
    this.transitions = result.transitions;
    this.nodeMap = new Map(this.nodes.map((n) => [n.code, n]));

    // Init empty state
    this.instanceId = '';
    this.currentNodeCode = '';
    this.status = 'ACTIVE';
    this.context = {};
    this.loopCount = 0;
    this.events = [];
    this.kafkaEvents = [];
    this.entityType = '';
    this.entityId = '';
    this.startedAt = null;
    this.completedAt = null;
    this.crossWorkflowActions = [];
    this.eventCounter = 0;

    // Extract cross-workflow references from node configs
    this.crossWorkflowActions = this.extractCrossWorkflowRefs();
  }

  // ─── Lifecycle ───────────────────────────────────────────

  start(opts: {
    entityType: string;
    entityId: string;
    actorId?: string;
    context?: Record<string, unknown>;
  }): void {
    const startNode = this.nodes.find((n) => n.type === 'START');
    if (!startNode) throw new Error('No START node in workflow');

    this.instanceId = `inst-${Date.now()}`;
    this.entityType = opts.entityType;
    this.entityId = opts.entityId;
    this.context = opts.context ?? {};
    this.status = 'ACTIVE';
    this.startedAt = new Date();
    this.loopCount = 0;
    this.events = [];
    this.kafkaEvents = [];

    // Auto-advance past START (like the real engine)
    const firstTransition = this.transitions.find((t) => t.from === startNode.code);
    const targetCode = firstTransition ? firstTransition.to : startNode.code;
    this.currentNodeCode = targetCode;

    const actorId = opts.actorId ?? 'system';
    this.recordEvent(startNode.code, targetCode, 'WORKFLOW_STARTED', actorId);
    this.recordKafka('WORKFLOW_STARTED', startNode.code, targetCode, 'WORKFLOW_STARTED', actorId);
  }

  transition(action: string, opts?: TransitionOptions): void {
    if (this.status !== 'ACTIVE') {
      throw new Error(`Instance is ${this.status}, only ACTIVE instances can transition`);
    }

    const actorId = opts?.actorId ?? 'user-1';

    // Find matching transitions from current node
    const candidates = this.transitions.filter(
      (t) => t.from === this.currentNodeCode && t.action === action,
    );

    if (candidates.length === 0) {
      const available = this.transitions
        .filter((t) => t.from === this.currentNodeCode)
        .map((t) => t.action);
      throw new Error(
        `No transition "${action}" from node "${this.currentNodeCode}". ` +
        `Available: [${available.join(', ')}]`,
      );
    }

    // Merge context
    const mergedContext = { ...this.context, ...opts?.context };

    // Find matching transition (evaluate guards)
    let matched: ParsedTransition | undefined;
    if (candidates.length === 1) {
      matched = candidates[0];
      if (!evaluateGuard(matched.guard as GuardExpression | GuardExpression[] | null, mergedContext)) {
        throw new Error(
          `Guard not satisfied for transition "${action}" from "${this.currentNodeCode}"`,
        );
      }
    } else {
      matched = candidates.find((t) =>
        evaluateGuard(t.guard as GuardExpression | GuardExpression[] | null, mergedContext),
      );
      if (!matched) {
        throw new Error(
          `No transition "${action}" satisfies guards from "${this.currentNodeCode}" with given context`,
        );
      }
    }

    // Validate requirements
    if (matched.requires_comment && !opts?.comment) {
      throw new Error(`Comment required for transition "${action}"`);
    }
    if (matched.requires_signature && !opts?.signatureId) {
      throw new Error(`Signature required for transition "${action}"`);
    }
    if (matched.requires_attachment && (!opts?.attachments || opts.attachments.length === 0)) {
      throw new Error(`Attachment required for transition "${action}"`);
    }

    const toNode = this.nodeMap.get(matched.to)!;
    const fromCode = this.currentNodeCode;

    // Update state
    this.context = mergedContext;
    this.currentNodeCode = matched.to;

    if (toNode.type === 'END') {
      this.status = 'COMPLETED';
      this.completedAt = new Date();
    }
    if (toNode.type === 'LOOP') {
      this.loopCount++;
    }

    // Record events
    this.recordEvent(fromCode, matched.to, action, actorId, opts?.comment, opts?.attachments, opts?.signatureId);

    const kafkaType = toNode.type === 'END' ? 'WORKFLOW_COMPLETED' : 'WORKFLOW_TRANSITIONED';
    this.recordKafka(kafkaType, fromCode, matched.to, action, actorId, opts?.context);
  }

  suspend(actorId: string = 'system', reason?: string): void {
    if (this.status !== 'ACTIVE') {
      throw new Error(`Can only suspend ACTIVE instances, current: ${this.status}`);
    }
    this.status = 'SUSPENDED';
    this.recordEvent(this.currentNodeCode, undefined, 'WORKFLOW_SUSPENDED', actorId, reason);
    this.recordKafka('WORKFLOW_SUSPENDED', this.currentNodeCode, undefined, 'WORKFLOW_SUSPENDED', actorId);
  }

  resume(actorId: string = 'system'): void {
    if (this.status !== 'SUSPENDED') {
      throw new Error(`Can only resume SUSPENDED instances, current: ${this.status}`);
    }
    this.status = 'ACTIVE';
    this.recordEvent(this.currentNodeCode, undefined, 'WORKFLOW_RESUMED', actorId);
    this.recordKafka('WORKFLOW_RESUMED', this.currentNodeCode, undefined, 'WORKFLOW_RESUMED', actorId);
  }

  cancel(actorId: string = 'system', reason?: string): void {
    if (this.status === 'COMPLETED' || this.status === 'CANCELLED') {
      throw new Error(`Instance already ${this.status}`);
    }
    this.status = 'CANCELLED';
    this.completedAt = new Date();
    this.recordEvent(this.currentNodeCode, undefined, 'WORKFLOW_CANCELLED', actorId, reason);
    this.recordKafka('WORKFLOW_CANCELLED', this.currentNodeCode, undefined, 'WORKFLOW_CANCELLED', actorId);
  }

  // ─── Queries ─────────────────────────────────────────────

  getAvailableActions(ctx?: Record<string, unknown>): AvailableTransition[] {
    const mergedCtx = { ...this.context, ...ctx };
    return this.transitions
      .filter((t) => t.from === this.currentNodeCode)
      .map((t) => {
        const toNode = this.nodeMap.get(t.to)!;
        return {
          action: t.action,
          label: t.label,
          toNodeCode: t.to,
          toNodeType: toNode.type,
          requiresComment: t.requires_comment,
          requiresSignature: t.requires_signature,
          requiresAttachment: t.requires_attachment,
          hasGuard: !!t.guard,
          guardSatisfied: evaluateGuard(t.guard as GuardExpression | GuardExpression[] | null, mergedCtx),
        };
      });
  }

  getCurrentNode(): ParsedNode {
    return this.nodeMap.get(this.currentNodeCode)!;
  }

  getMandatoryNodes(): ParsedNode[] {
    return this.nodes.filter((n) => n.mandatory);
  }

  getLoopNodes(): ParsedNode[] {
    return this.nodes.filter((n) => n.type === 'LOOP');
  }

  getNodesWithSla(): ParsedNode[] {
    return this.nodes.filter((n) => n.sla_hours != null);
  }

  getGuardedTransitions(): ParsedTransition[] {
    return this.transitions.filter((t) => !!t.guard);
  }

  getEndNodes(): ParsedNode[] {
    return this.nodes.filter((n) => n.type === 'END');
  }

  /**
   * Returns the list of node codes on the shortest path from START to a given END node,
   * using only unguarded transitions (or transitions whose guard matches the given context).
   */
  findPathToEnd(endCode: string, ctx?: Record<string, unknown>): string[] | null {
    const mergedCtx = { ...this.context, ...ctx };
    const visited = new Set<string>();
    const queue: { code: string; path: string[] }[] = [];

    const startNode = this.nodes.find((n) => n.type === 'START')!;
    const firstTrans = this.transitions.find((t) => t.from === startNode.code);
    const firstCode = firstTrans ? firstTrans.to : startNode.code;

    queue.push({ code: firstCode, path: [firstCode] });
    visited.add(firstCode);

    while (queue.length > 0) {
      const { code, path: currentPath } = queue.shift()!;
      if (code === endCode) return currentPath;

      const outgoing = this.transitions.filter(
        (t) => t.from === code && evaluateGuard(t.guard as GuardExpression | GuardExpression[] | null, mergedCtx),
      );

      for (const t of outgoing) {
        if (!visited.has(t.to)) {
          visited.add(t.to);
          queue.push({ code: t.to, path: [...currentPath, t.to] });
        }
      }
    }
    return null;
  }

  /**
   * Find the action needed to go from `fromCode` to `toCode`.
   */
  findAction(fromCode: string, toCode: string, ctx?: Record<string, unknown>): string | null {
    const mergedCtx = { ...this.context, ...ctx };
    const t = this.transitions.find(
      (t) => t.from === fromCode && t.to === toCode &&
        evaluateGuard(t.guard as GuardExpression | GuardExpression[] | null, mergedCtx),
    );
    return t?.action ?? null;
  }

  /**
   * Execute a full path of actions in sequence.
   */
  executePath(actions: Array<{ action: string; opts?: TransitionOptions }>): void {
    for (const step of actions) {
      this.transition(step.action, step.opts);
    }
  }

  // ─── SLA helpers ─────────────────────────────────────────

  simulateSlaCheck(): { breached: boolean; nodeCode: string; slaHours: number }[] {
    const node = this.getCurrentNode();
    if (!node.sla_hours) return [];

    const lastEvent = this.events[this.events.length - 1];
    if (!lastEvent) return [];

    const deadline = new Date(lastEvent.timestamp);
    deadline.setHours(deadline.getHours() + node.sla_hours);

    // Simulate time passing beyond deadline
    const breached = new Date() > deadline;

    if (breached) {
      this.recordEvent(this.currentNodeCode, undefined, 'SLA_BREACHED', 'SYSTEM',
        `SLA de ${node.sla_hours}h dépassé sur "${node.label}"`);
      this.recordKafka('SLA_BREACHED', this.currentNodeCode, undefined, 'SLA_BREACHED', 'SYSTEM',
        { slaHours: node.sla_hours, deadline: deadline.toISOString() });
    }

    return [{ breached, nodeCode: node.code, slaHours: node.sla_hours }];
  }

  /**
   * Force an SLA breach event for testing.
   */
  forceSlaBreachEvent(nodeCode?: string): void {
    const code = nodeCode ?? this.currentNodeCode;
    const node = this.nodeMap.get(code);
    if (!node?.sla_hours) throw new Error(`Node ${code} has no SLA`);

    this.recordEvent(code, undefined, 'SLA_BREACHED', 'SYSTEM',
      `SLA de ${node.sla_hours}h dépassé sur "${node.label}"`);
    this.recordKafka('SLA_BREACHED', code, undefined, 'SLA_BREACHED', 'SYSTEM',
      { slaHours: node.sla_hours });
  }

  // ─── Assertions ──────────────────────────────────────────

  assertCurrentNode(code: string): void {
    if (this.currentNodeCode !== code) {
      throw new Error(`Expected current node "${code}", got "${this.currentNodeCode}"`);
    }
  }

  assertStatus(expected: InstanceStatus): void {
    if (this.status !== expected) {
      throw new Error(`Expected status "${expected}", got "${this.status}"`);
    }
  }

  assertEventCount(expected: number): void {
    if (this.events.length !== expected) {
      throw new Error(`Expected ${expected} events, got ${this.events.length}`);
    }
  }

  assertKafkaEventTypes(expected: string[]): void {
    const actual = this.kafkaEvents.map((e) => e.eventType);
    for (const exp of expected) {
      if (!actual.includes(exp)) {
        throw new Error(`Expected Kafka event "${exp}" not found. Got: [${actual.join(', ')}]`);
      }
    }
  }

  assertKafkaEventCount(expected: number): void {
    if (this.kafkaEvents.length !== expected) {
      throw new Error(`Expected ${expected} Kafka events, got ${this.kafkaEvents.length}`);
    }
  }

  assertLoopCount(expected: number): void {
    if (this.loopCount !== expected) {
      throw new Error(`Expected loop count ${expected}, got ${this.loopCount}`);
    }
  }

  assertVisitedNodes(expectedCodes: string[]): void {
    const visited = new Set(this.events.map((e) => e.fromNodeCode));
    this.events.forEach((e) => { if (e.toNodeCode) visited.add(e.toNodeCode); });
    for (const code of expectedCodes) {
      if (!visited.has(code)) {
        throw new Error(`Expected node "${code}" to be visited, but it was not`);
      }
    }
  }

  assertEventSequence(expectedActions: string[]): void {
    const actual = this.events.map((e) => e.action);
    for (let i = 0; i < expectedActions.length; i++) {
      if (actual[i] !== expectedActions[i]) {
        throw new Error(
          `Event sequence mismatch at index ${i}: expected "${expectedActions[i]}", got "${actual[i]}". ` +
          `Full: [${actual.join(', ')}]`,
        );
      }
    }
  }

  // ─── Internal helpers ────────────────────────────────────

  private recordEvent(
    fromCode: string,
    toCode: string | undefined,
    action: string,
    actorId: string,
    comment?: string,
    attachments?: string[],
    signatureId?: string,
  ): void {
    this.eventCounter++;
    this.events.push({
      id: `evt-${this.eventCounter}`,
      fromNodeCode: fromCode,
      toNodeCode: toCode,
      action,
      actorId,
      comment,
      attachments,
      signatureId,
      timestamp: new Date(),
    });
  }

  private recordKafka(
    eventType: string,
    fromCode: string,
    toCode: string | undefined,
    action: string,
    actorId: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.kafkaEvents.push({
      eventType,
      instanceId: this.instanceId,
      entityType: this.entityType,
      entityId: this.entityId,
      fromNodeCode: fromCode,
      toNodeCode: toCode,
      action,
      actorId,
      timestamp: new Date().toISOString(),
      metadata,
    });
  }

  private extractCrossWorkflowRefs(): CrossWorkflowRef[] {
    const refs: CrossWorkflowRef[] = [];
    for (const node of this.nodes) {
      const cw = (node.config as Record<string, unknown>)?.cross_workflow as Record<string, unknown> | undefined;
      if (cw) {
        refs.push({
          nodeCode: node.code,
          action: cw.action as CrossWorkflowRef['action'],
          targetEntityType: cw.target_entity_type as string,
        });
      }
      // Also check triggers for cascade_workflow
      if (node.triggers?.cascade_workflow) {
        refs.push({
          nodeCode: node.code,
          action: 'CASCADE_START',
          targetEntityType: String(node.triggers.cascade_workflow),
        });
      }
    }
    return refs;
  }
}

// ─── Helper to resolve YAML path ──────────────────────────
export function yamlPath(filename: string): string {
  return path.resolve(__dirname, '../../../workflows', filename);
}

// ─── Helper to create a fresh runner ──────────────────────
export function createRunner(filename: string): WorkflowTestRunner {
  return new WorkflowTestRunner(yamlPath(filename));
}
