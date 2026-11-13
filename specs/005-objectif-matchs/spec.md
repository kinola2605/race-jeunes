# Spécification fonctionnelle — Objectif du nombre de matchs par saison

**Branche** `005-objectif-matchs` · **Créée** 2026-11-13 · **Révisée** 2026-11-13 (v2 : objectif par joueur)
· **Statut** Maquette à valider · **Origine** EV-08 (`specs/002-evolutions-club/spec.md`)

> Ce document décrit le **quoi** et le **pourquoi**, sans choix technique. La constitution reste la règle
> (`.specify/memory/constitution.md`) ; les exigences existantes sont dans `specs/livrees/001-race-jeunes/spec.md`.
> Maquette : `design/maquettes/15-objectif-matchs.html`.

## 1. Besoin

Fixer à chaque joueur un objectif de nombre de matchs à jouer **dans une saison**, et lui montrer de façon
**ludique**, sur son accueil, où il en est.

**Révision v2 (2026-11-13, demande du responsable)** : l'objectif n'est plus fixé par tranche d'âge dans un
tableau, mais **saisi par l'admin sur la fiche de chaque joueur**, pour chaque saison où il est engagé.
Cela supprime toute notion de tranche d'âge (et la question de conformité qu'elle posait, ex-C-501).

L'objectif est un **repère d'assiduité** : il n'attribue aucun point et ne change pas le classement.

## 2. Personas concernés

- **Admin** : fixe l'objectif de chaque joueur, saison par saison.
- **Joueur** : suit sa progression vers son objectif, sur son accueil.

## 3. User stories

- **US-O1** — En tant qu'admin, sur la fiche d'un joueur, je fixe son objectif de matchs pour chacune des
  saisons où il est engagé, et je vois où il en est.
- **US-O2** — En tant que joueur, je vois sur mon accueil, de façon ludique, ma progression vers mon objectif
  de la saison affichée, avec un message qui m'encourage.
- **US-O3** — En tant que joueur, je vois quand j'ai atteint (ou dépassé) mon objectif.

## 4. Exigences fonctionnelles

| ID | Exigence | Écran |
|---|---|---|
| FR-500 | L'objectif de matchs appartient à l'**engagement** d'un joueur dans une saison : un joueur engagé dans deux saisons a deux objectifs indépendants. Sans objectif, rien n'est affiché au joueur. | — |
| FR-501 | Sur la fiche du joueur, la carte « Saisons » liste ses engagements ; pour chaque saison en brouillon ou ouverte, l'admin saisit l'objectif (entier de 1 à 200 ; vide = aucun) et l'enregistre. Pour une saison clôturée ou archivée, l'objectif et le résultat final sont affichés en lecture seule. | Fiche joueur |
| FR-502 | Pour chaque saison, la fiche affiche aussi la progression : « *n* / *objectif* matchs », et « atteint » le cas échéant. | Fiche joueur |
| FR-503 | Comptent pour l'objectif : les matchs **validés** de la saison où le joueur est l'un des deux côtés, **hors forfaits** (un forfait n'est pas joué) ; un abandon compte. Les matchs en attente sont signalés à part, sans être comptés. | Accueil, fiche |
| FR-504 | Sur son accueil, l'engagé qui a un objectif pour la saison affichée voit un **indicateur ludique** de progression (variante retenue sur maquette, §8 C-506) : nombre de matchs joués / objectif, matchs en attente (affichés distinctement), **message d'encouragement** selon le palier atteint. | Accueil |
| FR-505 | Paliers et messages : départ (0 match), en route (< 50 %), mi-parcours (≥ 50 %), dernière ligne droite (≥ 75 %), **objectif atteint** (100 %), objectif dépassé (« +*k* » au-delà). Le message cite le nombre de matchs restants tant que l'objectif n'est pas atteint. | Accueil |
| FR-506 | L'indicateur reste lisible sans la couleur ni l'animation : le texte « *n* / *objectif* » et le message sont toujours affichés ; l'animation éventuelle est désactivée si l'utilisateur a demandé moins d'animations. | Accueil |
| FR-507 | Chaque modification d'objectif est tracée dans le journal d'audit (type « Engagement ») avec l'ancienne et la nouvelle valeur. Saisie réservée à l'admin, vérifiée côté serveur. | Journal |
| FR-508 | Un joueur ne voit que **son** objectif (règle FR-127). | Accueil |
| FR-509 | L'objectif n'a aucun effet sur les points ni sur le classement (aucun recalcul). | — |

## 5. Critères d'acceptation (Given / When / Then)

1. **Given** AceDuMatin engagé dans la saison ouverte 2026-2027, **when** l'admin saisit 12 sur sa fiche
   pour cette saison et enregistre, **then** l'objectif est enregistré, la fiche affiche « 0 / 12 » (ou la
   progression actuelle) et le journal trace « — → 12 ».
2. **Given** un objectif de 12 et 7 matchs validés (dont 1 forfait) et 1 en attente, **when** le joueur
   ouvre son accueil, **then** il voit 6 / 12, le palier « mi-parcours », « encore 6 matchs » et 1 match en
   attente distinct des matchs joués.
3. **Given** 12 matchs comptés sur 12, **then** il voit « Objectif atteint » ; avec 14, « Objectif dépassé
   (+2) ».
4. **Given** un joueur sans objectif pour la saison affichée, **then** aucun indicateur n'apparaît.
5. **Given** une saison clôturée, **when** l'admin ouvre la fiche, **then** l'objectif et le résultat final
   sont affichés sans champ de saisie.
6. **Given** la préférence « réduire les animations », **then** l'indicateur s'affiche directement dans son
   état final.

## 6. Cas limites

| Cas | Comportement |
|---|---|
| Valeur non entière, 0, négative ou > 200 | Refusée avec un message ; l'objectif précédent est conservé. |
| Objectif abaissé sous le nombre de matchs déjà joués | Accepté : le joueur passe en « objectif dépassé ». |
| Joueur retiré de la saison | Son objectif disparaît avec l'engagement. |
| Objectif élevé (ex. 40) | L'indicateur reste lisible : la représentation s'adapte (pas un symbole par match au-delà d'un seuil). |
| Admin, ou joueur non engagé dans la saison affichée | Pas d'indicateur. |

## 7. Principes de la constitution concernés

- **III** — aucune donnée personnelle : l'objectif est un nombre rattaché à un pseudo et à une saison.
- **II** — l'objectif n'est pas une règle de barème : aucun point, aucun recalcul.
- **V** — indicateur doublé de texte, contraste AA, animation désactivable, utilisable à 375 px.
- **VI** — saisie réservée à l'admin, vérifiée côté serveur ; action tracée.

## 8. Clarifications

- **C-501 · Tranche d'âge** — *abandonné en v2* : l'objectif est individuel.
- **C-502 · Matchs comptés** : validés, hors forfaits ; abandons inclus ; matchs en attente affichés à part.
- **C-503 · Saisie** : sur la fiche joueur uniquement (pas de saisie en lot pour l'instant). Une saisie en lot
  depuis la page Engagements pourra être ajoutée si le club le demande.
- **C-504 · Saison** : l'objectif est attaché à l'engagement (saison × joueur), modifiable tant que la
  saison est en brouillon ou ouverte.
- **C-505 · Dépassement** : affiché comme une réussite (« +*k* »), jamais comme une erreur.
- **C-506 · Représentation ludique** : **à choisir sur la maquette** `design/maquettes/15-objectif-matchs.html`
  — variante 1 « L'échange » (la balle traverse le court), variante 2 « Le tube de balles » (une balle par
  match). `[NEEDS CLARIFICATION]`
