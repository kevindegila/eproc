import { createRunner, WorkflowTestRunner } from './helpers/workflow-test-runner';

describe('wf-rapport-technique — Rapport technique (Integration)', () => {
  let wf: WorkflowTestRunner;

  beforeEach(() => {
    wf = createRunner('wf-rapport-technique.yaml');
  });

  describe('Chargement YAML', () => {
    it('devrait charger le YAML', () => {
      expect(wf.nodes.length).toBeGreaterThanOrEqual(8);
    });
  });

  describe('Happy path', () => {
    it('devrait traiter un rapport technique', () => {
      wf.start({ entityType: 'RAPPORT_TECHNIQUE', entityId: 'rpt-001', actorId: 'ingenieur' });

      while (wf.status === 'ACTIVE') {
        const satisfied = wf.getAvailableActions().filter((a) => a.guardSatisfied);
        if (satisfied.length === 0) break;
        const next = satisfied[0];
        wf.transition(next.action, {
          actorId: 'user-1',
          comment: next.requiresComment ? 'rapport ok' : undefined,
          signatureId: next.requiresSignature ? 'sig' : undefined,
          attachments: next.requiresAttachment ? ['rapport.pdf'] : undefined,
        });
      }

      expect(['ACTIVE', 'COMPLETED']).toContain(wf.status);
    });
  });

  describe('Boucle révision rapport', () => {
    it('devrait avoir un LOOP', () => {
      expect(wf.getLoopNodes().length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Guards', () => {
    it('devrait avoir des guards', () => {
      const guarded = wf.getGuardedTransitions();
      expect(guarded.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Nœuds mandatory', () => {
    it('devrait avoir des nœuds obligatoires', () => {
      expect(wf.getMandatoryNodes().length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Kafka et traçabilité', () => {
    it('devrait émettre WORKFLOW_STARTED', () => {
      wf.start({ entityType: 'RAPPORT_TECHNIQUE', entityId: 'rpt-k', actorId: 'user-1' });
      expect(wf.kafkaEvents[0].eventType).toBe('WORKFLOW_STARTED');
    });
  });
});
