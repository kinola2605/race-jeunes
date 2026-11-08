# Mise en production — Vercel (Hobby) + Neon (Free)

Ce guide décrit **les étapes manuelles** à faire soi-même pour mettre la Race jeunes en ligne, 100 % sur
offres gratuites. Aucun secret ne doit jamais être écrit dans le dépôt, un ticket, un chat ou une capture.

```
Navigateur ──HTTPS──▶ Vercel (fonctions fra1, Francfort) ──TLS, pooler──▶ Neon Postgres (eu-central-1, Francfort)
                        │ DATABASE_URL = rôle race_app (lecture/écriture, aucun DDL)
Votre poste ──TLS, direct──▶ Neon : migrations, premier admin, sauvegardes (rôle propriétaire)
```

| Environnement Vercel | Branche Git | Branche Neon | Données |
|---|---|---|---|
| Production | `main` | `main` | réelles |
| Preview | toute autre branche / PR | `preview` | test (démo autorisée) |
| Développement | — | Postgres local (`npm run local-db`) | démo |

---

## 1. Créer la base Neon

> Créez le projet **directement sur neon.com** plutôt que via le Vercel Marketplace : l'intégration du
> Marketplace injecte automatiquement dans Vercel une URL avec le **rôle propriétaire** et peut créer une
> branche Neon par preview (limite de 10 branches sur l'offre gratuite). Ici, on garde la main.

1. Créez un compte sur <https://neon.com> (offre **Free**, sans carte bancaire).
2. **New Project** :
   - Project name : `race-jeunes` (au choix)
   - Postgres version : la plus récente proposée
   - Cloud provider **AWS**, région **Europe Central 1 (Frankfurt)** — `aws-eu-central-1`
   - Database name : `neondb` (par défaut)
3. Une branche **`main`** est créée : ce sera la **production**.
4. **Branches → Create branch** : nom `preview`, parent `main`, *Current point in time*. Elle servira à
   tous les déploiements de preview.

### Récupérer les URLs (pour chaque branche : `main` puis `preview`)

Dans le tableau de bord du projet → bouton **Connect** :

- Branch : `main` (puis `preview`), Database : `neondb`, Role : `neondb_owner`.
- **Connection pooling désactivé** → copiez l'URL : c'est l'**URL directe** (hôte sans `-pooler`).
- **Connection pooling activé** → copiez l'URL : c'est l'**URL poolée** (hôte contenant `-pooler`).

Les deux contiennent déjà `sslmode=require`. Ne les collez nulle part ailleurs que dans les fichiers
locaux ci-dessous et dans Vercel.

## 2. Préparer vos fichiers d'environnement locaux (jamais versionnés)

Dans le dossier du dépôt, créez deux fichiers — ils sont ignorés par git (`.env.*`) :

`.env.neon.production`
```dotenv
# Provisoire : URL POOLÉE avec neondb_owner (remplacée à l'étape 3 par le rôle race_app)
DATABASE_URL="<URL poolée main, rôle neondb_owner>"
# URL DIRECTE, rôle propriétaire : migrations, sauvegardes
DATABASE_URL_UNPOOLED="<URL directe main, rôle neondb_owner>"
```

`.env.neon.preview` : même chose avec les URLs de la branche `preview`.

> N'y mettez **pas** `ADMIN_PASSWORD` : le mot de passe du premier admin est saisi de façon masquée.

## 3. Créer le schéma et le rôle applicatif (pour chaque branche)

Prérequis : Node 22 et `npm ci` lancé dans le dépôt.

1. **Migrations** (URL directe, confirmation demandée, refus des migrations destructives sans option) :
   ```bash
   npm run db:migrate:remote -- .env.neon.production
   ```
2. **Rôle `race_app`** : Neon → **SQL Editor**, branche `main`, rôle `neondb_owner`. Collez le contenu de
   [`prisma/sql/role-applicatif.sql`](../prisma/sql/role-applicatif.sql), remplacez `<MOT_DE_PASSE_FORT>`
   **dans l'éditeur uniquement** par un mot de passe généré :
   ```bash
   node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
   ```
   Exécutez. La dernière ligne doit afficher `race_app | f | f | f`. Effacez l'éditeur.
   *(Un rôle créé en SQL n'hérite pas de `neon_superuser`, contrairement à un rôle créé dans la console.)*
3. **URL applicative** : reprenez l'URL **poolée** et remplacez `neondb_owner:<mdp>` par
   `race_app:<mot de passe choisi>` :
   `postgresql://race_app:<mdp>@<hôte>-pooler.<…>.neon.tech/neondb?sslmode=require`
   Mettez-la comme `DATABASE_URL` dans `.env.neon.production`.
4. Recommencez 1 à 3 pour `.env.neon.preview` (branche `preview`, **autre mot de passe**).
5. *(Facultatif, preview uniquement)* données de démonstration :
   ```bash
   npx tsx prisma/seed.ts --env-file .env.neon.preview --base-de-test
   ```
   Le seed refuse toute base distante sans `--base-de-test` et refuse toujours `VERCEL_ENV=production`.
   **Ne le lancez jamais sur `main`** : l'admin de démo a un mot de passe public.

## 4. Configurer Vercel

Votre projet Vercel est déjà relié au dépôt GitHub.

1. **Settings → General** : Framework *Next.js* ; Node.js Version **22.x** ; commandes par défaut
   (`npm install` déclenche `prisma generate`, puis `next build`). Aucune migration n'est lancée au build.
2. **Settings → Functions** : la région est imposée par `vercel.json` (**fra1**, Francfort, à côté de Neon).
   Vérifiez qu'elle s'affiche bien après le premier déploiement.
3. **Settings → Git** : Production Branch = **`main`** (déploiement automatique à chaque fusion).
4. **Settings → Deployment Protection** : laissez **Vercel Authentication** activé pour les previews
   (seuls les membres du compte Vercel y accèdent).
5. **Settings → Environment Variables** — cochez **Sensitive** pour les trois premières :

| Variable | Production | Preview | Rôle |
|---|---|---|---|
| `DATABASE_URL` | URL poolée **main**, rôle `race_app` | URL poolée **preview**, rôle `race_app` | Connexion de l'application (SSL et pgbouncer imposés par le code) |
| `SESSION_SECRET` | valeur A | valeur B (différente) | Clé HMAC des sessions et de l'anti-abus, 32 caractères min. La changer déconnecte tout le monde |
| `APP_NAME` | ex. `Race jeunes` | idem | Nom affiché (facultatif) |
| `CLUB_NAME` | ex. `Tennis Club …` | idem | Nom du club (facultatif) |
| `CLUB_SHORT_NAME` | ex. `TCX` | idem | Sigle sous le nom de l'app (facultatif) |
| `BRAND_LOGO`, `BRAND_LOGO_LIGHT` | ex. `/logo/club.svg` | idem | Logos déposés dans `public/logo/` (facultatif) |

   Générez chaque `SESSION_SECRET` avec :
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```

   **Ne définissez pas dans Vercel** :
   - `DATABASE_URL_UNPOOLED` : l'application n'en a pas besoin à l'exécution ; la laisser hors de Vercel
     garantit qu'aucune fonction ne détient les droits propriétaire (DDL). Elle ne sert que depuis votre poste.
   - `ADMIN_PSEUDO`, `ADMIN_PASSWORD`, `SEED_DEMO`, `POSTGRES_PASSWORD`, `COOKIE_SECURE` : réservées à Docker / au local.
   - `VERCEL_ENV`, `VERCEL` : posées automatiquement par Vercel.
6. **Deployments** → dernier déploiement de `main` → **Redeploy** (pour prendre en compte les variables).

## 5. Créer le premier compte admin

Depuis votre poste (URL `race_app` de production, mot de passe saisi masqué, jamais affiché ni stocké) :

```bash
npm run bootstrap-admin -- --env-file .env.neon.production <votre-pseudo-admin>
```

Choisissez un mot de passe d'au moins 12 caractères (idéalement une phrase de passe ou un mot de passe
généré par votre gestionnaire). Créé ainsi, il n'a pas à être changé à la première connexion.
Connectez-vous ensuite sur `https://<votre-projet>.vercel.app/connexion`.

## 6. Recette rapide en production

- [ ] `https://<projet>.vercel.app/api/health` renvoie `{"ok":true}`.
- [ ] Connexion admin ; création d'une saison (identifiant + titre), barème publié, engagement d'un joueur.
- [ ] Le joueur se connecte avec son mot de passe temporaire et doit le changer.
- [ ] Un joueur qui ouvre `/admin` arrive sur « Accès refusé ».
- [ ] En-têtes (outil de développement du navigateur → Réseau) : `Strict-Transport-Security`,
      `Content-Security-Policy`, `X-Frame-Options: DENY`.
- [ ] Vercel → Deployment → Functions : région **fra1**.

---

## 7. Mettre à jour l'application

1. Travaillez sur une branche, ouvrez une PR : Vercel construit une **preview** branchée sur Neon `preview`.
2. Si la PR contient une migration : appliquez-la d'abord sur la preview
   (`npm run db:migrate:remote -- .env.neon.preview`), testez.
3. Avant de fusionner : **sauvegarde** (§9), puis `npm run db:migrate:remote -- .env.neon.production`.
   N'écrivez que des migrations **additives** (ajout de table/colonne nullable…) : l'ancienne version de
   l'app continue de fonctionner sur le nouveau schéma, ce qui rend le rollback applicatif sûr.
   Une suppression se fait en deux temps (version N : on n'utilise plus la colonne ; version N+1 : on la
   supprime avec `--allow-destructive`, après sauvegarde).
4. Fusionnez dans `main` : Vercel déploie la production automatiquement.

Les migrations ne sont **jamais** lancées automatiquement (ni au build ni au démarrage sur Vercel).

## 8. Rollback

- **Application** : Vercel → **Deployments** → déploiement précédent de production → **⋯ → Instant
  Rollback** (sur l'offre Hobby, retour au déploiement de production immédiatement précédent ;
  pour un plus ancien, **Redeploy** de ce déploiement ou `git revert` sur `main`).
  Les déploiements suivants depuis `main` ne sont plus promus automatiquement tant que vous n'avez pas
  rétabli le flux (bouton **Undo Rollback** / promotion d'un nouveau déploiement).
- **Base de données** (erreur de données, migration ratée) :
  - **Instant restore Neon** (fenêtre de **6 h** sur l'offre Free) : Neon → **Backup & Restore** →
    choisissez la branche `main` et l'horodatage → *Restore*. Neon conserve l'état remplacé dans une
    branche de sauvegarde. Agissez vite : au-delà de 6 h, seule la sauvegarde `pg_dump` permet de revenir.
  - Sinon : restauration du dernier `pg_dump` (§9).
- Changer `SESSION_SECRET` (puis Redeploy) déconnecte tous les utilisateurs : à faire en cas de doute sur
  une fuite.

## 9. Sauvegardes

La fenêtre de restauration de l'offre Free étant courte, faites des **exports réguliers** : au minimum
**chaque semaine** et **avant chaque migration**.

Prérequis : outils clients PostgreSQL (`pg_dump`, `pg_restore`) d'une version **≥ à celle du serveur Neon**.

Export (PowerShell) — l'URL est lue depuis votre fichier local, jamais tapée en clair :

```powershell
$env:PGURL = (Select-String -Path .env.neon.production -Pattern '^DATABASE_URL_UNPOOLED=').Line -replace '^DATABASE_URL_UNPOOLED="?([^"]*)"?$','$1'
pg_dump --format=custom --no-owner --no-privileges --file "race-$(Get-Date -Format yyyy-MM-dd).dump" $env:PGURL
Remove-Item Env:PGURL
```

Restauration (toujours dans une **nouvelle branche Neon** vide d'abord, jamais directement sur `main`) :

```powershell
pg_restore --no-owner --no-privileges --dbname "<URL directe de la branche de restauration>" race-AAAA-MM-JJ.dump
```

Puis relancez `prisma/sql/role-applicatif.sql` sur cette branche si elle doit servir l'application.

Les fichiers `.dump` contiennent uniquement des pseudos et des empreintes de mots de passe (aucune donnée
personnelle), mais **ne les versionnez pas** : rangez-les dans un stockage personnel chiffré.

## 10. Limites des offres gratuites (à surveiller)

| Service | Limite (Free / Hobby, novembre 2026) | Pour ce projet |
|---|---|---|
| Neon | 100 CU-heures / mois / projet ; base suspendue jusqu'au mois suivant si dépassé | Mise en veille après 5 min d'inactivité : largement suffisant pour un club. Ne désactivez pas la mise en veille |
| Neon | 1 Go de stockage par projet ; au-delà, les écritures échouent (pas de facturation) | Quelques Mo par saison |
| Neon | 10 branches par projet | 2 utilisées (`main`, `preview`) + branches de restauration à supprimer ensuite |
| Neon | Restauration instantanée : 6 h | D'où les `pg_dump` (§9) |
| Vercel Hobby | 1 M d'invocations de fonctions, 100 Go de transfert, 4 h de CPU actif / mois ; au-delà, le service est **mis en pause** (pas de facturation) | Très en dessous |
| Vercel Hobby | **Usage personnel et non commercial uniquement** | Une app gratuite de club associatif, sans revenu ni publicité, correspond a priori à un usage non commercial ; à vous de le confirmer. Si l'app devenait payante, il faudrait passer en Pro |

Effet visible du réveil à froid : la première requête après une période calme prend ~0,5 à 2 s de plus
(Neon se réveille ; le code relance automatiquement la connexion jusqu'à 3 fois).

Vérifiez les chiffres à jour : <https://neon.com/docs/introduction/plans> et
<https://vercel.com/docs/plans/hobby>.

## 11. Récapitulatif sécurité

- Secrets uniquement dans Vercel (*Sensitive*) et dans vos fichiers `.env.neon.*` locaux (ignorés par git).
- Application : rôle `race_app` (SELECT/INSERT/UPDATE/DELETE, aucun DDL), via le pooler, SSL imposé.
- Migrations : rôle propriétaire, URL directe, depuis votre poste, avec confirmation.
- Mots de passe : argon2id. Cookie de session `HttpOnly`, `Secure`, `SameSite=Lax`, 30 jours max ;
  empreinte HMAC en base.
- CSRF : vérification d'origine des Server Actions + middleware (403 sur toute écriture d'une autre origine).
- Anti-abus : verrouillage 15 min après 5 échecs par pseudo / 20 par adresse réseau.
- En-têtes : CSP sans tiers, HSTS, `X-Frame-Options: DENY` + `frame-ancestors 'none'`, `nosniff`,
  `Referrer-Policy: no-referrer`. API en `Cache-Control: no-store` ; le service worker ne met jamais
  l'API ni les pages en cache.
