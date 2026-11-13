# Spécification fonctionnelle — Espace RGPD par joueur

**Branche** `008-espace-rgpd` · **Créée** 2026-11-13 · **Statut** Déployée (v1.7.0, 2026-11-13) · **Origine** EV-11
(`specs/002-evolutions-club/spec.md`)

> Ce document décrit le **quoi** et le **pourquoi**, sans choix technique. La constitution reste la règle
> (`.specify/memory/constitution.md`) ; les exigences existantes sont dans `specs/livrees/001-race-jeunes/spec.md`.

## 1. Besoin

Espace RGPD par joueur pour récupérer ses données.

Même pseudonymes (constitution III), les données d'un joueur (pseudo, classement, matchs, points, actions
tracées) sont des données personnelles au sens du RGPD dès lors que le club peut relier le pseudo à l'enfant.
Le joueur (ou ses parents) doit pouvoir **savoir ce qui est enregistré** (droit d'accès, art. 15) et le
**récupérer dans un format réutilisable** (droit à la portabilité, art. 20), sans passer par une demande
manuelle au club.

## 2. Personas concernés

- **Joueur** : consulte ce que l'application enregistre sur lui et télécharge ses données.
- **Admin** : télécharge ses propres données ; télécharge celles d'un joueur qui en fait la demande au club,
  y compris si son compte est désactivé (il ne peut plus se connecter).

## 3. User stories

- **US-R1** — En tant que joueur, dans « Mon compte », je vois la liste de ce que l'application enregistre
  sur moi, avec le nombre d'éléments de chaque catégorie.
- **US-R2** — En tant que joueur, je télécharge **toutes mes données** dans un fichier en un clic.
- **US-R3** — En tant que joueur, je sais comment faire corriger ou effacer mes données (demande au club).
- **US-R4** — En tant qu'admin, depuis la fiche d'un joueur, je télécharge ses données pour répondre à une
  demande, même si le compte est désactivé.

## 4. Exigences fonctionnelles

| ID | Exigence | Écran |
|---|---|---|
| FR-800 | « Mon compte » comporte une carte **« Mes données »** listant les catégories enregistrées sur l'utilisateur, avec leur nombre : compte, étiquettes, historique du classement, saisons, matchs, points, actions au journal, sessions ouvertes. | Mon compte |
| FR-801 | Le bouton **« Télécharger mes données »** fournit un fichier **JSON** lisible par une machine (portabilité), nommé `mes-donnees-<pseudo>-<AAAA-MM-JJ>.json`. | Mon compte |
| FR-802 | Le fichier contient : **compte** (pseudo, rôle, statut, classement actuel, avatar, date de création, date du dernier changement de mot de passe, mot de passe temporaire oui/non) ; **étiquettes** ; **historique du classement** ; **saisons** (titre, statut, classement de départ, objectif de matchs) ; **matchs** où il figure, quel que soit leur statut (saison, date, côté, adversaire, résultat, score de son point de vue, type, tournoi, statut, motif de refus, classements de référence) ; **points** par match (points, écart, perf, détail du calcul, version du barème) ; **journal** (actions faites par lui ou visant son pseudo : date, auteur, type, action) ; **sessions** (date d'ouverture et d'expiration). | — |
| FR-803 | Le fichier ne contient **jamais** : empreinte du mot de passe, jeton ou empreinte de session, compteurs anti-abus, ni les matchs, points ou détails d'audit d'un autre joueur. L'adversaire n'apparaît que par son pseudo (ou le libellé saisi pour un adversaire extérieur). | — |
| FR-804 | Chacun ne télécharge que **ses propres** données ; seul un admin peut télécharger celles d'un autre compte. Contrôle côté serveur ; un utilisateur au mot de passe temporaire doit d'abord le changer. | — |
| FR-805 | Sur la fiche d'un joueur (admin), le bouton **« Télécharger ses données (RGPD) »** fournit le même fichier, que le compte soit actif ou désactivé. | E08a |
| FR-806 | Chaque téléchargement est tracé au journal (type « Export », « Export des données personnelles », cible = pseudo). | Journal |
| FR-807 | La carte rappelle les autres droits : **rectification** et **effacement** se demandent au club (l'admin corrige le pseudo ou le classement, désactive le compte) ; la carte renvoie vers les engagements de confidentialité existants. | Mon compte |

## 5. Critères d'acceptation (Given / When / Then)

1. **Given** un joueur connecté sur « Mon compte », **then** la carte « Mes données » liste les catégories
   avec leur nombre (ex. « Matchs : 4 »).
2. **Given** ce joueur, **when** il clique « Télécharger mes données », **then** il reçoit
   `mes-donnees-<pseudo>-<date>.json` contenant son pseudo et ses matchs, sans `passwordHash` ni jeton.
3. **Given** un joueur connecté, **when** il demande les données d'un autre compte (`?joueur=<id>`),
   **then** la réponse est un refus (403).
4. **Given** un admin sur la fiche d'un joueur désactivé, **when** il clique « Télécharger ses données
   (RGPD) », **then** il reçoit le fichier du joueur et l'action est tracée au journal.
5. **Given** une visite sans session, **when** l'URL de téléchargement est appelée, **then** aucune donnée
   n'est renvoyée.

## 6. Cas limites

| Cas | Comportement |
|---|---|
| Joueur sans match ni saison | Fichier valide avec des listes vides ; nombres à 0 sur la carte. |
| Match côté B (déclaré par l'adversaire) | Inclus ; résultat et score présentés du point de vue du joueur. |
| Match refusé ou annulé | Inclus avec son statut (et le motif de refus) : c'est une donnée le concernant. |
| Pseudo renommé | Le journal inclut les actions faites par le compte et celles visant le pseudo actuel ; les anciennes traces visant l'ancien pseudo restent au journal du club (export du journal par l'admin). |
| Admin qui exporte ses propres données | Mêmes règles ; son journal contient ses actions d'administration (au plus 5 000 dernières entrées). |
| Pseudo avec caractères spéciaux | Le nom de fichier ne garde que lettres, chiffres, `.`, `-`, `_`. |
| Compte inexistant (admin) | 404, rien n'est tracé. |

## 7. Principes de la constitution concernés

- **III** — aucune nouvelle donnée collectée ; le fichier n'expose ni secret ni donnée d'un autre joueur ;
  aucun service externe (fichier généré par l'application).
- **IV / VI** — accès vérifié côté serveur (soi-même ou admin) ; réponse non mise en cache ; action tracée.
- **VIII** — boutons étiquetés, cibles ≥ 44 px, liste lisible au lecteur d'écran.
- **IX** — un fichier JSON généré à la demande, sans file d'attente ni stockage.

## 8. Clarifications

### Session 2026-11-13 (décisions par défaut, sans rendez-vous)

- **Q : Quel format ?** → JSON (lisible par une machine, art. 20) ; la carte « Mes données » donne la vue
  lisible par un humain. Un PDF ou une page imprimable est hors périmètre.
- **Q : Effacement en libre-service ?** → Non. La suppression d'un compte casserait l'historique des
  saisons (constitution V : historique fidèle) et des classements des autres joueurs. Les droits de
  rectification et d'effacement passent par le club (désactivation du compte ; pseudo déjà pseudonyme).
  Une anonymisation complète d'un compte est `[NEEDS CLARIFICATION]` avec le club.
- **Q : L'admin peut-il exporter pour un joueur ?** → Oui, depuis la fiche joueur, pour répondre aux
  demandes faites au club (notamment par les parents ou pour un compte désactivé).
- **Q : Journal d'audit ?** → Inclus : date, auteur, type et action des entrées faites par le compte ou
  visant son pseudo, **sans** le détail technique (qui peut décrire d'autres comptes, ex. une création de
  compte par un admin).
