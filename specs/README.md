# Spécifications

| Répertoire | Contenu |
|---|---|
| `specs/NNN-…/` | Specs **en cours** : brouillon, en préparation ou en développement. |
| [`specs/livrees/`](livrees/) | Specs **terminées et déployées en production**, figées (statut « Déployée (vX.Y.Z) »). |

Une spec passe dans `livrees/` dans la PR qui la livre, une fois la migration appliquée en production et la
release GitHub créée (voir [CONTRIBUTING.md](../CONTRIBUTING.md) § Release). La numérotation reste unique
sur l'ensemble des deux répertoires : la prochaine spec prend le numéro suivant le plus élevé.

## Livrées

| Spec | Version | Objet |
|---|---|---|
| [001-race-jeunes](livrees/001-race-jeunes/spec.md) | 1.0.0 → 1.2.1 | Race jeunes (spec de référence, exigences `FR-xxx`) |
| [003-logo](livrees/003-logo/spec.md) | 1.3.0 | Logo du club configurable |
| [004-couleurs-site](livrees/004-couleurs-site/spec.md) | 1.3.0 | Couleurs du site configurables |
| [005-objectif-matchs](livrees/005-objectif-matchs/spec.md) | 1.4.0 → 1.4.1 | Objectif de matchs par joueur et par saison |
| [006-bonus-tournoi](livrees/006-bonus-tournoi/spec.md) | 1.5.0 | Bonus pour plusieurs victoires dans un même tournoi |
| [007-photos-profil](livrees/007-photos-profil/spec.md) | 1.6.0 | Avatars de profil (galerie, sans photo) |
| [008-espace-rgpd](livrees/008-espace-rgpd/spec.md) | 1.7.0 | Espace RGPD : consulter et télécharger ses données |
| [009-envoi-mot-de-passe-email](livrees/009-envoi-mot-de-passe-email/spec.md) | 1.8.0 | Envoi des identifiants depuis la messagerie de l'admin |
| [010-ergonomie](livrees/010-ergonomie/spec.md) | 1.9.0 | Ergonomie : réorganisation des écrans (revue UX) |
| [011-ergonomie-admin](livrees/011-ergonomie-admin/spec.md) | 1.10.0 | Ergonomie des écrans d'administration |
| [012-profil-mental](livrees/012-profil-mental/spec.md) | 1.11.0 | Profil mental calculé à partir des scores |
| [013-documentation](livrees/013-documentation/spec.md) | 1.11.1 | README et documentation du projet (`docs/`) |
| [014-fiche-joueur-onglets](livrees/014-fiche-joueur-onglets/spec.md) | 1.12.0 | Fiche joueur de l'admin en quatre onglets |
| [015-video-presentation](livrees/015-video-presentation/spec.md) | 1.12.1 | Vidéo de présentation en tête du README |
| [016-installation-un-clic](livrees/016-installation-un-clic/spec.md) | 1.13.0 | Installation en un clic par chaque club, mises à jour depuis GitHub |

## En cours

| Spec | Statut |
|---|---|
| [002-evolutions-club](002-evolutions-club/spec.md) | Brouillon — préparation du rendez-vous club |
