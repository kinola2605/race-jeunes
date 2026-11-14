# Journal des versions

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versions [SemVer](https://semver.org/lang/fr/).

## [Non publié]

## [1.12.2] — 2026-11-14

### Préparation du dépôt public
Aucune fonctionnalité nouvelle. Aucune migration.
- Documentation et exemples **anonymisés** : plus aucune mention d'un club ou d'un déploiement réel
  (`docs/DEPLOIEMENT.md`, spec 002). Les libellés de tournois de la démo, des maquettes et du champ « Libellé
  de l'adversaire » utilisent des noms fictifs.
- Captures d'écran régénérées à partir des données de démonstration.
- `SECURITY.md` : signalement privé des vulnérabilités.

## [1.12.1] — 2026-11-14

### Vidéo de présentation (spec 015)
Aucun changement de l'application. Aucune migration.
- **Vidéo de présentation** en tête du README : 48 secondes qui parcourent l'application côté joueur
  (connexion, accueil, déclaration d'un match, classement, détail du calcul) puis côté admin (validation,
  barème, fiche joueur, apparence). Aperçu animé (GIF) dans la page, MP4 1920×1080 en lien.
- `npm run docs:video` : vidéo régénérée à partir des données de démonstration (Playwright + ffmpeg).

## [1.12.0] — 2026-11-14

### Fiche joueur en onglets (spec 014)
Réorganisation de la fiche d'un joueur côté admin. Aucune fonctionnalité, règle ni donnée nouvelle. Aucune
migration.
- La fiche est découpée en **quatre onglets** : **Profil** (pseudo, classement, étiquettes, historique du
  classement), **Saisons** (engagements et objectif de matchs), **Mental** (profil mental, dans son propre
  onglet) et **Compte** (réinitialisation du mot de passe, données RGPD, désactivation).
- L'onglet est porté par l'adresse (`?onglet=saisons`…) : il se partage, se retrouve avec le bouton Retour, et
  l'on y revient après un enregistrement.
- Chaque onglet ne charge que ses données : le profil mental n'est plus calculé à chaque ouverture de la fiche.
- Guide de l'admin mis à jour.

## [1.11.1] — 2026-11-14

### Documentation (spec 013)
Aucun changement de l'application. Aucune migration.
- **README** refait : présentation, captures d'écran, fonctionnalités à jour (il datait de la 1.2.1), essai en
  5 minutes, sommaire par lecteur.
- **Documentation dans `docs/`**, lue directement sur GitHub : guide de l'admin, guide du joueur, barème
  expliqué avec exemples chiffrés, installation Docker, configuration (variables et commandes), architecture,
  données personnelles et sécurité. Sommaire : `docs/README.md`. Le guide Vercel + Neon ne change pas.
- `npm run docs:check` (lancé par la CI) : liens de la documentation et version annoncée par le README.
- `npm run docs:captures` : captures d'écran régénérées à partir des données de démonstration.
- `CONTRIBUTING.md` : la mise à jour de la documentation fait partie de chaque PR et de la release.

## [1.11.0] — 2026-11-14

### Profil mental calculé (spec 012)
- **Fiche joueur (admin)** : nouvelle carte « Profil mental », calculée à partir des scores déjà enregistrés,
  sans rien à saisir : tie-breaks gagnés, sets décisifs gagnés (3e set ou super tie-break), retours après la
  perte du premier set, perfs face à un mieux classé, contre-perfs face à un moins bien classé.
- Chaque indicateur donne le pourcentage, les nombres (« 2 gagnés sur 3 joués ») et la valeur du groupe (tous
  les engagés de la saison). Tableau « D'une saison à l'autre » dès que le joueur a plusieurs saisons.
- Forfaits jamais comptés ; abandons exclus des sets décisifs et des retours. Réservé à l'admin.
- Aucune donnée nouvelle, aucune migration.

### Outillage
- `npm run db:seed:volume` : jeu de données fictif et volumineux (4 saisons « Démo · … », 64 joueurs étiquetés
  « Jeu de données », environ 1 400 matchs). Ajout seul ; `-- --purge` le retire entièrement.

## [1.10.0] — 2026-11-14

### Ergonomie des écrans d'administration (spec 011)
Même travail que la 1.9.0, appliqué aux écrans admin restants. Aucune fonctionnalité, route ni donnée nouvelle.
Aucune migration.
- **Joueurs** : actions côte à côte, recherche validée depuis le champ, filtres « Statut » et « Étiquette »
  en deux rangées.
- **Fiche joueur** : « Saisons » (objectif de matchs) juste après le profil ; la désactivation du compte a sa
  propre carte en bas de page.
- **Saisons** : regroupement par état (en cours, brouillons, terminées), chiffres en bande, accès sur une ligne.
- **Détail d'une saison** : chiffres en bande, accès « Gérer » en lignes, exports CSV regroupés.
- **Engagements** : la barre « Engager la sélection » n'apparaît que si un joueur est coché ; lignes des engagés
  allégées.
- **Barème** : les quatre onglets de l'éditeur sont visibles sur mobile.
- **Journal** : regroupement par jour sur mobile, détails affichés en français (l'export CSV est inchangé).
- **Matchs validés et refusés** : cartes « tableau de score », comme la file de validation.
- Revue avec captures avant/après : `design/revue-ux/revue-ux-admin-2026-11.html`.

## [1.9.1] — 2026-11-14

### Correctif
- Application installée sur iPhone : le haut de l'écran (logo, accès au compte) n'est plus masqué par la barre
  d'état du téléphone. Le contenu commence désormais sous la zone de l'heure et de l'encoche.

## [1.9.0] — 2026-11-14

### Ergonomie (spec 010, revue UX)
Réorganisation des écrans, sans fonctionnalité, route, règle de calcul ni donnée nouvelle. Aucune migration.
- **Navigation** : « Saisir » est au centre de la barre d'onglets du joueur ; sur grand écran, le compte descend
  en bas de la barre latérale.
- **Accueil** : bilan intégré au bloc « Ma position », écart formulé comme un objectif (« Plus que N pts pour
  rejoindre le Xe »), alerte « en attente » juste dessous, dernier match cliquable ; deux colonnes sur grand écran.
- **Classement** : barre « Ma position » toujours visible sur mobile, avec accès au détail du calcul ; filtres
  en deux rangées libellées.
- **Mes matchs** : bande de chiffres, onglets avec compteurs, regroupement par mois, score en cases ; le badge
  « Validé » n'est plus affiché.
- **Déclarer un match** : trois étapes, adversaire replié une fois choisi, estimation des points dans la barre
  d'envoi. **Le score n'est plus prérempli** (6/4 6/3 auparavant) : il se saisit au clavier ou aux boutons − / +.
- **Admin** : file de validation en cartes « tableau de score » (vainqueur coché), bouton « Valider » en vert,
  barre de sélection affichée seulement quand un match est coché ; « Suivi » avec un indicateur principal.
- **Mon compte** : réglages en lignes, avatar et confidentialité repliables, « Se déconnecter » en bas de page.
- Zones tactiles de 44 px minimum sur mobile, ordinaux en exposant, couleur corail réservée à l'action
  principale et aux perfs.
- Revue et maquettes : `design/revue-ux/revue-ux-2026-11.html`.

## [1.8.0] — 2026-11-13

### Envoi du mot de passe par e-mail (spec 009)
- Écran de remise du mot de passe (création et réinitialisation) : nouveau bouton **« Envoyer par e-mail »**
  qui ouvre la messagerie de l'admin avec un message prêt (adresse de l'app, pseudo, mot de passe temporaire,
  consignes de première connexion).
- Aucun destinataire pré-rempli : l'application ne demande ni ne conserve aucune adresse e-mail et n'appelle
  aucun service d'envoi (constitution III). Un envoi direct par l'application nécessiterait un amendement.
- Case de confirmation : « J'ai remis, imprimé ou envoyé le mot de passe ».
- Aucune migration.

### Correctif
- `bootstrap-admin` avec `--env-file` : le mot de passe est toujours saisi au clavier ; l'`ADMIN_PASSWORD`
  du `.env` local n'est plus utilisé pour la base distante (ex-PR #4).

## [1.7.0] — 2026-11-13

### Espace RGPD (spec 008)
- « Mon compte » : nouvelle carte **« Mes données »** listant ce que l'application enregistre sur le compte
  (compte, étiquettes, historique du classement, saisons, matchs, points, actions au journal, sessions), avec
  le nombre d'éléments de chaque catégorie.
- Bouton **« Télécharger mes données »** : fichier JSON (droit d'accès et portabilité) avec le compte, les
  saisons, tous les matchs du joueur présentés de son point de vue, ses points et leur détail, son journal et
  ses sessions. Jamais de mot de passe, de jeton de session ni de donnée d'un autre joueur.
- Fiche joueur (admin) : **« Télécharger ses données (RGPD) »**, y compris pour un compte désactivé.
- Chacun ne télécharge que ses données (contrôle serveur) ; chaque téléchargement est tracé au journal
  (type « Export »). Rectification et effacement : sur demande au club.
- Aucune migration.

## [1.6.0] — 2026-11-13

### Avatars de profil (spec 007)
- Les « photos de profil » demandées sont remplacées par des **avatars** (constitution III : aucune photo) :
  dans « Mon compte », chacun compose le sien avec **10 pictogrammes** (balle, raquette, trophée…) et
  **8 couleurs**, avec aperçu immédiat ; aucun dépôt de fichier.
- Sans choix : **initiale du pseudo** sur une couleur stable. Retour possible à cet avatar par défaut.
- Avatar affiché à côté du pseudo : en-tête, « Mon compte », accueil, classement, liste et fiche des joueurs.
- Changements tracés au journal d'audit (type « Compte »). Couleurs ajoutées aux tokens (`color.avatar`),
  contrastes dans `design/identite.md` §3.2.
- **Migration** `20261114090000_user_avatar` (colonne `User.avatar`), appliquée en production avant le
  déploiement.

## [1.5.0] — 2026-11-13

### Bonus tournoi (spec 006)
- En déclarant ou en saisissant un match, case **« Match joué en tournoi »** et **nom du tournoi** (2 à 80
  caractères) ; les noms déjà utilisés dans la saison sont proposés. Casse, accents et espaces sont ignorés
  pour regrouper les matchs d'un même tournoi.
- Nouvelle règle de barème **Bonus tournoi** (onglet « Paramètres », désactivée par défaut) : *P* points par
  victoire à partir de la *N*-ième dans un même tournoi (ex. *N* = 2, *P* = 10 : 2 victoires → 10, 3 → 20).
  Victoires par forfait exclues, hors plafond par match ; visible dans l'impact avant publication.
- Classement : la colonne « Bonus » additionne assiduité et tournois ; le détail du calcul liste chaque
  tournoi ; l'export ajoute `bonus_assiduite` et `bonus_tournoi`. Le nom du tournoi apparaît dans « Mes
  matchs » et dans la file de validation.
- Classement sur téléphone : l'admin ouvre le détail d'un joueur en touchant son pseudo.
- Barème de démonstration 2026 : bonus tournoi activé (2 victoires, 10 pts).
- **Migration** `20261113200000_match_tournament` (colonne `Match.tournament`), appliquée en production avant
  le déploiement.

## [1.4.1] — 2026-11-13

### Objectif de matchs
- Court « L'échange » plus compact sur téléphone (hauteur réduite d'environ 40 %, balle plus petite,
  largeur limitée sur grand écran).

## [1.4.0] — 2026-11-13

### Objectif de matchs par joueur et par saison (spec 005)
- Sur la fiche d'un joueur, carte « Saisons » : l'admin fixe son **objectif de matchs** pour chaque saison
  (1 à 200, vide = aucun) et voit sa progression ; lecture seule une fois la saison clôturée.
- Sur l'accueil du joueur : **« n / objectif matchs »** et **« L'échange »** : la balle traverse un court en
  terre battue à mesure qu'il joue (service, filet, service adverse, point), avec palier, message
  d'encouragement et matchs en attente en pointillés. Comptent les matchs validés hors forfaits ; aucun effet sur les points.
- Modifications tracées au journal d'audit (type « Engagement »).
- **Migration** `20261113180000_enrollment_match_goal` (colonne `Enrollment.matchGoal`), appliquée en production
  avant le déploiement.

## [1.3.0] — 2026-11-13

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
- **Migration** `20261113120000_club_appearance` (nouvelle table `ClubAppearance`), appliquée en production avant le
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

[Non publié]: https://github.com/kinola2605/race-jeunes/compare/v1.12.2...HEAD
[1.12.2]: https://github.com/kinola2605/race-jeunes/releases/tag/v1.12.2
[1.12.1]: https://github.com/kinola2605/race-jeunes/releases/tag/v1.12.1
[1.12.0]: https://github.com/kinola2605/race-jeunes/releases/tag/v1.12.0
[1.11.1]: https://github.com/kinola2605/race-jeunes/releases/tag/v1.11.1
[1.11.0]: https://github.com/kinola2605/race-jeunes/releases/tag/v1.11.0
[1.10.0]: https://github.com/kinola2605/race-jeunes/releases/tag/v1.10.0
[1.9.1]: https://github.com/kinola2605/race-jeunes/releases/tag/v1.9.1
[1.9.0]: https://github.com/kinola2605/race-jeunes/releases/tag/v1.9.0
[1.8.0]: https://github.com/kinola2605/race-jeunes/releases/tag/v1.8.0
[1.7.0]: https://github.com/kinola2605/race-jeunes/releases/tag/v1.7.0
[1.6.0]: https://github.com/kinola2605/race-jeunes/releases/tag/v1.6.0
[1.5.0]: https://github.com/kinola2605/race-jeunes/releases/tag/v1.5.0
[1.4.1]: https://github.com/kinola2605/race-jeunes/releases/tag/v1.4.1
[1.4.0]: https://github.com/kinola2605/race-jeunes/releases/tag/v1.4.0
[1.3.0]: https://github.com/kinola2605/race-jeunes/releases/tag/v1.3.0
[1.2.1]: https://github.com/kinola2605/race-jeunes/releases/tag/v1.2.1
[1.2.0]: https://github.com/kinola2605/race-jeunes/releases/tag/v1.2.0
[1.1.0]: https://github.com/kinola2605/race-jeunes/releases/tag/v1.1.0
[1.0.0]: https://github.com/kinola2605/race-jeunes/releases/tag/v1.0.0
