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

## En cours

| Spec | Statut |
|---|---|
| [002-evolutions-club](002-evolutions-club/spec.md) | Brouillon — préparation du rendez-vous club |
| [005-objectif-matchs](005-objectif-matchs/spec.md) | Révisée (v2) — maquette à valider |
| [006-bonus-tournoi](006-bonus-tournoi/spec.md) | Brouillon |
| [007-photos-profil](007-photos-profil/spec.md) | Brouillon |
| [008-espace-rgpd](008-espace-rgpd/spec.md) | Brouillon |
| [009-envoi-mot-de-passe-email](009-envoi-mot-de-passe-email/spec.md) | Brouillon |
