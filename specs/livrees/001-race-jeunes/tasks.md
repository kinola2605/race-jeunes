# Tâches — Race jeunes (v1)

Légende : `[P]` parallélisable · `[x]` fait · écrans `E..` = maquettes `design/maquettes/`.
Ordre : socle → stories par priorité. Chaque tâche est testable indépendamment.

## Phase 0 — Socle

- [x] T001 Projet Next.js 15 + TypeScript strict, ESLint, Prettier, Vitest, Playwright (plan §2)
- [x] T002 [P] Génération `src/styles/tokens.css` depuis `design/tokens.json` ; CSS direction B (constitution VII)
- [x] T003 [P] Polices Poppins et logos auto-hébergés ; CSP sans origine tierce (FR-162)
- [x] T004 Schéma Prisma + migration initiale (data-model.md)
- [x] T005 PostgreSQL local sans Docker (`npm run local-db`) pour le développement

## Phase 1 — Moteur de points (bibliothèque pure, couverture 100 %)

- [x] T010 Tests table-driven, barème 2026 : victoire/défaite par écart, perf, bornes ±4, NC = 40 (FR-061)
- [x] T011 Tests avec un 2ᵉ barème (2025) prouvant l'indépendance des saisons (FR-060)
- [x] T012 Forfait, abandon, surcharges par couple, plafond, barème vide (FR-061, cas limites)
- [x] T013 Agrégation + bonus d'assiduité ; classement avec ex æquo (FR-120)
- [x] T014 Validation du barème (erreurs, avertissements) (FR-062) ; analyse du score (FR-108)

## US1 — Accès fermé (P1) · E01, E02, E14

- [x] T020 Hachage argon2id, mot de passe temporaire aléatoire, règles du nouveau mot de passe (FR-006, FR-021)
- [x] T021 Sessions serveur (jeton haché, cookie HttpOnly, expiration 30 j, révocation) (FR-009)
- [x] T022 Anti-abus : 5 échecs/pseudo, 20/IP, verrou 15 min, message unique (FR-003, FR-004)
- [x] T023 Page de connexion sans inscription ; middleware + `requireUser`/`requireAdmin` (FR-001, FR-002)
- [x] T024 Changement de mot de passe forcé / volontaire (FR-005, FR-007)
- [x] T025 Bootstrap du premier admin en CLI / variables d'environnement (FR-010)
- [x] T026 E2E : aucune route ne crée de compte sans session admin ; message identique ; verrouillage

## US2 — Comptes (P1) · E08a–E08d

- [x] T030 Création unitaire + remise unique du mot de passe + fiche imprimable (FR-020, FR-021)
- [x] T031 Liste, recherche, filtres statut/étiquette (FR-022)
- [x] T032 Modification pseudo/classement (historisé)/étiquettes (FR-023)
- [x] T033 Réinitialisation du mot de passe (FR-024) ; désactivation/réactivation avec coupure des sessions (FR-025)
- [x] T034 Import CSV 2 colonnes, doublons ignorés ou mis à jour, compte rendu, fiche une seule fois (FR-026)
- [x] T035 E2E : création → première connexion → changement forcé ; désactivation coupe la session

## US3 — Saisons et barèmes (P1) · E09a–E09c, E10

- [x] T040 Création de saison (slug, titre, modes, visibilité, duplication ou barème vide) (FR-040, FR-068)
- [x] T041 Cycle de vie ouvrir / clôturer (confirmation par identifiant) / archiver / rouvrir (FR-041 à FR-044)
- [x] T042 Éditeur : table par écart, table complète (surcharges), paramètres (FR-060, FR-061)
- [x] T043 Validation en direct + simulateur publié vs brouillon (FR-062, FR-063)
- [x] T044 Aperçu d'impact sans écriture (FR-065)
- [x] T045 Publication avec ou sans recalcul ; recalcul explicite audité (FR-064, FR-066) ; verrouillage (FR-067)

## US4 — Engagements (P1) · E11

- [x] T050 Engagement individuel et en lot (sélection rapide par étiquette) (FR-080)
- [x] T051 Classement de départ modifiable tant qu'aucun match validé ; retrait sans match (FR-080, FR-081)

## US5 — Matchs (P1) · E12a, E12b

- [x] T060 Saisie bord de court : adversaire club/extérieur, résultat, sets, type, estimation en direct (FR-100 à FR-102, FR-108)
- [x] T061 Saisie admin avec validation immédiate (FR-101)
- [x] T062 Validation (classements figés, points des deux joueurs, version du barème) (FR-103, FR-104, FR-106)
- [x] T063 Refus avec motif, annulation d'un match validé (FR-103, FR-107) ; doublons signalés (FR-105)
- [x] T064 E2E : déclaration → validation → points et détail visibles

## US6 — Classement et espace joueur (P1) · E03–E06

- [x] T070 Classement par saison, filtres étiquette/série, visibilité selon la saison (FR-120, FR-121, FR-123)
- [x] T071 Détail agrégé du calcul (soi-même ; tout joueur pour l'admin) (FR-122)
- [x] T072 Tableau de bord joueur (FR-124) ; Mes matchs avec détail par match (FR-125, FR-127) ; Mes saisons (FR-126)

## US7 — Suivi et traçabilité (P2) · E07, E13

- [x] T080 Tableau de bord admin : à valider, anomalies, mdp temporaires, engagés sans match (FR-140)
- [x] T081 Exports CSV classement, matchs, journal (FR-141)
- [x] T082 Journal d'audit filtrable (FR-142)

## US8 — PWA (P2) · E14

- [x] T090 Manifest, service worker (statique + page hors ligne), thème clair/sombre (FR-160, FR-161)

## Livraison

- [x] T100 Données de démonstration : 2 saisons, 2 barèmes, 20 pseudos, matchs, admin documenté (FR-165)
- [x] T101 Dockerfile + docker-compose (migrations, bootstrap, démo au démarrage)
- [x] T102 CI GitHub Actions : lint, typage, unitaires (couverture 100 %), E2E, `docker compose up`
- [x] T103 README (démarrage, bootstrap admin, sauvegardes, conservation), CONTRIBUTING, LICENSE provisoire

## Mise en production Vercel + Neon (v1.2)

- [x] T110 Connexion Neon : URL poolée + directUrl, SSL imposé, relance au réveil à froid (`db-url.ts`, `db.ts`)
- [x] T111 Rôle applicatif `race_app` sans DDL (`prisma/sql/role-applicatif.sql`)
- [x] T112 Migrations distantes contrôlées (`npm run db:migrate:remote`), jamais au build
- [x] T113 Seed interdit en production, bootstrap admin avec saisie masquée
- [x] T114 `SESSION_SECRET` (HMAC des sessions et de l'anti-abus), CSRF par origine dans le middleware, HSTS, API `no-store`, service worker durci
- [x] T115 `vercel.json` (fra1), `postinstall: prisma generate`, `.env.example`
- [x] T116 E2E de recette : saison + barème, engagement, historique, refus non-admin, CSRF, en-têtes
- [x] T117 `docs/DEPLOIEMENT.md` (étapes manuelles, variables, rollback, sauvegardes, limites gratuites)

## Suite (P3, hors v1)

- [ ] T200 Rôle « saisisseur »
- [ ] T201 Plafond de points par période
- [ ] T202 File de saisie hors ligne
- [ ] T203 Captures Playwright automatiques jointes aux PR
- [ ] T204 Expiration des mots de passe temporaires
