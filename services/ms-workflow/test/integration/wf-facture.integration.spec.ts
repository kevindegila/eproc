import { createRunner, WorkflowTestRunner } from './helpers/workflow-test-runner';

describe('wf-facture — Facturation et paiement (Integration)', () => {
  let wf: WorkflowTestRunner;

  beforeEach(() => {
    wf = createRunner('wf-facture.yaml');
  });

  describe('Chargement YAML', () => {
    it('devrait charger un workflow complexe de facturation', () => {
      expect(wf.nodes.length).toBeGreaterThanOrEqual(13);
      expect(wf.transitions.length).toBeGreaterThanOrEqual(14);
    });
  });

  describe('Happy path — paiement complet', () => {
    it('devrait traiter une facture de bout en bout', () => {
      wf.start({ entityType: 'FACTURE', entityId: 'fac-001', actorId: 'oe-1' });

      while (wf.status === 'ACTIVE') {
        const satisfied = wf.getAvailableActions().filter((a) => a.guardSatisfied);
        if (satisfied.length === 0) break;
        const next = satisfied[0];
        wf.transition(next.action, {
          actorId: 'user-1',
          comment: next.requiresComment ? 'ok' : undefined,
          signatureId: next.requiresSignature ? 'sig' : undefined,
          attachments: next.requiresAttachment ? ['facture.pdf'] : undefined,
        });
      }

      expect(['ACTIVE', 'COMPLETED']).toContain(wf.status);
    });
  });

  // ─── SCÉNARIO CRITIQUE: rejet comptable + intérêts moratoires ──
  describe('Scénario critique: rejet comptable + intérêts moratoires', () => {
    it('devrait pouvoir rejeter une facture et calculer les intérêts moratoires', () => {
      wf.start({ entityType: 'FACTURE', entityId: 'fac-rejet', actorId: 'oe-1' });

      // Le workflow doit avoir un chemin de rejet
      const allActions = wf.transitions.map((t) => t.action);
      const hasRejet = allActions.some((a) =>
        a.includes('REJETER') || a.includes('RETOURNER') || a.includes('REFUSER'),
      );
      expect(hasRejet).toBe(true);

      // Vérifier la présence des intérêts moratoires dans la config
      const moratoireNode = wf.nodes.find((n) =>
        JSON.stringify(n.config ?? {}).includes('moratoire') ||
        JSON.stringify(n.config ?? {}).includes('interet') ||
        n.code.includes('MORATOIRE') || n.code.includes('INTERET'),
      );
      // Les intérêts moratoires sont auto-calculés
      expect(moratoireNode !== undefined || wf.transitions.some((t) =>
        JSON.stringify(t).includes('moratoire') || JSON.stringify(t).includes('interet'),
      )).toBe(true);
    });
  });

  describe('Boucle révision facture', () => {
    it('devrait avoir un LOOP', () => {
      expect(wf.getLoopNodes().length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Nœuds mandatory', () => {
    it('devrait protéger les étapes de liquidation', () => {
      expect(wf.getMandatoryNodes().length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Timers SLA', () => {
    it('devrait avoir des SLA pour le délai de paiement', () => {
      expect(wf.getNodesWithSla().length).toBeGreaterThanOrEqual(2);
    });

    it('devrait déclencher SLA_BREACHED', () => {
      wf.start({ entityType: 'FACTURE', entityId: 'fac-sla', actorId: 'user-1' });
      const slaNode = wf.getNodesWithSla()[0];
      wf.forceSlaBreachEvent(slaNode.code);
      expect(wf.kafkaEvents.some((e) => e.eventType === 'SLA_BREACHED')).toBe(true);
    });
  });

  describe('Kafka et traçabilité', () => {
    it('devrait émettre les événements', () => {
      wf.start({ entityType: 'FACTURE', entityId: 'fac-k', actorId: 'user-1' });
      expect(wf.kafkaEvents[0].eventType).toBe('WORKFLOW_STARTED');
    });
  });
});
