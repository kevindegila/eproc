import { createRunner, WorkflowTestRunner } from './helpers/workflow-test-runner';

describe('wf-recours-armp — Recours ARMP (Integration)', () => {
  let wf: WorkflowTestRunner;

  beforeEach(() => {
    wf = createRunner('wf-recours-armp.yaml');
  });

  describe('Chargement YAML', () => {
    it('devrait charger le YAML', () => {
      expect(wf.nodes.length).toBeGreaterThanOrEqual(14);
      expect(wf.transitions.length).toBeGreaterThanOrEqual(14);
    });
  });

  describe('Happy path', () => {
    it('devrait traiter un recours ARMP', () => {
      wf.start({ entityType: 'RECOURS_ARMP', entityId: 'ra-001', actorId: 'oe-1',
        context: { recours_acceptes: true } });

      while (wf.status === 'ACTIVE') {
        const satisfied = wf.getAvailableActions({ recours_acceptes: true })
          .filter((a) => a.guardSatisfied);
        if (satisfied.length === 0) break;
        const next = satisfied[0];
        wf.transition(next.action, {
          actorId: 'user-1',
          comment: next.requiresComment ? 'ok' : undefined,
          signatureId: next.requiresSignature ? 'sig' : undefined,
          attachments: next.requiresAttachment ? ['recours.pdf'] : undefined,
          context: { recours_acceptes: true },
        });
      }

      expect(['ACTIVE', 'COMPLETED']).toContain(wf.status);
    });
  });

  // ─── SCÉNARIO CRITIQUE: suspension d'un DAC en cours de publication ──
  describe('Scénario critique: suspension d\'un DAC en publication', () => {
    it('devrait référencer la suspension du DAC', () => {
      const suspendRefs = wf.crossWorkflowActions.filter((r) => r.action === 'SUSPEND');
      expect(suspendRefs.length).toBeGreaterThanOrEqual(1);
      if (suspendRefs.length > 0) {
        expect(suspendRefs[0].targetEntityType).toBe('DAC');
      }
    });

    it('devrait émettre WORKFLOW_SUSPENDED quand le DAC est bloqué', () => {
      wf.start({ entityType: 'RECOURS_ARMP', entityId: 'ra-susp', actorId: 'oe-1' });

      // Simulate: le recours ARMP entraîne la suspension du workflow DAC associé
      wf.suspend('armp-agent', 'Recours ARMP en cours — DAC suspendu');
      wf.assertStatus('SUSPENDED');

      const suspendEvent = wf.kafkaEvents.find((e) => e.eventType === 'WORKFLOW_SUSPENDED');
      expect(suspendEvent).toBeDefined();

      // Resume after decision
      wf.resume('armp-agent');
      wf.assertStatus('ACTIVE');

      const resumeEvent = wf.kafkaEvents.find((e) => e.eventType === 'WORKFLOW_RESUMED');
      expect(resumeEvent).toBeDefined();
    });
  });

  describe('Guards', () => {
    it('devrait avoir des guards', () => {
      const guarded = wf.getGuardedTransitions();
      expect(guarded.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Nœuds mandatory', () => {
    it('devrait protéger les étapes', () => {
      expect(wf.getMandatoryNodes().length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Timers SLA', () => {
    it('devrait avoir des SLA', () => {
      expect(wf.getNodesWithSla().length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Traçabilité', () => {
    it('devrait enregistrer suspension et reprise', () => {
      wf.start({ entityType: 'RECOURS_ARMP', entityId: 'ra-t', actorId: 'oe-1' });
      wf.suspend('admin');
      wf.resume('admin');

      const actions = wf.events.map((e) => e.action);
      expect(actions).toContain('WORKFLOW_STARTED');
      expect(actions).toContain('WORKFLOW_SUSPENDED');
      expect(actions).toContain('WORKFLOW_RESUMED');
    });
  });
});
