# Journal des versions

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versions [SemVer](https://semver.org/lang/fr/).

## [Non publié]

### Apparence du club (specs 003 et 004)
- Nouvelle page admin **Apparence** (`/admin/apparence`, accessible depuis « Mon compte ») :
  - **logo** du club déposé par l'admin (PNG, JPEG, WebP ou SVG, 512 Ko au plus, type contrôlé d'après le
    contenu), utilisé dans les deux thèmes, sur la connexion, la fiche imprimable et comme icône de l'appli ;
    retour au logo par défaut en un clic ;
  - **4 couleurs** (accent et action, thèmes sombre et clair), avec aperçu en direct et **refus** de toute
    couleur dont le contraste WCAG 2.1 est insuffisant ; retour aux couleurs par défaut en un clic.
- Priorité du logo : logo déposé, puis `BRAND_LOGO` / `BRAND_LOGO_LIGHT`, puis logo du projet.
- Logo servi par l'appli (`/club-logo`), public, sous une CSP qui interdit tout script.
- Changements tracés au journal d'audit (nouveau type « Apparence »).
- **Migration** `20261113120000_club_appearance` (nouvelle table `ClubAppearance`) à appliquer avant le
  déploiement (`npm run db:migrate:remote`).

## [1.2.1] — 2026-11-09

### Couleurs
- Nouvelle palette sur deux couleurs principales : **bleu marine `#1F2B42`** et **terre battue `#BA6735`**.
  Accents dérivés et accessibles (WCAG AA) : terre battue claire `#EBB08C`, vive `#E28C57`, foncée `#9C4F22`.
- Icône de l'application, logo, bannière, couleur de thème et maquettes mis à jour ; contrastes recalculés
  dans `design/identite.md`.

## [1.2.0] — 2026-11-08

### Mise en production Vercel + Neon
- Procédure complète dans `docs/DEPLOIEMENT.md` : Neon (Francfort), Vercel (région `fra1`), variables par
  environnement, premier admin, rollback, sauvegardes, limites des offres gratuites.
- Base : URL poolée pour l'application, URL directe (`DATABASE_URL_UNPOOLED`) pour les migrations,
  SSL imposé, relance automatique au réveil à froid de Neon, rôle applicatif `race_app` sans DDL.
- `npm run db:migrate:remote` : migrations avec confirmation, refus des migrations destructives sans option.
- Seed de démonstration interdit en production ; mot de passe du premier admin saisi de façon masquée.

### Sécurité
- Nouvelle variable obligatoire en production : `SESSION_SECRET` (HMAC des sessions et des compteurs
  anti-abus). **Les sessions existantes sont invalidées** à la mise à jour.
- Écritures d'une autre origine refusées par le middleware (403), HSTS, API en `no-store`, service worker
  qui ne met jamais l'API en cache.

## [1.1.0] — 2026-11-08

### Marque blanche
- Plus aucune référence à un club particulier : nom de l'app, nom et sigle du club, logos (thèmes sombre et clair)
  se configurent par variables d'environnement (`APP_NAME`, `CLUB_NAME`, `CLUB_SHORT_NAME`, `BRAND_LOGO`,
  `BRAND_LOGO_LIGHT`), lues à l'exécution, sans rebuild.
- Manifeste PWA généré dynamiquement à partir de cette configuration.
- Valeurs neutres par défaut (« Race jeunes », logo du projet).

## [1.0.0] — 2026-11-07

Première version de la Race jeunes.

### Accès et comptes
- Connexion par **pseudo + mot de passe**, seule page publique ; **aucune inscription libre** (tests E2E dédiés).
- Comptes créés **uniquement par l'admin**, unitairement ou par **import CSV** (`pseudo;classement`) ;
  mot de passe temporaire aléatoire **affiché une seule fois**, fiche imprimable.
- **Changement de mot de passe obligatoire** à la première connexion et après réinitialisation.
- Désactivation / réactivation avec **coupure immédiate des sessions** ; un compte avec historique n'est jamais supprimé.
- Anti-abus : message d'erreur unique, verrouillage 15 min (5 échecs par pseudo, 20 par origine réseau).
- Premier admin créé par **bootstrap** (variables d'environnement ou CLI).

### Saisons et barèmes
- Saisons identifiées par un **identifiant stable** et un titre, indépendantes de l'année civile ;
  cycle brouillon → ouverte → clôturée → archivée (réouverture exceptionnelle tracée).
- **Barème propre à chaque saison**, versionné : points par écart d'échelons, table complète par couple
  de classements, non-classés, forfait, plafond par match, bonus d'assiduité.
- Duplication indépendante du barème d'une saison précédente.
- Éditeur avec **validation en direct**, **simulateur**, **aperçu d'impact** et **recalcul explicite**
  enregistré dans le journal d'audit — jamais de recalcul silencieux.
- Engagements individuels ou en lot (sélection par étiquette), classement de départ figé ou évolutif.

### Matchs et classement
- Saisie **en bord de court** (mobile) : adversaire du club ou extérieur, sets, forfait/abandon,
  **estimation des points en direct** ; validation, refus motivé, annulation par l'admin ; doublons signalés.
- Classement par saison (points, perfs, victoires, ex æquo), filtres par étiquette et série, visibilité réglable.
- Espace joueur : tableau de bord, **détail du calcul de chaque match**, saisons passées.
- Suivi admin : matchs à valider, anomalies, mots de passe temporaires non changés, engagés sans match ;
  **exports CSV** ; **journal d'audit** filtrable.

### Technique
- Moteur de points en **bibliothèque pure**, couverture **100 %**, tests sur deux barèmes différents.
- Next.js 15, PostgreSQL 16, Prisma 6, argon2id, sessions serveur révocables, CSP `default-src 'self'`.
- **Zéro donnée personnelle**, aucune ressource externe (Poppins et icônes auto-hébergées).
- PWA installable, thèmes sombre et clair, identité visuelle « Court » (direction B des maquettes), contrastes WCAG AA.
- `docker compose up` avec données de démonstration (deux saisons, deux barèmes, 20 pseudos).
- CI GitHub Actions : lint, typage, tests unitaires, E2E Playwright, démarrage Docker.
- Logo et bannière du projet.

[1.0.0]: https://github.com/kinola2605/race-jeunes/releases/tag/v1.0.0
