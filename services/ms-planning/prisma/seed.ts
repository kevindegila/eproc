import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Debut du seeding ms-planning...');

  // Plan previsionnel 1 - Ministere de la Sante
  const plan1 = await prisma.forecastPlan.upsert({
    where: { id: 'plan-sante-2026' },
    update: {},
    create: {
      id: 'plan-sante-2026',
      reference: 'PPM-MS-2026-001',
      title: 'Plan Previsionnel des Marches du Ministere de la Sante - Exercice 2026',
      fiscalYear: 2026,
      organizationId: 'org-ac-sante',
      status: 'VALIDE',
      totalAmount: 4850000000,
      createdBy: 'user-ppm',
    },
  });

  // Entrees du plan 1
  const entriesPlan1 = [
    {
      id: 'entry-sante-001',
      planId: plan1.id,
      lineNumber: 1,
      description: 'Acquisition de medicaments essentiels et consommables medicaux pour les centres de sante communaux',
      marketType: 'FOURNITURES',
      method: 'APPEL_OFFRES_OUVERT',
      estimatedAmount: 1500000000,
      launchQuarter: 1,
      fundingSource: 'Budget National',
    },
    {
      id: 'entry-sante-002',
      planId: plan1.id,
      lineNumber: 2,
      description: 'Construction et equipement du Centre Hospitalier Departemental de Parakou - Phase 2',
      marketType: 'TRAVAUX',
      method: 'APPEL_OFFRES_OUVERT',
      estimatedAmount: 2200000000,
      launchQuarter: 1,
      fundingSource: 'Budget National / BID',
    },
    {
      id: 'entry-sante-003',
      planId: plan1.id,
      lineNumber: 3,
      description: 'Recrutement d\'un cabinet pour l\'audit organisationnel des hopitaux de zone',
      marketType: 'PRESTATIONS_INTELLECTUELLES',
      method: 'APPEL_OFFRES_RESTREINT',
      estimatedAmount: 350000000,
      launchQuarter: 2,
      fundingSource: 'Banque Mondiale',
    },
    {
      id: 'entry-sante-004',
      planId: plan1.id,
      lineNumber: 4,
      description: 'Fourniture et installation d\'equipements de laboratoire pour les CHD',
      marketType: 'FOURNITURES',
      method: 'APPEL_OFFRES_OUVERT',
      estimatedAmount: 800000000,
      launchQuarter: 2,
      fundingSource: 'Budget National',
    },
  ];

  for (const entry of entriesPlan1) {
    await prisma.marketEntry.upsert({
      where: { id: entry.id },
      update: {},
      create: entry,
    });
  }

  // Plan previsionnel 2 - Ministere des Infrastructures (simule)
  const plan2 = await prisma.forecastPlan.upsert({
    where: { id: 'plan-infra-2026' },
    update: {},
    create: {
      id: 'plan-infra-2026',
      reference: 'PPM-MI-2026-001',
      title: 'Plan Previsionnel des Marches du Ministere des Infrastructures et des Transports - Exercice 2026',
      fiscalYear: 2026,
      organizationId: 'org-ac-sante',
      status: 'BROUILLON',
      totalAmount: 12750000000,
      createdBy: 'user-ppm',
    },
  });

  // Entrees du plan 2
  const entriesPlan2 = [
    {
      id: 'entry-infra-001',
      planId: plan2.id,
      lineNumber: 1,
      description: 'Rehabilitation de la Route Nationale Inter-Etats n°1 - Troncon Cotonou-Bohicon (125 km)',
      marketType: 'TRAVAUX',
      method: 'APPEL_OFFRES_OUVERT',
      estimatedAmount: 8500000000,
      launchQuarter: 1,
      fundingSource: 'Budget National / BAD',
    },
    {
      id: 'entry-infra-002',
      planId: plan2.id,
      lineNumber: 2,
      description: 'Mission de controle et surveillance des travaux routiers RNIE1',
      marketType: 'PRESTATIONS_INTELLECTUELLES',
      method: 'APPEL_OFFRES_RESTREINT',
      estimatedAmount: 750000000,
      launchQuarter: 1,
      fundingSource: 'Budget National / BAD',
    },
    {
      id: 'entry-infra-003',
      planId: plan2.id,
      lineNumber: 3,
      description: 'Entretien courant des routes en terre dans les departements de l\'Atacora et de la Donga',
      marketType: 'TRAVAUX',
      method: 'DEMANDE_COTATION',
      estimatedAmount: 1200000000,
      launchQuarter: 2,
      fundingSource: 'Budget National',
    },
    {
      id: 'entry-infra-004',
      planId: plan2.id,
      lineNumber: 4,
      description: 'Acquisition de materiel topographique et de signalisation routiere',
      marketType: 'FOURNITURES',
      method: 'APPEL_OFFRES_OUVERT',
      estimatedAmount: 450000000,
      launchQuarter: 3,
      fundingSource: 'Budget National',
    },
    {
      id: 'entry-infra-005',
      planId: plan2.id,
      lineNumber: 5,
      description: 'Etude de faisabilite pour la construction du pont sur le fleuve Oueme a Adjohoun',
      marketType: 'PRESTATIONS_INTELLECTUELLES',
      method: 'APPEL_OFFRES_RESTREINT',
      estimatedAmount: 350000000,
      launchQuarter: 3,
      fundingSource: 'Budget National',
    },
    {
      id: 'entry-infra-006',
      planId: plan2.id,
      lineNumber: 6,
      description: 'Services de gardiennage et de nettoyage des batiments administratifs du Ministere',
      marketType: 'SERVICES',
      method: 'DEMANDE_COTATION',
      estimatedAmount: 180000000,
      launchQuarter: 1,
      fundingSource: 'Budget National',
    },
  ];

  for (const entry of entriesPlan2) {
    await prisma.marketEntry.upsert({
      where: { id: entry.id },
      update: {},
      create: entry,
    });
  }

  // Avis generaux
  const notice1 = await prisma.generalNotice.upsert({
    where: { id: 'notice-sante-2026' },
    update: {},
    create: {
      id: 'notice-sante-2026',
      reference: 'AGM-MS-2026-001',
      title: 'Avis General de Marches du Ministere de la Sante - Exercice budgetaire 2026',
      organizationId: 'org-ac-sante',
      fiscalYear: 2026,
      content: `Le Ministere de la Sante informe les operateurs economiques nationaux et internationaux qu'il envisage de lancer au cours de l'exercice budgetaire 2026, les marches ci-apres :

1. FOURNITURES :
- Acquisition de medicaments essentiels et consommables medicaux (AOO - T1 2026)
- Fourniture et installation d'equipements de laboratoire pour les CHD (AOO - T2 2026)

2. TRAVAUX :
- Construction et equipement du Centre Hospitalier Departemental de Parakou - Phase 2 (AOO - T1 2026)

3. PRESTATIONS INTELLECTUELLES :
- Recrutement d'un cabinet pour l'audit organisationnel des hopitaux de zone (AOR - T2 2026)

Les avis specifiques d'appel d'offres seront publies ulterieurement dans le Journal des Marches Publics et sur la plateforme EPROC.

Les operateurs economiques interesses peuvent obtenir des informations complementaires aupres de la Personne Responsable des Marches Publics du Ministere de la Sante, Immeuble Ministere de la Sante, Boulevard Saint-Michel, Cotonou.`,
      publishedAt: new Date('2026-01-15'),
      status: 'PUBLIE',
      createdBy: 'user-ppm',
    },
  });

  const notice2 = await prisma.generalNotice.upsert({
    where: { id: 'notice-infra-2026' },
    update: {},
    create: {
      id: 'notice-infra-2026',
      reference: 'AGM-MI-2026-001',
      title: 'Avis General de Marches du Ministere des Infrastructures et des Transports - Exercice budgetaire 2026',
      organizationId: 'org-ac-sante',
      fiscalYear: 2026,
      content: `Le Ministere des Infrastructures et des Transports informe les entreprises et bureaux d'etudes nationaux et internationaux qu'il prevoit de lancer les consultations suivantes au titre de l'exercice 2026 :

1. TRAVAUX :
- Rehabilitation de la Route Nationale Inter-Etats n.1 - Troncon Cotonou-Bohicon (AOO - T1 2026)
- Entretien courant des routes en terre dans les departements de l'Atacora et de la Donga (DC - T2 2026)

2. PRESTATIONS INTELLECTUELLES :
- Mission de controle et surveillance des travaux routiers RNIE1 (AOR - T1 2026)
- Etude de faisabilite pour la construction du pont sur le fleuve Oueme a Adjohoun (AOR - T3 2026)

3. FOURNITURES :
- Acquisition de materiel topographique et de signalisation routiere (AOO - T3 2026)

4. SERVICES :
- Services de gardiennage et de nettoyage des batiments administratifs (DC - T1 2026)

Les dossiers d'appel d'offres seront disponibles selon le calendrier indique ci-dessus. Pour tout renseignement, s'adresser a la Direction de la Programmation et de la Prospective, Ministere des Infrastructures et des Transports, Cotonou, Benin.`,
      status: 'BROUILLON',
      createdBy: 'user-ppm',
    },
  });

  console.log('Seeding ms-planning termine avec succes !');
  console.log(`  - ${2} plans previsionnels crees`);
  console.log(`  - ${entriesPlan1.length + entriesPlan2.length} entrees de marches creees`);
  console.log(`  - ${2} avis generaux crees`);
}

main()
  .catch((e) => {
    console.error('Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
