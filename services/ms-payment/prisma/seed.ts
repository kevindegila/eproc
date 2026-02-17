import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Debut du seeding ms-payment...');

  // Demande de paiement 1 - Soumise (contrat travaux routiers)
  const request1 = await prisma.paymentRequest.upsert({
    where: { id: 'pay-req-001' },
    update: {},
    create: {
      id: 'pay-req-001',
      reference: 'DDP-2026-001',
      contractId: 'contract-infra-001',
      contractReference: 'MC-MIT-2026-001',
      amount: 850000000,
      description: 'Demande de paiement pour la premiere tranche des travaux de rehabilitation de la RNIE1 - Troncon Cotonou-Bohicon',
      status: 'SOUMISE',
      submittedAt: new Date('2026-02-01'),
      createdBy: 'user-entreprise-btp',
    },
  });

  // Demande de paiement 2 - Payee (fournitures medicales)
  const request2 = await prisma.paymentRequest.upsert({
    where: { id: 'pay-req-002' },
    update: {},
    create: {
      id: 'pay-req-002',
      reference: 'DDP-2026-002',
      contractId: 'contract-sante-001',
      contractReference: 'MC-MS-2026-003',
      amount: 375000000,
      description: 'Paiement integral pour la livraison de medicaments essentiels et consommables medicaux - Lot 1',
      status: 'PAYEE',
      submittedAt: new Date('2026-01-10'),
      validatedAt: new Date('2026-01-18'),
      paidAt: new Date('2026-01-25'),
      createdBy: 'user-fournisseur-pharma',
    },
  });

  // Factures pour la demande 1
  const invoicesReq1 = [
    {
      id: 'inv-001',
      requestId: request1.id,
      invoiceNumber: 'FAC-BTP-2026-0045',
      amount: 500000000,
      invoiceDate: new Date('2026-01-28'),
      description: 'Facture pour les travaux de terrassement et de fondation - Phase 1',
    },
    {
      id: 'inv-002',
      requestId: request1.id,
      invoiceNumber: 'FAC-BTP-2026-0046',
      amount: 350000000,
      invoiceDate: new Date('2026-01-30'),
      description: 'Facture pour la fourniture et pose de bitume - Phase 1',
    },
  ];

  for (const invoice of invoicesReq1) {
    await prisma.invoice.upsert({
      where: { id: invoice.id },
      update: {},
      create: invoice,
    });
  }

  // Facture pour la demande 2
  await prisma.invoice.upsert({
    where: { id: 'inv-003' },
    update: {},
    create: {
      id: 'inv-003',
      requestId: request2.id,
      invoiceNumber: 'FAC-PHARMA-2026-0012',
      amount: 375000000,
      invoiceDate: new Date('2026-01-08'),
      description: 'Facture pour la livraison de medicaments essentiels - Commande globale Lot 1',
    },
  });

  // Paiement effectue pour la demande 2
  await prisma.payment.upsert({
    where: { id: 'payment-001' },
    update: {},
    create: {
      id: 'payment-001',
      requestId: request2.id,
      amount: 375000000,
      paymentDate: new Date('2026-01-25'),
      paymentMethod: 'VIREMENT_BANCAIRE',
      transactionRef: 'VIR-TRESOR-2026-00234',
      observations: 'Paiement effectue par virement du Tresor Public - Compte BCEAO',
    },
  });

  // Penalite de retard
  await prisma.penalty.upsert({
    where: { id: 'penalty-001' },
    update: {},
    create: {
      id: 'penalty-001',
      contractId: 'contract-infra-002',
      contractReference: 'MC-MIT-2026-005',
      type: 'RETARD',
      amount: 12500000,
      reason: 'Penalite de retard de 15 jours sur les travaux de construction du poste de peage de Seme-Kpodji - 1/1000eme du montant du marche par jour de retard',
      appliedDate: new Date('2026-01-20'),
      createdBy: 'user-controleur',
    },
  });

  // Garanties
  await prisma.guarantee.upsert({
    where: { id: 'guarantee-001' },
    update: {},
    create: {
      id: 'guarantee-001',
      contractId: 'contract-infra-001',
      contractReference: 'MC-MIT-2026-001',
      type: 'BONNE_EXECUTION',
      amount: 425000000,
      issuer: 'Bank of Africa - Benin',
      issueDate: new Date('2025-12-15'),
      expiryDate: new Date('2027-12-15'),
      status: 'ACTIVE',
    },
  });

  await prisma.guarantee.upsert({
    where: { id: 'guarantee-002' },
    update: {},
    create: {
      id: 'guarantee-002',
      contractId: 'contract-sante-001',
      contractReference: 'MC-MS-2026-003',
      type: 'AVANCE_DEMARRAGE',
      amount: 75000000,
      issuer: 'Ecobank Benin',
      issueDate: new Date('2025-11-20'),
      expiryDate: new Date('2026-05-20'),
      status: 'ACTIVE',
    },
  });

  console.log('Seeding ms-payment termine avec succes !');
  console.log('  - 2 demandes de paiement creees');
  console.log('  - 3 factures creees');
  console.log('  - 1 paiement cree');
  console.log('  - 1 penalite creee');
  console.log('  - 2 garanties creees');
}

main()
  .catch((e) => {
    console.error('Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
