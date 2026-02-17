# EPROC Benin

**Systeme d'Information et de Gestion Electronique de la Commande Publique du Benin**

Plateforme de passation electronique des marches publics conforme au Decret N 2025-169. EPROC couvre l'ensemble du cycle de vie de la commande publique : planification, passation, soumission, evaluation, contractualisation, execution, paiement et recours.

## Architecture

Monorepo Turborepo organise en microservices NestJS (backend) et applications React (frontend).

```
eproc/
├── apps/                        # Applications frontend
│   ├── web-ac/                  # Portail Autorite Contractante
│   ├── web-armp/                # Portail ARMP (Recours)
│   ├── web-public/              # Portail Public
│   └── web-soumissionnaire/     # Portail Soumissionnaire
├── services/                    # Microservices backend
│   ├── ms-iam/                  # Identite & Acces (port 3001)
│   ├── ms-planning/             # Planification (port 3002)
│   ├── ms-passation/            # Passation / DAC (port 3003)
│   ├── ms-submission/           # Soumissions (port 3004)
│   ├── ms-evaluation/           # Evaluation (port 3005)
│   ├── ms-contract/             # Contrats (port 3006)
│   ├── ms-execution/            # Execution (port 3007)
│   ├── ms-payment/              # Paiements (port 3008)
│   ├── ms-recours/              # Recours (port 3009)
│   └── ms-workflow/             # Moteur de workflow
├── packages/                    # Packages partages
│   ├── api-client/              # Client API (Axios + React Query hooks)
│   ├── shared-types/            # Types et enums TypeScript
│   ├── shared-utils/            # Guards, filtres, decorateurs NestJS
│   └── ui-components/           # Composants React reutilisables
└── infrastructure/
    ├── docker/                  # Docker Compose (PostgreSQL, Redis)
    └── k8s/                     # Configurations Kubernetes
```

## Technologies

| Couche | Technologies |
|--------|-------------|
| Frontend | React 19, Vite 7, TypeScript 5.9, TailwindCSS 4, TanStack React Query, React Flow |
| Backend | NestJS 11, Prisma 6, PostgreSQL 16, Redis 7, Passport JWT |
| Monorepo | Turborepo 2.4, pnpm 10.18 |
| Infrastructure | Docker Compose, Kubernetes |

## Pre-requis

- **Node.js** >= 18
- **pnpm** 10.18+
- **Docker** & **Docker Compose**

## Installation et lancement

### 1. Cloner et installer les dependances

```bash
git clone <repo-url>
cd eproc
pnpm install
```

### 2. Configurer l'environnement

```bash
cp .env.example .env
```

Les valeurs par defaut dans `.env.example` fonctionnent pour le developpement local.

### 3. Demarrer l'infrastructure (PostgreSQL + Redis)

```bash
pnpm docker:up
```

### 4. Initialiser la base de donnees

```bash
pnpm db:generate    # Generer le client Prisma
pnpm db:push        # Appliquer les schemas sur la base
pnpm db:seed        # Injecter les donnees initiales
```

### 5. Lancer en mode developpement

```bash
# Tout lancer (services + apps frontend)
pnpm dev

# Lancer uniquement les services backend
pnpm dev:services
```

### Acces aux applications

| Application | URL | Description |
|------------|-----|-------------|
| Portail AC | http://localhost:5173 | Autorite Contractante |
| Portail ARMP | http://localhost:5174 | Autorite de recours |
| Portail Soumissionnaire | http://localhost:5175 | Soumission des offres |
| Portail Public | http://localhost:5176 | Consultation publique |

### Documentation API (Swagger)

Chaque microservice expose sa documentation sur `/api/docs` :

- IAM : http://localhost:3001/api/docs
- Planning : http://localhost:3002/api/docs
- Passation : http://localhost:3003/api/docs
- Submission : http://localhost:3004/api/docs
- Evaluation : http://localhost:3005/api/docs
- Contrats : http://localhost:3006/api/docs
- Execution : http://localhost:3007/api/docs
- Paiements : http://localhost:3008/api/docs
- Recours : http://localhost:3009/api/docs

## Autres commandes

```bash
pnpm build          # Build de production
pnpm lint           # Linter
pnpm test           # Tests
pnpm docker:down    # Arreter PostgreSQL et Redis
```

## Ce qui a ete realise

### Infrastructure & Architecture
- [x] Monorepo Turborepo avec workspaces pnpm
- [x] Docker Compose pour PostgreSQL 16 et Redis 7
- [x] Configurations Kubernetes (k8s)
- [x] Packages partages (api-client, shared-types, shared-utils, ui-components)

### Backend - 10 Microservices
- [x] **ms-iam** : Authentification JWT (login/refresh/logout), gestion des utilisateurs, organisations et roles (RBAC)
- [x] **ms-planning** : Plans previsionnels, postes de marche, avis generaux, export Excel
- [x] **ms-passation** : Gestion des DAC (creation, documents, modeles, retraits)
- [x] **ms-submission** : Soumission d'offres, upload de fichiers (technique, financier, administratif), accuses de reception
- [x] **ms-evaluation** : Seances d'ouverture, sessions d'evaluation, notation, attribution provisoire
- [x] **ms-contract** : Creation de contrats, suivi des signatures
- [x] **ms-execution** : Suivi d'execution, rapports techniques, avenants, receptions
- [x] **ms-payment** : Demandes de paiement, factures, paiements, penalites, garanties
- [x] **ms-recours** : Recours, arbitrages, decisions, denonciations
- [x] **ms-workflow** : Moteur de workflow (definitions YAML, machine a etats, types de noeuds: START/ACTION/DECISION/LOOP/SYSTEM/END)

### Frontend - 4 Applications React
- [x] **web-ac** : Connexion, tableau de bord, planification (liste + detail), gestion DAC (liste + assistant de creation multi-etapes), evaluations, contrats, execution, paiements, messagerie, editeur de workflow visuel (React Flow)
- [x] **web-armp** : Structure de base avec authentification
- [x] **web-soumissionnaire** : Portail de soumission des offres
- [x] **web-public** : Avis publics, plans, liste rouge, plaintes, connexion

### Packages partages
- [x] **api-client** : Client Axios avec hooks React Query et AuthProvider
- [x] **shared-types** : 11+ enums (UserRole, DACStatus, SubmissionStatus...), interfaces (IUser, ApiResponse, PaginatedResponse...)
- [x] **shared-utils** : Guards JWT, filtres d'exception, decorateurs, service Prisma
- [x] **ui-components** : DataTable, FormField, FileUpload, Modal, ConfirmDialog, Toast, StatusBadge, Card, StatCard

### Schemas de base de donnees
- [x] 9 schemas Prisma separes (iam, planning, passation, submission, evaluation, contract, execution, payment, recours, workflow)
- [x] Relations, enums, champs d'audit (createdAt, updatedAt)

## Ce qui reste a faire

### Securite & Conformite
- [ ] MS-PKI : Certificats, chiffrement, signatures electroniques
- [ ] MS-Timestamp : Horodatage certifie (RFC 3161)
- [ ] MS-Vault : Stockage securise de documents
- [ ] MS-Audit : Journalisation complete avec Kafka
- [ ] Integration Keycloak pour l'authentification SSO

### Infrastructure avancee
- [ ] API Gateway (Kong ou Traefik)
- [ ] MinIO pour le stockage objet
- [ ] Kafka pour la communication inter-services
- [ ] Elasticsearch pour la recherche avancee
- [ ] Mailhog pour le developpement des emails

### Fonctionnalites metier
- [ ] MS-Notification : Notifications email/SMS
- [ ] E-Catalogue : Service de catalogue electronique
- [ ] 39+ formulaires d'execution
- [ ] Systeme de liste noire / liste rouge
- [ ] Archivage electronique
- [ ] Integration X-ROAD

### Frontend
- [ ] Authentification Keycloak sur les portails
- [ ] Tableaux de bord analytiques et reporting
- [ ] Portails ARMP et Soumissionnaire complets
- [ ] Composants de securite (signatures numeriques, accuses de reception)

### DevOps & Qualite
- [ ] Tests unitaires et d'integration
- [ ] Pipeline CI/CD
- [ ] Monitoring et alerting
- [ ] Documentation utilisateur

## Structure des bases de donnees

Chaque microservice possede son propre schema PostgreSQL :

| Schema | Tables principales |
|--------|-------------------|
| `iam` | users, organizations, roles, permissions, user_roles |
| `planning` | forecast_plans, market_entries, general_notices |
| `passation` | dacs, dac_documents, dac_templates, dac_withdrawals |
| `submission` | submissions, submission_files, submission_receipts |
| `evaluation` | opening_sessions, evaluation_sessions, evaluation_scores, provisional_awards |
| `contract` | contracts, contract_signatures |
| `execution` | executions, technical_reports, attachments, receptions, amendments |
| `payment` | payment_requests, invoices, payments, penalties, guarantees |
| `recours` | appeals, appeal_decisions, arbitrations |
| `workflow` | workflow_definitions, workflow_nodes, workflow_transitions, workflow_instances |

## Licence

Projet prive - Gouvernement du Benin
