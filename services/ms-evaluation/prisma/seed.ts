import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Debut du seeding ms-evaluation...');

  // Sessions d'ouverture des plis
  const opening1 = await prisma.openingSession.upsert({
    where: { id: 'opening-session-1' },
    update: {},
    create: {
      id: 'opening-session-1',
      dacId: 'dac-sante-2026-001',
      dacReference: 'DAC/MS/2026/001',
      sessionDate: new Date('2026-02-15T09:00:00Z'),
      location: 'Salle de conference du Ministere de la Sante, Cotonou',
      status: 'TERMINEE',
      presentMembers: [
        'Codjo Adjahouinou (President)',
        'Patrice Dossou (Membre)',
        'Grace Tossou (Rapporteur)',
        'Afi Houessou (Observateur DGCMP)',
      ],
      observations: 'Ouverture des plis effectuee en presence de 3 soumissionnaires. 5 offres recues dont 4 conformes administrativement.',
      createdBy: 'user-ppm',
    },
  });

  const opening2 = await prisma.openingSession.upsert({
    where: { id: 'opening-session-2' },
    update: {},
    create: {
      id: 'opening-session-2',
      dacId: 'dac-education-2026-003',
      dacReference: 'DAC/MEN/2026/003',
      sessionDate: new Date('2026-03-01T10:00:00Z'),
      location: 'Salle polyvalente du Ministere de l\'Enseignement, Porto-Novo',
      status: 'PROGRAMMEE',
      presentMembers: [],
      observations: null,
      createdBy: 'user-ppm',
    },
  });

  // Sessions d'evaluation technique
  const evalSession1 = await prisma.evaluationSession.upsert({
    where: { id: 'eval-session-tech-1' },
    update: {},
    create: {
      id: 'eval-session-tech-1',
      dacId: 'dac-sante-2026-001',
      dacReference: 'DAC/MS/2026/001',
      type: 'TECHNIQUE',
      sessionDate: new Date('2026-02-20T09:00:00Z'),
      status: 'TERMINEE',
      createdBy: 'user-ppm',
    },
  });

  const evalSession2 = await prisma.evaluationSession.upsert({
    where: { id: 'eval-session-fin-1' },
    update: {},
    create: {
      id: 'eval-session-fin-1',
      dacId: 'dac-sante-2026-001',
      dacReference: 'DAC/MS/2026/001',
      type: 'FINANCIERE',
      sessionDate: new Date('2026-02-25T09:00:00Z'),
      status: 'EN_COURS',
      createdBy: 'user-ppm',
    },
  });

  // Scores d'evaluation technique - Session 1
  const scores = [
    // BTP Plus SARL
    {
      id: 'score-tech-1-1',
      sessionId: 'eval-session-tech-1',
      submissionId: 'submission-btpplus-001',
      operatorName: 'BTP Plus SARL',
      criterion: 'Experience generale de l\'entreprise',
      score: 18,
      maxScore: 20,
      observations: 'Plus de 10 ans d\'experience dans les marches publics au Benin',
      evaluatedBy: 'user-membre',
    },
    {
      id: 'score-tech-1-2',
      sessionId: 'eval-session-tech-1',
      submissionId: 'submission-btpplus-001',
      operatorName: 'BTP Plus SARL',
      criterion: 'Qualification du personnel cle',
      score: 15,
      maxScore: 20,
      observations: 'Equipe technique qualifiee, chef de projet senior',
      evaluatedBy: 'user-membre',
    },
    {
      id: 'score-tech-1-3',
      sessionId: 'eval-session-tech-1',
      submissionId: 'submission-btpplus-001',
      operatorName: 'BTP Plus SARL',
      criterion: 'Methodologie proposee',
      score: 22,
      maxScore: 30,
      observations: 'Methodologie claire mais planning un peu optimiste',
      evaluatedBy: 'user-membre',
    },
    {
      id: 'score-tech-1-4',
      sessionId: 'eval-session-tech-1',
      submissionId: 'submission-btpplus-001',
      operatorName: 'BTP Plus SARL',
      criterion: 'Moyens materiels',
      score: 25,
      maxScore: 30,
      observations: 'Equipements recents et bien entretenus',
      evaluatedBy: 'user-membre',
    },
    // Constructions Modernes SA
    {
      id: 'score-tech-2-1',
      sessionId: 'eval-session-tech-1',
      submissionId: 'submission-constmod-001',
      operatorName: 'Constructions Modernes SA',
      criterion: 'Experience generale de l\'entreprise',
      score: 16,
      maxScore: 20,
      observations: '8 ans d\'experience, quelques references pertinentes',
      evaluatedBy: 'user-membre',
    },
    {
      id: 'score-tech-2-2',
      sessionId: 'eval-session-tech-1',
      submissionId: 'submission-constmod-001',
      operatorName: 'Constructions Modernes SA',
      criterion: 'Qualification du personnel cle',
      score: 14,
      maxScore: 20,
      observations: 'Equipe competente, manque d\'un specialiste en assainissement',
      evaluatedBy: 'user-membre',
    },
    {
      id: 'score-tech-2-3',
      sessionId: 'eval-session-tech-1',
      submissionId: 'submission-constmod-001',
      operatorName: 'Constructions Modernes SA',
      criterion: 'Methodologie proposee',
      score: 20,
      maxScore: 30,
      observations: 'Methodologie satisfaisante dans l\'ensemble',
      evaluatedBy: 'user-membre',
    },
    {
      id: 'score-tech-2-4',
      sessionId: 'eval-session-tech-1',
      submissionId: 'submission-constmod-001',
      operatorName: 'Constructions Modernes SA',
      criterion: 'Moyens materiels',
      score: 20,
      maxScore: 30,
      observations: 'Equipements suffisants, certains en location',
      evaluatedBy: 'user-membre',
    },
  ];

  for (const scoreData of scores) {
    await prisma.evaluationScore.upsert({
      where: { id: scoreData.id },
      update: {},
      create: scoreData,
    });
  }

  // Attribution provisoire
  const award1 = await prisma.provisionalAward.upsert({
    where: { id: 'award-prov-001' },
    update: {},
    create: {
      id: 'award-prov-001',
      dacId: 'dac-sante-2026-001',
      dacReference: 'DAC/MS/2026/001',
      submissionId: 'submission-btpplus-001',
      operatorName: 'BTP Plus SARL',
      awardAmount: 245000000,
      justification: 'Offre evaluee la mieux-disante au terme de l\'evaluation technique (80/100) et financiere. Conformite aux criteres du DAO. Meilleur rapport qualite-prix parmi les soumissionnaires qualifies.',
      awardDate: new Date('2026-02-28T00:00:00Z'),
      status: 'PROVISOIRE',
      createdBy: 'user-ppm',
    },
  });

  console.log('Seeding ms-evaluation termine avec succes !');
  console.log(`  - ${2} sessions d'ouverture creees`);
  console.log(`  - ${2} sessions d'evaluation creees`);
  console.log(`  - ${scores.length} scores d'evaluation crees`);
  console.log(`  - ${1} attribution provisoire creee`);
}

main()
  .catch((e) => {
    console.error('Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
