# Journal des versions

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versions [SemVer](https://semver.org/lang/fr/).

## [1.0.0] — 2026-11-07

Première version de la Race jeunes d'un club de tennis.

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
- PWA installable, thèmes sombre et clair, identité visuelle du club (direction B des maquettes), contrastes WCAG AA.
- `docker compose up` avec données de démonstration (deux saisons, deux barèmes, 20 pseudos).
- CI GitHub Actions : lint, typage, tests unitaires, E2E Playwright, démarrage Docker.
- Logo et bannière du projet.

[1.0.0]: https://github.com/kinola2605/race-jeunes/releases/tag/v1.0.0
