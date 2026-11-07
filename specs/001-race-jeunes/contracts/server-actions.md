# Contrats — Server Actions et routes

L'application n'expose pas d'API REST publique. Les mutations passent par des **Server Actions** Next.js
(POST same-origin, vérification d'origine intégrée = protection CSRF) ; chaque action vérifie la session et
le rôle **côté serveur** avant d'appeler un service (`src/server/services`). Les entrées sont validées
(Zod pour le barème, règles explicites ailleurs) ; une erreur métier renvoie un message en français.

## Public (sans session)

| Action / route | Entrées | Effet | FR |
|---|---|---|---|
| `loginAction` (`src/app/actions/auth.ts`) | `pseudo`, `password` | crée une session ou renvoie « Pseudo ou mot de passe incorrect. » / verrouillage | FR-001, 003, 004 |
| `GET /connexion` | — | seule page publique | FR-001, 002 |
| `GET /hors-ligne`, `/manifest.webmanifest`, `/sw.js` | — | PWA, aucune donnée | FR-160 |
| `GET /api/health` | — | `{ ok }` pour la sonde Docker | — |

## Utilisateur connecté

| Action | Rôle | Entrées | FR |
|---|---|---|---|
| `changePasswordAction` | tous (y compris mot de passe temporaire) | `current`, `next`, `confirm` | FR-005 à 007 |
| `logoutAction` | tous | — | FR-008 |
| `setThemeAction` | tous | `theme` = dark/light | FR-161 |
| `declareMatchAction` | joueur engagé (pour lui-même) / admin (pour tout engagé, `validateNow`) | `seasonId`, `playerAId` (admin), `playedOn`, `opponentType` club/external, `opponentId` ou `externalLabel` + `externalRanking`, `result` WIN/LOSS, `kind`, `s1a`…`s3b` | FR-100 à 102, 108 |

## Admin uniquement (`requireAdmin`)

| Action | Entrées | FR |
|---|---|---|
| `createPlayerAction` | `pseudo`, `ranking`, `tags[]`, `newTag`, `enrollSeasonId` → renvoie `{ pseudo, password }` **une seule fois** | FR-020, 021 |
| `resetPasswordAction` | `userId` → `{ pseudo, password }` une seule fois | FR-024 |
| `setStatusAction` | `userId`, `status` | FR-025 |
| `updatePlayerAction` | `userId`, `pseudo`, `ranking`, `tags[]` | FR-023 |
| `importCsvAction` | `file` (CSV `pseudo;classement`, 200 Ko max), `onExisting`, `enrollSeasonId` → rapport + mots de passe | FR-026 |
| `createSeasonAction` | `slug`, `title`, `startsOn`, `endsOn`, `rankingMode`, `visibility`, `bareme` copy/empty, `copyFromRuleSetId` | FR-040 |
| `seasonTransitionAction` | `seasonId`, `to` OPEN/CLOSED/ARCHIVED/REOPEN, `confirmSlug` | FR-041, 042 |
| `seasonTitleAction` | `seasonId`, `title` | FR-044 |
| `saveDraftAction` | `seasonId`, `rules` (JSON `RuleSet`) → avertissements | FR-060 à 062 |
| `impactAction` | `seasonId`, `rules` → aperçu sans écriture | FR-065 |
| `publishAction` | `seasonId`, `recalculate` yes/no | FR-064, 066 |
| `recalcAction` | `seasonId` (recalcul avec la version publiée) | FR-066 |
| `discardDraftAction` | `seasonId` | FR-060 |
| `enrollAction` / `unenrollAction` / `startingRankingAction` | `seasonId`, `userId[]` / `userId` / `userId`, `ranking` | FR-080, 081 |
| `validateMatchesAction` / `validateOneAction` | `matchId[]` / identifiant lié | FR-103 |
| `refuseMatchAction` | `matchId`, `reason` (visible du joueur) | FR-103 |
| `cancelMatchAction` | `matchId` | FR-107 |
| `GET /api/export/classement?saison=` · `/api/export/matchs?saison=` · `/api/export/journal?type=` | CSV `;` UTF-8, 403 hors admin | FR-141 |

Toutes les actions admin écrivent une entrée dans `AuditLog` (FR-142).
