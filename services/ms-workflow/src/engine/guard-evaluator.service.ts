import { Injectable, Logger } from '@nestjs/common';

export interface GuardExpression {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'contains' | 'regex';
  value: unknown;
}

@Injectable()
export class GuardEvaluatorService {
  private readonly logger = new Logger(GuardEvaluatorService.name);

  /**
   * Evaluate a guard expression (or array of expressions) against a context.
   * All expressions in an array must pass (AND logic).
   * Returns true if no guard is defined.
   */
  evaluate(
    guard: GuardExpression | GuardExpression[] | null | undefined,
    context: Record<string, unknown>,
  ): boolean {
    if (!guard) return true;

    const expressions = Array.isArray(guard) ? guard : [guard];

    for (const expr of expressions) {
      if (!expr || !expr.field) continue;
      if (!this.evaluateOne(expr, context)) {
        this.logger.debug(
          'Garde échouée: %s %s %s (valeur actuelle: %s)',
          expr.field,
          expr.operator,
          expr.value,
          this.resolveField(expr.field, context),
        );
        return false;
      }
    }

    return true;
  }

  private evaluateOne(expr: GuardExpression, context: Record<string, unknown>): boolean {
    const actual = this.resolveField(expr.field, context);
    const expected = expr.value;

    switch (expr.operator) {
      case 'eq':
        return actual === expected;

      case 'neq':
        return actual !== expected;

      case 'gt':
        return typeof actual === 'number' && typeof expected === 'number' && actual > expected;

      case 'gte':
        return typeof actual === 'number' && typeof expected === 'number' && actual >= expected;

      case 'lt':
        return typeof actual === 'number' && typeof expected === 'number' && actual < expected;

      case 'lte':
        return typeof actual === 'number' && typeof expected === 'number' && actual <= expected;

      case 'in':
        return Array.isArray(expected) && expected.includes(actual);

      case 'not_in':
        return Array.isArray(expected) && !expected.includes(actual);

      case 'contains':
        return typeof actual === 'string' && typeof expected === 'string' && actual.includes(expected);

      case 'regex':
        if (typeof actual !== 'string' || typeof expected !== 'string') return false;
        try {
          return new RegExp(expected).test(actual);
        } catch {
          this.logger.warn('Expression régulière invalide: %s', expected);
          return false;
        }

      default:
        this.logger.warn('Opérateur de garde inconnu: %s', expr.operator);
        return false;
    }
  }

  /**
   * Resolve dot-notation field paths (e.g. "montant.ht" -> context.montant.ht)
   */
  private resolveField(field: string, context: Record<string, unknown>): unknown {
    const parts = field.split('.');
    let current: unknown = context;

    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined;
      }
      current = (current as Record<string, unknown>)[part];
    }

    return current;
  }
}
