import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Debut du seeding ms-submission...');

  // Soumission 1 : BROUILLON (en cours de preparation)
  const submission1 = await prisma.submission.upsert({
    where: { id: 'sub-001' },
    update: {},
    create: {
      id: 'sub-001',
      dacId: 'dac-2026-001',
      dacReference: 'DAC/MS/2026/AOO/001',
      operatorId: 'user-operateur',
      operatorName: 'BTP Plus SARL',
      status: 'BROUILLON',
    },
  });

  await prisma.submissionFile.upsert({
    where: { id: 'file-001' },
    update: {},
    create: {
      id: 'file-001',
      submissionId: submission1.id,
      name: 'Offre technique - BTP Plus.pdf',
      filePath: '/uploads/submissions/sub-001/offre-technique.pdf',
      fileSize: 2457600,
      mimeType: 'application/pdf',
      category: 'TECHNIQUE',
    },
  });

  // Soumission 2 : SOUMISE (deposee avec accuse de reception)
  const submission2 = await prisma.submission.upsert({
    where: { id: 'sub-002' },
    update: {},
    create: {
      id: 'sub-002',
      dacId: 'dac-2026-002',
      dacReference: 'DAC/MEF/2026/AOO/015',
      operatorId: 'user-operateur-2',
      operatorName: 'Entreprise Generale du Benin SA',
      status: 'SOUMISE',
      submittedAt: new Date('2026-01-15T10:30:00Z'),
    },
  });

  await prisma.submissionFile.upsert({
    where: { id: 'file-002' },
    update: {},
    create: {
      id: 'file-002',
      submissionId: submission2.id,
      name: 'Dossier technique complet.pdf',
      filePath: '/uploads/submissions/sub-002/dossier-technique.pdf',
      fileSize: 5242880,
      mimeType: 'application/pdf',
      category: 'TECHNIQUE',
    },
  });

  await prisma.submissionFile.upsert({
    where: { id: 'file-003' },
    update: {},
    create: {
      id: 'file-003',
      submissionId: submission2.id,
      name: 'Offre financiere - EGB.xlsx',
      filePath: '/uploads/submissions/sub-002/offre-financiere.xlsx',
      fileSize: 1048576,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      category: 'FINANCIERE',
    },
  });

  await prisma.submissionFile.upsert({
    where: { id: 'file-004' },
    update: {},
    create: {
      id: 'file-004',
      submissionId: submission2.id,
      name: 'Attestation fiscale 2025.pdf',
      filePath: '/uploads/submissions/sub-002/attestation-fiscale.pdf',
      fileSize: 524288,
      mimeType: 'application/pdf',
      category: 'ADMINISTRATIVE',
    },
  });

  await prisma.submissionReceipt.upsert({
    where: { id: 'receipt-001' },
    update: {},
    create: {
      id: 'receipt-001',
      submissionId: submission2.id,
      receiptNumber: 'AR-2026-00042',
      receivedAt: new Date('2026-01-15T10:30:00Z'),
      receivedBy: 'Afi Houessou',
    },
  });

  // Soumission 3 : RETIREE (retiree par l'operateur)
  const submission3 = await prisma.submission.upsert({
    where: { id: 'sub-003' },
    update: {},
    create: {
      id: 'sub-003',
      dacId: 'dac-2026-001',
      dacReference: 'DAC/MS/2026/AOO/001',
      operatorId: 'user-operateur-3',
      operatorName: 'Constructions Modernes Afrique SARL',
      status: 'RETIREE',
      submittedAt: new Date('2026-01-10T08:15:00Z'),
    },
  });

  await prisma.submissionFile.upsert({
    where: { id: 'file-005' },
    update: {},
    create: {
      id: 'file-005',
      submissionId: submission3.id,
      name: 'Proposition technique CMA.pdf',
      filePath: '/uploads/submissions/sub-003/proposition-technique.pdf',
      fileSize: 3145728,
      mimeType: 'application/pdf',
      category: 'TECHNIQUE',
    },
  });

  await prisma.submissionFile.upsert({
    where: { id: 'file-006' },
    update: {},
    create: {
      id: 'file-006',
      submissionId: submission3.id,
      name: 'Bordereau des prix unitaires.pdf',
      filePath: '/uploads/submissions/sub-003/bordereau-prix.pdf',
      fileSize: 786432,
      mimeType: 'application/pdf',
      category: 'FINANCIERE',
    },
  });

  await prisma.submissionReceipt.upsert({
    where: { id: 'receipt-002' },
    update: {},
    create: {
      id: 'receipt-002',
      submissionId: submission3.id,
      receiptNumber: 'AR-2026-00035',
      receivedAt: new Date('2026-01-10T08:15:00Z'),
      receivedBy: 'Codjo Adjahouinou',
    },
  });

  console.log('Seeding ms-submission termine avec succes !');
  console.log(`  - ${3} soumissions creees`);
  console.log(`  - ${6} fichiers crees`);
  console.log(`  - ${2} accuses de reception crees`);
}

main()
  .catch((e) => {
    console.error('Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
