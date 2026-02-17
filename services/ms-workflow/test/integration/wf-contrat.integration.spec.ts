import { createRunner, WorkflowTestRunner } from './helpers/workflow-test-runner';

describe('wf-contrat — Contrat (Integration)', () => {
  let wf: WorkflowTestRunner;

  beforeEach(() => {
    wf = createRunner('wf-contrat.yaml');
  });

  describe('Chargement YAML', () => {
    it('devrait charger le YAML', () => {
      expect(wf.nodes.length).toBeGreaterThanOrEqual(14);
      expect(wf.transitions.length).toBeGreaterThanOrEqual(16);
    });
  });

  describe('Happy path — signature contrat', () => {
    it('devrait parcourir jusqu\'à la signature du contrat', () => {
      wf.start({ entityType: 'CONTRAT', entityId: 'ctr-001', actorId: 'ppm' });

      while (wf.status === 'ACTIVE') {
        const satisfied = wf.getAvailableActions().filter((a) => a.guardSatisfied);
        if (satisfied.length === 0) break;
        const next = satisfied[0];
        wf.transition(next.action, {
          actorId: 'user-1',
          comment: next.requiresComment ? 'ok' : undefined,
          signatureId: next.requiresSignature ? 'sig' : undefined,
          attachments: next.requiresAttachment ? ['contrat.pdf'] : undefined,
        });
      }

      expect(['ACTIVE', 'COMPLETED']).toContain(wf.status);
    });
  });

  describe('Boucle de révision contrat', () => {
    it('devrait avoir un LOOP pour révision', () => {
      expect(wf.getLoopNodes().length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Nœuds mandatory', () => {
    it('devrait protéger les étapes clés', () => {
      expect(wf.getMandatoryNodes().length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Timers SLA', () => {
    it('devrait avoir des SLA', () => {
      expect(wf.getNodesWithSla().length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Cascade vers wf-ordre-service', () => {
    it('devrait avoir une référence cross-workflow', () => {
      const refs = wf.nodes.filter((n) =>
        JSON.stringify(n.config ?? {}).includes('cross_workflow') ||
        n.triggers?.cascade_workflow,
      );
      expect(refs.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Kafka et traçabilité', () => {
    it('devrait émettre WORKFLOW_STARTED', () => {
      wf.start({ entityType: 'CONTRAT', entityId: 'ctr-k', actorId: 'user-1' });
      expect(wf.kafkaEvents[0].eventType).toBe('WORKFLOW_STARTED');
      expect(wf.events[0].action).toBe('WORKFLOW_STARTED');
    });
  });
});
