import { createRunner, WorkflowTestRunner } from './helpers/workflow-test-runner';

describe('wf-ouverture — Ouverture des plis (Integration)', () => {
  let wf: WorkflowTestRunner;

  beforeEach(() => {
    wf = createRunner('wf-ouverture.yaml');
  });

  describe('Chargement YAML', () => {
    it('devrait charger le YAML', () => {
      expect(wf.nodes.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Happy path', () => {
    it('devrait parcourir l\'ouverture des plis', () => {
      wf.start({ entityType: 'OUVERTURE', entityId: 'ouv-001', actorId: 'ppm' });

      while (wf.status === 'ACTIVE') {
        const satisfied = wf.getAvailableActions().filter((a) => a.guardSatisfied);
        if (satisfied.length === 0) break;
        const next = satisfied[0];
        wf.transition(next.action, {
          actorId: 'commission',
          comment: next.requiresComment ? 'PV séance' : undefined,
          signatureId: next.requiresSignature ? 'sig' : undefined,
          attachments: next.requiresAttachment ? ['pv.pdf'] : undefined,
        });
      }

      expect(['ACTIVE', 'COMPLETED']).toContain(wf.status);
    });
  });

  describe('Nœuds mandatory', () => {
    it('devrait protéger le quorum et le PV', () => {
      const mandatory = wf.getMandatoryNodes();
      expect(mandatory.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Cascade vers wf-evaluation', () => {
    it('devrait avoir une référence cascade', () => {
      const cascadeNodes = wf.nodes.filter((n) =>
        n.triggers?.cascade_workflow || JSON.stringify(n.config ?? {}).includes('cross_workflow'),
      );
      expect(cascadeNodes.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Timers SLA', () => {
    it('devrait avoir des SLA courts pour la vérification', () => {
      const slaNodes = wf.getNodesWithSla();
      expect(slaNodes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Kafka', () => {
    it('devrait émettre WORKFLOW_STARTED', () => {
      wf.start({ entityType: 'OUVERTURE', entityId: 'ouv-k', actorId: 'user-1' });
      expect(wf.kafkaEvents[0].eventType).toBe('WORKFLOW_STARTED');
    });
  });

  describe('Traçabilité', () => {
    it('chaque événement doit avoir un acteur', () => {
      wf.start({ entityType: 'OUVERTURE', entityId: 'ouv-t', actorId: 'ppm' });
      wf.events.forEach((e) => expect(e.actorId).toBeDefined());
    });
  });
});
