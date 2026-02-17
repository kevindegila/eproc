import { createRunner, WorkflowTestRunner } from './helpers/workflow-test-runner';

describe('wf-penalites — Pénalités de retard (Integration)', () => {
  let wf: WorkflowTestRunner;

  beforeEach(() => {
    wf = createRunner('wf-penalites.yaml');
  });

  describe('Chargement YAML', () => {
    it('devrait charger le YAML', () => {
      expect(wf.nodes.length).toBeGreaterThanOrEqual(12);
    });
  });

  describe('Happy path — pénalité appliquée', () => {
    it('devrait traiter une pénalité de bout en bout', () => {
      wf.start({ entityType: 'PENALITE', entityId: 'pen-001', actorId: 'ppm',
        context: { taux_retard: 0.05, plafond_atteint: false } });

      while (wf.status === 'ACTIVE') {
        const satisfied = wf.getAvailableActions({ taux_retard: 0.05, plafond_atteint: false })
          .filter((a) => a.guardSatisfied);
        if (satisfied.length === 0) break;
        const next = satisfied[0];
        wf.transition(next.action, {
          actorId: 'user-1',
          comment: next.requiresComment ? 'ok' : undefined,
          signatureId: next.requiresSignature ? 'sig' : undefined,
          attachments: next.requiresAttachment ? ['mise-en-demeure.pdf'] : undefined,
          context: { taux_retard: 0.05, plafond_atteint: false },
        });
      }

      expect(['ACTIVE', 'COMPLETED']).toContain(wf.status);
    });
  });

  describe('Guard plafond et résiliation', () => {
    it('devrait avoir des guards sur le plafond', () => {
      const guarded = wf.getGuardedTransitions();
      expect(guarded.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Nœuds mandatory', () => {
    it('devrait avoir des nœuds obligatoires', () => {
      expect(wf.getMandatoryNodes().length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Timers SLA', () => {
    it('devrait avoir des SLA', () => {
      expect(wf.getNodesWithSla().length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Kafka', () => {
    it('devrait émettre WORKFLOW_STARTED', () => {
      wf.start({ entityType: 'PENALITE', entityId: 'pen-k', actorId: 'user-1' });
      expect(wf.kafkaEvents[0].eventType).toBe('WORKFLOW_STARTED');
    });
  });
});
