/**
 * seed-e2e.ts — Seed transversal pour le test E2E complet
 *
 * Crée un jeu de données cohérent à travers tous les microservices :
 * - 1 Organisation (MinSanté)
 * - 1 Opérateur économique (BTP Excellence SARL)
 * - 6 Utilisateurs avec rôles (PPM, AgentPPM, DNCMP, Évaluateur, Opérateur, Comptable)
 * - 1 PPM avec 1 ligne de marché travaux à 150M FCFA
 * - 1 DAC
 * - Les workflow definitions chargées depuis les YAML
 *
 * Usage: npx tsx test/e2e/seed-e2e.ts
 */

const BASE_URLS = {
  iam: process.env.MS_IAM_URL ?? 'http://localhost:3001',
  planning: process.env.MS_PLANNING_URL ?? 'http://localhost:3002',
  passation: process.env.MS_PASSATION_URL ?? 'http://localhost:3003',
  submission: process.env.MS_SUBMISSION_URL ?? 'http://localhost:3004',
  evaluation: process.env.MS_EVALUATION_URL ?? 'http://localhost:3005',
  contract: process.env.MS_CONTRACT_URL ?? 'http://localhost:3006',
  execution: process.env.MS_EXECUTION_URL ?? 'http://localhost:3007',
  payment: process.env.MS_PAYMENT_URL ?? 'http://localhost:3008',
  workflow: process.env.MS_WORKFLOW_URL ?? 'http://localhost:3010',
};

// ─── Identifiants déterministes (UUID v4 fixés) ─────────────
export const IDS = {
  ORG_MINSANTE: 'e2e-org-00000-minsante',
  ORG_OPERATOR: 'e2e-org-00000-operator',

  USER_PPM: 'e2e-user-0000-ppm',
  USER_AGENT_PPM: 'e2e-user-0000-agent-ppm',
  USER_DNCMP: 'e2e-user-0000-dncmp',
  USER_EVALUATEUR: 'e2e-user-0000-evaluateur',
  USER_OPERATEUR: 'e2e-user-0000-operateur',
  USER_COMPTABLE: 'e2e-user-0000-comptable',

  ROLE_PPM: 'e2e-role-0000-ppm',
  ROLE_AGENT_PPM: 'e2e-role-0000-agent-ppm',
  ROLE_DNCMP: 'e2e-role-0000-dncmp',
  ROLE_MEMBRE_COMMISSION: 'e2e-role-0000-membre-commission',
  ROLE_OPERATEUR_ECONOMIQUE: 'e2e-role-0000-operateur-eco',
  ROLE_COMPTABLE: 'e2e-role-0000-comptable',

  PPM_ID: 'e2e-ppm-000000001',
  MARKET_ENTRY_ID: 'e2e-entry-000000001',
  DAC_ID: 'e2e-dac-000000001',
};

export const REFS = {
  PPM_REFERENCE: 'PPM-2025-MINSANTE-001',
  DAC_REFERENCE: 'DAC-2025-MINSANTE-001',
  CONTRACT_REFERENCE: 'CTR-2025-MINSANTE-001',
  PAYMENT_REFERENCE: 'PAY-2025-MINSANTE-001',
};

export const MARKET = {
  title: 'Construction du Centre de Santé de Parakou',
  description: 'Travaux de construction d\'un centre de santé intégré comprenant 20 lits, bloc opératoire et laboratoire',
  type: 'TRAVAUX',
  method: 'APPEL_OFFRES_OUVERT',
  amount: 150_000_000,
  fundingSource: 'BUDGET_NATIONAL',
};

// ─── HTTP Helper ─────────────────────────────────────────────
async function post(baseUrl: string, path: string, body: unknown) {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${baseUrl}${path} -> ${res.status}: ${text}`);
  }
  return res.json();
}

async function get(baseUrl: string, path: string) {
  const res = await fetch(`${baseUrl}${path}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${baseUrl}${path} -> ${res.status}: ${text}`);
  }
  return res.json();
}

// ─── Seed Functions ──────────────────────────────────────────

async function seedIAM() {
  console.log('  [IAM] Création organisation MinSanté...');
  await post(BASE_URLS.iam, '/organizations', {
    id: IDS.ORG_MINSANTE,
    name: 'Ministère de la Santé',
    type: 'MINISTERE',
    sigle: 'MINSANTE',
    address: 'Cotonou, Bénin',
    phone: '+229 21 33 00 00',
    email: 'contact@sante.gouv.bj',
  });

  console.log('  [IAM] Création organisation opérateur...');
  await post(BASE_URLS.iam, '/organizations', {
    id: IDS.ORG_OPERATOR,
    name: 'BTP Excellence SARL',
    type: 'ENTREPRISE',
    sigle: 'BTPE',
    address: 'Parakou, Bénin',
    phone: '+229 97 00 00 00',
    email: 'contact@btp-excellence.bj',
    nif: '3012345678',
    rccm: 'RB/PAR/2020/B/1234',
  });

  console.log('  [IAM] Création des rôles...');
  const roles = [
    { id: IDS.ROLE_PPM, code: 'PPM', name: 'Personne Responsable des Marchés Publics' },
    { id: IDS.ROLE_AGENT_PPM, code: 'AGENT_PPM', name: 'Agent de la cellule PPM' },
    { id: IDS.ROLE_DNCMP, code: 'DNCMP', name: 'Agent DNCMP' },
    { id: IDS.ROLE_MEMBRE_COMMISSION, code: 'MEMBRE_COMMISSION', name: 'Membre de commission' },
    { id: IDS.ROLE_OPERATEUR_ECONOMIQUE, code: 'OPERATEUR_ECONOMIQUE', name: 'Opérateur économique' },
    { id: IDS.ROLE_COMPTABLE, code: 'COMPTABLE', name: 'Comptable public' },
  ];
  for (const role of roles) {
    await post(BASE_URLS.iam, '/roles', role);
  }

  console.log('  [IAM] Création des utilisateurs...');
  const users = [
    {
      id: IDS.USER_PPM,
      email: 'ppm@sante.gouv.bj',
      password: 'E2eTest2025!',
      firstName: 'Amadou',
      lastName: 'KEREKOU',
      organizationId: IDS.ORG_MINSANTE,
      roleCode: 'PPM',
    },
    {
      id: IDS.USER_AGENT_PPM,
      email: 'agent-ppm@sante.gouv.bj',
      password: 'E2eTest2025!',
      firstName: 'Fatima',
      lastName: 'SOGLO',
      organizationId: IDS.ORG_MINSANTE,
      roleCode: 'AGENT_PPM',
    },
    {
      id: IDS.USER_DNCMP,
      email: 'agent@dncmp.gouv.bj',
      password: 'E2eTest2025!',
      firstName: 'Ibrahim',
      lastName: 'SAKA',
      organizationId: null,
      roleCode: 'DNCMP',
    },
    {
      id: IDS.USER_EVALUATEUR,
      email: 'evaluateur@sante.gouv.bj',
      password: 'E2eTest2025!',
      firstName: 'Rose',
      lastName: 'AHOYO',
      organizationId: IDS.ORG_MINSANTE,
      roleCode: 'MEMBRE_COMMISSION',
    },
    {
      id: IDS.USER_OPERATEUR,
      email: 'directeur@btp-excellence.bj',
      password: 'E2eTest2025!',
      firstName: 'Pierre',
      lastName: 'DOSSOU',
      organizationId: IDS.ORG_OPERATOR,
      roleCode: 'OPERATEUR_ECONOMIQUE',
    },
    {
      id: IDS.USER_COMPTABLE,
      email: 'comptable@tresor.gouv.bj',
      password: 'E2eTest2025!',
      firstName: 'Marie',
      lastName: 'ADJANOHOUN',
      organizationId: null,
      roleCode: 'COMPTABLE',
    },
  ];
  for (const user of users) {
    await post(BASE_URLS.iam, '/users', user);
  }
}

async function seedPlanning() {
  console.log('  [PLANNING] Création du PPM 2025...');
  await post(BASE_URLS.planning, '/forecast-plans', {
    id: IDS.PPM_ID,
    reference: REFS.PPM_REFERENCE,
    title: 'Plan de Passation des Marchés 2025 — MinSanté',
    fiscalYear: 2025,
    organizationId: IDS.ORG_MINSANTE,
    organizationName: 'Ministère de la Santé',
    status: 'APPROUVE',
    totalAmount: MARKET.amount,
    createdBy: IDS.USER_PPM,
  });

  console.log('  [PLANNING] Ajout de la ligne de marché travaux...');
  await post(BASE_URLS.planning, `/forecast-plans/${IDS.PPM_ID}/entries`, {
    id: IDS.MARKET_ENTRY_ID,
    lineNumber: 1,
    description: MARKET.title,
    marketType: MARKET.type,
    method: MARKET.method,
    estimatedAmount: MARKET.amount,
    launchQuarter: 1,
    fundingSource: MARKET.fundingSource,
    referenceCode: 'MINSANTE-TRAV-2025-001',
    category: 'INFRASTRUCTURE_SANITAIRE',
    controlBody: 'DNCMP',
    budgetLine: 'Chapitre 62, Article 621',
  });
}

async function seedPassation() {
  console.log('  [PASSATION] Création du DAC...');
  await post(BASE_URLS.passation, '/dacs', {
    id: IDS.DAC_ID,
    reference: REFS.DAC_REFERENCE,
    title: MARKET.title,
    description: MARKET.description,
    organizationId: IDS.ORG_MINSANTE,
    marketType: MARKET.type,
    procurementMethod: MARKET.method,
    estimatedAmount: MARKET.amount,
    status: 'BROUILLON',
    criteria: {
      technique: [
        { name: 'Expérience similaire', poids: 30, seuil: 60 },
        { name: 'Personnel clé', poids: 25, seuil: 50 },
        { name: 'Méthodologie', poids: 25, seuil: 50 },
        { name: 'Matériel', poids: 20, seuil: 50 },
      ],
      financiere: { methode: 'MOINS_DISANT' },
    },
    createdBy: IDS.USER_AGENT_PPM,
  });
}

async function seedWorkflowDefinitions() {
  console.log('  [WORKFLOW] Chargement des définitions de workflow...');

  const fs = await import('fs');
  const path = await import('path');
  const workflowsDir = path.resolve(__dirname, '../../services/ms-workflow/workflows');

  const workflowFiles = [
    { file: 'wf-dac.yaml', entityType: 'DAC', procedureType: 'APPEL_OFFRES_OUVERT' },
    { file: 'wf-soumission.yaml', entityType: 'SOUMISSION', procedureType: 'APPEL_OFFRES_OUVERT' },
    { file: 'wf-ouverture.yaml', entityType: 'OUVERTURE', procedureType: 'APPEL_OFFRES_OUVERT' },
    { file: 'wf-evaluation.yaml', entityType: 'EVALUATION', procedureType: 'APPEL_OFFRES_OUVERT' },
    { file: 'wf-contrat.yaml', entityType: 'CONTRAT', procedureType: null },
    { file: 'wf-ordre-service.yaml', entityType: 'ORDRE_SERVICE', procedureType: null },
    { file: 'wf-facture.yaml', entityType: 'FACTURE', procedureType: null },
    { file: 'wf-reception.yaml', entityType: 'RECEPTION', procedureType: null },
  ];

  for (const wf of workflowFiles) {
    const yamlContent = fs.readFileSync(path.join(workflowsDir, wf.file), 'utf-8');
    console.log(`    Loading ${wf.file} -> ${wf.entityType}...`);
    await post(BASE_URLS.workflow, '/workflow-definitions', {
      name: wf.file.replace('.yaml', '').replace('wf-', 'Workflow '),
      entityType: wf.entityType,
      procedureType: wf.procedureType,
      organisationId: IDS.ORG_MINSANTE,
      yamlContent,
      isActive: true,
    });
  }
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  console.log('=== Seed E2E : Parcours complet marché public ===\n');

  try {
    await seedIAM();
    await seedPlanning();
    await seedPassation();
    await seedWorkflowDefinitions();

    console.log('\n=== Seed E2E terminé avec succès ===');
    console.log(`Organisation : MinSanté (${IDS.ORG_MINSANTE})`);
    console.log(`Opérateur    : BTP Excellence SARL (${IDS.ORG_OPERATOR})`);
    console.log(`PPM          : ${REFS.PPM_REFERENCE}`);
    console.log(`DAC          : ${REFS.DAC_REFERENCE}`);
    console.log(`Montant      : ${MARKET.amount.toLocaleString('fr-FR')} FCFA`);
    console.log(`Seuil DNCMP  : OUI (>= 100M)`);
  } catch (err) {
    console.error('\n!!! Erreur pendant le seed !!!');
    console.error(err);
    process.exit(1);
  }
}

main();
