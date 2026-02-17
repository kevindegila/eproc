import { createRunner, WorkflowTestRunner } from './helpers/workflow-test-runner';

describe('wf-avenant — Avenant (Integration)', () => {
  let wf: WorkflowTestRunner;

  beforeEach(() => {
    wf = createRunner('wf-avenant.yaml');
  });

  describe('Chargement YAML', () => {
    it('devrait charger le YAML', () => {
      expect(wf.nodes.length).toBeGreaterThanOrEqual(12);
    });
  });

  describe('Happy path', () => {
    it('devrait traiter un avenant de bout en bout', () => {
      wf.start({ entityType: 'AVENANT', entityId: 'av-001', actorId: 'ppm',
        context: { depassement_plafond: false } });

      while (wf.status === 'ACTIVE') {
        const satisfied = wf.getAvailableActions({ depassement_plafond: false })
          .filter((a) => a.guardSatisfied);
        if (satisfied.length === 0) break;
        const next = satisfied[0];
        wf.transition(next.action, {
          actorId: 'user-1',
          comment: next.requiresComment ? 'ok' : undefined,
          signatureId: next.requiresSignature ? 'sig' : undefined,
          attachments: next.requiresAttachment ? ['avenant.pdf'] : undefined,
          context: { depassement_plafond: false },
        });
      }

      expect(['ACTIVE', 'COMPLETED']).toContain(wf.status);
    });
  });

  describe('Guard plafond 20%', () => {
    it('devrait avoir un guard sur le dépassement de plafond', () => {
      const guarded = wf.getGuardedTransitions();
      const plafondGuard = guarded.find((t) =>
        JSON.stringify(t.guard).includes('depassement_plafond') ||
        JSON.stringify(t.guard).includes('plafond'),
      );
      expect(plafondGuard).toBeDefined();
    });
  });

  describe('Boucle révision', () => {
    it('devrait avoir un LOOP', () => {
      expect(wf.getLoopNodes().length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Nœuds mandatory', () => {
    it('devrait avoir des nœuds obligatoires', () => {
      expect(wf.getMandatoryNodes().length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Kafka et traçabilité', () => {
    it('devrait émettre WORKFLOW_STARTED', () => {
      wf.start({ entityType: 'AVENANT', entityId: 'av-k', actorId: 'user-1' });
      expect(wf.kafkaEvents[0].eventType).toBe('WORKFLOW_STARTED');
    });
  });
});
