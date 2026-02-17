export interface WorkflowMeta {
  id: string
  name: string
  description: string
  articleRef: string
  nodeCount: number
  yamlFile: string
  category: CategoryId
}

export type CategoryId =
  | 'passation'
  | 'attribution'
  | 'execution'
  | 'paiement'
  | 'recours'
  | 'administration'

export interface Category {
  id: CategoryId
  label: string
  color: string
  bgColor: string
  borderColor: string
  iconBg: string
}

export const CATEGORIES: Category[] = [
  {
    id: 'passation',
    label: 'Passation',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconBg: 'bg-blue-100',
  },
  {
    id: 'attribution',
    label: 'Attribution & Contrat',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
  },
  {
    id: 'execution',
    label: 'Exécution',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconBg: 'bg-amber-100',
  },
  {
    id: 'paiement',
    label: 'Paiement',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    iconBg: 'bg-purple-100',
  },
  {
    id: 'recours',
    label: 'Recours & Litiges',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconBg: 'bg-red-100',
  },
  {
    id: 'administration',
    label: 'Administration',
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    iconBg: 'bg-slate-100',
  },
]

export const WORKFLOWS: WorkflowMeta[] = [
  // ── Passation ──────────────────────────────────────────
  {
    id: 'wf-dac',
    name: 'Élaboration du DAC',
    description:
      'Création, validation et publication d\'un Dossier d\'Appel à Concurrence',
    articleRef: 'Art. 66-69',
    nodeCount: 12,
    yamlFile: 'wf-dac.yaml',
    category: 'passation',
  },
  {
    id: 'wf-dac-modification',
    name: 'Modification du DAC',
    description:
      'Modification d\'un DAC déjà publié (additif, prorogation de délai, correction)',
    articleRef: 'Art. 74',
    nodeCount: 11,
    yamlFile: 'wf-dac-modification.yaml',
    category: 'passation',
  },
  {
    id: 'wf-eclaircissement',
    name: 'Éclaircissements',
    description:
      'Gestion des demandes d\'éclaircissement des soumissionnaires et réponses',
    articleRef: 'Art. 154',
    nodeCount: 9,
    yamlFile: 'wf-eclaircissement.yaml',
    category: 'passation',
  },
  {
    id: 'wf-soumission',
    name: 'Dépôt des offres',
    description:
      'Cycle complet du dépôt électronique des offres par les opérateurs économiques',
    articleRef: 'Art. 75-83',
    nodeCount: 14,
    yamlFile: 'wf-soumission.yaml',
    category: 'passation',
  },
  {
    id: 'wf-ouverture',
    name: 'Ouverture des plis',
    description:
      'Séance publique d\'ouverture des plis et vérification de conformité administrative',
    articleRef: 'Art. 84-88',
    nodeCount: 13,
    yamlFile: 'wf-ouverture.yaml',
    category: 'passation',
  },

  // ── Attribution & Contrat ──────────────────────────────
  {
    id: 'wf-evaluation',
    name: 'Évaluation & Attribution',
    description:
      'Évaluation technique, financière et attribution provisoire puis définitive du marché',
    articleRef: 'Art. 89-93',
    nodeCount: 19,
    yamlFile: 'wf-evaluation.yaml',
    category: 'attribution',
  },
  {
    id: 'wf-contrat',
    name: 'Élaboration du contrat',
    description:
      'Rédaction, négociation, signature et approbation du marché public',
    articleRef: 'Art. 94-98',
    nodeCount: 16,
    yamlFile: 'wf-contrat.yaml',
    category: 'attribution',
  },
  {
    id: 'wf-avenant',
    name: 'Avenant au contrat',
    description:
      'Processus d\'élaboration et d\'approbation d\'un avenant au marché public',
    articleRef: 'Art. 130-131',
    nodeCount: 15,
    yamlFile: 'wf-avenant.yaml',
    category: 'attribution',
  },

  // ── Exécution ──────────────────────────────────────────
  {
    id: 'wf-ordre-service',
    name: 'Ordre de service',
    description:
      'Émission, notification et suivi des ordres de service (démarrage, arrêt, reprise)',
    articleRef: 'Art. 103',
    nodeCount: 11,
    yamlFile: 'wf-ordre-service.yaml',
    category: 'execution',
  },
  {
    id: 'wf-rapport-technique',
    name: 'Rapports périodiques',
    description:
      'Élaboration, validation et publication des rapports périodiques de suivi d\'exécution',
    articleRef: 'Art. 106',
    nodeCount: 10,
    yamlFile: 'wf-rapport-technique.yaml',
    category: 'execution',
  },
  {
    id: 'wf-attachement',
    name: 'Attachements & Décomptes',
    description:
      'Constatation des travaux, établissement des attachements et décomptes',
    articleRef: 'Art. 107',
    nodeCount: 12,
    yamlFile: 'wf-attachement.yaml',
    category: 'execution',
  },
  {
    id: 'wf-reception',
    name: 'Réceptions',
    description:
      'Réception provisoire, période de garantie et réception définitive des travaux/fournitures',
    articleRef: 'Art. 111, 135',
    nodeCount: 18,
    yamlFile: 'wf-reception.yaml',
    category: 'execution',
  },

  // ── Paiement ───────────────────────────────────────────
  {
    id: 'wf-avance',
    name: 'Avance de démarrage',
    description:
      'Demande, vérification et versement de l\'avance de démarrage au titulaire',
    articleRef: 'Art. 117',
    nodeCount: 11,
    yamlFile: 'wf-avance.yaml',
    category: 'paiement',
  },
  {
    id: 'wf-facture',
    name: 'Paiement des factures',
    description:
      'Circuit complet de traitement des factures depuis le dépôt jusqu\'au paiement',
    articleRef: 'Art. 118',
    nodeCount: 15,
    yamlFile: 'wf-facture.yaml',
    category: 'paiement',
  },
  {
    id: 'wf-penalites',
    name: 'Pénalités de retard',
    description:
      'Calcul, notification et application des pénalités de retard',
    articleRef: 'Art. 120',
    nodeCount: 14,
    yamlFile: 'wf-penalites.yaml',
    category: 'paiement',
  },
  {
    id: 'wf-garantie',
    name: 'Gestion des garanties',
    description:
      'Cycle de vie des garanties : soumission, bonne exécution, retenue, mainlevée',
    articleRef: 'Art. 125-129',
    nodeCount: 17,
    yamlFile: 'wf-garantie.yaml',
    category: 'paiement',
  },

  // ── Recours & Litiges ──────────────────────────────────
  {
    id: 'wf-recours-prealable',
    name: 'Recours gracieux',
    description:
      'Recours gracieux préalable auprès de l\'autorité contractante',
    articleRef: 'Art. 137-140',
    nodeCount: 15,
    yamlFile: 'wf-recours-prealable.yaml',
    category: 'recours',
  },
  {
    id: 'wf-recours-armp',
    name: 'Recours ARMP',
    description:
      'Saisine de l\'ARMP après échec du recours gracieux',
    articleRef: 'Art. 141-146',
    nodeCount: 16,
    yamlFile: 'wf-recours-armp.yaml',
    category: 'recours',
  },
  {
    id: 'wf-arbitrage',
    name: 'Arbitrage',
    description:
      'Procédure d\'arbitrage pour les litiges d\'exécution des marchés publics',
    articleRef: 'Art. 147-150',
    nodeCount: 15,
    yamlFile: 'wf-arbitrage.yaml',
    category: 'recours',
  },
  {
    id: 'wf-conciliation',
    name: 'Conciliation',
    description:
      'Procédure de conciliation amiable pour les litiges d\'exécution',
    articleRef: 'Art. 151-169',
    nodeCount: 17,
    yamlFile: 'wf-conciliation.yaml',
    category: 'recours',
  },

  // ── Administration ─────────────────────────────────────
  {
    id: 'wf-denonciation',
    name: 'Dénonciation',
    description:
      'Traitement des dénonciations de pratiques irrégulières dans la commande publique',
    articleRef: 'Art. 170-174',
    nodeCount: 19,
    yamlFile: 'wf-denonciation.yaml',
    category: 'administration',
  },
  {
    id: 'wf-inscription',
    name: 'Inscription',
    description:
      'Processus d\'inscription et de validation des acteurs sur la plateforme',
    articleRef: 'Art. 10-16',
    nodeCount: 16,
    yamlFile: 'wf-inscription.yaml',
    category: 'administration',
  },
]
