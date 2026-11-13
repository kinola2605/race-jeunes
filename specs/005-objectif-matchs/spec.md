# Spécification fonctionnelle — Objectif du nombre de matchs par saison et par tranche d'âge

**Branche** `005-objectif-matchs` · **Créée** 2026-11-13 · **Statut** Implémentée · **Origine** EV-08
(`specs/002-evolutions-club/spec.md`)

> Ce document décrit le **quoi** et le **pourquoi**, sans choix technique. La constitution reste la règle
> (`.specify/memory/constitution.md`) ; les exigences existantes sont dans `specs/livrees/001-race-jeunes/spec.md`.

## 1. Besoin

Objectif du nombre de matchs à jouer par saison et par tranche d'âge — juste un tableau côté admin
à remplir et un indicateur de suivi pour le joueur.

L'objectif est un **repère d'assiduité** : il n'attribue aucun point et ne change pas le classement.

## 2. Personas concernés

- **Admin** : fixe, pour chaque saison, le nombre de matchs attendu par tranche.
- **Joueur** : voit où il en est par rapport à son objectif.

## 3. User stories

- **US-O1** — En tant qu'admin, je remplis un tableau « tranche → nombre de matchs » pour une saison, avec
  un objectif par défaut pour les engagés hors tranche.
- **US-O2** — En tant qu'admin, je vois dans ce tableau combien d'engagés sont concernés par chaque ligne et
  combien ont déjà atteint leur objectif.
- **US-O3** — En tant que joueur, je vois sur mon accueil le nombre de matchs joués par rapport à mon
  objectif de la saison, et ce qu'il me reste à jouer.

## 4. Exigences fonctionnelles

| ID | Exigence | Écran |
|---|---|---|
| FR-500 | Une **tranche** est une **étiquette** de joueur (règle existante FR-020/023, ex. « Mini-tennis », « Groupe 2 ») : l'application ne stocke ni âge ni date de naissance (constitution III). | Joueurs |
| FR-501 | Pour chaque saison, la page « Objectifs » présente un tableau : une ligne **« Tous les engagés (par défaut) »** puis une ligne par étiquette existante, chacune avec un nombre de matchs à saisir (entier de 1 à 200) ; une case vide = pas d'objectif. Un seul enregistrement met à jour tout le tableau. | Objectifs |
| FR-502 | L'objectif d'un engagé est celui de ses étiquettes ; s'il en a plusieurs avec un objectif, c'est le **plus élevé** ; s'il n'en a aucune, c'est l'objectif par défaut ; sinon il n'a pas d'objectif (aucun indicateur). | — |
| FR-503 | Comptent pour l'objectif : les matchs **validés** de la saison où le joueur est l'un des deux côtés, **hors forfaits** (un forfait n'est pas joué) ; un abandon compte. Les matchs en attente sont signalés à part, sans être comptés. | Accueil |
| FR-504 | Pour chaque ligne, le tableau indique « atteint / concernés » : combien d'engagés dont l'objectif retenu vient de cette ligne l'ont atteint, sur leur nombre. | Objectifs |
| FR-505 | Sur son accueil, l'engagé qui a un objectif voit « *n* / *objectif* matchs », une jauge, le nombre restant ou « Objectif atteint », et le nombre de matchs en attente de validation. La jauge est doublée de texte (pas d'information par la couleur seule). | Accueil |
| FR-506 | Les objectifs sont modifiables tant que la saison est en brouillon ou ouverte ; ensuite le tableau est en lecture seule. Ils n'ont aucun effet sur les points ni sur le classement (aucun recalcul). | Objectifs |
| FR-507 | Chaque modification est tracée dans le journal d'audit (type « Saison ») avec les objectifs avant / après. Page et action réservées à l'admin, vérifiées côté serveur. | Journal |
| FR-508 | Un joueur ne voit que **son** objectif et sa progression (règle FR-127 : il ne voit pas les matchs des autres). | Accueil |

## 5. Critères d'acceptation (Given / When / Then)

1. **Given** une saison ouverte et les étiquettes « Mini-tennis » et « Groupe 2 », **when** l'admin saisit
   6 pour « Mini-tennis », 10 pour « Groupe 2 », 8 par défaut et enregistre, **then** les trois objectifs
   sont enregistrés et le journal trace l'avant / après.
2. **Given** un engagé étiqueté « Groupe 2 » avec 3 matchs validés (dont 1 forfait) et 1 en attente,
   **when** il ouvre son accueil, **then** il voit « 2 / 10 matchs », « encore 8 » et « 1 en attente de
   validation ».
3. **Given** un engagé étiqueté à la fois « Mini-tennis » (6) et « Groupe 2 » (10), **then** son objectif
   est 10.
4. **Given** un engagé sans étiquette et un objectif par défaut de 8, **then** son objectif est 8 ; sans
   objectif par défaut, aucun indicateur n'est affiché.
5. **Given** un engagé à 10 matchs validés sur 10, **then** il voit « Objectif atteint » et la ligne de son
   étiquette compte 1 objectif atteint.
6. **Given** une saison clôturée, **when** l'admin ouvre « Objectifs », **then** le tableau est affiché en
   lecture seule.

## 6. Cas limites

| Cas | Comportement |
|---|---|
| Valeur non entière, 0, négative ou > 200 | Refusée, rien n'est enregistré ; le message cite la ligne fautive. |
| Étiquette supprimée ou renommée | L'objectif suit l'étiquette (renommage) ; il disparaît avec elle. |
| Étiquette ajoutée / retirée à un joueur en cours de saison | L'objectif retenu est recalculé à l'affichage, sans trace particulière. |
| Plus de matchs que l'objectif | « Objectif atteint » ; la jauge reste pleine (pas de dépassement affiché). |
| Admin non engagé, joueur non engagé dans la saison | Pas d'indicateur. |
| Aucune étiquette n'existe | Seule la ligne « par défaut » est proposée, avec un lien vers la gestion des joueurs. |

## 7. Principes de la constitution concernés

- **III** — aucune donnée d'âge : la « tranche d'âge » demandée par le club est une **étiquette libre**
  choisie par l'admin. L'avertissement « aucune donnée personnelle » est rappelé sur la page.
- **II** — l'objectif n'est pas une règle de barème : il ne donne aucun point, aucun recalcul.
- **VI** — page et action réservées à l'admin, vérifiées côté serveur ; action tracée.
- **V** — jauge doublée de texte, champs étiquetés, utilisable à 375 px.

## 8. Clarifications

Choix par défaut adoptés sans rendez-vous (à confirmer avec le responsable Race) :

- **C-501 · Tranche = étiquette.** La constitution interdit de stocker l'âge ; les tranches passent donc par
  les étiquettes existantes, que l'admin met à jour en début de saison. Nommer une étiquette d'après une
  catégorie d'âge (ex. « U12 ») révèle indirectement une tranche d'âge : **à valider** avec le club, à
  défaut préférer des noms neutres (« Groupe 1 », « Mini-tennis »).
- **C-502 · Plusieurs étiquettes avec objectif** → le plus élevé.
- **C-503 · Forfaits exclus**, abandons inclus ; seuls les matchs validés comptent.
- **C-504 · Objectif par défaut** pour les engagés sans étiquette ayant un objectif.
- **C-505 · Pas de vue admin par joueur** au-delà des comptes par ligne (« juste un tableau »).
