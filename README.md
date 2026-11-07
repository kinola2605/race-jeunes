<p align="center">
  <img src="docs/assets/banner.svg" alt="Race jeunes" width="100%">
</p>

<p align="center">
  <a href="https://github.com/kinola2605/race-jeunes/actions/workflows/ci.yml"><img src="https://github.com/kinola2605/race-jeunes/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/kinola2605/race-jeunes/releases/tag/v1.0.0"><img src="https://img.shields.io/badge/version-1.0.0-FF7F5C" alt="Version 1.0.0"></a>
  <img src="https://img.shields.io/badge/couverture_moteur-100%25-6FDC9C" alt="Couverture du moteur de points : 100 %">
  <img src="https://img.shields.io/badge/donn%C3%A9es_personnelles-0-FDC2B2" alt="Zéro donnée personnelle">
</p>

# Race jeunes

Application web (PWA mobile-first) de suivi de la **Race jeunes** du club : chaque joueur engagé cumule des
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

## Installation en production

1. Copiez `.env.example` en `.env` et renseignez au minimum :

   ```bash
   POSTGRES_PASSWORD=un-mot-de-passe-long-et-aleatoire
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
   docker compose exec app npx tsx scripts/bootstrap-admin.ts admin.club "mot-de-passe-initial"
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

## Conservation

Par conception, **aucune donnée personnelle n'est collectée** (constitution, principe III) :

- un joueur est identifié par un pseudo attribué par le club ; la correspondance pseudo ↔ personne réelle est
  tenue **hors de l'application** par le club ;
- tous les champs libres affichent « Ne saisissez aucune donnée personnelle (nom réel, etc.) » ;
- pas de catégorie d'âge ni de sexe : des étiquettes libres (« Groupe A ») permettent les regroupements ;
- seul cookie : la session (`HttpOnly`) et la préférence de thème (fonctionnel) ; aucun analytics, aucun
  appel à un service tiers (CSP `default-src 'self'`) ;
- les compteurs anti-abus ne stockent qu'une empreinte SHA-256 du pseudo et de l'adresse IP, purgée après 24 h.

**Conservation** : saisons archivées et matchs conservés sans limite (données pseudonymes, historique du
club) ; journal d'audit 5 ans ; sessions 30 jours maximum. Un compte n'est jamais supprimé s'il a un
historique : il est désactivé.

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
PWA. Il est distinct du logo d'un club, utilisé dans l'interface sous réserve de l'accord du club.

## Licence

Tous droits réservés, en attendant la décision du club (voir [LICENSE](LICENSE)). Le logo du club est la
propriété du club ; son usage dans l'application est soumis à son accord. Police Poppins : SIL Open Font
License 1.1 (`public/fonts/OFL.txt`).
