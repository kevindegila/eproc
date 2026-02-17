/**
 * scenario-marche-complet.ts — Scénario E2E : parcours complet d'un marché public
 *
 * Décrit les 9 phases du parcours depuis le PPM jusqu'à la réception définitive.
 * Chaque phase identifie le workflow, les transitions du happy path,
 * les acteurs impliqués, et les données de contexte.
 *
 * Ce fichier est importé par le runner et les assertions.
 */

import { IDS, REFS, MARKET } from './seed-e2e';

// ─── Types ─────────────────────────────────────────────────
export interface TransitionStep {
  action: string;
  actorId: string;
  actorRole: string;
  comment?: string;
  signatureId?: string;
  attachments?: string[];
  context?: Record<string, unknown>;
  description: string;
}

export interface WorkflowPhase {
  phase: number;
  name: string;
  workflow: string;
  entityType: string;
  entityId: string;
  procedureType?: string;
  startActorId: string;
  context: Record<string, unknown>;
  transitions: TransitionStep[];
  cascadeTo?: string;
  serviceCalls?: ServiceCall[];
}

export interface ServiceCall {
  when: 'before_workflow' | 'during' | 'after_workflow';
  afterTransition?: string;
  service: string;
  method: 'POST' | 'PUT' | 'GET';
  path: string;
  body?: Record<string, unknown>;
  description: string;
}

// ─── Scénario Complet ──────────────────────────────────────

export const SCENARIO: WorkflowPhase[] = [
  // ═══════════════════════════════════════════════════════════
  // PHASE 1 : Élaboration et publication du DAC
  // Workflow: wf-dac  |  150M FCFA → passage DNCMP (≥100M)
  // ═══════════════════════════════════════════════════════════
  {
    phase: 1,
    name: 'Élaboration & Publication du DAC',
    workflow: 'wf-dac',
    entityType: 'DAC',
    entityId: IDS.DAC_ID,
    procedureType: 'APPEL_OFFRES_OUVERT',
    startActorId: IDS.USER_PPM,
    context: { montant: MARKET.amount, type_marche: MARKET.type },
    transitions: [
      // START → REDACTION_DAO (auto)
      {
        action: 'SOUMETTRE',
        actorId: IDS.USER_AGENT_PPM,
        actorRole: 'AGENT_PPM',
        attachments: ['dao-minsante-2025.pdf'],
        description: 'Agent PPM soumet le DAO pour validation',
      },
      {
        action: 'EXAMINER',
        actorId: IDS.USER_PPM,
        actorRole: 'PPM',
        description: 'PPM examine la conformité du DAO',
      },
      {
        action: 'VALIDER_VERS_DNCMP',
        actorId: IDS.USER_PPM,
        actorRole: 'PPM',
        signatureId: 'sig-ppm-validation-001',
        context: { montant: 150_000_000 },
        description: 'PPM valide et transmet à la DNCMP (montant ≥ 100M)',
      },
      {
        action: 'TRANSMETTRE',
        actorId: IDS.USER_PPM,
        actorRole: 'PPM',
        description: 'Transmission du dossier à la DNCMP',
      },
      {
        action: 'STATUER',
        actorId: IDS.USER_DNCMP,
        actorRole: 'DNCMP',
        description: 'DNCMP examine le dossier',
      },
      {
        action: 'APPROUVER',
        actorId: IDS.USER_DNCMP,
        actorRole: 'DNCMP',
        signatureId: 'sig-dncmp-avis-001',
        comment: 'Avis favorable — dossier conforme au décret 2025-169',
        description: 'DNCMP émet un avis favorable',
      },
      {
        action: 'APPROUVER',
        actorId: IDS.USER_PPM,
        actorRole: 'PPM',
        signatureId: 'sig-ac-approbation-001',
        description: 'Autorité contractante approuve la publication',
      },
      {
        action: 'PUBLIER',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        description: 'Publication automatique de l\'avis (portail + JORT)',
      },
    ],
    cascadeTo: 'wf-soumission',
    serviceCalls: [
      {
        when: 'after_workflow',
        service: 'passation',
        method: 'PUT',
        path: `/dacs/${IDS.DAC_ID}`,
        body: { status: 'PUBLIE', publicationDate: new Date().toISOString() },
        description: 'Mise à jour du statut DAC → PUBLIÉ',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 2 : Dépôt des offres (soumission)
  // Workflow: wf-soumission
  // ═══════════════════════════════════════════════════════════
  {
    phase: 2,
    name: 'Dépôt des offres',
    workflow: 'wf-soumission',
    entityType: 'SOUMISSION',
    entityId: IDS.DAC_ID,
    procedureType: 'APPEL_OFFRES_OUVERT',
    startActorId: 'SYSTEM',
    context: { delai_expire: false },
    transitions: [
      {
        action: 'RETIRER',
        actorId: IDS.USER_OPERATEUR,
        actorRole: 'OPERATEUR_ECONOMIQUE',
        description: 'Opérateur retire le dossier de consultation',
      },
      {
        action: 'DEPOSER',
        actorId: IDS.USER_OPERATEUR,
        actorRole: 'OPERATEUR_ECONOMIQUE',
        attachments: ['offre-technique.pdf', 'offre-financiere.pdf'],
        description: 'Opérateur dépose son offre (technique + financière)',
      },
      {
        action: 'CHIFFRER',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        description: 'Chiffrement et scellement de l\'offre',
      },
      {
        action: 'VERIFIER',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        description: 'Vérification automatique de complétude',
      },
      {
        action: 'ACCEPTER',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        description: 'Offre complète et dans les délais → acceptée',
      },
      {
        action: 'CONFIRMER',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        description: 'Accusé de réception horodaté envoyé',
      },
      {
        action: 'CLOTURER',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        description: 'Clôture automatique des dépôts à la date limite',
      },
      {
        action: 'TERMINER',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        description: 'Phase de soumission terminée',
      },
    ],
    cascadeTo: 'wf-ouverture',
    serviceCalls: [
      {
        when: 'during',
        afterTransition: 'DEPOSER',
        service: 'submission',
        method: 'POST',
        path: '/submissions',
        body: {
          dacId: IDS.DAC_ID,
          dacReference: REFS.DAC_REFERENCE,
          operatorId: IDS.USER_OPERATEUR,
          operatorName: 'BTP Excellence SARL',
          status: 'DEPOSEE',
        },
        description: 'Enregistrement de la soumission dans ms-submission',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 3 : Ouverture des plis
  // Workflow: wf-ouverture
  // ═══════════════════════════════════════════════════════════
  {
    phase: 3,
    name: 'Ouverture des plis',
    workflow: 'wf-ouverture',
    entityType: 'OUVERTURE',
    entityId: IDS.DAC_ID,
    procedureType: 'APPEL_OFFRES_OUVERT',
    startActorId: IDS.USER_PPM,
    context: {},
    transitions: [
      {
        action: 'CONVOQUER',
        actorId: IDS.USER_PPM,
        actorRole: 'PPM',
        description: 'Envoi des convocations aux membres de la commission',
      },
      {
        action: 'CONSTITUER',
        actorId: IDS.USER_PPM,
        actorRole: 'PPM',
        description: 'Constitution de la commission d\'ouverture',
      },
      {
        action: 'CONFIRMER_QUORUM',
        actorId: IDS.USER_PPM,
        actorRole: 'PPM',
        description: 'Quorum atteint — ouverture autorisée',
      },
      {
        action: 'OUVRIR',
        actorId: IDS.USER_EVALUATEUR,
        actorRole: 'MEMBRE_COMMISSION',
        description: 'Ouverture des plis administratifs en séance publique',
      },
      {
        action: 'VALIDER',
        actorId: IDS.USER_EVALUATEUR,
        actorRole: 'MEMBRE_COMMISSION',
        description: 'Conformité administrative validée',
      },
      {
        action: 'OUVRIR_TECHNIQUE',
        actorId: IDS.USER_EVALUATEUR,
        actorRole: 'MEMBRE_COMMISSION',
        description: 'Ouverture des plis techniques',
      },
      {
        action: 'LIRE',
        actorId: IDS.USER_EVALUATEUR,
        actorRole: 'MEMBRE_COMMISSION',
        description: 'Lecture publique des montants',
      },
      {
        action: 'REDIGER',
        actorId: IDS.USER_EVALUATEUR,
        actorRole: 'MEMBRE_COMMISSION',
        attachments: ['pv-ouverture.pdf'],
        description: 'Rédaction du PV d\'ouverture',
      },
      {
        action: 'SIGNER',
        actorId: IDS.USER_EVALUATEUR,
        actorRole: 'MEMBRE_COMMISSION',
        signatureId: 'sig-pv-ouverture-001',
        description: 'Signature du PV par la commission',
      },
      {
        action: 'TRANSMETTRE',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        description: 'Transmission des dossiers pour évaluation',
      },
    ],
    cascadeTo: 'wf-evaluation',
    serviceCalls: [
      {
        when: 'during',
        afterTransition: 'OUVRIR',
        service: 'evaluation',
        method: 'POST',
        path: '/opening-sessions',
        body: {
          dacId: IDS.DAC_ID,
          dacReference: REFS.DAC_REFERENCE,
          sessionDate: new Date().toISOString(),
          location: 'Salle du Conseil — MinSanté, Cotonou',
          status: 'EN_COURS',
          presentMembers: ['Amadou KEREKOU', 'Rose AHOYO', 'Membre 3'],
          createdBy: IDS.USER_PPM,
        },
        description: 'Création de la session d\'ouverture',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 4 : Évaluation & Attribution
  // Workflow: wf-evaluation  |  150M → passage DNCMP
  // ═══════════════════════════════════════════════════════════
  {
    phase: 4,
    name: 'Évaluation & Attribution',
    workflow: 'wf-evaluation',
    entityType: 'EVALUATION',
    entityId: IDS.DAC_ID,
    procedureType: 'APPEL_OFFRES_OUVERT',
    startActorId: IDS.USER_PPM,
    context: { montant: MARKET.amount, recours_deposes: 0, recours_acceptes: 0 },
    transitions: [
      {
        action: 'CONSTITUER',
        actorId: IDS.USER_PPM,
        actorRole: 'PPM',
        description: 'Constitution de la sous-commission d\'évaluation',
      },
      {
        action: 'EVALUER',
        actorId: IDS.USER_EVALUATEUR,
        actorRole: 'MEMBRE_COMMISSION',
        attachments: ['grille-evaluation-technique.pdf'],
        description: 'Évaluation technique des offres',
      },
      {
        action: 'DECLARER_ADMISSIBLE',
        actorId: IDS.USER_EVALUATEUR,
        actorRole: 'MEMBRE_COMMISSION',
        description: 'Au moins une offre techniquement admissible',
      },
      {
        action: 'EVALUER_FINANCE',
        actorId: IDS.USER_EVALUATEUR,
        actorRole: 'MEMBRE_COMMISSION',
        description: 'Évaluation financière terminée',
      },
      {
        action: 'CLASSER',
        actorId: IDS.USER_EVALUATEUR,
        actorRole: 'MEMBRE_COMMISSION',
        description: 'Classement final établi',
      },
      {
        action: 'REDIGER',
        actorId: IDS.USER_EVALUATEUR,
        actorRole: 'MEMBRE_COMMISSION',
        attachments: ['rapport-evaluation.pdf'],
        description: 'Rapport d\'évaluation finalisé',
      },
      {
        action: 'PROPOSER',
        actorId: IDS.USER_EVALUATEUR,
        actorRole: 'MEMBRE_COMMISSION',
        signatureId: 'sig-proposition-attribution-001',
        description: 'Proposition d\'attribution soumise',
      },
      {
        action: 'VALIDER',
        actorId: IDS.USER_PPM,
        actorRole: 'PPM',
        description: 'PPM valide la proposition',
      },
      {
        action: 'TRANSMETTRE_DNCMP',
        actorId: IDS.USER_PPM,
        actorRole: 'PPM',
        context: { montant: 150_000_000 },
        description: 'Transmission à la DNCMP (≥ 100M)',
      },
      {
        action: 'STATUER',
        actorId: IDS.USER_DNCMP,
        actorRole: 'DNCMP',
        description: 'DNCMP rend son avis sur l\'attribution',
      },
      {
        action: 'APPROUVER',
        actorId: IDS.USER_DNCMP,
        actorRole: 'DNCMP',
        signatureId: 'sig-dncmp-attribution-001',
        description: 'DNCMP approuve l\'attribution',
      },
      {
        action: 'NOTIFIER',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        description: 'Notification de l\'attribution provisoire',
      },
      {
        action: 'EXPIRER',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        description: 'Délai de standstill écoulé (10 jours)',
      },
      {
        action: 'AUCUN_RECOURS',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        context: { recours_deposes: 0 },
        description: 'Aucun recours déposé pendant le standstill',
      },
      {
        action: 'ATTRIBUER',
        actorId: IDS.USER_PPM,
        actorRole: 'PPM',
        signatureId: 'sig-attribution-def-001',
        description: 'Attribution définitive prononcée',
      },
    ],
    cascadeTo: 'wf-contrat',
    serviceCalls: [
      {
        when: 'during',
        afterTransition: 'EVALUER',
        service: 'evaluation',
        method: 'POST',
        path: '/evaluation-sessions',
        body: {
          dacId: IDS.DAC_ID,
          dacReference: REFS.DAC_REFERENCE,
          type: 'TECHNIQUE',
          sessionDate: new Date().toISOString(),
          status: 'TERMINEE',
          createdBy: IDS.USER_EVALUATEUR,
        },
        description: 'Enregistrement de la session d\'évaluation technique',
      },
      {
        when: 'during',
        afterTransition: 'ATTRIBUER',
        service: 'evaluation',
        method: 'POST',
        path: '/provisional-awards',
        body: {
          dacId: IDS.DAC_ID,
          dacReference: REFS.DAC_REFERENCE,
          submissionId: 'sub-btp-excellence',
          operatorName: 'BTP Excellence SARL',
          awardAmount: MARKET.amount,
          justification: 'Offre conforme, moins-disant',
          awardDate: new Date().toISOString(),
          status: 'DEFINITIVE',
          createdBy: IDS.USER_PPM,
        },
        description: 'Enregistrement de l\'attribution définitive',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 5 : Élaboration du contrat
  // Workflow: wf-contrat  |  150M → passage DNCMP
  // ═══════════════════════════════════════════════════════════
  {
    phase: 5,
    name: 'Élaboration & Signature du contrat',
    workflow: 'wf-contrat',
    entityType: 'CONTRAT',
    entityId: IDS.DAC_ID,
    startActorId: IDS.USER_PPM,
    context: { montant: MARKET.amount },
    transitions: [
      {
        action: 'SOUMETTRE',
        actorId: IDS.USER_AGENT_PPM,
        actorRole: 'AGENT_PPM',
        attachments: ['projet-contrat.pdf'],
        description: 'Agent PPM soumet le projet de contrat',
      },
      {
        action: 'CONCLURE',
        actorId: IDS.USER_PPM,
        actorRole: 'PPM',
        comment: 'Négociation conclue — clauses acceptées par les deux parties',
        description: 'Négociation conclue avec l\'attributaire',
      },
      {
        action: 'VALIDER',
        actorId: IDS.USER_AGENT_PPM,
        actorRole: 'AGENT_PPM',
        description: 'Validation juridique conforme',
      },
      {
        action: 'VALIDER',
        actorId: IDS.USER_PPM,
        actorRole: 'PPM',
        description: 'PPM valide le contrat',
      },
      {
        action: 'TRANSMETTRE_DNCMP',
        actorId: IDS.USER_PPM,
        actorRole: 'PPM',
        context: { montant: 150_000_000 },
        description: 'Transmission à la DNCMP (≥ 100M)',
      },
      {
        action: 'STATUER',
        actorId: IDS.USER_DNCMP,
        actorRole: 'DNCMP',
        description: 'DNCMP examine le contrat',
      },
      {
        action: 'APPROUVER',
        actorId: IDS.USER_DNCMP,
        actorRole: 'DNCMP',
        signatureId: 'sig-dncmp-contrat-001',
        description: 'DNCMP approuve le contrat',
      },
      {
        action: 'SIGNER',
        actorId: IDS.USER_PPM,
        actorRole: 'PPM',
        signatureId: 'sig-ac-contrat-001',
        description: 'Autorité contractante signe le contrat',
      },
      {
        action: 'SIGNER',
        actorId: IDS.USER_OPERATEUR,
        actorRole: 'OPERATEUR_ECONOMIQUE',
        signatureId: 'sig-titulaire-contrat-001',
        description: 'Titulaire signe le contrat',
      },
      {
        action: 'ENREGISTRER',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        description: 'Enregistrement officiel du contrat',
      },
      {
        action: 'NOTIFIER',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        description: 'Notification au titulaire',
      },
      {
        action: 'PUBLIER',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        description: 'Publication de l\'attribution définitive',
      },
    ],
    cascadeTo: 'wf-ordre-service',
    serviceCalls: [
      {
        when: 'during',
        afterTransition: 'ENREGISTRER',
        service: 'contract',
        method: 'POST',
        path: '/contracts',
        body: {
          reference: REFS.CONTRACT_REFERENCE,
          dacId: IDS.DAC_ID,
          dacReference: REFS.DAC_REFERENCE,
          title: MARKET.title,
          operatorId: IDS.USER_OPERATEUR,
          operatorName: 'BTP Excellence SARL',
          organizationId: IDS.ORG_MINSANTE,
          amount: MARKET.amount,
          status: 'SIGNE',
          signatureDate: new Date().toISOString(),
          createdBy: IDS.USER_PPM,
        },
        description: 'Enregistrement du contrat dans ms-contract',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 6 : Ordre de service de démarrage
  // Workflow: wf-ordre-service
  // ═══════════════════════════════════════════════════════════
  {
    phase: 6,
    name: 'Ordre de service de démarrage',
    workflow: 'wf-ordre-service',
    entityType: 'ORDRE_SERVICE',
    entityId: IDS.DAC_ID,
    startActorId: IDS.USER_PPM,
    context: { type_os: 'DEMARRAGE' },
    transitions: [
      {
        action: 'SOUMETTRE',
        actorId: IDS.USER_AGENT_PPM,
        actorRole: 'AGENT_PPM',
        attachments: ['ordre-service-demarrage.pdf'],
        description: 'Rédaction et soumission de l\'OS de démarrage',
      },
      {
        action: 'VALIDER',
        actorId: IDS.USER_PPM,
        actorRole: 'PPM',
        signatureId: 'sig-validation-os-001',
        description: 'PPM valide l\'OS',
      },
      {
        action: 'SIGNER',
        actorId: IDS.USER_PPM,
        actorRole: 'PPM',
        signatureId: 'sig-ac-os-001',
        description: 'AC signe l\'OS',
      },
      {
        action: 'NOTIFIER',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        description: 'Notification de l\'OS au titulaire',
      },
      {
        action: 'ACCUSER',
        actorId: IDS.USER_OPERATEUR,
        actorRole: 'OPERATEUR_ECONOMIQUE',
        description: 'Titulaire accuse réception de l\'OS',
      },
      {
        action: 'ACCEPTER_SANS_RESERVE',
        actorId: IDS.USER_OPERATEUR,
        actorRole: 'OPERATEUR_ECONOMIQUE',
        description: 'Titulaire accepte l\'OS sans réserves',
      },
      {
        action: 'ACTIVER',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        description: 'OS prend effet — exécution démarre',
      },
    ],
    serviceCalls: [
      {
        when: 'after_workflow',
        service: 'execution',
        method: 'POST',
        path: '/executions',
        body: {
          contractId: 'CONTRACT_ID_PLACEHOLDER',
          contractReference: REFS.CONTRACT_REFERENCE,
          status: 'EN_COURS',
          progressPercent: 0,
          startDate: new Date().toISOString(),
          expectedEndDate: new Date(Date.now() + 365 * 86400000).toISOString(),
          createdBy: IDS.USER_PPM,
        },
        description: 'Création de l\'exécution dans ms-execution',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 7 : Paiement (facture)
  // Workflow: wf-facture
  // ═══════════════════════════════════════════════════════════
  {
    phase: 7,
    name: 'Paiement de la facture',
    workflow: 'wf-facture',
    entityType: 'FACTURE',
    entityId: IDS.DAC_ID,
    startActorId: IDS.USER_OPERATEUR,
    context: {},
    transitions: [
      {
        action: 'DEPOSER',
        actorId: IDS.USER_OPERATEUR,
        actorRole: 'OPERATEUR_ECONOMIQUE',
        attachments: ['facture-decompte-1.pdf'],
        description: 'Titulaire dépose la facture du 1er décompte',
      },
      {
        action: 'ENREGISTRER',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        description: 'Enregistrement automatique de la facture',
      },
      {
        action: 'VERIFIER',
        actorId: IDS.USER_AGENT_PPM,
        actorRole: 'AGENT_PPM',
        description: 'Vérification du service fait',
      },
      {
        action: 'ATTESTER',
        actorId: IDS.USER_AGENT_PPM,
        actorRole: 'AGENT_PPM',
        signatureId: 'sig-service-fait-001',
        description: 'Attestation du service fait',
      },
      {
        action: 'LIQUIDER',
        actorId: IDS.USER_AGENT_PPM,
        actorRole: 'AGENT_PPM',
        description: 'Liquidation de la facture (calcul du montant net)',
      },
      {
        action: 'VALIDER',
        actorId: IDS.USER_PPM,
        actorRole: 'PPM',
        signatureId: 'sig-ppm-facture-001',
        description: 'Validation PPM du paiement',
      },
      {
        action: 'ORDONNANCER',
        actorId: IDS.USER_PPM,
        actorRole: 'PPM',
        signatureId: 'sig-ordonnancement-001',
        description: 'Émission du mandat de paiement',
      },
      {
        action: 'CONTROLER',
        actorId: IDS.USER_COMPTABLE,
        actorRole: 'COMPTABLE',
        description: 'Contrôle du comptable public',
      },
      {
        action: 'VALIDER',
        actorId: IDS.USER_COMPTABLE,
        actorRole: 'COMPTABLE',
        description: 'Dépense régulière — autorisation de paiement',
      },
      {
        action: 'PAYER',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        description: 'Virement bancaire effectué',
      },
      {
        action: 'CONFIRMER',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        description: 'Confirmation du paiement au titulaire',
      },
    ],
    serviceCalls: [
      {
        when: 'during',
        afterTransition: 'DEPOSER',
        service: 'payment',
        method: 'POST',
        path: '/payment-requests',
        body: {
          reference: REFS.PAYMENT_REFERENCE,
          contractId: 'CONTRACT_ID_PLACEHOLDER',
          contractReference: REFS.CONTRACT_REFERENCE,
          amount: 45_000_000,
          description: 'Décompte n°1 — Terrassement et fondations',
          status: 'SOUMISE',
          submittedAt: new Date().toISOString(),
          createdBy: IDS.USER_OPERATEUR,
        },
        description: 'Enregistrement de la demande de paiement',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // PHASE 8 : Réception provisoire + définitive
  // Workflow: wf-reception
  // ═══════════════════════════════════════════════════════════
  {
    phase: 8,
    name: 'Réception provisoire & définitive',
    workflow: 'wf-reception',
    entityType: 'RECEPTION',
    entityId: IDS.DAC_ID,
    startActorId: IDS.USER_OPERATEUR,
    context: {},
    transitions: [
      {
        action: 'ENREGISTRER',
        actorId: IDS.USER_OPERATEUR,
        actorRole: 'OPERATEUR_ECONOMIQUE',
        attachments: ['demande-reception.pdf'],
        description: 'Titulaire demande la réception provisoire',
      },
      {
        action: 'CONSTITUER',
        actorId: IDS.USER_PPM,
        actorRole: 'PPM',
        description: 'Constitution de la commission de réception',
      },
      {
        action: 'VISITER',
        actorId: IDS.USER_EVALUATEUR,
        actorRole: 'MEMBRE_COMMISSION',
        attachments: ['rapport-visite.pdf'],
        description: 'Visite de réception sur site',
      },
      {
        action: 'ACCEPTER_SANS_RESERVE',
        actorId: IDS.USER_EVALUATEUR,
        actorRole: 'MEMBRE_COMMISSION',
        signatureId: 'sig-reception-provisoire-001',
        description: 'Réception provisoire sans réserves',
      },
      {
        action: 'PRONONCER',
        actorId: IDS.USER_EVALUATEUR,
        actorRole: 'MEMBRE_COMMISSION',
        attachments: ['pv-reception-provisoire.pdf'],
        signatureId: 'sig-pv-reception-001',
        description: 'PV de réception provisoire prononcé',
      },
      {
        action: 'EXPIRER',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        description: 'Fin de la période de garantie (12 mois)',
      },
      {
        action: 'DEMANDER',
        actorId: IDS.USER_OPERATEUR,
        actorRole: 'OPERATEUR_ECONOMIQUE',
        description: 'Demande de réception définitive',
      },
      {
        action: 'VISITER',
        actorId: IDS.USER_EVALUATEUR,
        actorRole: 'MEMBRE_COMMISSION',
        attachments: ['rapport-visite-definitive.pdf'],
        description: 'Visite de réception définitive',
      },
      {
        action: 'ACCEPTER',
        actorId: IDS.USER_EVALUATEUR,
        actorRole: 'MEMBRE_COMMISSION',
        signatureId: 'sig-reception-definitive-001',
        description: 'Réception définitive prononcée',
      },
      {
        action: 'PRONONCER',
        actorId: IDS.USER_EVALUATEUR,
        actorRole: 'MEMBRE_COMMISSION',
        attachments: ['pv-reception-definitive.pdf'],
        signatureId: 'sig-pv-reception-def-001',
        description: 'PV de réception définitive signé',
      },
      {
        action: 'LIBERER',
        actorId: 'SYSTEM',
        actorRole: 'SYSTEM',
        description: 'Libération de la retenue de garantie — marché clôturé',
      },
    ],
    serviceCalls: [
      {
        when: 'during',
        afterTransition: 'PRONONCER',
        service: 'execution',
        method: 'POST',
        path: '/executions/EXEC_ID_PLACEHOLDER/receptions',
        body: {
          type: 'PROVISOIRE',
          receptionDate: new Date().toISOString(),
          pvReference: 'PV-REC-PROV-2025-001',
          members: ['Amadou KEREKOU', 'Rose AHOYO', 'Membre 3'],
          createdBy: IDS.USER_PPM,
        },
        description: 'Enregistrement de la réception provisoire',
      },
      {
        when: 'after_workflow',
        service: 'execution',
        method: 'PUT',
        path: '/executions/EXEC_ID_PLACEHOLDER',
        body: {
          status: 'TERMINE',
          progressPercent: 100,
          actualEndDate: new Date().toISOString(),
        },
        description: 'Mise à jour de l\'exécution → TERMINÉ (100%)',
      },
    ],
  },
];

// ─── Summary ─────────────────────────────────────────────────
export function printScenarioSummary() {
  console.log('\n=== Scénario E2E : Parcours complet d\'un marché public ===\n');
  console.log(`Marché       : ${MARKET.title}`);
  console.log(`Montant      : ${MARKET.amount.toLocaleString('fr-FR')} FCFA`);
  console.log(`Type         : ${MARKET.type} — ${MARKET.method}`);
  console.log(`Organisation : MinSanté`);
  console.log(`Opérateur    : BTP Excellence SARL`);
  console.log(`Phases       : ${SCENARIO.length}`);
  console.log(`Transitions  : ${SCENARIO.reduce((acc, p) => acc + p.transitions.length, 0)}`);
  console.log('');

  for (const phase of SCENARIO) {
    const actors = [...new Set(phase.transitions.map((t) => t.actorRole))];
    console.log(`  Phase ${phase.phase}: ${phase.name}`);
    console.log(`    Workflow    : ${phase.workflow}`);
    console.log(`    Transitions : ${phase.transitions.length}`);
    console.log(`    Acteurs     : ${actors.join(', ')}`);
    if (phase.cascadeTo) {
      console.log(`    Cascade →   : ${phase.cascadeTo}`);
    }
    console.log('');
  }
}

// Run summary if executed directly
if (require.main === module) {
  printScenarioSummary();
}
