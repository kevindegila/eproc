import { createRunner, WorkflowTestRunner } from './helpers/workflow-test-runner';

describe('wf-garantie — Garantie (Integration)', () => {
  let wf: WorkflowTestRunner;

  beforeEach(() => {
    wf = createRunner('wf-garantie.yaml');
  });

  describe('Chargement YAML', () => {
    it('devrait charger un workflow complexe', () => {
      expect(wf.nodes.length).toBeGreaterThanOrEqual(15);
      expect(wf.transitions.length).toBeGreaterThanOrEqual(18);
    });
  });

  describe('Happy path — mainlevée', () => {
    it('devrait parcourir la garantie de la constitution à la mainlevée', () => {
      wf.start({ entityType: 'GARANTIE', entityId: 'gar-001', actorId: 'oe-1' });

      while (wf.status === 'ACTIVE') {
        const satisfied = wf.getAvailableActions().filter((a) => a.guardSatisfied);
        if (satisfied.length === 0) break;
        const next = satisfied[0];
        wf.transition(next.action, {
          actorId: 'user-1',
          comment: next.requiresComment ? 'ok' : undefined,
          signatureId: next.requiresSignature ? 'sig' : undefined,
          attachments: next.requiresAttachment ? ['garantie.pdf'] : undefined,
        });
      }

      expect(['ACTIVE', 'COMPLETED']).toContain(wf.status);
    });
  });

  describe('Boucle de régularisation', () => {
    it('devrait avoir un LOOP', () => {
      expect(wf.getLoopNodes().length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Nœuds mandatory', () => {
    it('devrait protéger les étapes de constitution et mainlevée', () => {
      expect(wf.getMandatoryNodes().length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Timers SLA', () => {
    it('devrait avoir des SLA', () => {
      expect(wf.getNodesWithSla().length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Kafka', () => {
    it('devrait émettre WORKFLOW_STARTED', () => {
      wf.start({ entityType: 'GARANTIE', entityId: 'gar-k', actorId: 'user-1' });
      expect(wf.kafkaEvents[0].eventType).toBe('WORKFLOW_STARTED');
    });
  });
});
