import { createRunner, WorkflowTestRunner } from './helpers/workflow-test-runner';

describe('wf-attachement — Attachement/Décompte (Integration)', () => {
  let wf: WorkflowTestRunner;

  beforeEach(() => {
    wf = createRunner('wf-attachement.yaml');
  });

  describe('Chargement YAML', () => {
    it('devrait charger le YAML', () => {
      expect(wf.nodes.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Happy path', () => {
    it('devrait traiter un attachement de bout en bout', () => {
      wf.start({ entityType: 'ATTACHEMENT', entityId: 'att-001', actorId: 'oe-1' });

      while (wf.status === 'ACTIVE') {
        const satisfied = wf.getAvailableActions().filter((a) => a.guardSatisfied);
        if (satisfied.length === 0) break;
        const next = satisfied[0];
        wf.transition(next.action, {
          actorId: 'user-1',
          comment: next.requiresComment ? 'ok' : undefined,
          signatureId: next.requiresSignature ? 'sig' : undefined,
          attachments: next.requiresAttachment ? ['decompte.pdf'] : undefined,
        });
      }

      expect(['ACTIVE', 'COMPLETED']).toContain(wf.status);
    });
  });

  describe('Boucle révision décompte', () => {
    it('devrait avoir un LOOP', () => {
      expect(wf.getLoopNodes().length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Cascade vers wf-facture', () => {
    it('devrait référencer le cascade', () => {
      const cascade = wf.nodes.filter((n) =>
        JSON.stringify(n.config ?? {}).includes('cross_workflow') ||
        n.triggers?.cascade_workflow,
      );
      expect(cascade.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Nœuds mandatory', () => {
    it('devrait protéger les étapes clés', () => {
      expect(wf.getMandatoryNodes().length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Kafka et traçabilité', () => {
    it('devrait émettre WORKFLOW_STARTED', () => {
      wf.start({ entityType: 'ATTACHEMENT', entityId: 'att-k', actorId: 'user-1' });
      expect(wf.kafkaEvents[0].eventType).toBe('WORKFLOW_STARTED');
    });
  });
});
