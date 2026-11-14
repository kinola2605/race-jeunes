# Installation avec Docker

Deux usages : essayer l'application en 5 minutes, ou l'héberger soi-même. Pour un hébergement gratuit sans
serveur à gérer, voir plutôt [Vercel + Neon](DEPLOIEMENT.md).

## 1. Démonstration en 5 minutes

Prérequis : Docker avec Compose.

```bash
git clone https://github.com/kinola2605/race-jeunes.git
cd race-jeunes
docker compose up --build
```

Ouvrez <http://localhost:3000>. Les **données de démonstration** sont chargées automatiquement : deux saisons
aux barèmes différents (« Race jeunes 2025-2026 » clôturée, « Race jeunes 2026-2027 » ouverte), une saison
brouillon, 20 pseudos, environ 120 matchs.

| Compte de démonstration | Pseudo | Mot de passe |
|---|---|---|
| Admin | `admin.demo` | `demo-admin-2026` |
| Joueur | `AceDuMatin` (et les autres pseudos de la démo) | `demo-joueur-2026` |

Quatre pseudos (`FiletMignon`, `LigneDeFond`, `JeuBlanc`, `Chip&Charge`) ont un mot de passe temporaire
inconnu : ils illustrent le suivi « mot de passe jamais changé ». Réinitialisez-les depuis l'admin.

> ⚠️ Ces identifiants sont publics : **ne jamais activer la démo en production** (`SEED_DEMO=false`).

Sans `SESSION_SECRET`, le conteneur en génère un à chaque démarrage : les sessions sont perdues au
redémarrage. C'est voulu pour la démonstration.

## 2. Production auto-hébergée

1. Copiez `.env.example` en `.env` et renseignez au minimum :

   ```bash
   POSTGRES_PASSWORD=un-mot-de-passe-long-et-aleatoire
   SESSION_SECRET=au-moins-32-caracteres-aleatoires
   SEED_DEMO=false
   COOKIE_SECURE=true          # derrière un proxy HTTPS
   ADMIN_PSEUDO=admin.club
   ADMIN_PASSWORD=mot-de-passe-initial-provisoire
   ```

   Toutes les variables : [Configuration](configuration.md).

2. Lancez :

   ```bash
   docker compose up -d --build
   ```

   Au démarrage, le conteneur applique les migrations (`prisma migrate deploy`), crée le premier admin s'il
   n'existe pas, puis lance le serveur sur le port 3000 (`APP_PORT` pour en changer).

3. **Premier admin** : connectez-vous avec `ADMIN_PSEUDO` et le mot de passe initial. L'application exige
   aussitôt d'en choisir un nouveau. Retirez ensuite `ADMIN_PASSWORD` du `.env`. Variante en ligne de
   commande, mot de passe saisi sans affichage :

   ```bash
   docker compose exec app npx tsx scripts/bootstrap-admin.ts admin.club
   ```

   Il n'existe **aucun** autre moyen de créer un compte : ensuite, seul un admin connecté crée les comptes.

4. Placez l'application derrière un reverse proxy **HTTPS** (Caddy, Nginx, Traefik). Sans HTTPS, le cookie de
   session `Secure` n'est pas transmis et personne ne peut se connecter.

5. Vérifiez : `http://localhost:3000/api/health` répond `{"ok":true}`.

### Logo du club

Depuis l'interface (**Mon compte → Apparence**), sans toucher au serveur. Ou par fichier : déposez le logo
dans un dossier monté en volume (`./logo:/app/public/logo:ro`) et renseignez `BRAND_LOGO`.

## 3. Sauvegardes

Les données sont dans le volume Docker `db-data`.

```bash
# sauvegarde quotidienne (à planifier, ex. cron)
docker compose exec -T db pg_dump -U race -Fc race > sauvegarde-$(date +%F).dump
```

```bash
# restauration
docker compose exec -T db pg_restore -U race -d race --clean < sauvegarde-AAAA-MM-JJ.dump
```

Conservez plusieurs générations **hors du serveur**. Les sauvegardes ne contiennent que des pseudos et des
empreintes de mots de passe, mais ne les publiez pas.

## 4. Mettre à jour

```bash
git pull
```

```bash
docker compose up -d --build
```

Faites une sauvegarde avant. Les migrations sont versionnées dans `prisma/migrations` et appliquées
automatiquement au démarrage. Le [journal des versions](../CHANGELOG.md) signale chaque migration et chaque
changement qui demande une action (par exemple l'ajout de `SESSION_SECRET` en 1.2.0).

## 5. Arrêter, repartir de zéro

```bash
docker compose down
```

```bash
# supprime aussi la base : irréversible
docker compose down -v
```
