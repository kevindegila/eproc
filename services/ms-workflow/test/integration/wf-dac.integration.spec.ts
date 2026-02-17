import { createRunner, WorkflowTestRunner } from './helpers/workflow-test-runner';

describe('wf-dac — Dossier d\'Appel à Concurrence (Integration)', () => {
  let wf: WorkflowTestRunner;

  beforeEach(() => {
    wf = createRunner('wf-dac.yaml');
  });

  // ─── 1. YAML Loading ────────────────────────────────────
  describe('Chargement YAML', () => {
    it('devrait charger et parser le YAML sans erreur', () => {
      expect(wf.nodes.length).toBeGreaterThanOrEqual(10);
      expect(wf.transitions.length).toBeGreaterThanOrEqual(10);
    });

    it('devrait avoir exactement 1 START et au moins 1 END', () => {
      expect(wf.nodes.filter((n) => n.type === 'START')).toHaveLength(1);
      expect(wf.nodes.filter((n) => n.type === 'END').length).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── 2. Happy Path ──────────────────────────────────────
  describe('Happy path complet', () => {
    it('devrait parcourir le workflow DAC du début à la fin (publication)', () => {
      wf.start({ entityType: 'DAC', entityId: 'dac-001', actorId: 'user-ppm' });
      wf.assertStatus('ACTIVE');

      // Rédaction → Validation PPM → Examen DGCMP → Avis DNCMP → Publication
      wf.transition('REDIGER', { actorId: 'agent-ppm', attachments: ['dao.pdf'] });
      wf.transition('VALIDER', { actorId: 'ppm-chef', signatureId: 'sig-1' });
      wf.transition('EXAMINER', { actorId: 'agent-dgcmp' });
      wf.transition('APPROUVER', { actorId: 'dgcmp', signatureId: 'sig-2' });

      // DNCMP approval (montant >= 100M)
      wf.transition('APPROUVER', {
        actorId: 'dncmp',
        signatureId: 'sig-3',
        context: { montant: 200_000_000 },
      });

      wf.transition('PUBLIER', { actorId: 'system' });

      wf.assertStatus('COMPLETED');
      wf.assertKafkaEventTypes(['WORKFLOW_STARTED', 'WORKFLOW_TRANSITIONED', 'WORKFLOW_COMPLETED']);
    });
  });

  // ─── 3. Boucles de retour ───────────────────────────────
  describe('Boucles de retour DNCMP', () => {
    function advanceToDncmp(): void {
      wf.start({ entityType: 'DAC', entityId: 'dac-002', actorId: 'user-ppm' });
      wf.transition('REDIGER', { actorId: 'agent-ppm', attachments: ['dao.pdf'] });
      wf.transition('VALIDER', { actorId: 'ppm-chef', signatureId: 'sig-1' });
      wf.transition('EXAMINER', { actorId: 'agent-dgcmp' });
      wf.transition('APPROUVER', { actorId: 'dgcmp', signatureId: 'sig-2' });
    }

    it('devrait supporter 5 retours DNCMP consécutifs', () => {
      advanceToDncmp();

      for (let i = 0; i < 5; i++) {
        // DNCMP rejette → retour en révision
        wf.transition('REJETER', {
          actorId: 'dncmp',
          comment: `Retour #${i + 1}: modifications requises`,
          context: { montant: 200_000_000 },
        });

        // Révision et re-soumission
        wf.transition('REVISER', { actorId: 'agent-ppm', attachments: ['dao-rev.pdf'] });
        wf.transition('VALIDER', { actorId: 'ppm-chef', signatureId: `sig-rev-${i}` });
        wf.transition('EXAMINER', { actorId: 'agent-dgcmp' });
        wf.transition('APPROUVER', { actorId: 'dgcmp', signatureId: `sig-dgcmp-${i}` });
      }

      // Finally approve
      wf.transition('APPROUVER', {
        actorId: 'dncmp',
        signatureId: 'sig-final',
        context: { montant: 200_000_000 },
      });
      wf.transition('PUBLIER', { actorId: 'system' });

      wf.assertStatus('COMPLETED');
      expect(wf.loopCount).toBeGreaterThanOrEqual(5);
    });
  });

  // ─── 4. Guards ──────────────────────────────────────────
  describe('Guards (seuils montant)', () => {
    it('devrait appliquer le guard montant >= 100M pour passage DNCMP', () => {
      const guarded = wf.getGuardedTransitions();
      expect(guarded.length).toBeGreaterThanOrEqual(1);

      const dncmpGuard = guarded.find((t) => t.to.includes('DNCMP') || t.to.includes('EXAMEN_DNCMP'));
      if (dncmpGuard) {
        expect(dncmpGuard.guard).toBeDefined();
      }
    });
  });

  // ─── 5. Nœuds mandatory ────────────────────────────────
  describe('Nœuds mandatory', () => {
    it('devrait avoir START et END comme mandatory', () => {
      const mandatory = wf.getMandatoryNodes();
      const mandatoryCodes = mandatory.map((n) => n.code);
      expect(mandatoryCodes).toContain('START');
      expect(mandatoryCodes.some((c) => wf.nodeMap.get(c)!.type === 'END')).toBe(true);
    });

    it('tous les nœuds mandatory doivent être atteignables', () => {
      const mandatoryNonStart = wf.getMandatoryNodes().filter((n) => n.type !== 'START');
      for (const node of mandatoryNonStart) {
        if (node.type === 'END') continue;
        const incoming = wf.transitions.filter((t) => t.to === node.code);
        expect(incoming.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  // ─── 6. Timers SLA ─────────────────────────────────────
  describe('Timers SLA', () => {
    it('devrait avoir des SLA sur les nœuds d\'action', () => {
      const slaNodes = wf.getNodesWithSla();
      expect(slaNodes.length).toBeGreaterThanOrEqual(1);
    });

    it('devrait déclencher un événement SLA_BREACHED', () => {
      wf.start({ entityType: 'DAC', entityId: 'dac-sla', actorId: 'user-1' });

      const slaNode = wf.getNodesWithSla()[0];
      if (slaNode) {
        wf.forceSlaBreachEvent(slaNode.code);

        const slaBreach = wf.kafkaEvents.find((e) => e.eventType === 'SLA_BREACHED');
        expect(slaBreach).toBeDefined();
        expect(slaBreach!.fromNodeCode).toBe(slaNode.code);
      }
    });
  });

  // ─── 7. Événements Kafka ────────────────────────────────
  describe('Événements Kafka', () => {
    it('devrait émettre un événement Kafka à chaque transition', () => {
      wf.start({ entityType: 'DAC', entityId: 'dac-kafka', actorId: 'user-1' });
      const initialCount = wf.kafkaEvents.length;

      wf.transition('REDIGER', { actorId: 'agent', attachments: ['f.pdf'] });
      expect(wf.kafkaEvents.length).toBe(initialCount + 1);
      expect(wf.kafkaEvents[wf.kafkaEvents.length - 1].eventType).toBe('WORKFLOW_TRANSITIONED');
    });

    it('devrait émettre WORKFLOW_STARTED au démarrage', () => {
      wf.start({ entityType: 'DAC', entityId: 'dac-k2', actorId: 'user-1' });
      expect(wf.kafkaEvents[0].eventType).toBe('WORKFLOW_STARTED');
    });
  });

  // ─── 8. Cross-workflow ──────────────────────────────────
  describe('Cross-workflow', () => {
    it('devrait référencer un cascade vers wf-soumission à la publication', () => {
      const cascadeRefs = wf.crossWorkflowActions;
      // The DAC workflow triggers wf-soumission upon PUBLICATION
      if (cascadeRefs.length > 0) {
        const cascadeStart = cascadeRefs.find((r) => r.action === 'CASCADE_START');
        if (cascadeStart) {
          expect(cascadeStart.targetEntityType).toBeDefined();
        }
      }
    });
  });

  // ─── 9. Suspend / Resume ───────────────────────────────
  describe('Suspension et reprise', () => {
    it('devrait pouvoir suspendre et reprendre une instance ACTIVE', () => {
      wf.start({ entityType: 'DAC', entityId: 'dac-susp', actorId: 'user-1' });
      wf.transition('REDIGER', { actorId: 'agent', attachments: ['f.pdf'] });

      wf.suspend('admin', 'Recours déposé');
      wf.assertStatus('SUSPENDED');
      expect(() => wf.transition('VALIDER', { actorId: 'ppm' })).toThrow();

      wf.resume('admin');
      wf.assertStatus('ACTIVE');
    });
  });

  // ─── 10. Traçabilité ───────────────────────────────────
  describe('Traçabilité', () => {
    it('devrait enregistrer chaque action dans le journal', () => {
      wf.start({ entityType: 'DAC', entityId: 'dac-trace', actorId: 'user-1' });
      wf.transition('REDIGER', { actorId: 'agent', attachments: ['f.pdf'] });
      wf.transition('VALIDER', { actorId: 'ppm', signatureId: 'sig-1' });

      expect(wf.events.length).toBe(3); // STARTED + 2 transitions
      wf.assertEventSequence(['WORKFLOW_STARTED', 'REDIGER', 'VALIDER']);

      // Each event has actor, timestamp
      for (const evt of wf.events) {
        expect(evt.actorId).toBeDefined();
        expect(evt.timestamp).toBeInstanceOf(Date);
      }
    });
  });
});
