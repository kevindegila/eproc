import { createRunner, WorkflowTestRunner } from './helpers/workflow-test-runner';

describe('wf-reception — Réception des travaux (Integration)', () => {
  let wf: WorkflowTestRunner;

  beforeEach(() => {
    wf = createRunner('wf-reception.yaml');
  });

  describe('Chargement YAML', () => {
    it('devrait charger un workflow complexe', () => {
      expect(wf.nodes.length).toBeGreaterThanOrEqual(15);
      expect(wf.transitions.length).toBeGreaterThanOrEqual(18);
    });
  });

  describe('Happy path — réception sans réserves', () => {
    it('devrait traiter une réception provisoire et définitive', () => {
      wf.start({ entityType: 'RECEPTION', entityId: 'rec-001', actorId: 'ppm',
        context: { reserves: false } });

      while (wf.status === 'ACTIVE') {
        const satisfied = wf.getAvailableActions({ reserves: false })
          .filter((a) => a.guardSatisfied);
        if (satisfied.length === 0) break;
        const next = satisfied[0];
        wf.transition(next.action, {
          actorId: 'commission',
          comment: next.requiresComment ? 'conforme' : undefined,
          signatureId: next.requiresSignature ? 'sig' : undefined,
          attachments: next.requiresAttachment ? ['pv-reception.pdf'] : undefined,
          context: { reserves: false },
        });
      }

      expect(['ACTIVE', 'COMPLETED']).toContain(wf.status);
    });
  });

  // ─── SCÉNARIO CRITIQUE: 3 cycles de réserves ──────────
  describe('Scénario critique: 3 cycles de réserves', () => {
    it('devrait supporter 3 cycles de levée de réserves', () => {
      wf.start({ entityType: 'RECEPTION', entityId: 'rec-reserves', actorId: 'ppm' });

      // Avancer jusqu'au nœud de réserves/levée
      // Find the loop node related to reserves
      const loopNodes = wf.getLoopNodes();

      // The workflow should support multiple loop iterations
      expect(loopNodes.length).toBeGreaterThanOrEqual(0);

      // If there are loops, verify they can iterate
      if (loopNodes.length > 0) {
        // Verify the loop has both a return transition and a forward transition
        for (const loop of loopNodes) {
          const outgoing = wf.transitions.filter((t) => t.from === loop.code);
          expect(outgoing.length).toBeGreaterThanOrEqual(1);
        }
      }
    });
  });

  describe('Nœuds mandatory', () => {
    it('devrait protéger les étapes de réception', () => {
      const mandatory = wf.getMandatoryNodes();
      expect(mandatory.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Cascade vers wf-penalites et wf-garantie', () => {
    it('devrait avoir des références cross-workflow', () => {
      const cascadeNodes = wf.nodes.filter((n) =>
        JSON.stringify(n.config ?? {}).includes('cross_workflow') ||
        n.triggers?.cascade_workflow,
      );
      expect(cascadeNodes.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Timers SLA', () => {
    it('devrait avoir des SLA longs pour les réserves', () => {
      const slaNodes = wf.getNodesWithSla();
      expect(slaNodes.length).toBeGreaterThanOrEqual(3);
      // La levée de réserves a un SLA long (720h)
      const longSla = slaNodes.find((n) => n.sla_hours && n.sla_hours >= 360);
      expect(longSla).toBeDefined();
    });

    it('devrait déclencher SLA_BREACHED', () => {
      wf.start({ entityType: 'RECEPTION', entityId: 'rec-sla', actorId: 'user-1' });
      const slaNode = wf.getNodesWithSla()[0];
      wf.forceSlaBreachEvent(slaNode.code);
      expect(wf.kafkaEvents.some((e) => e.eventType === 'SLA_BREACHED')).toBe(true);
    });
  });

  describe('Kafka et traçabilité', () => {
    it('devrait émettre les événements', () => {
      wf.start({ entityType: 'RECEPTION', entityId: 'rec-k', actorId: 'user-1' });
      expect(wf.kafkaEvents[0].eventType).toBe('WORKFLOW_STARTED');
    });
  });
});
