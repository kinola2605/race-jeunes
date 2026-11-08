# Plan technique — Race jeunes

**Spec** [spec.md](spec.md) · **Constitution** [constitution.md](../../.specify/memory/constitution.md) · **Date** 2026-11-07

## 1. Résumé

Application web monolithique Next.js (App Router, rendu serveur), base PostgreSQL via Prisma,
sessions serveur maison, moteur de points en bibliothèque TypeScript pure. Interface PWA mobile-first
fidèle à la direction B des maquettes, thèmes pilotés par les tokens de `design/tokens.json`.
Livraison : une image Docker + PostgreSQL via `docker compose`.

## 2. Contexte technique

| Élément | Choix |
|---|---|
| Langage | TypeScript 5 (strict) |
| Framework | Next.js 15 (App Router, Server Components, Server Actions), React 19 |
| Base | PostgreSQL 16, Prisma 6 (migrations versionnées dans `prisma/migrations`) |
| Validation | Zod |
| Hachage | argon2id (`@node-rs/argon2`, binaires précompilés, compatible Alpine) |
| Styles | CSS natif : variables générées depuis `design/tokens.json` + composants issus des maquettes |
| Tests | Vitest (unitaires, couverture v8), Playwright (E2E) |
| CI | GitHub Actions : lint, typecheck, unitaires, E2E (service PostgreSQL), build, image Docker |
| Cible | 1 conteneur applicatif + 1 PostgreSQL, quelques centaines d'utilisateurs |

## 3. Écarts à la stack par défaut (justifiés)

1. **Sessions maison au lieu d'Auth.js.** Le fournisseur « credentials » d'Auth.js impose des sessions
   JWT : impossible de révoquer immédiatement une session à la désactivation d'un compte (FR-009,
   constitution VI) sans réintroduire une table de sessions. Une table `Session` (jeton aléatoire de
   32 octets, seul son SHA-256 est stocké) + cookie `HttpOnly` couvre le besoin en ~150 lignes
   auditées, sans dépendance supplémentaire ni route `/api/auth/*` générique (surface d'attaque
   réduite : aucune route d'inscription ne peut exister « par défaut »).
2. **CSS natif au lieu de Tailwind.** Les maquettes validées sont écrites en CSS à variables ; les
   reprendre telles quelles garantit la fidélité visuelle (constitution VII) et évite une couche de
   traduction. Les variables sont générées depuis `tokens.json` (`npm run tokens`), qui reste la
   source unique. Aucune dépendance de build supplémentaire.

## 4. Architecture

```
src/
  scoring/            # moteur de points PUR (aucun import hors de ce dossier)
    ladder.ts         #   échelle des classements FFT
    rules.ts          #   schéma et validation d'un barème (types + Zod)
    engine.ts         #   points d'un match, agrégation, classement
  server/             # code serveur uniquement
    db.ts             #   client Prisma
    auth/             #   mots de passe, sessions, garde-fous de rôle, anti-abus
    services/         #   comptes, saisons, barèmes, engagements, matchs, classement, audit, csv
  app/                # routes Next.js (pages + server actions)
    connexion/        #   seule page publique
    (app)/            #   espace connecté (joueur + admin), layout avec navigation
    api/export/       #   téléchargements CSV (admin)
  components/         # composants d'interface (Icon, Badge, StatCard, RankList…)
  styles/             # tokens.css (généré), app.css (composants)
prisma/               # schema.prisma, migrations, seed de démonstration
scripts/              # bootstrap admin, génération des tokens, entrée Docker
tests/e2e/            # Playwright
```

**Règles de dépendance** : `scoring` n'importe rien ; `server/services` importe `scoring` et `db` ;
les pages et actions n'appellent que `server/services` après `requireUser()/requireAdmin()`.

## 5. Stratégie de calcul et de recalcul des points

- Le barème est un document JSON validé par Zod (`RuleSet`), stocké dans `ScoringRuleSet.rules`,
  versionné par saison (`version` entier, statut `DRAFT` / `PUBLISHED`).
- **À la validation d'un match** : le service fige les classements de référence (mode de la saison),
  appelle `computeMatchPoints(rules, input)` pour chaque joueur de l'application concerné, et écrit une
  ligne `PointsEntry` par joueur (points, écart, perf, détail JSON, version du barème).
- **Classement** : agrégation des `PointsEntry` courantes des matchs validés + bonus d'assiduité
  (calculé à l'agrégation avec la dernière version publiée), tri et rangs ex æquo par
  `rankStandings()` — pur et testé.
- **Recalcul** : `previewRecalculation()` calcule en mémoire les nouvelles lignes et compare
  (points, rangs) sans écrire. `applyRecalculation()` fait la même chose dans une transaction :
  remplace les `PointsEntry` des matchs validés, enregistre un `RecalcRun` et une entrée d'audit.
  Rien ne se recalcule implicitement.
- Volumétrie : quelques milliers de matchs au plus par saison ; un calcul complet en mémoire est
  instantané, aucune file de traitement n'est nécessaire.

## 6. Sécurité

| Menace | Mesure |
|---|---|
| Création de compte non autorisée | aucune route publique hors `/connexion` ; actions de création appellent `requireAdmin()` ; test E2E + test unitaire de garde |
| Énumération de pseudos | message unique ; hachage factice calculé quand le pseudo n'existe pas (temps constant approximatif) |
| Force brute | table `LoginThrottle` (clé = HMAC-SHA256 `SESSION_SECRET` du pseudo normalisé / de l'IP, non réversible par énumération), 5 échecs / 15 min → blocage 15 min ; purge à 24 h |
| Vol de session | cookie `HttpOnly`, `SameSite=Lax`, `Secure` en production ; jeton stocké sous forme d'empreinte HMAC (`SESSION_SECRET`) ; expiration 30 j ; révocation à la désactivation, au changement et à la réinitialisation du mot de passe |
| CSRF | Server Actions Next.js (vérification d'origine intégrée) + middleware : 403 sur toute écriture d'une autre origine ou sans `Origin` ; routes d'export en GET sans effet de bord |
| XSS | rendu React échappé, aucune injection HTML ; CSP `default-src 'self'` |
| Injection | Prisma (requêtes paramétrées) ; validation Zod de toutes les entrées |
| Escalade de privilège | vérification de rôle dans chaque action et chaque page (`requireAdmin`), jamais seulement dans la navigation |
| Transport | HTTPS + HSTS (2 ans) ; base Neon en `sslmode=require` imposé par le code |
| Privilèges base | l'application se connecte avec le rôle `race_app` (aucun DDL) ; migrations avec le rôle propriétaire, depuis le poste de l'admin technique |
| Cache | API en `Cache-Control: no-store` ; le service worker ne met jamais l'API ni les pages en cache |
| Fuite de secrets | `.env` ignoré, `.env.example` ; mots de passe temporaires jamais écrits en base ni dans les journaux |

## 7. Interface

- `src/styles/tokens.css` est généré par `scripts/build-tokens.mjs` depuis `design/tokens.json`.
- `src/styles/app.css` reprend les composants des maquettes, direction B uniquement.
- Polices Poppins auto-hébergées dans `public/fonts`, logo dans `public/logo`, icônes SVG en composant.
- Thème : sombre par défaut ; bascule clair/sombre mémorisée dans un cookie fonctionnel `theme`
  (strictement nécessaire, non traçant).
- PWA : `manifest.webmanifest`, service worker minimal (ressources statiques + page hors ligne).

## 8. Déploiement

Deux cibles, même code :

**A. Production du club : Vercel (Hobby) + Neon (Free)** — procédure complète dans
[`docs/DEPLOIEMENT.md`](../../docs/DEPLOIEMENT.md).

- Fonctions en région `fra1` (`vercel.json`), base Neon `aws-eu-central-1` : données hébergées en UE.
- `DATABASE_URL` = URL **poolée** (pgbouncer), rôle `race_app` sans DDL ; `src/server/db-url.ts` impose
  `sslmode=require`, `pgbouncer=true` et `connect_timeout=15`. `src/server/db.ts` relance jusqu'à 3 fois
  une connexion impossible (réveil à froid de Neon), jamais une requête déjà envoyée.
- `DATABASE_URL_UNPOOLED` = URL **directe**, rôle propriétaire, utilisée **uniquement** par
  `npm run db:migrate:remote` depuis le poste de l'admin technique (jamais présente dans Vercel).
- Migrations jamais automatiques : script avec confirmation, refus des migrations destructives sans
  `--allow-destructive`. Migrations additives uniquement (expand/contract) pour garder le rollback sûr.
- Previews Vercel branchées sur la branche Neon `preview`, jamais sur la production.
- `SESSION_SECRET` (≥ 32 caractères) obligatoire en production.
- Premier admin : `npm run bootstrap-admin -- --env-file <fichier> <pseudo>`, mot de passe saisi masqué.
- Seed de démonstration refusé si `VERCEL_ENV=production`, et sur toute base distante sans `--base-de-test`.

**B. Auto-hébergement : Docker**

- `Dockerfile` multi-étapes (Node 22 Alpine, sortie `standalone`).
- `docker-compose.yml` : `db` (postgres:16-alpine, volume nommé, healthcheck) + `app`.
- Au démarrage : `prisma migrate deploy` → bootstrap admin si `ADMIN_PSEUDO`/`ADMIN_PASSWORD` sont
  fournis → seed de démonstration si `SEED_DEMO=true` et base vide → `node server.js`.
- Sauvegarde : `pg_dump` documenté dans le README (volume `db-data`).

## 9. Constitution check

| Principe | Respect |
|---|---|
| I SDD | FR référencés dans tâches et tests |
| II Tests | moteur pur à 100 %, E2E des parcours critiques |
| III Zéro DPI | modèle sans champ personnel ; avertissements ; pas de ressource tierce ; CSP |
| IV Accès fermé | aucune route d'inscription, bootstrap CLI, anti-abus, test dédié |
| V Barème par saison | `ScoringRuleSet` rattaché à `Season`, versionné, recalcul explicite audité |
| VI Sécurité | voir §6 |
| VII Identité | tokens générés, CSS des maquettes |
| VIII Accessibilité | composants issus des maquettes AA, libellés, focus, icône + texte |
| IX Simplicité | monolithe, pas d'infrastructure annexe |
| X Conventions | ESLint, Prettier, Conventional Commits, PR |
