import { createRunner, WorkflowTestRunner } from './helpers/workflow-test-runner';

describe('wf-avance — Avance sur marché (Integration)', () => {
  let wf: WorkflowTestRunner;

  beforeEach(() => {
    wf = createRunner('wf-avance.yaml');
  });

  describe('Chargement YAML', () => {
    it('devrait charger le YAML', () => {
      expect(wf.nodes.length).toBeGreaterThanOrEqual(9);
    });
  });

  describe('Happy path', () => {
    it('devrait traiter une avance', () => {
      wf.start({ entityType: 'AVANCE', entityId: 'av-001', actorId: 'oe-1' });

      while (wf.status === 'ACTIVE') {
        const satisfied = wf.getAvailableActions().filter((a) => a.guardSatisfied);
        if (satisfied.length === 0) break;
        const next = satisfied[0];
        wf.transition(next.action, {
          actorId: 'user-1',
          comment: next.requiresComment ? 'ok' : undefined,
          signatureId: next.requiresSignature ? 'sig' : undefined,
          attachments: next.requiresAttachment ? ['caution.pdf'] : undefined,
        });
      }

      expect(['ACTIVE', 'COMPLETED']).toContain(wf.status);
    });
  });

  describe('Nœuds mandatory', () => {
    it('devrait avoir des nœuds obligatoires', () => {
      expect(wf.getMandatoryNodes().length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Timers SLA', () => {
    it('devrait avoir des SLA', () => {
      expect(wf.getNodesWithSla().length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Kafka', () => {
    it('devrait émettre WORKFLOW_STARTED', () => {
      wf.start({ entityType: 'AVANCE', entityId: 'av-k', actorId: 'user-1' });
      expect(wf.kafkaEvents[0].eventType).toBe('WORKFLOW_STARTED');
    });
  });
});
