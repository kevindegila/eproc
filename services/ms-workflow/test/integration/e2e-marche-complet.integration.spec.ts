/**
 * e2e-marche-complet.integration.spec.ts
 *
 * Test d'intégration in-memory du parcours complet d'un marché public
 * depuis le DAC jusqu'à la réception définitive.
 *
 * Utilise WorkflowTestRunner pour simuler le moteur de workflow
 * sans base de données ni microservices.
 *
 * Chaîne : wf-dac → wf-soumission → wf-ouverture → wf-evaluation
 *          → wf-contrat → wf-ordre-service → wf-facture → wf-reception
 */

import { createRunner, WorkflowTestRunner } from './helpers/workflow-test-runner';

describe('E2E — Parcours complet d\'un marché public (150M FCFA)', () => {
  const ENTITY_ID = 'dac-e2e-test-001';
  const CONTEXT = {
    montant: 150_000_000,
    type_marche: 'TRAVAUX',
    delai_expire: false,
    recours_deposes: 0,
    recours_acceptes: 0,
  };

  const runners: Record<string, WorkflowTestRunner> = {};

  beforeAll(() => {
    // Pre-load all workflow runners
    runners.dac = createRunner('wf-dac.yaml');
    runners.soumission = createRunner('wf-soumission.yaml');
    runners.ouverture = createRunner('wf-ouverture.yaml');
    runners.evaluation = createRunner('wf-evaluation.yaml');
    runners.contrat = createRunner('wf-contrat.yaml');
    runners.ordreService = createRunner('wf-ordre-service.yaml');
    runners.facture = createRunner('wf-facture.yaml');
    runners.reception = createRunner('wf-reception.yaml');
  });

  // ═══════════════════════════════════════════════════════════
  // PHASE 1 : DAC
  // ═══════════════════════════════════════════════════════════
  describe('Phase 1 — DAC (Élaboration & Publication)', () => {
    it('exécute le happy path DAC avec passage DNCMP (≥100M)', () => {
      const r = runners.dac;
      r.start({ entityType: 'DAC', entityId: ENTITY_ID, context: CONTEXT });

      // START auto-avance vers REDACTION_DAO
      r.assertCurrentNode('REDACTION_DAO');

      r.transition('SOUMETTRE', {
        actorId: 'agent-ppm',
        attachments: ['dao.pdf'],
      });
      r.assertCurrentNode('VALIDATION_PPM');

      r.transition('EXAMINER', { actorId: 'ppm' });
      r.assertCurrentNode('DECISION_CONFORMITE');

      // Guard: montant >= 100M → route vers DNCMP
      r.transition('VALIDER_VERS_DNCMP', {
        actorId: 'ppm',
        signatureId: 'sig-001',
        context: { montant: 150_000_000 },
      });
      r.assertCurrentNode('SOUMISSION_DNCMP');

      r.transition('TRANSMETTRE', { actorId: 'ppm' });
      r.assertCurrentNode('EXAMEN_DNCMP');

      r.transition('STATUER', { actorId: 'dncmp' });
      r.assertCurrentNode('DECISION_DNCMP');

      r.transition('APPROUVER', {
        actorId: 'dncmp',
        signatureId: 'sig-dncmp-001',
        comment: 'Avis favorable',
      });
      r.assertCurrentNode('APPROBATION_AC');

      r.transition('APPROUVER', {
        actorId: 'ppm',
        signatureId: 'sig-ac-001',
      });
      r.assertCurrentNode('PUBLICATION');

      r.transition('PUBLIER', { actorId: 'system' });
      r.assertStatus('COMPLETED');
    });

    it('a émis les événements Kafka attendus', () => {
      runners.dac.assertKafkaEventTypes([
        'WORKFLOW_STARTED',
        'WORKFLOW_TRANSITIONED',
        'WORKFLOW_COMPLETED',
      ]);
    });

    it('a détecté la cascade vers wf-soumission', () => {
      const cascades = runners.dac.crossWorkflowActions.filter(
        (cw) => cw.action === 'CASCADE_START',
      );
      expect(cascades.length).toBeGreaterThanOrEqual(1);
      expect(cascades.some((c) => c.targetEntityType === 'wf-soumission')).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // PHASE 2 : Soumission
  // ═══════════════════════════════════════════════════════════
  describe('Phase 2 — Soumission (Dépôt des offres)', () => {
    it('exécute le happy path soumission', () => {
      const r = runners.soumission;
      r.start({ entityType: 'SOUMISSION', entityId: ENTITY_ID, context: CONTEXT });

      r.assertCurrentNode('RETRAIT_DOSSIER');

      r.transition('RETIRER', { actorId: 'operateur' });
      r.assertCurrentNode('PREPARATION_OFFRE');

      r.transition('DEPOSER', {
        actorId: 'operateur',
        attachments: ['offre-technique.pdf', 'offre-financiere.pdf'],
      });
      r.assertCurrentNode('CHIFFREMENT_DEPOT');

      r.transition('CHIFFRER', { actorId: 'system' });
      r.assertCurrentNode('VERIFICATION_COMPLETUDE');

      r.transition('VERIFIER', { actorId: 'system' });
      r.assertCurrentNode('DECISION_COMPLETUDE');

      r.transition('ACCEPTER', { actorId: 'system' });
      r.assertCurrentNode('ACCUSE_RECEPTION');

      r.transition('CONFIRMER', { actorId: 'system' });
      r.assertCurrentNode('COFFRE_FORT');

      r.transition('CLOTURER', { actorId: 'system' });
      r.assertCurrentNode('CLOTURE');

      r.transition('TERMINER', { actorId: 'system' });
      r.assertStatus('COMPLETED');
    });

    it('cascade vers wf-ouverture', () => {
      const cascades = runners.soumission.crossWorkflowActions.filter(
        (cw) => cw.action === 'CASCADE_START',
      );
      expect(cascades.some((c) => c.targetEntityType === 'wf-ouverture')).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // PHASE 3 : Ouverture des plis
  // ═══════════════════════════════════════════════════════════
  describe('Phase 3 — Ouverture des plis', () => {
    it('exécute le happy path ouverture', () => {
      const r = runners.ouverture;
      r.start({ entityType: 'OUVERTURE', entityId: ENTITY_ID, context: CONTEXT });

      r.assertCurrentNode('CONVOCATION');

      r.transition('CONVOQUER', { actorId: 'ppm' });
      r.transition('CONSTITUER', { actorId: 'ppm' });
      r.transition('CONFIRMER_QUORUM', { actorId: 'ppm' });
      r.transition('OUVRIR', { actorId: 'evaluateur' });
      r.transition('VALIDER', { actorId: 'evaluateur' });
      r.transition('OUVRIR_TECHNIQUE', { actorId: 'evaluateur' });
      r.transition('LIRE', { actorId: 'evaluateur' });
      r.transition('REDIGER', {
        actorId: 'evaluateur',
        attachments: ['pv-ouverture.pdf'],
      });
      r.transition('SIGNER', {
        actorId: 'evaluateur',
        signatureId: 'sig-pv-001',
      });
      r.transition('TRANSMETTRE', { actorId: 'system' });

      r.assertStatus('COMPLETED');
    });

    it('cascade vers wf-evaluation', () => {
      const cascades = runners.ouverture.crossWorkflowActions.filter(
        (cw) => cw.action === 'CASCADE_START',
      );
      expect(cascades.some((c) => c.targetEntityType === 'wf-evaluation')).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // PHASE 4 : Évaluation & Attribution
  // ═══════════════════════════════════════════════════════════
  describe('Phase 4 — Évaluation & Attribution', () => {
    it('exécute le happy path évaluation avec passage DNCMP (≥100M)', () => {
      const r = runners.evaluation;
      r.start({ entityType: 'EVALUATION', entityId: ENTITY_ID, context: CONTEXT });

      r.assertCurrentNode('CONSTITUTION_SOUS_COMMISSION');

      r.transition('CONSTITUER', { actorId: 'ppm' });
      r.transition('EVALUER', {
        actorId: 'evaluateur',
        attachments: ['grille.pdf'],
      });
      r.transition('DECLARER_ADMISSIBLE', { actorId: 'evaluateur' });
      r.transition('EVALUER_FINANCE', { actorId: 'evaluateur' });
      r.transition('CLASSER', { actorId: 'evaluateur' });
      r.transition('REDIGER', {
        actorId: 'evaluateur',
        attachments: ['rapport-eval.pdf'],
      });
      r.transition('PROPOSER', {
        actorId: 'evaluateur',
        signatureId: 'sig-prop-001',
      });
      r.transition('VALIDER', { actorId: 'ppm' });

      // Guard: montant >= 100M → DNCMP
      r.transition('TRANSMETTRE_DNCMP', {
        actorId: 'ppm',
        context: { montant: 150_000_000 },
      });
      r.assertCurrentNode('EXAMEN_DNCMP');

      r.transition('STATUER', { actorId: 'dncmp' });
      r.transition('APPROUVER', {
        actorId: 'dncmp',
        signatureId: 'sig-dncmp-eval-001',
      });
      r.assertCurrentNode('ATTRIBUTION_PROVISOIRE');

      r.transition('NOTIFIER', { actorId: 'system' });
      r.transition('EXPIRER', { actorId: 'system' });

      // Guard: recours_deposes == 0
      r.transition('AUCUN_RECOURS', {
        actorId: 'system',
        context: { recours_deposes: 0 },
      });
      r.assertCurrentNode('ATTRIBUTION_DEFINITIVE');

      r.transition('ATTRIBUER', {
        actorId: 'ppm',
        signatureId: 'sig-attr-def-001',
      });
      r.assertStatus('COMPLETED');
    });

    it('cascade vers wf-contrat', () => {
      const cascades = runners.evaluation.crossWorkflowActions.filter(
        (cw) => cw.action === 'CASCADE_START',
      );
      expect(cascades.some((c) => c.targetEntityType === 'wf-contrat')).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // PHASE 5 : Contrat
  // ═══════════════════════════════════════════════════════════
  describe('Phase 5 — Contrat (Élaboration & Signature)', () => {
    it('exécute le happy path contrat avec passage DNCMP (≥100M)', () => {
      const r = runners.contrat;
      r.start({ entityType: 'CONTRAT', entityId: ENTITY_ID, context: CONTEXT });

      r.assertCurrentNode('REDACTION_CONTRAT');

      r.transition('SOUMETTRE', {
        actorId: 'agent-ppm',
        attachments: ['contrat-draft.pdf'],
      });
      r.transition('CONCLURE', {
        actorId: 'ppm',
        comment: 'Négociation conclue',
      });
      r.transition('VALIDER', { actorId: 'agent-ppm' }); // juridique
      r.transition('VALIDER', { actorId: 'ppm' }); // PPM

      // Guard: montant >= 100M → DNCMP
      r.transition('TRANSMETTRE_DNCMP', {
        actorId: 'ppm',
        context: { montant: 150_000_000 },
      });
      r.assertCurrentNode('APPROBATION_DNCMP');

      r.transition('STATUER', { actorId: 'dncmp' });
      r.transition('APPROUVER', {
        actorId: 'dncmp',
        signatureId: 'sig-dncmp-contrat-001',
      });
      r.assertCurrentNode('SIGNATURE_AC');

      r.transition('SIGNER', {
        actorId: 'ppm',
        signatureId: 'sig-ac-contrat-001',
      });
      r.transition('SIGNER', {
        actorId: 'operateur',
        signatureId: 'sig-titulaire-001',
      });
      r.transition('ENREGISTRER', { actorId: 'system' });
      r.transition('NOTIFIER', { actorId: 'system' });
      r.transition('PUBLIER', { actorId: 'system' });

      r.assertStatus('COMPLETED');
    });

    it('cascade vers wf-ordre-service', () => {
      const cascades = runners.contrat.crossWorkflowActions.filter(
        (cw) => cw.action === 'CASCADE_START',
      );
      expect(cascades.some((c) => c.targetEntityType === 'wf-ordre-service')).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // PHASE 6 : Ordre de service
  // ═══════════════════════════════════════════════════════════
  describe('Phase 6 — Ordre de service de démarrage', () => {
    it('exécute le happy path OS sans réserves', () => {
      const r = runners.ordreService;
      r.start({ entityType: 'ORDRE_SERVICE', entityId: ENTITY_ID, context: CONTEXT });

      r.assertCurrentNode('REDACTION_OS');

      r.transition('SOUMETTRE', {
        actorId: 'agent-ppm',
        attachments: ['os-demarrage.pdf'],
      });
      r.transition('VALIDER', {
        actorId: 'ppm',
        signatureId: 'sig-val-os-001',
      });
      r.transition('SIGNER', {
        actorId: 'ppm',
        signatureId: 'sig-ac-os-001',
      });
      r.transition('NOTIFIER', { actorId: 'system' });
      r.transition('ACCUSER', { actorId: 'operateur' });
      r.transition('ACCEPTER_SANS_RESERVE', { actorId: 'operateur' });
      r.transition('ACTIVER', { actorId: 'system' });

      r.assertStatus('COMPLETED');
    });
  });

  // ═══════════════════════════════════════════════════════════
  // PHASE 7 : Facture (paiement)
  // ═══════════════════════════════════════════════════════════
  describe('Phase 7 — Paiement de la facture', () => {
    it('exécute le happy path paiement', () => {
      const r = runners.facture;
      r.start({ entityType: 'FACTURE', entityId: ENTITY_ID, context: CONTEXT });

      r.assertCurrentNode('DEPOT_FACTURE');

      r.transition('DEPOSER', {
        actorId: 'operateur',
        attachments: ['facture.pdf'],
      });
      r.transition('ENREGISTRER', { actorId: 'system' });
      r.transition('VERIFIER', { actorId: 'agent-ppm' });
      r.transition('ATTESTER', {
        actorId: 'agent-ppm',
        signatureId: 'sig-sf-001',
      });
      r.transition('LIQUIDER', { actorId: 'agent-ppm' });
      r.transition('VALIDER', {
        actorId: 'ppm',
        signatureId: 'sig-ppm-fact-001',
      });
      r.transition('ORDONNANCER', {
        actorId: 'ppm',
        signatureId: 'sig-ord-001',
      });
      r.transition('CONTROLER', { actorId: 'comptable' });
      r.transition('VALIDER', { actorId: 'comptable' });
      r.transition('PAYER', { actorId: 'system' });
      r.transition('CONFIRMER', { actorId: 'system' });

      r.assertStatus('COMPLETED');
    });
  });

  // ═══════════════════════════════════════════════════════════
  // PHASE 8 : Réception provisoire & définitive
  // ═══════════════════════════════════════════════════════════
  describe('Phase 8 — Réception provisoire & définitive', () => {
    it('exécute le happy path réception complète', () => {
      const r = runners.reception;
      r.start({ entityType: 'RECEPTION', entityId: ENTITY_ID, context: CONTEXT });

      r.assertCurrentNode('DEMANDE_RECEPTION');

      // Réception provisoire
      r.transition('ENREGISTRER', {
        actorId: 'operateur',
        attachments: ['demande-reception.pdf'],
      });
      r.transition('CONSTITUER', { actorId: 'ppm' });
      r.transition('VISITER', {
        actorId: 'evaluateur',
        attachments: ['rapport-visite.pdf'],
      });
      r.transition('ACCEPTER_SANS_RESERVE', {
        actorId: 'evaluateur',
        signatureId: 'sig-rec-prov-001',
      });
      r.transition('PRONONCER', {
        actorId: 'evaluateur',
        attachments: ['pv-reception-prov.pdf'],
        signatureId: 'sig-pv-prov-001',
      });
      r.assertCurrentNode('PERIODE_GARANTIE');

      // Période de garantie expire
      r.transition('EXPIRER', { actorId: 'system' });

      // Réception définitive
      r.transition('DEMANDER', { actorId: 'operateur' });
      r.transition('VISITER', {
        actorId: 'evaluateur',
        attachments: ['rapport-visite-def.pdf'],
      });
      r.transition('ACCEPTER', {
        actorId: 'evaluateur',
        signatureId: 'sig-rec-def-001',
      });
      r.transition('PRONONCER', {
        actorId: 'evaluateur',
        attachments: ['pv-reception-def.pdf'],
        signatureId: 'sig-pv-def-001',
      });
      r.assertCurrentNode('LIBERATION_GARANTIE');

      r.transition('LIBERER', { actorId: 'system' });
      r.assertStatus('COMPLETED');
    });

    it('a déclenché la cascade vers wf-garantie', () => {
      const cascades = runners.reception.crossWorkflowActions.filter(
        (cw) => cw.action === 'CASCADE_START',
      );
      expect(cascades.some((c) => c.targetEntityType === 'wf-garantie')).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // VÉRIFICATIONS TRANSVERSALES
  // ═══════════════════════════════════════════════════════════
  describe('Vérifications transversales', () => {
    it('les 8 workflows se terminent tous en COMPLETED', () => {
      for (const [name, runner] of Object.entries(runners)) {
        expect(runner.status).toBe('COMPLETED');
      }
    });

    it('le total des événements est cohérent', () => {
      let totalEvents = 0;
      for (const runner of Object.values(runners)) {
        expect(runner.events.length).toBeGreaterThan(0);
        totalEvents += runner.events.length;
      }
      // 8 workflows × au moins 3 événements chacun
      expect(totalEvents).toBeGreaterThanOrEqual(24);
    });

    it('le total des événements Kafka est cohérent', () => {
      let totalKafka = 0;
      for (const runner of Object.values(runners)) {
        expect(runner.kafkaEvents.length).toBeGreaterThan(0);
        totalKafka += runner.kafkaEvents.length;
      }
      expect(totalKafka).toBeGreaterThanOrEqual(24);
    });

    it('les nœuds DNCMP sont visités dans les phases 1, 4 et 5', () => {
      // Phase 1 (DAC)
      runners.dac.assertVisitedNodes(['EXAMEN_DNCMP', 'DECISION_DNCMP']);

      // Phase 4 (Evaluation)
      runners.evaluation.assertVisitedNodes(['EXAMEN_DNCMP', 'DECISION_DNCMP']);

      // Phase 5 (Contrat)
      runners.contrat.assertVisitedNodes(['APPROBATION_DNCMP', 'DECISION_DNCMP']);
    });

    it('aucun loop n\'a été nécessaire dans le happy path', () => {
      for (const runner of Object.values(runners)) {
        expect(runner.loopCount).toBe(0);
      }
    });

    it('la chaîne de cascade est complète', () => {
      // Vérifier que chaque workflow déclenche bien le suivant
      const expectedCascades: Record<string, string> = {
        dac: 'wf-soumission',
        soumission: 'wf-ouverture',
        ouverture: 'wf-evaluation',
        evaluation: 'wf-contrat',
        contrat: 'wf-ordre-service',
      };

      for (const [workflow, expectedTarget] of Object.entries(expectedCascades)) {
        const runner = runners[workflow];
        const cascades = runner.crossWorkflowActions.filter(
          (cw) => cw.action === 'CASCADE_START',
        );
        const found = cascades.some((c) => c.targetEntityType === expectedTarget);
        expect(found).toBe(true);
      }
    });
  });
});
