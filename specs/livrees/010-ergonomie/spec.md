# Spécification fonctionnelle — Ergonomie (revue UX)

**Branche** `feat/010-ergonomie` · **Créée** 2026-11-14 · **Statut** Déployée (v1.9.0, 2026-11-14) · **Origine** revue UX du
14 novembre 2026 (`design/revue-ux/revue-ux-2026-11.html`)

> Ce document décrit le **quoi** et le **pourquoi**, sans choix technique. La constitution reste la règle
> (`.specify/memory/constitution.md`) ; les exigences existantes sont dans `specs/livrees/001-race-jeunes/spec.md`.

## 1. Besoin

Chaque écran contient la bonne information, mais pas dans l'ordre où on en a besoin : le joueur fait défiler
pour se trouver dans le classement et pour atteindre le bouton d'envoi, l'admin lit une phrase pour savoir qui
a gagné. Cette évolution réorganise l'existant (les trois lots de la revue).
**Aucune fonctionnalité, route, règle de calcul ni donnée n'est ajoutée ou retirée.**

## 2. Personas concernés

- **Joueur** : se situe, déclare un match et relit ses matchs plus vite, au pouce, en bord de court.
- **Admin** : voit d'un regard qui a gagné et valide sans erreur de pouce.

## 3. Exigences

| ID | Exigence | Écran |
|---|---|---|
| FR-1000 | Dans la barre d'onglets du joueur, « Saisir » est au centre et mis en avant. Les cinq destinations sont inchangées. Le bouton « Déclarer un match » en bas de l'accueil, devenu redondant, est retiré. | Navigation, E03 |
| FR-1001 | Le bilan (victoires, défaites, perfs, classement de départ) est affiché dans le bloc « Ma position ». Les défaites ne sont plus en rouge. | E03 |
| FR-1002 | L'écart avec le joueur précédent est formulé comme un objectif : « Plus que N pt(s) pour rejoindre le Xe », ou « À égalité de points avec le Xe » si l'écart est nul. | E03 |
| FR-1003 | L'alerte « matchs en attente de validation » est placée juste sous le bloc « Ma position » et mène à « Mes matchs » filtré sur « En attente ». | E03 |
| FR-1004 | La carte « Dernier match validé » est cliquable en entier et mène au détail du calcul. | E03 |
| FR-1005 | Sur mobile, quand le joueur a accès au détail de son calcul, une barre « Ma position » reste visible en bas du classement (rang, points) et mène à ce détail. | E04 |
| FR-1006 | Le classement et « Mes matchs » ont pour titre le nom de l'écran ; la saison n'est plus répétée dans le titre et dans le sélecteur. | E04, E05 |
| FR-1007 | Les filtres du classement sont répartis en deux rangées libellées (« Étiquette », « Série ») qui passent à la ligne au lieu de défiler. Il en va de même des filtres de la liste des joueurs. | E04, E08a |
| FR-1008 | « Mes matchs » : résumé en bande de chiffres ; onglets de filtre de largeur égale avec le nombre de matchs ; le badge « Validé » n'est plus affiché (les autres statuts le restent) ; le chevron des lignes dépliables pointe vers le bas. | E05 |
| FR-1009 | Le score n'est plus prérempli. Chaque champ garde la saisie au clavier et reçoit deux boutons − / + ; depuis un champ vide, « + » donne 6 et « − » donne 0. Les champs envoyés par le formulaire sont inchangés. | E12a |
| FR-1010 | Sur mobile, les petits boutons mesurent au moins 44 px de haut. | Tous |
| FR-1011 | Les ordinaux sont composés en exposant (1er, 9e) et l'unité s'accorde (« 1 pt », « 2 pts »). | E03, E06 |
| FR-1012 | La couleur corail est réservée à l'action principale, aux perfs et aux points gagnés : sur-titres et onglet actif n'en usent plus. | Tous |
| FR-1013 | « Mes saisons » : l'identifiant technique de la saison n'est plus affiché au joueur ; le badge de statut reste sur la ligne du titre ; l'introduction ne parle plus seulement de lecture seule. | E06 |
| FR-1014 | Sur mobile, la puce du compte dans la barre du haut n'affiche que l'avatar (le pseudo reste lu par les lecteurs d'écran). | Tous |

| FR-1015 | La saisie de match suit trois étapes numérotées : adversaire et date, résultat, score. Une fois l'adversaire du club choisi, la liste se replie en une ligne avec « Modifier ». Le type de match est un choix à trois boutons (mêmes valeurs). | E12a |
| FR-1016 | L'estimation des points est affichée dans la barre d'envoi, à côté du bouton, pendant toute la saisie. Sur mobile, la barre d'onglets est masquée pendant la saisie ; un lien de retour permet d'en sortir. | E12a |
| FR-1017 | File de validation : chaque match est une carte « tableau de score » (vainqueur coché et en gras, jeux en colonnes, classements, ancienneté de la demande). « Valider » est le bouton principal, en vert ; « Saisir un match » devient secondaire. Un doublon probable est signalé par un badge. | E12b |
| FR-1018 | La barre « Valider la sélection » n'est affichée que si au moins un match est coché, avec le nombre de matchs cochés. | E12b |
| FR-1019 | Suivi : « Matchs à valider » est l'indicateur principal, avec un accès direct à la file ; les trois autres sont secondaires. Un compteur à zéro n'est pas en couleur d'alerte. Les matchs à valider reprennent le tableau de score. | E07 |
| FR-1020 | « Mon compte » : thème, mot de passe (et apparence pour l'admin) sont des lignes de réglages ; l'avatar et la confidentialité sont des sections repliables ; « Se déconnecter » est isolé en bas de page. Le contenu est inchangé. | Compte |
| FR-1021 | Grand écran : l'accueil du joueur passe en deux colonnes ; le compte descend en bas de la barre latérale (la barre du haut disparaît) et « Saisir » en prend la tête. | E03, navigation |
| FR-1022 | « Mes matchs » : les matchs sont regroupés par mois et le score est affiché en cases. | E05 |
| FR-1023 | Connexion : la mention « aucune donnée personnelle collectée » rejoint les deux aides sous le formulaire. | E01 |

## 4. Hors périmètre

Départage des ex æquo au classement. Écrans barème, engagements, import CSV et journal. Cartes des saisons de
l'admin.

## 5. Données et migration

Aucune donnée nouvelle, aucune migration.

## 6. Vérification

- Tests E2E existants adaptés : le score est saisi explicitement (`fillScore`), le type de match est choisi par
  bouton, la section avatar est dépliée avant usage. Un envoi sans score est vérifié comme bloqué.
- Contrôle visuel en 375 px et en bureau, thèmes sombre et clair.
