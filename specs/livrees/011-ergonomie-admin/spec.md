# Spécification fonctionnelle — Ergonomie des écrans d'administration

**Branche** `feat/011-ergonomie-admin` · **Créée** 2026-11-14 · **Statut** Déployée (v1.10.0, 2026-11-14) · **Origine** revue UX
des écrans admin (`design/revue-ux/revue-ux-admin-2026-11.html`), suite de la spec 010

> Ce document décrit le **quoi** et le **pourquoi**, sans choix technique. La constitution reste la règle
> (`.specify/memory/constitution.md`) ; les exigences existantes sont dans `specs/livrees/001-race-jeunes/spec.md`.

## 1. Besoin

La spec 010 a réorganisé le parcours joueur et deux écrans admin (suivi, file de validation). Les autres écrans
admin gardaient le même défaut : les commandes passaient avant le contenu. Cette évolution leur applique le même
travail. **Aucune fonctionnalité, route, règle de calcul ni donnée n'est ajoutée ou retirée.**

## 2. Persona concerné

- **Admin** : retrouve un joueur, règle une saison et relit le journal plus vite, y compris sur téléphone.

## 3. Exigences

| ID | Exigence | Écran |
|---|---|---|
| FR-1100 | Liste des joueurs : les deux actions sont côte à côte ; la recherche se valide depuis le champ ; les filtres sont en deux rangées libellées (« Statut », « Étiquette ») ; le nombre de saisons est accordé. | E08a |
| FR-1101 | Fiche joueur : la carte « Saisons » (objectif de matchs) suit le profil ; la désactivation du compte a sa propre carte en fin de page, avec une phrase d'explication ; « Télécharger ses données (RGPD) » est un bouton. | E08a (détail) |
| FR-1102 | Liste des saisons : regroupement par état (en cours, brouillons, terminées) ; chiffres en bande ; trois accès de même style sur une ligne ; « Nouvelle saison » à côté du titre. | E09a |
| FR-1103 | Détail d'une saison : chiffres en bande ; accès « Gérer » en lignes qui rappellent l'état (version du barème, nombre d'engagés) ; exports CSV regroupés. | E09a (détail) |
| FR-1104 | Engagements : la barre « Engager la sélection » n'est affichée que si au moins un joueur est coché, avec le nombre coché ; les lignes des engagés n'affichent le classement actuel que s'il diffère du classement de départ ; commandes alignées à droite. | E11 |
| FR-1105 | Éditeur de barème : sur mobile, les quatre onglets sont visibles sans défilement. | E10 |
| FR-1106 | Journal : sur mobile, regroupement par jour avec l'heure en marge ; détails techniques affichés en français, valeurs vides masquées ; export à côté du titre ; filtre libellé « Type ». L'export CSV est inchangé. | E13 |
| FR-1107 | Matchs validés et refusés : mêmes cartes « tableau de score » que la file de validation, avec les points attribués. | E12b |

## 4. Hors périmètre

Table de points du barème sur mobile (grille conçue pour grand écran). Nouveau joueur, remise du mot de passe,
import CSV, nouvelle saison, apparence : parcourus, laissés tels quels.

## 5. Données et migration

Aucune donnée nouvelle, aucune migration.

## 6. Vérification

- Tests E2E existants inchangés et verts (les libellés et rôles utilisés par les tests sont conservés).
- Contrôle visuel en 375 px, thème sombre ; captures avant/après dans la page de revue.
