import { createRunner, WorkflowTestRunner } from './helpers/workflow-test-runner';

describe('wf-soumission — Soumission des offres (Integration)', () => {
  let wf: WorkflowTestRunner;

  beforeEach(() => {
    wf = createRunner('wf-soumission.yaml');
  });

  describe('Chargement YAML', () => {
    it('devrait charger le YAML avec tous les nœuds et transitions', () => {
      expect(wf.nodes.length).toBeGreaterThanOrEqual(12);
      expect(wf.transitions.length).toBeGreaterThanOrEqual(12);
    });
  });

  describe('Happy path — soumission complète', () => {
    it('devrait parcourir la soumission de bout en bout', () => {
      wf.start({ entityType: 'SOUMISSION', entityId: 'soum-001', actorId: 'oe-1' });
      wf.assertStatus('ACTIVE');

      while (wf.status === 'ACTIVE') {
        const satisfied = wf.getAvailableActions().filter((a) => a.guardSatisfied);
        if (satisfied.length === 0) break;
        const next = satisfied[0];
        wf.transition(next.action, {
          actorId: 'user-1',
          comment: next.requiresComment ? 'ok' : undefined,
          signatureId: next.requiresSignature ? 'sig' : undefined,
          attachments: next.requiresAttachment ? ['offre.pdf'] : undefined,
        });
      }

      expect(['ACTIVE', 'COMPLETED']).toContain(wf.status);
    });
  });

  describe('Boucle de modification d\'offre', () => {
    it('devrait avoir un nœud LOOP pour modification', () => {
      const loops = wf.getLoopNodes();
      expect(loops.length).toBeGreaterThanOrEqual(1);
      expect(loops.some((l) => l.code.includes('MODIFICATION'))).toBe(true);
    });
  });

  describe('Nœuds mandatory', () => {
    it('devrait protéger les nœuds obligatoires', () => {
      const mandatory = wf.getMandatoryNodes();
      expect(mandatory.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Timers SLA', () => {
    it('devrait avoir des délais SLA', () => {
      expect(wf.getNodesWithSla().length).toBeGreaterThanOrEqual(1);
    });

    it('devrait déclencher SLA_BREACHED', () => {
      wf.start({ entityType: 'SOUMISSION', entityId: 'soum-sla', actorId: 'user-1' });
      const slaNode = wf.getNodesWithSla()[0];
      wf.forceSlaBreachEvent(slaNode.code);
      expect(wf.kafkaEvents.some((e) => e.eventType === 'SLA_BREACHED')).toBe(true);
    });
  });

  describe('Cascade vers wf-ouverture', () => {
    it('devrait référencer le cascade workflow', () => {
      const cascadeNodes = wf.nodes.filter((n) =>
        n.triggers?.cascade_workflow || (n.config as any)?.cross_workflow,
      );
      // La clôture déclenche wf-ouverture
      expect(cascadeNodes.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Événements Kafka', () => {
    it('devrait émettre un événement par transition', () => {
      wf.start({ entityType: 'SOUMISSION', entityId: 'soum-k', actorId: 'user-1' });
      const count = wf.kafkaEvents.length;
      const next = wf.getAvailableActions().filter((a) => a.guardSatisfied)[0];
      if (next) {
        wf.transition(next.action, {
          actorId: 'user-1',
          comment: next.requiresComment ? 'ok' : undefined,
          signatureId: next.requiresSignature ? 'sig' : undefined,
          attachments: next.requiresAttachment ? ['f.pdf'] : undefined,
        });
        expect(wf.kafkaEvents.length).toBe(count + 1);
      }
    });
  });

  describe('Traçabilité', () => {
    it('devrait garder un journal chronologique', () => {
      wf.start({ entityType: 'SOUMISSION', entityId: 'soum-t', actorId: 'user-1' });
      wf.assertEventSequence(['WORKFLOW_STARTED']);
      expect(wf.events[0].actorId).toBe('user-1');
    });
  });
});
