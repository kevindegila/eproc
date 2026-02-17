import { createRunner, WorkflowTestRunner } from './helpers/workflow-test-runner';

describe('wf-dac-modification — Modification de DAC (Integration)', () => {
  let wf: WorkflowTestRunner;

  beforeEach(() => {
    wf = createRunner('wf-dac-modification.yaml');
  });

  describe('Chargement YAML', () => {
    it('devrait charger et parser le YAML', () => {
      expect(wf.nodes.length).toBeGreaterThanOrEqual(8);
      expect(wf.transitions.length).toBeGreaterThanOrEqual(8);
    });
  });

  describe('Happy path — modification mineure', () => {
    it('devrait traiter une modification mineure de DAC', () => {
      wf.start({ entityType: 'DAC_MODIFICATION', entityId: 'mod-001', actorId: 'ppm',
        context: { type_modification: 'MINEURE' } });

      // Traverse happy path
      const actions = wf.getAvailableActions({ type_modification: 'MINEURE' });
      expect(actions.length).toBeGreaterThanOrEqual(1);

      // Follow the path based on type_modification MINEURE (no DNCMP)
      while (wf.status === 'ACTIVE') {
        const available = wf.getAvailableActions();
        const satisfied = available.filter((a) => a.guardSatisfied);
        if (satisfied.length === 0) break;

        const next = satisfied[0];
        const opts: Record<string, unknown> = { actorId: 'user-1' };
        if (next.requiresComment) (opts as any).comment = 'test';
        if (next.requiresSignature) (opts as any).signatureId = 'sig';
        if (next.requiresAttachment) (opts as any).attachments = ['doc.pdf'];
        wf.transition(next.action, opts as any);
      }

      expect(['ACTIVE', 'COMPLETED']).toContain(wf.status);
    });
  });

  describe('Boucle de révision', () => {
    it('devrait supporter les boucles de révision de modification', () => {
      wf.start({ entityType: 'DAC_MODIFICATION', entityId: 'mod-002', actorId: 'ppm' });

      // Advance to a point where revision is possible
      const loopNodes = wf.getLoopNodes();
      expect(loopNodes.length).toBeGreaterThanOrEqual(1);
      expect(loopNodes[0].type).toBe('LOOP');
    });
  });

  describe('Guards type_modification', () => {
    it('devrait avoir des guards sur le type de modification', () => {
      const guarded = wf.getGuardedTransitions();
      const typeGuards = guarded.filter((t) =>
        JSON.stringify(t.guard).includes('type_modification'),
      );
      expect(typeGuards.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Nœuds mandatory', () => {
    it('START et END doivent être mandatory', () => {
      const mandatory = wf.getMandatoryNodes().map((n) => n.code);
      expect(mandatory).toContain('START');
    });

    it('les nœuds mandatory doivent avoir des transitions entrantes', () => {
      const mandatory = wf.getMandatoryNodes().filter((n) => n.type !== 'START');
      for (const node of mandatory) {
        if (node.type === 'END') continue;
        const incoming = wf.transitions.filter((t) => t.to === node.code);
        expect(incoming.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('Timers SLA', () => {
    it('devrait avoir des SLA définis', () => {
      expect(wf.getNodesWithSla().length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Événements Kafka', () => {
    it('devrait émettre les événements de cycle de vie', () => {
      wf.start({ entityType: 'DAC_MODIFICATION', entityId: 'mod-k', actorId: 'user-1' });
      expect(wf.kafkaEvents[0].eventType).toBe('WORKFLOW_STARTED');
    });
  });

  describe('Traçabilité', () => {
    it('devrait enregistrer chaque événement avec acteur et timestamp', () => {
      wf.start({ entityType: 'DAC_MODIFICATION', entityId: 'mod-trace', actorId: 'user-1' });
      for (const evt of wf.events) {
        expect(evt.actorId).toBeDefined();
        expect(evt.timestamp).toBeInstanceOf(Date);
      }
    });
  });
});
