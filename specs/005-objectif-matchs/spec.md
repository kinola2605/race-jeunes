# Spécification fonctionnelle — Objectif du nombre de matchs par saison

**Branche** `005-objectif-matchs` · **Créée** 2026-11-13 · **Révisée** 2026-11-13 (v3 : objectif simple par
joueur et par saison) · **Statut** Implémentée · **Origine** EV-08 (`specs/002-evolutions-club/spec.md`)

> Ce document décrit le **quoi** et le **pourquoi**, sans choix technique. La constitution reste la règle
> (`.specify/memory/constitution.md`) ; les exigences existantes sont dans `specs/livrees/001-race-jeunes/spec.md`.

## 1. Besoin

Un **objectif quantitatif** de matchs à jouer, **par joueur et par saison**, fixé par l'admin, et suivi
simplement par le joueur sur son accueil.

Historique : la v1 (objectif par tranche d'âge) et la v2 (représentation ludique) ont été abandonnées à la
demande du responsable au profit d'un fonctionnement simple.

L'objectif est un **repère d'assiduité** : il n'attribue aucun point et ne change pas le classement.

## 2. Personas concernés

- **Admin** : fixe l'objectif de chaque joueur, saison par saison.
- **Joueur** : voit où il en est.

## 3. User stories

- **US-O1** — En tant qu'admin, sur la fiche d'un joueur, je fixe son objectif de matchs pour chaque saison
  où il est engagé, et je vois où il en est.
- **US-O2** — En tant que joueur, je vois sur mon accueil le nombre de matchs joués par rapport à mon
  objectif de la saison.

## 4. Exigences fonctionnelles

| ID | Exigence | Écran |
|---|---|---|
| FR-500 | L'objectif est un nombre entier de matchs (1 à 200) attaché à l'**engagement** d'un joueur dans une saison. Sans objectif, rien n'est affiché au joueur. | — |
| FR-501 | Sur la fiche du joueur, la carte « Saisons » liste ses engagements avec, pour chacun, la progression « *n* / *objectif* matchs » ; pour une saison en brouillon ou ouverte, un champ permet de fixer, modifier ou effacer l'objectif (vide = aucun). Pour une saison clôturée ou archivée, l'objectif est affiché en lecture seule. | Fiche joueur |
| FR-502 | Comptent pour l'objectif : les matchs **validés** de la saison où le joueur est l'un des deux côtés, **hors forfaits** ; un abandon compte. Les matchs en attente ne comptent pas. | — |
| FR-503 | Sur son accueil, l'engagé qui a un objectif pour la saison affichée voit « *n* / *objectif* matchs », une jauge, le nombre de matchs restants ou « Objectif atteint », et le nombre de matchs en attente de validation. La jauge est doublée de texte. | Accueil |
| FR-504 | Chaque modification est tracée dans le journal d'audit (type « Engagement ») avec l'ancienne et la nouvelle valeur. Saisie réservée à l'admin, vérifiée côté serveur. | Journal |
| FR-505 | Un joueur ne voit que **son** objectif (règle FR-127). L'objectif n'a aucun effet sur les points ni le classement. | Accueil |

## 5. Critères d'acceptation (Given / When / Then)

1. **Given** AceDuMatin engagé dans la saison ouverte, **when** l'admin saisit 12 sur sa fiche pour cette
   saison, **then** l'objectif est enregistré, la fiche affiche « *n* / 12 » et le journal trace « — → 12 ».
2. **Given** un objectif de 12, 7 matchs validés dont 1 forfait et 1 en attente, **then** l'accueil du
   joueur affiche « 6 / 12 matchs », « encore 6 » et « 1 en attente de validation ».
3. **Given** 12 matchs comptés sur 12 (ou plus), **then** l'accueil affiche « Objectif atteint ».
4. **Given** un objectif effacé (champ vide), **then** l'accueil n'affiche plus l'indicateur.
5. **Given** une saison clôturée, **then** la fiche affiche l'objectif sans champ de saisie.

## 6. Cas limites

| Cas | Comportement |
|---|---|
| Valeur non entière, 0, négative ou > 200 | Refusée avec un message ; l'objectif précédent est conservé. |
| Objectif abaissé sous le nombre de matchs déjà joués | Accepté : « Objectif atteint ». |
| Joueur retiré de la saison | L'objectif disparaît avec l'engagement. |

## 7. Principes de la constitution concernés

- **III** — aucune donnée personnelle : un nombre rattaché à un pseudo et à une saison.
- **II** — pas une règle de barème : aucun point, aucun recalcul.
- **V** — jauge doublée de texte, utilisable à 375 px.
- **VI** — saisie réservée à l'admin, vérifiée côté serveur, tracée.

## 8. Clarifications

- **C-501** — Objectif individuel, par saison ; pas de tranche d'âge (v1 abandonnée).
- **C-502** — Matchs comptés : validés, hors forfaits ; abandons inclus.
- **C-503** — Saisie sur la fiche joueur uniquement ; affichage simple (v2 « ludique » abandonnée).
