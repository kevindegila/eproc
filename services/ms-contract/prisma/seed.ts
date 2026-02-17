import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Debut du seeding ms-contract...');

  // Contrat 1 - Brouillon
  const contract1 = await prisma.contract.upsert({
    where: { id: 'contract-001' },
    update: {},
    create: {
      id: 'contract-001',
      reference: 'CTR-2026-0001',
      dacId: 'dac-001',
      dacReference: 'DAC-2026-0042',
      title: 'Construction du centre de sante de Parakou',
      operatorId: 'user-operateur',
      operatorName: 'BTP Plus SARL',
      organizationId: 'org-ac-sante',
      amount: 245000000,
      status: 'BROUILLON',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-03-31'),
      createdBy: 'user-ppm',
    },
  });

  // Contrat 2 - Signe avec signatures
  const contract2 = await prisma.contract.upsert({
    where: { id: 'contract-002' },
    update: {},
    create: {
      id: 'contract-002',
      reference: 'CTR-2026-0002',
      dacId: 'dac-002',
      dacReference: 'DAC-2025-0118',
      title: 'Fourniture de materiel informatique pour le Ministere de la Sante',
      operatorId: 'user-operateur',
      operatorName: 'InfoTech Benin SA',
      organizationId: 'org-ac-sante',
      amount: 78500000,
      status: 'SIGNE',
      signatureDate: new Date('2026-01-15'),
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-07-31'),
      createdBy: 'user-ppm',
    },
  });

  // Contrat 3 - Notifie
  const contract3 = await prisma.contract.upsert({
    where: { id: 'contract-003' },
    update: {},
    create: {
      id: 'contract-003',
      reference: 'CTR-2026-0003',
      dacId: 'dac-003',
      dacReference: 'DAC-2025-0095',
      title: 'Prestations de nettoyage des locaux administratifs de la DGCMP',
      operatorId: 'user-operateur',
      operatorName: 'ProNet Services',
      organizationId: 'org-dgcmp',
      amount: 18200000,
      status: 'NOTIFIE',
      signatureDate: new Date('2025-12-20'),
      approvalDate: new Date('2026-01-05'),
      notificationDate: new Date('2026-01-10'),
      startDate: new Date('2026-02-01'),
      endDate: new Date('2027-01-31'),
      createdBy: 'user-dgcmp',
    },
  });

  // Signatures du contrat 2
  await prisma.contractSignature.upsert({
    where: { id: 'sig-001' },
    update: {},
    create: {
      id: 'sig-001',
      contractId: contract2.id,
      signerName: 'Codjo Adjahouinou',
      signerRole: 'Personne Responsable des Marches Publics',
      signedAt: new Date('2026-01-14'),
      observations: 'Contrat conforme au dossier de consultation',
    },
  });

  await prisma.contractSignature.upsert({
    where: { id: 'sig-002' },
    update: {},
    create: {
      id: 'sig-002',
      contractId: contract2.id,
      signerName: 'Raoul Ahouandjinou',
      signerRole: 'Representant de l\'operateur economique',
      signedAt: new Date('2026-01-15'),
      observations: null,
    },
  });

  // Signatures du contrat 3
  await prisma.contractSignature.upsert({
    where: { id: 'sig-003' },
    update: {},
    create: {
      id: 'sig-003',
      contractId: contract3.id,
      signerName: 'Koffi Mensah',
      signerRole: 'Directeur General DGCMP',
      signedAt: new Date('2025-12-20'),
      observations: 'Approuve apres verification de conformite',
    },
  });

  await prisma.contractSignature.upsert({
    where: { id: 'sig-004' },
    update: {},
    create: {
      id: 'sig-004',
      contractId: contract3.id,
      signerName: 'Aminata Diallo',
      signerRole: 'Gerante de ProNet Services',
      signedAt: new Date('2025-12-20'),
      observations: null,
    },
  });

  console.log('Seeding ms-contract termine avec succes !');
  console.log(`  - ${3} contrats crees`);
  console.log(`    * ${contract1.reference} (BROUILLON)`);
  console.log(`    * ${contract2.reference} (SIGNE)`);
  console.log(`    * ${contract3.reference} (NOTIFIE)`);
  console.log(`  - ${4} signatures creees`);
}

main()
  .catch((e) => {
    console.error('Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
