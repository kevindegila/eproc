import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Debut du seeding ms-execution...');

  // Execution 1 : En cours - Construction route nationale
  const exec1 = await prisma.execution.upsert({
    where: { id: 'exec-001' },
    update: {},
    create: {
      id: 'exec-001',
      contractId: 'contract-001',
      contractReference: 'MC-2025-TRAVAUX-0042',
      status: 'EN_COURS',
      progressPercent: 45.5,
      startDate: new Date('2025-06-15'),
      expectedEndDate: new Date('2026-12-31'),
      observations: 'Travaux en cours de realisation. Phase de terrassement achevee.',
      createdBy: 'user-ppm',
    },
  });

  // Execution 2 : Terminee - Fourniture equipements medicaux
  const exec2 = await prisma.execution.upsert({
    where: { id: 'exec-002' },
    update: {},
    create: {
      id: 'exec-002',
      contractId: 'contract-002',
      contractReference: 'MC-2025-FOURNITURES-0078',
      status: 'TERMINE',
      progressPercent: 100,
      startDate: new Date('2025-03-01'),
      expectedEndDate: new Date('2025-09-30'),
      actualEndDate: new Date('2025-10-15'),
      observations: 'Livraison integrale effectuee avec un leger retard de 15 jours.',
      createdBy: 'user-ppm',
    },
  });

  // Rapports techniques
  await prisma.technicalReport.upsert({
    where: { id: 'report-001' },
    update: {},
    create: {
      id: 'report-001',
      executionId: exec1.id,
      title: 'Rapport d\'avancement - Phase de terrassement',
      reportDate: new Date('2025-09-15'),
      content: 'Les travaux de terrassement sur le troncon Cotonou-Porto-Novo ont ete acheves conformement au cahier des charges. Le compactage des couches de forme a ete realise selon les normes en vigueur. Taux d\'avancement global : 30%.',
      progressPercent: 30,
      createdBy: 'user-agent-ppm',
    },
  });

  await prisma.technicalReport.upsert({
    where: { id: 'report-002' },
    update: {},
    create: {
      id: 'report-002',
      executionId: exec1.id,
      title: 'Rapport d\'avancement - Pose de la couche de base',
      reportDate: new Date('2026-01-20'),
      content: 'La pose de la couche de base granulaire est en cours sur 12 km du troncon. Les essais de portance donnent des resultats conformes aux specifications techniques. Quelques ajustements necessaires au niveau du drainage lateral.',
      progressPercent: 45.5,
      createdBy: 'user-agent-ppm',
    },
  });

  // Receptions
  await prisma.reception.upsert({
    where: { id: 'reception-001' },
    update: {},
    create: {
      id: 'reception-001',
      executionId: exec2.id,
      type: 'PROVISOIRE',
      receptionDate: new Date('2025-10-15'),
      pvReference: 'PV-RP-2025-0078-001',
      observations: 'Reception provisoire des equipements medicaux. Verification de la conformite des specifications techniques realisee. Periode de garantie de 12 mois demarree.',
      members: ['Dr. Codjo Adjahouinou', 'Ing. Grace Tossou', 'M. Patrice Dossou'],
      createdBy: 'user-ppm',
    },
  });

  await prisma.reception.upsert({
    where: { id: 'reception-002' },
    update: {},
    create: {
      id: 'reception-002',
      executionId: exec2.id,
      type: 'DEFINITIVE',
      receptionDate: new Date('2026-10-15'),
      pvReference: 'PV-RD-2026-0078-001',
      observations: 'Reception definitive apres expiration de la periode de garantie. Tous les equipements sont en etat de fonctionnement optimal. Aucune reserve.',
      members: ['Dr. Codjo Adjahouinou', 'Ing. Grace Tossou', 'Mme Eulalie Zinsou'],
      createdBy: 'user-ppm',
    },
  });

  // Avenant
  await prisma.amendment.upsert({
    where: { id: 'amendment-001' },
    update: {},
    create: {
      id: 'amendment-001',
      executionId: exec1.id,
      reference: 'AV-2025-TRAVAUX-0042-01',
      type: 'DELAI',
      description: 'Prolongation du delai d\'execution de 3 mois suite aux intemperies exceptionnelles survenues durant la saison des pluies 2025. Les conditions meteorologiques ont empeche la poursuite des travaux de terrassement pendant 45 jours.',
      amountChange: 0,
      durationChange: 90,
      status: 'APPROUVE',
      approvedAt: new Date('2025-11-20'),
      createdBy: 'user-ppm',
    },
  });

  console.log('Seeding ms-execution termine avec succes !');
  console.log('  - 2 executions creees');
  console.log('  - 2 rapports techniques crees');
  console.log('  - 2 receptions creees');
  console.log('  - 1 avenant cree');
}

main()
  .catch((e) => {
    console.error('Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
