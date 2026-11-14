# Spécification fonctionnelle — Profil mental calculé

**Branche** `feat/012-profil-mental` · **Créée** 2026-11-14 · **Statut** Déployée (v1.11.0, 2026-11-14) · **Origine** demande du
club (proposition 1 sur le suivi du mental en match)

> Ce document décrit le **quoi** et le **pourquoi**, sans choix technique. La constitution reste la règle
> (`.specify/memory/constitution.md`) ; les exigences existantes sont dans `specs/livrees/001-race-jeunes/spec.md`.

## 1. Besoin

Les entraîneurs jugent le mental d'un joueur en match à quelques situations précises : le tie-break, le set
décisif, le match mal engagé, l'adversaire mieux ou moins bien classé. Tout cela se lit déjà dans les matchs
enregistrés. L'application calcule donc ces indicateurs **sans rien demander à saisir** : ils sont objectifs, ils
ne dépendent pas de la bonne volonté du joueur, ils se suivent d'une saison à l'autre et se comparent au groupe.
Ils serviront de point de comparaison aux propositions 2 et 3 (à spécifier séparément).

## 2. Persona concerné

- **Admin** (encadrement, entraîneurs) : lit le profil mental d'un joueur sur sa fiche.

## 3. Exigences

| ID | Exigence |
|---|---|
| FR-1200 | La fiche d'un joueur (E08a, détail) présente une carte « Profil mental » : cinq indicateurs calculés sur les matchs **validés** d'une saison où il est engagé. Rien n'est saisi ni enregistré : le calcul est refait à chaque affichage, une correction de match s'y reflète aussitôt. |
| FR-1201 | **Tie-breaks** : gagnés / joués. Un tie-break est un set conclu 7/6 (ou 5/4 dans les formats courts jeunes). |
| FR-1202 | **Sets décisifs** : gagnés / joués. Un set décisif est le troisième set d'un match, qu'il soit joué en set complet ou en super tie-break. Le super tie-break compte ici, pas dans les tie-breaks. |
| FR-1203 | **Retours** : victoires / matchs dont le premier set a été perdu (matchs d'au moins deux sets). |
| FR-1204 | **Face à un mieux classé** : perfs / matchs joués contre un adversaire mieux classé. |
| FR-1205 | **Face à un moins bien classé** : contre-perfs (défaites) / matchs joués contre un adversaire moins bien classé. C'est le seul indicateur où un pourcentage bas est le bon signe ; l'écran le dit. |
| FR-1206 | Un **forfait** n'est jamais compté (match non joué). Un **abandon** compte pour les tie-breaks réellement joués et pour les indicateurs de classement, mais ni pour les sets décisifs ni pour les retours (le match n'est pas allé à son terme). |
| FR-1207 | Mieux ou moins bien classé s'entend avec les classements de référence figés à la validation du match (FR-106) et l'écart enregistré avec les points : la « perf » du profil est la même que celle du classement de la Race. À classement égal, le match ne compte dans aucun des deux indicateurs. |
| FR-1208 | Chaque indicateur est comparé au **groupe** : le même rapport, cumulé sur tous les engagés de la saison (joueur compris). |
| FR-1209 | Chaque indicateur affiche le pourcentage **et** les nombres (« 2 gagnés sur 3 joués ») ; une situation jamais rencontrée affiche « — », jamais 0 %. Aucune information n'est portée par la seule couleur ou la seule jauge. |
| FR-1210 | Si le joueur a plusieurs saisons, on choisit la saison détaillée (la plus récente par défaut) et un tableau « D'une saison à l'autre » aligne les cinq indicateurs de toutes ses saisons. Les saisons en brouillon sont ignorées. |
| FR-1211 | Le profil mental est réservé à l'admin : il n'apparaît sur aucun écran du joueur. |

## 4. Décisions par défaut

- **Score « facultatif »** : dans l'application, seul le forfait n'a pas de score ; tout match joué en a un. La
  limite annoncée (« l'indicateur ne compte que les matchs où le score a été saisi ») ne retire donc que les
  forfaits. Un score illisible serait ignoré pour les trois indicateurs de score, sans erreur.
- **Moyenne du groupe** : rapport cumulé (toutes les situations du groupe), et non moyenne des pourcentages
  individuels, pour qu'un joueur à un seul tie-break ne pèse pas autant qu'un joueur à vingt.
- **Visibilité** : admin seulement (FR-1211). Montrer ses contre-perfs et sa place par rapport au groupe à un
  jeune joueur est un choix pédagogique qui revient au club ; à rouvrir avec les propositions 2 et 3.
- **Pas de seuil minimal** de matchs : le nombre de situations est toujours affiché à côté du pourcentage.

## 5. Hors périmètre

Vue d'ensemble de tous les joueurs d'une saison, export CSV du profil, affichage côté joueur, propositions 2 et 3.

## 6. Données et migration

Aucune donnée nouvelle, aucune migration. Les indicateurs sont dérivés de matchs que le joueur consulte déjà :
rien à ajouter à l'espace RGPD (spec 008).

Pour les démonstrations, `npm run db:seed:volume` injecte un jeu **fictif** et repérable (saisons « Démo · … »,
joueurs étiquetés « Jeu de données ») ; `-- --purge` le retire entièrement.

## 7. Vérification

- Tests unitaires du calcul (`src/mental/profile.test.ts`) : chaque exigence FR-1201 à FR-1206 par l'exemple.
- Test E2E `tests/e2e/profil-mental.spec.ts` : lecture par l'admin, changement de saison, absence côté joueur.
