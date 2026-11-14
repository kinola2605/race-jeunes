# Spécification fonctionnelle — Fiche joueur en onglets

**Branche** `feat/014-fiche-joueur-onglets` · **Créée** 2026-11-14 · **Statut** Déployée (v1.12.0, 2026-11-14) · **Origine**
demande du porteur du projet (« revoir la fiche joueur en mode admin et mettre des onglets », « la fiche mentale
dans un onglet dédié »)

> Ce document décrit le **quoi** et le **pourquoi**, sans choix technique. La constitution reste la règle
> (`.specify/memory/constitution.md`) ; les exigences existantes sont dans `specs/livrees/001-race-jeunes/spec.md`.

## 1. Besoin

La fiche d'un joueur (E08a, détail) a reçu une carte à chaque évolution : objectif de matchs (spec 005), données
RGPD (008), désactivation isolée (011), profil mental (012). Elle empile aujourd'hui six cartes sur une seule
page : sur téléphone, il faut faire défiler tout le profil mental pour atteindre la réinitialisation du mot de
passe, et une action rare et grave (désactiver) côtoie la consultation courante.

## 2. Persona concerné

- **Admin** : seul lecteur de la fiche joueur.

## 3. Exigences

| ID | Exigence |
|---|---|
| FR-1400 | La fiche d'un joueur est découpée en quatre onglets, dans cet ordre : **Profil**, **Saisons**, **Mental**, **Compte**. L'en-tête (avatar, pseudo, état du compte) reste visible sur les quatre. |
| FR-1401 | **Profil** (onglet par défaut) : pseudo, classement, étiquettes (FR-023) et historique du classement. |
| FR-1402 | **Saisons** : engagements du joueur et objectif de matchs par saison (spec 005). **Mental** : le profil mental (spec 012), seul dans son onglet. **Compte** : réinitialisation du mot de passe (FR-024), téléchargement des données (spec 008), désactivation et réactivation (FR-025). |
| FR-1403 | L'onglet affiché est porté par l'adresse de la page : il se partage, se retrouve avec le bouton Retour du navigateur, et l'admin y revient après un enregistrement fait depuis cet onglet (objectif enregistré → Saisons ; compte désactivé ou mot de passe remis → Compte). |
| FR-1404 | L'onglet actif est signalé autrement que par la seule couleur (`aria-current`), les onglets sont des liens atteignables au clavier, d'au moins 44 px de haut. Une valeur d'onglet inconnue affiche Profil. |
| FR-1405 | Chaque onglet ne charge que ses données : le profil mental n'est calculé que lorsque l'onglet Mental est ouvert. |
| FR-1406 | Un joueur sans saison ouverte ni terminée voit, dans l'onglet Mental, un message qui l'explique, au lieu d'un onglet vide. |

## 4. Décisions par défaut

- **Quatre onglets et non trois** : le profil mental a son propre onglet (demande explicite), plutôt que d'être
  rangé avec les saisons.
- **Libellés courts** (« Mental », « Compte ») pour tenir sur une ligne sur téléphone ; le titre complet
  « Profil mental » reste dans l'onglet.
- **Même composant d'onglets** que la file de validation des matchs (spec 011) : pas de nouveau motif visuel.
- **Historique du classement dans Profil**, à côté du champ qu'il historise.

## 5. Hors périmètre

Nouveaux contenus dans la fiche (liste des matchs du joueur, notes), onglets sur d'autres écrans, propositions 2
et 3 sur le suivi du mental.

## 6. Données et migration

Aucune donnée nouvelle, aucune migration, aucune route nouvelle (un paramètre d'adresse).

## 7. Vérification

- Test E2E `tests/e2e/fiche-joueur.spec.ts` : les quatre onglets et leur contenu, l'onglet inconnu, le retour
  sur l'onglet après enregistrement.
- Tests E2E existants adaptés (objectifs, profil mental, RGPD, envoi par e-mail, désactivation).
