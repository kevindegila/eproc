import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Debut du seeding ms-passation...');

  // DAC 1 - Publie (Appel d'offres ouvert - Travaux)
  const dac1 = await prisma.dAC.upsert({
    where: { id: 'dac-001' },
    update: {},
    create: {
      id: 'dac-001',
      reference: 'AOO/TRAV/2026/001',
      title: 'Construction du Centre de Sante de Parakou',
      description:
        'Travaux de construction et d\'equipement d\'un centre de sante communal dans la commune de Parakou, departement du Borgou. Le projet comprend la construction de 3 batiments, l\'amenagement des voies d\'acces et le raccordement aux reseaux.',
      organizationId: 'org-ac-sante',
      marketType: 'TRAVAUX',
      procurementMethod: 'APPEL_OFFRES_OUVERT',
      estimatedAmount: 450000000,
      status: 'PUBLIE',
      publicationDate: new Date('2026-01-15'),
      closingDate: new Date('2026-03-15'),
      createdBy: 'user-ppm',
    },
  });

  // DAC 2 - Brouillon (Appel d'offres restreint - Fournitures)
  const dac2 = await prisma.dAC.upsert({
    where: { id: 'dac-002' },
    update: {},
    create: {
      id: 'dac-002',
      reference: 'AOR/FOUR/2026/002',
      title: 'Acquisition de medicaments essentiels pour les hopitaux de zone',
      description:
        'Fourniture de medicaments essentiels generiques pour approvisionner les 5 hopitaux de zone du departement de l\'Atlantique. Lot 1: Antibiotiques, Lot 2: Antipaludeens, Lot 3: Dispositifs medicaux.',
      organizationId: 'org-ac-sante',
      marketType: 'FOURNITURES',
      procurementMethod: 'APPEL_OFFRES_RESTREINT',
      estimatedAmount: 280000000,
      status: 'BROUILLON',
      publicationDate: null,
      closingDate: null,
      createdBy: 'user-ppm',
    },
  });

  // DAC 3 - Cloture (Demande de cotation - Services)
  const dac3 = await prisma.dAC.upsert({
    where: { id: 'dac-003' },
    update: {},
    create: {
      id: 'dac-003',
      reference: 'DC/SERV/2025/047',
      title: 'Audit des systemes d\'information hospitaliers',
      description:
        'Prestation de services pour la realisation d\'un audit complet des systemes d\'information de 3 centres hospitaliers universitaires (CHU) de Cotonou. L\'audit couvrira la securite, la performance et la conformite reglementaire.',
      organizationId: 'org-ac-sante',
      marketType: 'SERVICES',
      procurementMethod: 'DEMANDE_COTATION',
      estimatedAmount: 75000000,
      status: 'CLOTURE',
      publicationDate: new Date('2025-10-01'),
      closingDate: new Date('2025-11-30'),
      createdBy: 'user-ppm',
    },
  });

  // Documents pour DAC 1
  await prisma.dACDocument.upsert({
    where: { id: 'doc-001' },
    update: {},
    create: {
      id: 'doc-001',
      dacId: dac1.id,
      name: 'Dossier d\'Appel d\'Offres - Construction Centre de Sante Parakou',
      filePath: '/uploads/dacs/dac-001/dao_parakou_2026.pdf',
      fileSize: 2450000,
      mimeType: 'application/pdf',
      uploadedBy: 'user-ppm',
    },
  });

  await prisma.dACDocument.upsert({
    where: { id: 'doc-002' },
    update: {},
    create: {
      id: 'doc-002',
      dacId: dac1.id,
      name: 'Plans architecturaux - Centre de Sante Parakou',
      filePath: '/uploads/dacs/dac-001/plans_architecturaux.pdf',
      fileSize: 8900000,
      mimeType: 'application/pdf',
      uploadedBy: 'user-ppm',
    },
  });

  await prisma.dACDocument.upsert({
    where: { id: 'doc-003' },
    update: {},
    create: {
      id: 'doc-003',
      dacId: dac3.id,
      name: 'Termes de Reference - Audit SI Hospitalier',
      filePath: '/uploads/dacs/dac-003/tdr_audit_si.pdf',
      fileSize: 1200000,
      mimeType: 'application/pdf',
      uploadedBy: 'user-ppm',
    },
  });

  // Templates
  await prisma.dACTemplate.upsert({
    where: { id: 'tpl-001' },
    update: {},
    create: {
      id: 'tpl-001',
      name: 'Modele DAO - Marches de Travaux',
      marketType: 'TRAVAUX',
      filePath: '/templates/dao_travaux_standard.docx',
      description:
        'Modele standard de Dossier d\'Appel d\'Offres pour les marches de travaux publics, conforme au Code des Marches Publics du Benin.',
      isActive: true,
    },
  });

  await prisma.dACTemplate.upsert({
    where: { id: 'tpl-002' },
    update: {},
    create: {
      id: 'tpl-002',
      name: 'Modele DAO - Marches de Fournitures',
      marketType: 'FOURNITURES',
      filePath: '/templates/dao_fournitures_standard.docx',
      description:
        'Modele standard de Dossier d\'Appel d\'Offres pour les marches de fournitures, conforme au Code des Marches Publics du Benin.',
      isActive: true,
    },
  });

  // Retraits pour DAC 1 (publie)
  await prisma.dACWithdrawal.upsert({
    where: { id: 'wth-001' },
    update: {},
    create: {
      id: 'wth-001',
      dacId: dac1.id,
      operatorName: 'BTP Plus SARL',
      operatorEmail: 'contact@btpplus.bj',
      operatorPhone: '+229 97 12 34 56',
      withdrawalDate: new Date('2026-01-20'),
    },
  });

  await prisma.dACWithdrawal.upsert({
    where: { id: 'wth-002' },
    update: {},
    create: {
      id: 'wth-002',
      dacId: dac1.id,
      operatorName: 'Constructions Modernes du Benin SA',
      operatorEmail: 'marches@cmb-benin.com',
      operatorPhone: '+229 95 67 89 01',
      withdrawalDate: new Date('2026-01-22'),
    },
  });

  await prisma.dACWithdrawal.upsert({
    where: { id: 'wth-003' },
    update: {},
    create: {
      id: 'wth-003',
      dacId: dac1.id,
      operatorName: 'Entreprise Generale Kougblenou et Fils',
      operatorEmail: 'info@egkf.bj',
      operatorPhone: '+229 96 45 23 78',
      withdrawalDate: new Date('2026-02-01'),
    },
  });

  // Retrait pour DAC 3 (cloture)
  await prisma.dACWithdrawal.upsert({
    where: { id: 'wth-004' },
    update: {},
    create: {
      id: 'wth-004',
      dacId: dac3.id,
      operatorName: 'Digital Services Afrique',
      operatorEmail: 'appels@dsa-consulting.com',
      operatorPhone: '+229 61 99 88 77',
      withdrawalDate: new Date('2025-10-10'),
    },
  });

  console.log('Seeding ms-passation termine avec succes !');
  console.log(`  - 3 DAC crees (1 publie, 1 brouillon, 1 cloture)`);
  console.log(`  - 3 documents crees`);
  console.log(`  - 2 modeles de documents crees`);
  console.log(`  - 4 retraits crees`);
}

main()
  .catch((e) => {
    console.error('Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
