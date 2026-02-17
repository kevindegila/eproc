import { GuardEvaluatorService, GuardExpression } from '../src/engine/guard-evaluator.service';

describe('GuardEvaluatorService', () => {
  let service: GuardEvaluatorService;

  beforeEach(() => {
    service = new GuardEvaluatorService();
  });

  const context = {
    montant: 75000000,
    type: 'TRAVAUX',
    statut: 'EN_COURS',
    fournisseur: {
      pays: 'BJ',
      categorie: 'A',
    },
    tags: ['urgent', 'gros_montant'],
    description: 'Construction du pont de Cotonou',
  };

  describe('opérateur eq', () => {
    it('devrait retourner true si la valeur est égale', () => {
      const guard: GuardExpression = { field: 'type', operator: 'eq', value: 'TRAVAUX' };
      expect(service.evaluate(guard, context)).toBe(true);
    });

    it('devrait retourner false si la valeur est différente', () => {
      const guard: GuardExpression = { field: 'type', operator: 'eq', value: 'FOURNITURES' };
      expect(service.evaluate(guard, context)).toBe(false);
    });
  });

  describe('opérateur neq', () => {
    it('devrait retourner true si la valeur est différente', () => {
      const guard: GuardExpression = { field: 'type', operator: 'neq', value: 'FOURNITURES' };
      expect(service.evaluate(guard, context)).toBe(true);
    });

    it('devrait retourner false si la valeur est égale', () => {
      const guard: GuardExpression = { field: 'type', operator: 'neq', value: 'TRAVAUX' };
      expect(service.evaluate(guard, context)).toBe(false);
    });
  });

  describe('opérateurs numériques', () => {
    it('gt: devrait comparer correctement', () => {
      expect(service.evaluate({ field: 'montant', operator: 'gt', value: 50000000 }, context)).toBe(true);
      expect(service.evaluate({ field: 'montant', operator: 'gt', value: 100000000 }, context)).toBe(false);
    });

    it('gte: devrait comparer correctement', () => {
      expect(service.evaluate({ field: 'montant', operator: 'gte', value: 75000000 }, context)).toBe(true);
      expect(service.evaluate({ field: 'montant', operator: 'gte', value: 75000001 }, context)).toBe(false);
    });

    it('lt: devrait comparer correctement', () => {
      expect(service.evaluate({ field: 'montant', operator: 'lt', value: 100000000 }, context)).toBe(true);
      expect(service.evaluate({ field: 'montant', operator: 'lt', value: 50000000 }, context)).toBe(false);
    });

    it('lte: devrait comparer correctement', () => {
      expect(service.evaluate({ field: 'montant', operator: 'lte', value: 75000000 }, context)).toBe(true);
      expect(service.evaluate({ field: 'montant', operator: 'lte', value: 74999999 }, context)).toBe(false);
    });
  });

  describe('opérateurs de collection', () => {
    it('in: devrait vérifier l\'appartenance', () => {
      const guard: GuardExpression = { field: 'type', operator: 'in', value: ['TRAVAUX', 'FOURNITURES'] };
      expect(service.evaluate(guard, context)).toBe(true);
    });

    it('in: devrait échouer si absent', () => {
      const guard: GuardExpression = { field: 'type', operator: 'in', value: ['SERVICES'] };
      expect(service.evaluate(guard, context)).toBe(false);
    });

    it('not_in: devrait vérifier la non-appartenance', () => {
      const guard: GuardExpression = { field: 'type', operator: 'not_in', value: ['SERVICES'] };
      expect(service.evaluate(guard, context)).toBe(true);
    });
  });

  describe('opérateur contains', () => {
    it('devrait vérifier la sous-chaîne', () => {
      const guard: GuardExpression = { field: 'description', operator: 'contains', value: 'Cotonou' };
      expect(service.evaluate(guard, context)).toBe(true);
    });

    it('devrait échouer si absent', () => {
      const guard: GuardExpression = { field: 'description', operator: 'contains', value: 'Parakou' };
      expect(service.evaluate(guard, context)).toBe(false);
    });
  });

  describe('opérateur regex', () => {
    it('devrait évaluer l\'expression régulière', () => {
      const guard: GuardExpression = { field: 'description', operator: 'regex', value: '^Construction' };
      expect(service.evaluate(guard, context)).toBe(true);
    });

    it('devrait échouer si pas de match', () => {
      const guard: GuardExpression = { field: 'description', operator: 'regex', value: '^Réhabilitation' };
      expect(service.evaluate(guard, context)).toBe(false);
    });

    it('devrait gérer les regex invalides', () => {
      const guard: GuardExpression = { field: 'description', operator: 'regex', value: '[[invalid' };
      expect(service.evaluate(guard, context)).toBe(false);
    });
  });

  describe('chemins imbriqués (dot notation)', () => {
    it('devrait résoudre les champs imbriqués', () => {
      const guard: GuardExpression = { field: 'fournisseur.pays', operator: 'eq', value: 'BJ' };
      expect(service.evaluate(guard, context)).toBe(true);
    });

    it('devrait retourner undefined pour un chemin inexistant', () => {
      const guard: GuardExpression = { field: 'fournisseur.ville', operator: 'eq', value: 'Cotonou' };
      expect(service.evaluate(guard, context)).toBe(false);
    });
  });

  describe('garde null/undefined', () => {
    it('devrait retourner true si pas de garde', () => {
      expect(service.evaluate(null, context)).toBe(true);
      expect(service.evaluate(undefined, context)).toBe(true);
    });
  });

  describe('gardes multiples (AND logic)', () => {
    it('devrait évaluer toutes les conditions (toutes vraies)', () => {
      const guards: GuardExpression[] = [
        { field: 'montant', operator: 'gt', value: 50000000 },
        { field: 'type', operator: 'eq', value: 'TRAVAUX' },
      ];
      expect(service.evaluate(guards, context)).toBe(true);
    });

    it('devrait échouer si une condition est fausse', () => {
      const guards: GuardExpression[] = [
        { field: 'montant', operator: 'gt', value: 50000000 },
        { field: 'type', operator: 'eq', value: 'FOURNITURES' },
      ];
      expect(service.evaluate(guards, context)).toBe(false);
    });
  });
});
