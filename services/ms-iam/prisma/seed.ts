import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Début du seeding ms-iam...');

  // Organisations
  const orgDGCMP = await prisma.organization.upsert({
    where: { id: 'org-dgcmp' },
    update: {},
    create: {
      id: 'org-dgcmp',
      name: 'Direction Générale du Contrôle des Marchés Publics',
      type: 'DGCMP',
      sigle: 'DGCMP',
      address: 'Cotonou, Bénin',
      email: 'contact@dgcmp.bj',
    },
  });

  const orgARMP = await prisma.organization.upsert({
    where: { id: 'org-armp' },
    update: {},
    create: {
      id: 'org-armp',
      name: 'Autorité de Régulation des Marchés Publics',
      type: 'ARMP',
      sigle: 'ARMP',
      address: 'Cotonou, Bénin',
      email: 'contact@armp.bj',
    },
  });

  const orgDNCMP = await prisma.organization.upsert({
    where: { id: 'org-dncmp' },
    update: {},
    create: {
      id: 'org-dncmp',
      name: 'Direction Nationale de Contrôle des Marchés Publics',
      type: 'DNCMP',
      sigle: 'DNCMP',
      address: 'Cotonou, Bénin',
      email: 'contact@dncmp.bj',
    },
  });

  const orgANDF = await prisma.organization.upsert({
    where: { id: 'org-andf' },
    update: {},
    create: {
      id: 'org-andf',
      name: 'Agence Nationale du Domaine et du Foncier',
      type: 'AUTORITE_CONTRACTANTE',
      sigle: 'ANDF',
      address: 'Cotonou, Benin',
      email: 'contact@andf.bj',
      phone: '+229 21 31 XX XX',
    },
  });

  const orgANAC = await prisma.organization.upsert({
    where: { id: 'org-anac' },
    update: {},
    create: {
      id: 'org-anac',
      name: 'Agence Nationale de l\'Aviation Civile',
      type: 'AUTORITE_CONTRACTANTE',
      sigle: 'ANAC',
      address: 'Cotonou, Bénin',
      email: 'contact@anac.bj',
      phone: '+229 21 30 04 88',
    },
  });

  const orgDroneBJ = await prisma.organization.upsert({
    where: { id: 'org-dronebj' },
    update: {},
    create: {
      id: 'org-dronebj',
      name: 'Drone BJ SARL',
      type: 'ENTREPRISE',
      sigle: 'DRONEBJ',
      address: 'Abomey-Calavi, Bénin',
      email: 'contact@dronebj.bj',
      phone: '+229 96 00 00 00',
      nif: '3098765432',
      rccm: 'RB/COT/2024/B/5678',
    },
  });

  // Rôles
  const roles = [
    { id: 'role-admin', code: 'ADMIN_SYSTEM', name: 'Administrateur Système', description: 'Accès complet au système' },
    { id: 'role-dgcmp', code: 'DGCMP', name: 'Directeur DGCMP', description: 'Directeur de la DGCMP' },
    { id: 'role-agent-dgcmp', code: 'AGENT_DGCMP', name: 'Agent DGCMP', description: 'Agent de la DGCMP' },
    { id: 'role-ppm', code: 'PPM', name: 'Personne Responsable des Marchés Publics', description: 'PPM d\'une autorité contractante' },
    { id: 'role-agent-ppm', code: 'AGENT_PPM', name: 'Agent PPM', description: 'Agent de la PPM' },
    { id: 'role-membre-commission', code: 'MEMBRE_COMMISSION', name: 'Membre de Commission', description: 'Membre d\'une commission d\'évaluation' },
    { id: 'role-operateur', code: 'OPERATEUR_ECONOMIQUE', name: 'Opérateur Économique', description: 'Soumissionnaire / Entreprise' },
    { id: 'role-armp', code: 'ARMP', name: 'Responsable ARMP', description: 'Responsable de l\'ARMP' },
    { id: 'role-agent-armp', code: 'AGENT_ARMP', name: 'Agent ARMP', description: 'Agent de l\'ARMP' },
    { id: 'role-dncmp', code: 'DNCMP', name: 'Responsable DNCMP', description: 'Responsable de la DNCMP' },
    { id: 'role-public', code: 'PUBLIC', name: 'Utilisateur Public', description: 'Accès public uniquement' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: {},
      create: role,
    });
  }

  // Mot de passe pour ANDF PRMP user
  const hashedPasswordPrmp = await bcrypt.hash('1234', 10);
  // Mot de passe commun pour other test users
  const hashedPassword = await bcrypt.hash('EprocTest2026!', 10);

  // Utilisateurs
  const users = [
    { id: 'user-admin', email: 'admin@eproc.bj', firstName: 'Admin', lastName: 'Système', organizationId: orgDGCMP.id, roleId: 'role-admin', password: hashedPassword },
    { id: 'user-dgcmp', email: 'directeur@dgcmp.bj', firstName: 'Koffi', lastName: 'Mensah', organizationId: orgDGCMP.id, roleId: 'role-dgcmp', password: hashedPassword },
    { id: 'user-agent-dgcmp', email: 'agent@dgcmp.bj', firstName: 'Afi', lastName: 'Houessou', organizationId: orgDGCMP.id, roleId: 'role-agent-dgcmp', password: hashedPassword },
    { id: 'user-prmp-andf', email: 'prmp@andf.bj', firstName: 'Arnaud', lastName: 'Hounkpatin', phone: '+229 97 00 00 00', organizationId: orgANDF.id, roleId: 'role-ppm', password: hashedPasswordPrmp },
    { id: 'user-operateur', email: 'contact@btpplus.bj', firstName: 'Raoul', lastName: 'Ahouandjinou', organizationId: null, roleId: 'role-operateur', password: hashedPassword },
    // ANAC — Agence Nationale de l'Aviation Civile
    { id: 'user-prmp-anac', email: 'prmp@anac.bj', firstName: 'Séverin', lastName: 'QUENUM', phone: '+229 97 11 11 11', organizationId: orgANAC.id, roleId: 'role-ppm', password: hashedPasswordPrmp },
    { id: 'user-agent-ppm-anac', email: 'agent-ppm@anac.bj', firstName: 'Grâce', lastName: 'DOSSOU-YOVO', organizationId: orgANAC.id, roleId: 'role-agent-ppm', password: hashedPassword },
    { id: 'user-commission-anac', email: 'evaluateur@anac.bj', firstName: 'Patrice', lastName: 'BOKO', organizationId: orgANAC.id, roleId: 'role-membre-commission', password: hashedPassword },
    // Drone BJ — Opérateur économique
    { id: 'user-dronebj', email: 'contact@dronebj.bj', firstName: 'Christophe', lastName: 'AGOSSOU', organizationId: orgDroneBJ.id, roleId: 'role-operateur', password: hashedPassword },
    { id: 'user-armp', email: 'directeur@armp.bj', firstName: 'Yolande', lastName: 'Gnonlonfin', organizationId: orgARMP.id, roleId: 'role-armp', password: hashedPassword },
    { id: 'user-agent-armp', email: 'agent@armp.bj', firstName: 'Marcel', lastName: 'Hounkanrin', organizationId: orgARMP.id, roleId: 'role-agent-armp', password: hashedPassword },
    { id: 'user-dncmp', email: 'directeur@dncmp.bj', firstName: 'Eulalie', lastName: 'Zinsou', organizationId: orgDNCMP.id, roleId: 'role-dncmp', password: hashedPassword },
  ];

  for (const userData of users) {
    const { roleId, password: userPassword, ...userInfo } = userData;
    const user = await prisma.user.upsert({
      where: { id: userInfo.id },
      update: {},
      create: {
        ...userInfo,
        password: userPassword,
        status: 'ACTIVE',
      },
    });

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId } },
      update: {},
      create: { userId: user.id, roleId },
    });
  }

  console.log('Seeding ms-iam terminé avec succès !');
  console.log(`  - 6 organisations créées`);
  console.log(`  - ${roles.length} rôles créés`);
  console.log(`  - ${users.length} utilisateurs créés`);
  console.log('');
  console.log('  Comptes Autorités Contractantes (web-ac) :');
  console.log('    PRMP ANDF     : prmp@andf.bj / 1234');
  console.log('    PRMP ANAC     : prmp@anac.bj / 1234');
  console.log('    Agent PPM ANAC: agent-ppm@anac.bj / EprocTest2026!');
  console.log('    Evaluateur ANAC: evaluateur@anac.bj / EprocTest2026!');
  console.log('');
  console.log('  Comptes Soumissionnaires (web-soumissionnaire) :');
  console.log('    BTP Plus      : contact@btpplus.bj / EprocTest2026!');
  console.log('    Drone BJ      : contact@dronebj.bj / EprocTest2026!');
  console.log('');
  console.log('  Comptes Régulation (web-armp) :');
  console.log('    Tous les comptes : EprocTest2026!');
}

main()
  .catch((e) => {
    console.error('Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
