<p align="center">
  <img src="docs/assets/banner.svg" alt="Race jeunes" width="100%">
</p>

<p align="center">
  <a href="https://github.com/kinola2605/race-jeunes/actions/workflows/ci.yml"><img src="https://github.com/kinola2605/race-jeunes/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <img src="https://img.shields.io/badge/version-1.1.0-E28C57" alt="Version 1.1.0">
  <img src="https://img.shields.io/badge/couverture_moteur-100%25-6FDC9C" alt="Couverture du moteur de points : 100 %">
  <img src="https://img.shields.io/badge/marque-blanche-EBB08C" alt="Marque blanche">
</p>

# Race jeunes

Application web (PWA mobile-first) de suivi d'une **Race jeunes** de club de tennis, en **marque blanche** : chaque joueur engagé cumule des
points selon ses victoires et défaites, d'après un **barème propre à chaque saison**, paramétrable sans
toucher au code.

- **Accès fermé** : aucune inscription libre ; seul l'admin crée les comptes (mot de passe temporaire
  affiché une seule fois, changement obligatoire à la première connexion).
- **Aucune donnée personnelle** : un joueur n'est qu'un **pseudo**. Ni nom, ni e-mail, ni date de naissance,
  ni photo. Aucun cookie de suivi, aucune ressource externe (polices et icônes auto-hébergées).
- **Barème par saison** versionné, simulateur, aperçu d'impact et **recalcul explicite** tracé dans un journal
  d'audit.

Documents de référence : [constitution](.specify/memory/constitution.md) ·
[spécification](specs/001-race-jeunes/spec.md) · [plan](specs/001-race-jeunes/plan.md) ·
[tâches](specs/001-race-jeunes/tasks.md) · [charte et contrastes](design/identite.md) ·
[maquettes](design/maquettes/index.html).

## Démarrer en 5 minutes (Docker)

Prérequis : Docker avec Compose.

```bash
git clone https://github.com/kinola2605/race-jeunes.git
cd race-jeunes
docker compose up --build
```

Ouvrez <http://localhost:3000>. Les **données de démonstration** sont chargées automatiquement :
deux saisons aux barèmes différents (« Race jeunes 2025-2026 » clôturée, « Race jeunes 2026-2027 » ouverte),
une saison brouillon, 20 pseudos, ~120 matchs.

| Compte de démonstration | Pseudo | Mot de passe |
|---|---|---|
| Admin | `admin.demo` | `demo-admin-2026` |
| Joueur | `AceDuMatin` (et les autres pseudos de la démo) | `demo-joueur-2026` |

Quatre pseudos de la démo (`FiletMignon`, `LigneDeFond`, `JeuBlanc`, `Chip&Charge`) ont un mot de passe
temporaire inconnu : ils illustrent le suivi « mot de passe jamais changé ». Réinitialisez-les depuis l'admin.

> ⚠️ Ces identifiants sont publics : **ne jamais activer la démo en production** (`SEED_DEMO=false`).

## Mise en ligne gratuite (Vercel + Neon)

Hébergement géré, 100 % offres gratuites, données en UE (Francfort) : suivez
**[docs/DEPLOIEMENT.md](docs/DEPLOIEMENT.md)** (création de la base, variables Vercel, premier admin,
rollback, sauvegardes).

## Installation en production (Docker)

1. Copiez `.env.example` en `.env` et renseignez au minimum :

   ```bash
   POSTGRES_PASSWORD=un-mot-de-passe-long-et-aleatoire
   SESSION_SECRET=au-moins-32-caracteres-aleatoires
   SEED_DEMO=false
   COOKIE_SECURE=true          # derrière un proxy HTTPS (recommandé)
   ADMIN_PSEUDO=admin.club
   ADMIN_PASSWORD=mot-de-passe-initial-provisoire
   ```

2. Lancez `docker compose up -d --build`.
3. **Premier admin (bootstrap)** : au démarrage, le conteneur crée le compte `ADMIN_PSEUDO` s'il n'existe pas.
   Connectez-vous avec ce mot de passe initial : l'application exige immédiatement d'en choisir un nouveau.
   Retirez ensuite `ADMIN_PASSWORD` du fichier `.env`. Alternative en ligne de commande :

   ```bash
   docker compose exec app npx tsx scripts/bootstrap-admin.ts admin.club   # mot de passe demandé, non affiché
   ```

   Il n'existe **aucun** autre moyen de créer un compte : ensuite, seul un admin connecté crée les comptes
   joueurs (unitaire ou import CSV).
4. Placez l'application derrière un reverse proxy HTTPS (Caddy, Nginx, Traefik).

### Sauvegardes

Les données sont dans le volume Docker `db-data`.

```bash
# sauvegarde quotidienne (à planifier, ex. cron)
docker compose exec -T db pg_dump -U race -Fc race > sauvegarde-$(date +%F).dump
# restauration
docker compose exec -T db pg_restore -U race -d race --clean < sauvegarde-AAAA-MM-JJ.dump
```

Conservez plusieurs générations hors du serveur. Les migrations sont versionnées dans `prisma/migrations`
et appliquées automatiquement au démarrage (`prisma migrate deploy`).

## Marque blanche

Aucun nom de club n'est codé en dur. L'identité se règle par variables d'environnement, lues au démarrage
(aucun rebuild nécessaire) :

| Variable | Rôle | Défaut |
|---|---|---|
| `APP_NAME` | nom de l'application | `Race jeunes` |
| `CLUB_NAME` | nom complet du club (connexion, fiches imprimables, manifeste) | aucun |
| `CLUB_SHORT_NAME` | sigle affiché sous le nom de l'app dans l'en-tête | aucun |
| `BRAND_LOGO` | logo pour le thème sombre, chemin servi par l'app (ex. `/logo/club-clair.svg`) | `/icon.svg` |
| `BRAND_LOGO_LIGHT` | logo pour le thème clair et l'impression | `BRAND_LOGO` |

Les logos se déposent dans `public/logo/` (la CSP n'autorise aucune origine tierce). Avec Docker, montez
ce dossier en volume (`./logo:/app/public/logo:ro`).

**Conservation** : saisons archivées et matchs conservés sans limite (historique du club) ; journal d'audit
5 ans ; sessions 30 jours maximum. Un compte n'est jamais supprimé s'il a un historique : il est désactivé.

## Développement

Prérequis : Node.js 22, PostgreSQL 16 (ou la base embarquée fournie, sans Docker).

```bash
npm install
cp .env.example .env                    # adapter DATABASE_URL
npm run local-db                        # optionnel : PostgreSQL embarqué sur le port 54329 (autre terminal)
npx prisma migrate deploy
npm run db:seed                         # données de démonstration
npm run dev                             # http://localhost:3000
```

| Commande | Rôle |
|---|---|
| `npm run lint` / `npm run typecheck` | ESLint, TypeScript strict |
| `npm run test:coverage` | tests unitaires du moteur de points (couverture exigée : 100 %) |
| `npm run build && npm run test:e2e` | tests E2E Playwright (dont « aucune route d'inscription ») |
| `npm run tokens` | régénère `src/styles/tokens.css` depuis `design/tokens.json` |
| `python design/maquettes/_gen/build.py` | régénère les maquettes HTML |

### Architecture

```
src/scoring/        moteur de points PUR (aucune dépendance base/framework), testé à 100 %
src/server/         sessions, mots de passe (argon2id), anti-abus, services métier, audit
src/app/            pages Next.js (App Router) et server actions ; /connexion est la seule page publique
src/styles/         tokens générés + composants de la direction B des maquettes
prisma/             schéma, migrations, données de démonstration
design/             charte, tokens, maquettes validées
specs/, .specify/   spécification (Spec Kit) : constitution, spec, plan, tâches
```

## Logo

Le logo du projet ([`docs/assets/logo.svg`](docs/assets/logo.svg)) est une création originale aux couleurs de
la charte (bleu nuit, saumon, corail) : une balle, un podium et une trajectoire montante. Il sert d'icône à la
PWA et de logo par défaut ; chaque club peut le remplacer par le sien (voir « Marque blanche »).

## Licence

Tous droits réservés (voir [LICENSE](LICENSE)). Police Poppins : SIL Open Font License 1.1
(`public/fonts/OFL.txt`).
