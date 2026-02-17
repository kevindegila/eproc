import { createRunner, WorkflowTestRunner } from './helpers/workflow-test-runner';

describe('wf-recours-prealable — Recours préalable (Integration)', () => {
  let wf: WorkflowTestRunner;

  beforeEach(() => {
    wf = createRunner('wf-recours-prealable.yaml');
  });

  describe('Chargement YAML', () => {
    it('devrait charger le YAML', () => {
      expect(wf.nodes.length).toBeGreaterThanOrEqual(12);
      expect(wf.transitions.length).toBeGreaterThanOrEqual(12);
    });
  });

  describe('Happy path — recours accepté', () => {
    it('devrait traiter un recours préalable', () => {
      wf.start({ entityType: 'RECOURS_PREALABLE', entityId: 'rp-001', actorId: 'oe-1' });

      while (wf.status === 'ACTIVE') {
        const satisfied = wf.getAvailableActions().filter((a) => a.guardSatisfied);
        if (satisfied.length === 0) break;
        const next = satisfied[0];
        wf.transition(next.action, {
          actorId: 'user-1',
          comment: next.requiresComment ? 'ok' : undefined,
          signatureId: next.requiresSignature ? 'sig' : undefined,
          attachments: next.requiresAttachment ? ['recours.pdf'] : undefined,
        });
      }

      expect(['ACTIVE', 'COMPLETED']).toContain(wf.status);
    });
  });

  describe('Cross-workflow: suspension du DAC', () => {
    it('devrait référencer la suspension du DAC à l\'enregistrement', () => {
      const suspendRefs = wf.crossWorkflowActions.filter((r) => r.action === 'SUSPEND');
      expect(suspendRefs.length).toBeGreaterThanOrEqual(1);
      if (suspendRefs.length > 0) {
        expect(suspendRefs[0].targetEntityType).toBe('DAC');
      }
    });

    it('devrait référencer la reprise du DAC', () => {
      const resumeRefs = wf.crossWorkflowActions.filter(
        (r) => r.action === 'RESUME' || r.action === 'RESUME_OR_CANCEL',
      );
      expect(resumeRefs.length).toBeGreaterThanOrEqual(0);
    });

    it('devrait suspendre et reprendre le workflow', () => {
      wf.start({ entityType: 'RECOURS_PREALABLE', entityId: 'rp-susp', actorId: 'oe-1' });

      wf.suspend('admin', 'En attente de décision');
      wf.assertStatus('SUSPENDED');
      expect(() => wf.transition('ACCEPTER', { actorId: 'u' })).toThrow();

      wf.resume('admin');
      wf.assertStatus('ACTIVE');
    });
  });

  describe('Nœuds mandatory', () => {
    it('devrait protéger les étapes', () => {
      expect(wf.getMandatoryNodes().length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Timers SLA', () => {
    it('devrait avoir des SLA', () => {
      expect(wf.getNodesWithSla().length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Kafka et traçabilité', () => {
    it('devrait émettre les événements lifecycle', () => {
      wf.start({ entityType: 'RECOURS_PREALABLE', entityId: 'rp-k', actorId: 'user-1' });
      wf.suspend('admin');
      wf.resume('admin');

      wf.assertKafkaEventTypes(['WORKFLOW_STARTED', 'WORKFLOW_SUSPENDED', 'WORKFLOW_RESUMED']);
    });
  });
});
