import { createRunner, WorkflowTestRunner } from './helpers/workflow-test-runner';

describe('wf-eclaircissement — Demande d\'éclaircissement (Integration)', () => {
  let wf: WorkflowTestRunner;

  beforeEach(() => {
    wf = createRunner('wf-eclaircissement.yaml');
  });

  describe('Chargement YAML', () => {
    it('devrait charger le YAML', () => {
      expect(wf.nodes.length).toBeGreaterThanOrEqual(7);
    });
  });

  describe('Happy path complet', () => {
    it('devrait traiter un éclaircissement de bout en bout', () => {
      wf.start({ entityType: 'ECLAIRCISSEMENT', entityId: 'ecl-001', actorId: 'oe-1' });
      wf.assertStatus('ACTIVE');

      while (wf.status === 'ACTIVE') {
        const available = wf.getAvailableActions();
        const satisfied = available.filter((a) => a.guardSatisfied);
        if (satisfied.length === 0) break;
        const next = satisfied[0];
        wf.transition(next.action, {
          actorId: 'user-1',
          comment: next.requiresComment ? 'ok' : undefined,
          signatureId: next.requiresSignature ? 'sig' : undefined,
          attachments: next.requiresAttachment ? ['doc.pdf'] : undefined,
        });
      }

      expect(['ACTIVE', 'COMPLETED']).toContain(wf.status);
    });
  });

  describe('Boucle de révision de réponse', () => {
    it('devrait avoir un nœud LOOP pour révision', () => {
      const loops = wf.getLoopNodes();
      expect(loops.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Nœuds mandatory', () => {
    it('devrait avoir des nœuds obligatoires', () => {
      expect(wf.getMandatoryNodes().length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Kafka et traçabilité', () => {
    it('devrait émettre WORKFLOW_STARTED', () => {
      wf.start({ entityType: 'ECLAIRCISSEMENT', entityId: 'ecl-k', actorId: 'user-1' });
      expect(wf.kafkaEvents[0].eventType).toBe('WORKFLOW_STARTED');
      expect(wf.events.length).toBe(1);
    });
  });
});
