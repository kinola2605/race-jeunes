# Configuration

Toute la configuration passe par des **variables d'environnement**. Le modèle est
[`.env.example`](../.env.example). Aucun secret ne va dans le dépôt : `.env` et `.env.*` sont ignorés par git.

## 1. Variables

### Base de données

| Variable | Rôle | Où |
|---|---|---|
| `DATABASE_URL` | Connexion de l'application. Sur Neon : URL **poolée** (hôte `-pooler`) ; en installation avancée, rôle `race_app` sans droit de modifier le schéma | partout |
| `DATABASE_URL_UNPOOLED` | Connexion directe, rôle propriétaire, **pour les migrations uniquement**. Sur Vercel, sa présence déclenche les migrations automatiques au déploiement | poste local, Docker ; sur Vercel **uniquement** en [installation en un clic](installation-simple.md) (posée par l'intégration Neon) |
| `SKIP_AUTO_MIGRATIONS` | `true` désactive les migrations automatiques au déploiement Vercel même si `DATABASE_URL_UNPOOLED` est présente | Vercel (facultatif) |

### Sessions

| Variable | Rôle | Où |
|---|---|---|
| `SESSION_SECRET` | Clé HMAC des sessions et des compteurs anti-abus, 32 caractères minimum, différente par environnement. La changer déconnecte tout le monde. **Facultative** : sans elle, l'application génère sa clé au premier besoin et la conserve en base (table `AppSecret`) | recommandée en installation avancée |
| `COOKIE_SECURE` | `false` pour tester en HTTP en local. Par défaut le cookie est `Secure` dès que `NODE_ENV=production` | Docker, local |

Générer un secret (installation avancée) :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### Installation (spec 016)

| Variable | Rôle | Où |
|---|---|---|
| `INSTALL_CODE` | Code choisi par le club (8 caractères minimum) et demandé par l'écran de premier démarrage `/installation`, tant qu'aucun admin n'existe. Inutile une fois l'installation faite | Vercel ([installation en un clic](installation-simple.md)) |

### Marque blanche

Aucun nom de club n'est codé en dur. Ces variables sont lues au démarrage, sans rebuild, et sont toutes
facultatives.

| Variable | Rôle | Défaut |
|---|---|---|
| `APP_NAME` | Nom de l'application | `Race jeunes` |
| `CLUB_NAME` | Nom complet du club (connexion, fiches imprimables, manifeste). Le nom saisi à l'installation ou dans **Apparence** prime | aucun |
| `CLUB_SHORT_NAME` | Sigle affiché sous le nom de l'app dans l'en-tête. Même priorité que `CLUB_NAME` | aucun |
| `BRAND_LOGO` | Logo pour le thème sombre, chemin servi par l'app (ex. `/logo/club-clair.svg`) | `/icon.svg` |
| `BRAND_LOGO_LIGHT` | Logo pour le thème clair et l'impression | `BRAND_LOGO` |

Les logos par fichier se déposent dans `public/logo/` : la politique de sécurité du contenu n'autorise aucune
origine tierce.

**Depuis l'interface** : la page admin **Apparence** permet de modifier le nom et le sigle du club, de déposer
le logo et de régler quatre couleurs.
Ces réglages sont stockés en base et s'appliquent sans redéploiement.

Ordre de priorité du logo : logo déposé dans l'interface, puis `BRAND_LOGO` / `BRAND_LOGO_LIGHT`, puis logo du
projet.

### Docker et développement uniquement

| Variable | Rôle |
|---|---|
| `POSTGRES_PASSWORD` | Mot de passe de la base du `docker compose` |
| `ADMIN_PSEUDO`, `ADMIN_PASSWORD` | Création du premier admin au démarrage du conteneur (mot de passe à changer à la première connexion) |
| `SEED_DEMO` | `true` charge les données de démonstration. **Jamais en production** : le seed refuse `VERCEL_ENV=production` |
| `APP_PORT` | Port publié par `docker compose` (3000 par défaut) |
| `LOCAL_DB_PORT` | Port de la base embarquée `npm run local-db` (54329 par défaut) |
| `E2E_PORT` | Port du serveur des tests E2E (3000 par défaut) |

## 2. Quelle variable dans quel environnement

| Variable | Local | Docker | Vercel |
|---|---|---|---|
| `DATABASE_URL` | ✅ | posée par compose | ✅ rôle `race_app` |
| `DATABASE_URL_UNPOOLED` | ✅ | posée par compose | ❌ |
| `SESSION_SECRET` | facultative | ✅ | ✅ une valeur par environnement |
| Marque blanche | facultatif | facultatif | facultatif |
| `POSTGRES_PASSWORD`, `ADMIN_*`, `SEED_DEMO`, `COOKIE_SECURE` | selon besoin | ✅ | ❌ |

Détail pour Vercel : [DEPLOIEMENT.md § 4](DEPLOIEMENT.md#4-configurer-vercel).

## 3. Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement, <http://localhost:3000> |
| `npm run build` / `npm start` | Build de production, puis serveur |
| `npm run local-db` | PostgreSQL embarqué, sans Docker (port 54329, données dans `.local-db/`) |
| `npm run db:migrate` | Applique les migrations sur la base de `DATABASE_URL_UNPOOLED` |
| `npm run db:migrate:remote -- <fichier .env>` | Migrations sur une base distante : confirmation demandée, migrations destructives refusées sans option |
| `npm run db:migrate:status` | État des migrations |
| `npm run db:seed` | Données de démonstration |
| `npm run db:seed:volume` | Gros jeu fictif (4 saisons « Démo · … », 64 joueurs, environ 1 400 matchs) ; `-- --purge` le retire |
| `npm run bootstrap-admin -- <pseudo>` | Crée le premier admin, mot de passe saisi sans affichage |
| `npm run lint` / `npm run typecheck` | ESLint, TypeScript strict |
| `npm run test` / `npm run test:coverage` | Tests unitaires ; couverture du moteur de points exigée à 100 % |
| `npm run test:e2e` | Tests de bout en bout Playwright (après `npm run build`) |
| `npm run tokens` | Régénère `src/styles/tokens.css` depuis `design/tokens.json` |
| `npm run docs:check` | Vérifie les liens de la documentation et la version du README |
| `npm run docs:captures` | Régénère les captures d'écran de la documentation |
