# Spécification fonctionnelle — Photos de profil → avatars

**Branche** `007-avatars-profil` · **Créée** 2026-11-13 · **Statut** Déployée (v1.6.0, 2026-11-13) · **Origine** EV-10
(`specs/002-evolutions-club/spec.md`)

> Ce document décrit le **quoi** et le **pourquoi**, sans choix technique. La constitution reste la règle
> (`.specify/memory/constitution.md`) ; les exigences existantes sont dans `specs/livrees/001-race-jeunes/spec.md`.

## 1. Besoin

Prévoir des photos de profil.

**Conflit avec la constitution.** Le principe III interdit de collecter ou de stocker une **photo** (les joueurs
sont mineurs ; un joueur n'est identifié que par un pseudo). Conformément à la spec 002 (§7 et §8.4), on retient
l'**alternative compatible** déjà prévue : un **avatar générique** que chaque joueur compose à partir d'une
galerie fermée (pictogramme + couleur), sans aucun dépôt de fichier. La constitution n'est pas modifiée.
Une vraie photo exigerait un amendement **majeur** de la constitution (principe III) et une analyse RGPD
(consentement parental, durée de conservation, droit à l'effacement) : hors périmètre `[NEEDS CLARIFICATION]`
si le club le redemande.

## 2. Personas concernés

- **Joueur** : choisit son avatar, voit ceux des autres au classement.
- **Admin** : choisit son propre avatar ; voit l'avatar des joueurs dans la liste et sur leur fiche.

## 3. User stories

- **US-A1** — En tant que joueur, je choisis un pictogramme et une couleur dans « Mon compte » pour me
  reconnaître d'un coup d'œil au classement.
- **US-A2** — En tant que joueur sans avatar choisi, j'ai quand même un avatar (l'initiale de mon pseudo sur
  une couleur), stable d'une visite à l'autre.
- **US-A3** — En tant que joueur, je reviens à l'avatar par défaut.

## 4. Exigences fonctionnelles

| ID | Exigence | Écran |
|---|---|---|
| FR-700 | **Aucune photo** ni aucun fichier n'est déposé : l'avatar est composé uniquement à partir d'une galerie fermée (constitution III). | Mon compte |
| FR-701 | La galerie propose **10 pictogrammes** sur le thème du tennis et du sport (balle, raquette, trophée, étoile, éclair, flamme, couronne, fusée, soleil, cœur), auto-hébergés. | Mon compte |
| FR-702 | La galerie propose **8 couleurs** issues des tokens (`color.avatar`), identiques dans les deux thèmes ; le pictogramme a un contraste ≥ 4,5:1 sur chacune. | Mon compte |
| FR-703 | Sans choix, l'avatar par défaut est l'**initiale du pseudo** sur une couleur déduite du pseudo (stable, sans distinction de casse). | toutes |
| FR-704 | Seules les valeurs de la galerie sont acceptées, contrôle côté serveur ; toute autre valeur est refusée avec un message. | Mon compte |
| FR-705 | Dans « Mon compte », chaque utilisateur (joueur ou admin) choisit **son propre** avatar avec un aperçu immédiat ; personne ne modifie l'avatar d'un autre. | Mon compte |
| FR-706 | L'utilisateur peut revenir à l'avatar par défaut. | Mon compte |
| FR-707 | L'avatar est affiché à côté du pseudo : en-tête (lien « Mon compte »), « Mon compte », accueil du joueur, classement (téléphone et tableau), liste des joueurs et fiche joueur (admin). Il est **décoratif** : le pseudo est toujours écrit à côté. | toutes |
| FR-708 | Chaque changement est tracé au journal d'audit (type « Compte », « Avatar modifié » / « Avatar par défaut rétabli »). | Journal |

## 5. Critères d'acceptation (Given / When / Then)

1. **Given** un joueur sur « Mon compte », **when** il choisit « Étoile » et « Ciel » puis enregistre,
   **then** « Avatar enregistré. » s'affiche et l'étoile sur fond ciel apparaît dans l'en-tête et sur sa
   ligne du classement.
2. **Given** un joueur avec un avatar choisi, **when** il clique « Revenir à l'avatar par défaut »,
   **then** l'initiale de son pseudo réapparaît.
3. **Given** la page « Mon compte », **then** elle ne contient aucun champ de dépôt de fichier.
4. **Given** une valeur forgée (« photo:ciel », URL…), **when** elle est envoyée, **then** elle est refusée.

## 6. Cas limites

| Cas | Comportement |
|---|---|
| Pseudo commençant par une lettre accentuée | Initiale conservée en majuscule (« élise » → « É »). |
| Pseudo renommé par l'admin | L'avatar choisi est conservé ; l'avatar par défaut suit le nouveau pseudo. |
| Avatar choisi devenu inconnu (galerie réduite plus tard) | Avatar par défaut affiché, aucune erreur. |
| Lecteur d'écran | L'avatar est ignoré (décoratif) ; dans la galerie, chaque choix a un libellé (« Étoile », « Ciel »). |
| Sélection | Indiquée par un anneau (forme) en plus de l'aperçu, jamais par la couleur seule. |

## 7. Principes de la constitution concernés

- **III** — aucune photo, aucun fichier, aucune ressource tierce ; l'avatar ne révèle aucune donnée personnelle.
- **VI** — chacun ne modifie que son propre avatar (vérifié côté serveur) ; valeur validée ; action tracée.
- **VII** — couleurs ajoutées aux tokens (`color.avatar`), contrastes documentés dans `design/identite.md` §3.2.
- **VIII** — avatar décoratif, choix étiquetés, cibles ≥ 44 px, focus visible, sélection non signalée par la couleur seule.

## 8. Clarifications

### Session 2026-11-13 (décisions par défaut, sans rendez-vous)

- **Q : Vraies photos ?** → Non : conflit avec le principe III. Alternative compatible de la spec 002 §7
  (« avatar générique ou couleur choisie »).
- **Q : Qui choisit l'avatar ?** → Chaque utilisateur pour lui-même. L'admin ne modifie pas l'avatar d'un
  joueur (rien à modérer : la galerie est fermée).
- **Q : Avatar par défaut ?** → Initiale du pseudo sur une couleur stable déduite du pseudo.
