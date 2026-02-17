import { createRunner, WorkflowTestRunner } from './helpers/workflow-test-runner';

describe('wf-ordre-service — Ordre de service (Integration)', () => {
  let wf: WorkflowTestRunner;

  beforeEach(() => {
    wf = createRunner('wf-ordre-service.yaml');
  });

  describe('Chargement YAML', () => {
    it('devrait charger le YAML', () => {
      expect(wf.nodes.length).toBeGreaterThanOrEqual(9);
    });
  });

  describe('Happy path', () => {
    it('devrait traiter un ordre de service', () => {
      wf.start({ entityType: 'ORDRE_SERVICE', entityId: 'os-001', actorId: 'ppm' });

      while (wf.status === 'ACTIVE') {
        const satisfied = wf.getAvailableActions().filter((a) => a.guardSatisfied);
        if (satisfied.length === 0) break;
        const next = satisfied[0];
        wf.transition(next.action, {
          actorId: 'user-1',
          comment: next.requiresComment ? 'ok' : undefined,
          signatureId: next.requiresSignature ? 'sig' : undefined,
          attachments: next.requiresAttachment ? ['os.pdf'] : undefined,
        });
      }

      expect(['ACTIVE', 'COMPLETED']).toContain(wf.status);
    });
  });

  describe('Boucle révision', () => {
    it('devrait avoir un LOOP', () => {
      expect(wf.getLoopNodes().length).toBeGreaterThanOrEqual(1);
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

  describe('Kafka et traçabilité', () => {
    it('devrait émettre WORKFLOW_STARTED', () => {
      wf.start({ entityType: 'ORDRE_SERVICE', entityId: 'os-k', actorId: 'user-1' });
      expect(wf.kafkaEvents[0].eventType).toBe('WORKFLOW_STARTED');
      expect(wf.events[0].action).toBe('WORKFLOW_STARTED');
    });
  });
});
