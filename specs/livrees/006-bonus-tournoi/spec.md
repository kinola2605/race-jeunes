# Spécification fonctionnelle — Bonus gain tournoi

**Branche** `006-bonus-tournoi` · **Créée** 2026-11-13 · **Statut** Déployée (v1.5.0, 2026-11-13) · **Origine** EV-09
(`specs/002-evolutions-club/spec.md`)

> Ce document décrit le **quoi** et le **pourquoi**, sans choix technique. La constitution reste la règle
> (`.specify/memory/constitution.md`) ; les exigences existantes sont dans `specs/livrees/001-race-jeunes/spec.md`.

## 1. Besoin

Bonus gain tournoi à prévoir. Plusieurs victoires dans un même tournoi = des points gagnés.

Aujourd'hui un match n'est rattaché à aucune compétition : chaque victoire rapporte ses points selon l'écart
de classement, et seul le bonus d'assiduité récompense le volume. Le club veut **récompenser le parcours
dans un tournoi** : enchaîner les tours rapporte des points en plus de ceux de chaque match.

Le bonus est une **règle de barème** de la saison (principe II) : il se paramètre, se simule et se publie
avec le barème, et il est recalculé avec lui.

## 2. Personas concernés

- **Admin** : active et règle le bonus dans le barème de la saison ; voit le tournoi de chaque match à la
  validation.
- **Joueur** : indique, en déclarant un match, le tournoi dans lequel il l'a joué ; voit ses bonus.

## 3. User stories

- **US-T1** — En tant que joueur, quand je déclare un match joué en tournoi, j'indique le nom du tournoi (en
  reprenant de préférence un nom déjà utilisé dans la saison).
- **US-T2** — En tant qu'admin, dans le barème, j'active un bonus « à partir de *N* victoires dans un même
  tournoi, *P* points par victoire », et je vois son effet avant de publier.
- **US-T3** — En tant que joueur ou admin, je vois dans le classement et dans le détail du calcul les bonus
  tournoi obtenus, tournoi par tournoi.

## 4. Exigences fonctionnelles

| ID | Exigence | Écran |
|---|---|---|
| FR-600 | Un match peut porter un **nom de tournoi** facultatif (2 à 80 caractères), saisi par le joueur qui déclare ou par l'admin qui saisit. Le formulaire propose les noms déjà utilisés dans la saison. Le champ rappelle de ne saisir aucune donnée personnelle. | Saisie de match |
| FR-601 | Deux matchs appartiennent au **même tournoi** s'ils sont de la même saison et que leurs noms sont identiques après normalisation (casse, accents et espaces ignorés) : « TMC Pâques » = « tmc  paques ». | — |
| FR-602 | Le barème comporte une règle **Bonus tournoi**, désactivée par défaut, réglée par deux valeurs : **à partir de *N* victoires** (2 à 20) et ***P* points** (0 à 1000) par victoire à partir de la *N*-ième. Bonus d'un tournoi = (victoires − *N* + 1) × *P* si victoires ≥ *N*, sinon 0. Exemple *N* = 2, *P* = 10 : 1 victoire → 0, 2 → 10, 3 → 20, 4 → 30. | Barème |
| FR-603 | Comptent comme victoires de tournoi les matchs **validés** gagnés portant ce tournoi, **hors victoires par forfait** ; une victoire sur abandon compte. Défaites, matchs en attente, refusés ou annulés ne comptent pas. | — |
| FR-604 | Le bonus tournoi s'ajoute aux points du joueur, comme le bonus d'assiduité, et n'est pas soumis au plafond par match. La colonne « Bonus » du classement et de l'export additionne les deux bonus ; l'export ajoute les colonnes `bonus_assiduite` et `bonus_tournoi`. | Classement, export |
| FR-605 | Le détail du calcul d'un joueur liste chaque tournoi ayant rapporté un bonus : « Bonus tournoi — *nom* (*v* victoires) : *b* pts ». Dans « Mes matchs », le nom du tournoi apparaît sur le match. | Classement, Mes matchs |
| FR-606 | La file de validation de l'admin et la liste des matchs affichent le nom du tournoi. | Matchs (admin) |
| FR-607 | Le bonus tournoi suit le cycle de vie du barème : modifié dans un brouillon, il est visible dans l'**impact avant publication** et ne s'applique qu'à la publication (FR-064 à FR-066). Le simulateur rappelle la règle active. | Barème |

## 5. Critères d'acceptation (Given / When / Then)

1. **Given** un barème publié avec bonus tournoi *N* = 2, *P* = 10, **when** AceDuMatin a 3 victoires
   validées au « TMC Pâques », **then** son bonus tournoi vaut 20 et ses points augmentent de 20.
2. **Given** 2 victoires validées dont une par forfait au même tournoi, **then** aucun bonus (1 victoire
   comptée).
3. **Given** deux matchs déclarés « TMC Pâques » et « tmc paques », **then** ils comptent pour le même tournoi.
4. **Given** le bonus désactivé dans un brouillon, **when** l'admin consulte l'impact, **then** les joueurs
   concernés apparaissent avec leurs points avant / après ; rien ne change tant qu'il n'a pas publié.
5. **Given** un match sans nom de tournoi, **then** il ne compte pour aucun bonus tournoi.
6. **Given** le détail du calcul d'un joueur avec un bonus, **then** la ligne « Bonus tournoi — TMC Pâques
   (3 victoires) : 20 » apparaît et le total est juste.

## 6. Cas limites

| Cas | Comportement |
|---|---|
| Nom de 1 caractère ou de plus de 80 | Refusé avec un message ; le match n'est pas enregistré. |
| Nom vide ou fait d'espaces | Le match n'est pas un match de tournoi. |
| Même tournoi écrit différemment (fautes) | Deux tournois distincts. L'admin peut refuser le match en attente pour le faire redéclarer, ou annuler un match validé et le ressaisir. Les noms déjà utilisés sont proposés pour limiter le cas. |
| Barème antérieur à la règle | Lu comme « bonus tournoi désactivé ». |
| Match annulé | Sa victoire ne compte plus ; le bonus est recalculé à l'affichage. |

## 7. Principes de la constitution concernés

- **II** — règle de barème versionnée : simulable, publiée, recalculée ; jamais appliquée en douce.
- **III** — le nom du tournoi est un libellé de compétition, pas une donnée personnelle (rappel affiché).
- **V** — formulaire utilisable à 375 px, libellés explicites.
- **VI** — saisie contrôlée côté serveur ; validation par l'admin inchangée.

## 8. Clarifications (choix par défaut, à confirmer avec le responsable)

- **C-601** — Bonus progressif « par victoire à partir de la *N*-ième » plutôt qu'un forfait unique par
  tournoi : plus le parcours est long, plus il rapporte.
- **C-602** — Les victoires par forfait ne comptent pas (cohérent avec l'objectif de matchs, C-502).
- **C-603** — Le tournoi est un libellé libre attaché au match, pas une entité gérée par l'admin : pas de
  calendrier des tournois à tenir à jour.
- **C-604** — Le bonus n'est pas plafonné par le plafond par match.
