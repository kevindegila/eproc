import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Debut du seeding ms-recours...');

  // Recours 1 - Recours gracieux, en instruction
  const appeal1 = await prisma.appeal.upsert({
    where: { id: 'appeal-001' },
    update: {},
    create: {
      id: 'appeal-001',
      reference: 'REC/ARMP/2026/001',
      type: 'GRACIEUX',
      dacId: 'dac-sante-2026-001',
      dacReference: 'DAC/MS/2026/001',
      complainantId: 'operator-btpplus',
      complainantName: 'BTP Plus SARL',
      respondentName: 'Ministere de la Sante',
      subject: 'Contestation de l\'attribution provisoire du marche de construction du centre de sante de Parakou',
      description: 'Le soumissionnaire conteste l\'attribution provisoire au motif que l\'evaluation technique n\'a pas respecte les criteres definis dans le DAO. Les coefficients de ponderation appliques different de ceux annonces dans le dossier d\'appel d\'offres.',
      status: 'EN_INSTRUCTION',
      filedAt: new Date('2026-01-20T10:00:00Z'),
    },
  });

  // Recours 2 - Recours hierarchique, depose
  const appeal2 = await prisma.appeal.upsert({
    where: { id: 'appeal-002' },
    update: {},
    create: {
      id: 'appeal-002',
      reference: 'REC/ARMP/2026/002',
      type: 'HIERARCHIQUE',
      dacId: 'dac-education-2026-003',
      dacReference: 'DAC/MEN/2026/003',
      complainantId: 'operator-constmod',
      complainantName: 'Constructions Modernes SA',
      respondentName: 'Ministere de l\'Enseignement',
      subject: 'Recours contre la decision de rejet de l\'offre pour non-conformite administrative',
      description: 'Le soumissionnaire considere que son offre a ete rejetee a tort pour absence de caution de soumission alors que celle-ci etait jointe a l\'offre originale. Le soumissionnaire dispose d\'un recepisse de depot attestant la presence de la caution.',
      status: 'DEPOSE',
      filedAt: new Date('2026-02-05T14:30:00Z'),
    },
  });

  // Decision pour le recours 1
  const decision1 = await prisma.appealDecision.upsert({
    where: { id: 'decision-001' },
    update: {},
    create: {
      id: 'decision-001',
      appealId: 'appeal-001',
      decisionDate: new Date('2026-02-10T00:00:00Z'),
      decisionType: 'AVIS_ARMP',
      summary: 'Apres examen du dossier, l\'ARMP constate que les criteres d\'evaluation mentionnes dans le DAO n\'ont pas ete strictement respectes lors de l\'evaluation technique. Recommandation de reprendre l\'evaluation technique conformement aux criteres du DAO.',
      isInFavor: true,
      decidedBy: 'Comite de Reglement des Differends - ARMP',
    },
  });

  // Arbitrage
  const arbitration1 = await prisma.arbitration.upsert({
    where: { id: 'arbitration-001' },
    update: {},
    create: {
      id: 'arbitration-001',
      reference: 'ARB/ARMP/2026/001',
      appealId: 'appeal-001',
      parties: ['BTP Plus SARL', 'Ministere de la Sante'],
      subject: 'Arbitrage suite au recours gracieux sur le marche DAC/MS/2026/001',
      description: 'Procedure d\'arbitrage initiee suite au recours de BTP Plus SARL concernant l\'attribution provisoire du marche de construction du centre de sante de Parakou. Les deux parties ont accepte la procedure d\'arbitrage.',
      arbitrator: 'Me Rodrigue Ahouandjinou, Arbitre certifie OHADA',
      status: 'EN_COURS',
      hearingDate: new Date('2026-03-01T09:00:00Z'),
    },
  });

  // Denonciations
  const denunciation1 = await prisma.denunciation.upsert({
    where: { id: 'denunciation-001' },
    update: {},
    create: {
      id: 'denunciation-001',
      reference: 'DEN/ARMP/2026/001',
      subject: 'Suspicion de favoritisme dans l\'attribution d\'un marche public',
      description: 'Un marche de fourniture de materiels informatiques d\'un montant de 150 millions FCFA a ete attribue a une entreprise creee il y a moins de 6 mois. L\'entreprise attributaire serait liee a un cadre de l\'autorite contractante. Les autres soumissionnaires, avec plus d\'experience, ont ete elimines pour des motifs administratifs mineurs.',
      category: 'FAVORITISME',
      isAnonymous: true,
      status: 'EN_TRAITEMENT',
      receivedAt: new Date('2026-01-15T08:00:00Z'),
    },
  });

  const denunciation2 = await prisma.denunciation.upsert({
    where: { id: 'denunciation-002' },
    update: {},
    create: {
      id: 'denunciation-002',
      reference: 'DEN/ARMP/2026/002',
      subject: 'Non-respect des delais de publication des appels d\'offres',
      description: 'Plusieurs appels d\'offres de la mairie de Bohicon ont ete publies avec des delais de soumission inferieurs au minimum legal de 30 jours prevu par le code des marches publics. Cette pratique reduit les chances de participation des PME locales qui n\'ont pas le temps de preparer leurs offres.',
      category: 'IRREGULARITE_PROCEDURE',
      isAnonymous: false,
      contactEmail: 'association.pme.zou@gmail.com',
      status: 'RECUE',
      receivedAt: new Date('2026-02-01T11:30:00Z'),
    },
  });

  console.log('Seeding ms-recours termine avec succes !');
  console.log(`  - ${2} recours crees`);
  console.log(`  - ${1} decision creee`);
  console.log(`  - ${1} arbitrage cree`);
  console.log(`  - ${2} denonciations creees`);
}

main()
  .catch((e) => {
    console.error('Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
