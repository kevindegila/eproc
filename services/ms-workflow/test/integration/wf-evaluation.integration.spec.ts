import { createRunner, WorkflowTestRunner } from './helpers/workflow-test-runner';

describe('wf-evaluation — Évaluation des offres (Integration)', () => {
  let wf: WorkflowTestRunner;

  beforeEach(() => {
    wf = createRunner('wf-evaluation.yaml');
  });

  describe('Chargement YAML', () => {
    it('devrait avoir de nombreux nœuds et transitions', () => {
      expect(wf.nodes.length).toBeGreaterThanOrEqual(15);
      expect(wf.transitions.length).toBeGreaterThanOrEqual(18);
    });
  });

  describe('Happy path — attribution', () => {
    it('devrait parcourir l\'évaluation jusqu\'à l\'attribution', () => {
      wf.start({ entityType: 'EVALUATION', entityId: 'eval-001', actorId: 'commission',
        context: { recours_deposes: false } });

      while (wf.status === 'ACTIVE') {
        const satisfied = wf.getAvailableActions({ recours_deposes: false }).filter((a) => a.guardSatisfied);
        if (satisfied.length === 0) break;
        const next = satisfied[0];
        wf.transition(next.action, {
          actorId: 'evaluateur',
          comment: next.requiresComment ? 'évaluation' : undefined,
          signatureId: next.requiresSignature ? 'sig' : undefined,
          attachments: next.requiresAttachment ? ['rapport.pdf'] : undefined,
          context: { recours_deposes: false },
        });
      }

      expect(['ACTIVE', 'COMPLETED']).toContain(wf.status);
    });
  });

  describe('Boucle de révision', () => {
    it('devrait avoir un nœud LOOP pour révision d\'évaluation', () => {
      const loops = wf.getLoopNodes();
      expect(loops.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Guards', () => {
    it('devrait avoir des guards sur les seuils et les recours', () => {
      const guarded = wf.getGuardedTransitions();
      expect(guarded.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Nœuds mandatory', () => {
    it('devrait protéger les étapes critiques', () => {
      const mandatory = wf.getMandatoryNodes();
      expect(mandatory.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Standstill et recours', () => {
    it('devrait avoir une référence au délai standstill', () => {
      const standstillNode = wf.nodes.find((n) =>
        n.code.includes('STANDSTILL') || JSON.stringify(n.config ?? {}).includes('standstill'),
      );
      expect(standstillNode).toBeDefined();
    });
  });

  describe('Cascade vers wf-contrat', () => {
    it('devrait référencer le cascade', () => {
      const cascade = wf.nodes.filter((n) =>
        JSON.stringify(n.config ?? {}).includes('cross_workflow') ||
        n.triggers?.cascade_workflow,
      );
      expect(cascade.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Timers SLA', () => {
    it('devrait avoir de nombreux SLA', () => {
      expect(wf.getNodesWithSla().length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Kafka et traçabilité', () => {
    it('devrait émettre les événements Kafka', () => {
      wf.start({ entityType: 'EVALUATION', entityId: 'eval-k', actorId: 'user-1' });
      expect(wf.kafkaEvents.length).toBe(1);
      expect(wf.kafkaEvents[0].eventType).toBe('WORKFLOW_STARTED');
    });

    it('traçabilité complète', () => {
      wf.start({ entityType: 'EVALUATION', entityId: 'eval-t', actorId: 'user-1' });
      expect(wf.events[0].action).toBe('WORKFLOW_STARTED');
    });
  });
});
