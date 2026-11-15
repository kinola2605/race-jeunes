# Installer Race jeunes pour votre club (sans compétence technique)

Ce guide s'adresse au **responsable du club** : aucun terminal, aucune ligne de code. Comptez **20 minutes**
la première fois.

| | |
|---|---|
| **Coût** | 0 €. Vercel (hébergement) et Neon (base de données) en offres gratuites, sans carte bancaire. |
| **Ce que vous obtenez** | Votre propre application, à votre adresse (`https://<nom>.vercel.app`), avec vos propres données. Personne d'autre, pas même les auteurs du projet, n'y a accès. |
| **Il vous faut** | Une adresse e-mail et un ordinateur (le téléphone suffit ensuite pour tout le reste). |

> Un club = une installation. Si plusieurs clubs utilisent Race jeunes, chacun fait sa propre installation.

## 1. Créer un compte GitHub

GitHub conserve une copie du code de **votre** application. Si vous avez déjà un compte, passez à l'étape 2.

1. Allez sur <https://github.com/signup>.
2. Saisissez une adresse e-mail, un mot de passe et un nom d'utilisateur (par exemple `tc-monclub`).
3. Validez le code reçu par e-mail. Choisissez l'offre **Free**.

## 2. Cliquer sur « Deploy »

1. Ouvrez la page du projet : <https://github.com/kinola2605/race-jeunes>.
2. Cliquez sur le bouton noir **Deploy** (en haut de la page, sous la présentation).
3. Vercel s'ouvre. Choisissez **Continue with GitHub** et autorisez Vercel. Si Vercel demande un type de
   compte, choisissez **Hobby** (gratuit, usage non commercial : c'est le cas d'un club associatif).

## 3. Créer votre copie

Vercel propose de créer un dépôt GitHub à votre nom.

1. **Repository Name** : laissez `race-jeunes` (ou un autre nom sans espace).
2. Cochez **Create private Git Repository** si la case est proposée.
3. Cliquez **Create**.

## 4. Ajouter la base de données

Vercel propose d'ajouter une base **Neon** (Postgres).

1. Cliquez **Add** (ou **Connect**) à côté de Neon.
2. Acceptez les conditions de Neon et choisissez l'offre **Free**.
3. Région : **Frankfurt (eu-central-1)**, pour que vos données restent en Union européenne.
4. Laissez les autres options par défaut et validez.

Vous n'avez **rien à copier** : Vercel transmet lui-même l'adresse de la base à l'application.

## 5. Choisir le code d'installation

Vercel demande une seule valeur : **`INSTALL_CODE`**.

C'est un code **de votre choix**, au moins 8 caractères (par exemple `ma-race-2026`). Il protège la toute
première ouverture de l'application : sans lui, personne ne peut créer le compte administrateur à votre place.
Notez-le, il vous sera demandé dans quelques minutes.

Cliquez ensuite **Deploy**. La construction prend 2 à 4 minutes (la base de données est préparée
automatiquement).

## 6. Premier démarrage

1. Quand Vercel affiche **Congratulations**, cliquez sur l'aperçu de l'application (ou **Continue to
   Dashboard**, puis **Visit**).
2. L'écran **Installer Race jeunes** s'affiche. Renseignez :
   - le **code d'installation** choisi à l'étape 5 ;
   - le **nom du club** et, si vous voulez, son **sigle** ;
   - votre **pseudo** d'administrateur et votre **mot de passe** (10 caractères minimum).
3. Cliquez **Installer et me connecter**. Vous arrivez sur le tableau de bord de l'admin.

L'écran d'installation disparaît définitivement : les prochaines visites arrivent sur la page de connexion.

**Notez l'adresse de votre application** (par exemple `https://race-jeunes-abc.vercel.app`) : c'est celle que
vous donnerez aux joueurs. Ils peuvent l'installer sur leur téléphone comme une application.

## 7. Et ensuite ?

- **Logo et couleurs du club** : Admin → **Apparence**.
- **Première saison et comptes des joueurs** : suivez le [Guide de l'admin](guide-admin.md).
- **Adresse plus courte** (facultatif) : Vercel → votre projet → **Settings → Domains**. Un nom en
  `.vercel.app` est gratuit s'il est libre ; un nom de domaine du club est possible (payant chez un registraire).

## Mettre à jour

Quand une nouvelle version est annoncée dans le [journal des versions](../CHANGELOG.md) :

1. Ouvrez **votre** dépôt sur GitHub (`https://github.com/<votre-compte>/race-jeunes`).
2. Onglet **Actions** → **Mettre à jour Race jeunes** → bouton **Run workflow** → **Run workflow**.
3. Une à deux minutes plus tard, Vercel redéploie l'application ; la base de données est mise à jour
   automatiquement. Vos données, votre logo et vos couleurs sont conservés.

Si l'onglet Actions demande d'activer les workflows, cliquez **I understand my workflows, go ahead and enable
them**.

Si le workflow affiche un avertissement « Les workflows GitHub ont changé » : la mise à jour du code a bien été
faite ; seuls les fichiers du dossier `.github/workflows` de votre dépôt n'ont pas pu être remplacés
automatiquement. Copiez-les depuis le dépôt du projet si l'annonce de la version le demande.

## En cas de souci

| Situation | Solution |
|---|---|
| « Code d'installation incorrect » | Vérifiez majuscules et minuscules. Vous pouvez relire ou changer le code dans Vercel → projet → **Settings → Environment Variables** → `INSTALL_CODE`, puis **Deployments → ⋯ → Redeploy**. |
| « Code d'installation manquant » | Ajoutez `INSTALL_CODE` dans **Settings → Environment Variables** (8 caractères minimum), puis **Redeploy**. |
| La première page met quelques secondes à s'afficher | Normal après une période calme : la base gratuite se met en veille et se réveille en 1 à 2 secondes. |
| Mot de passe admin oublié | Si un autre admin existe, il peut réinitialiser votre mot de passe. Sinon, suivez la [procédure avancée](DEPLOIEMENT.md) pour créer un admin depuis un poste. |
| Le déploiement échoue | Vercel → **Deployments** → le déploiement en rouge → **Build Logs** : le message en français indique la cause. Ouvrez un ticket sur le dépôt du projet en recopiant ce message (jamais de mot de passe ni d'adresse de base de données). |

## Pour aller plus loin

- [Installation avancée](DEPLOIEMENT.md) : base avec un rôle sans droits sur le schéma, migrations
  contrôlées depuis un poste, sauvegardes `pg_dump`.
- [Installation avec Docker](installation-docker.md) : sur un serveur ou un NAS du club.
- [Données personnelles et sécurité](donnees-et-securite.md) : ce que l'application enregistre.
