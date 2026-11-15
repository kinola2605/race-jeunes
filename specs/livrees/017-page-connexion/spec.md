# Spécification fonctionnelle — Page de connexion revue

**Branche** `feat/017-page-connexion` · **Créée** 2026-11-15 · **Statut** Déployée (v1.14.0, 2026-11-15) · **Origine**
demande du mainteneur : « revoir l'UX de la page de connexion ; elle n'est pas centrée sur l'écran en mode PC »

> Ce document décrit le **quoi** et le **pourquoi**. La constitution reste la règle
> (`.specify/memory/constitution.md`) ; les exigences existantes sont dans `specs/livrees/001-race-jeunes/spec.md`.

## 1. Besoin

La page de connexion est le premier écran vu par un joueur, un parent ou un enseignant. Constats sur la v1.13.0 :

1. **Décalage sur PC.** À partir de 1024 px de large, l'application réserve une colonne de 248 px à la barre
   latérale. Les pages **sans** barre latérale (connexion, installation, mot de passe, accès refusé, hors
   connexion, page introuvable) héritent de cette colonne vide : leur contenu est décalé de 124 px vers la
   droite.
2. **Contenu collé en haut.** Sur un grand écran, le formulaire occupe le tiers supérieur et laisse le reste
   vide.
3. **Erreur coûteuse.** Après un mot de passe faux, le pseudo est effacé : il faut tout ressaisir.
4. **Champs vides envoyés au serveur.** Valider sans rien saisir affiche « Pseudo ou mot de passe incorrect »
   et compte comme un échec dans le verrouillage anti-abus (FR-004).
5. **Aide trop présente.** Trois paragraphes d'aide permanents pèsent autant que le formulaire lui-même.
6. **Majuscules verrouillées.** Rien ne le signale, alors que c'est une cause fréquente d'échec.

## 2. Personas concernés

- **Joueur** (souvent sur téléphone, parfois sur l'ordinateur familial) et **parent**.
- **Admin / enseignant** (le plus souvent sur PC).

## 3. User stories

- **US-C1** — Sur PC, je vois le formulaire de connexion au centre de l'écran, dans un bloc clairement délimité.
- **US-C2** — Si je me trompe de mot de passe, mon pseudo reste saisi et je peux retaper directement le mot de
  passe.
- **US-C3** — Si j'oublie un champ, on me le dit tout de suite, sous le champ, sans compter un échec.
- **US-C4** — Si mes majuscules sont verrouillées, je suis prévenu pendant que je tape mon mot de passe.
- **US-C5** — Je trouve l'aide (« mot de passe oublié », « pas encore de compte ») quand j'en ai besoin, sans
  qu'elle encombre l'écran.

## 4. Exigences fonctionnelles

| ID | Exigence |
|---|---|
| FR-1700 | Les pages **sans navigation** (connexion, installation, mot de passe, accès refusé, hors connexion, page introuvable) sont **centrées horizontalement** à toutes les largeurs : la colonne de la barre latérale ne s'applique qu'aux pages qui en ont une. |
| FR-1701 | La page de connexion est **centrée verticalement** dans la fenêtre quand la hauteur le permet ; sinon elle défile normalement, sans contenu coupé. |
| FR-1702 | À partir de 600 px de large, le formulaire est présenté dans une **carte** (fond distinct, coins arrondis). En dessous, il occupe toute la largeur, sans carte. |
| FR-1703 | En-tête : logo du club, nom du club (s'il est défini), nom de l'application en titre, et une phrase d'accroche : « Connectez-vous avec le pseudo remis par votre club. » |
| FR-1704 | Après un échec, le **pseudo saisi est conservé** ; le mot de passe est vidé et reçoit le focus. Le message d'erreur reste générique (FR-003 inchangée) et est annoncé aux lecteurs d'écran. |
| FR-1705 | Un champ vide est signalé **sous le champ** (« Saisissez votre pseudo. », « Saisissez votre mot de passe. »), le focus va sur le premier champ en erreur, et **aucune requête** n'est envoyée (donc aucun échec compté). |
| FR-1706 | Pendant la saisie du mot de passe, un message « Verrouillage des majuscules activé » apparaît tant que la touche est active. |
| FR-1707 | Sur un appareil à souris et clavier, le champ Pseudo reçoit le focus à l'ouverture de la page. Pas sur un écran tactile (le clavier virtuel masquerait la page). |
| FR-1708 | L'aide devient deux rubriques **repliées** sous le bouton : « Mot de passe oublié ? » et « Pas encore de compte ? ». Les textes actuels sont conservés. Toujours **aucun lien ni bouton d'inscription** (FR-002). |
| FR-1709 | La mention « Aucune donnée personnelle collectée, aucun cookie de suivi. » reste visible en permanence, sous la carte. |
| FR-1710 | Libellés, noms des champs, bouton « Se connecter », adresse `/connexion`, redirections après connexion et verrouillage anti-abus sont **inchangés**. Thèmes clair et sombre pris en charge ; cibles tactiles ≥ 44 px ; contrastes AA. |

## 5. Critères d'acceptation (Given / When / Then)

1. **Given** une fenêtre de 1440 × 900, **when** j'ouvre `/connexion`, **then** le centre de la carte est au
   centre de la fenêtre, horizontalement et verticalement (à 2 px près).
2. **Given** une fenêtre de 1440 px, **when** j'ouvre `/installation` (sans admin), une page inconnue ou
   `/mot-de-passe`, **then** le contenu est centré horizontalement.
3. **Given** un téléphone (412 px), **when** j'ouvre `/connexion`, **then** le formulaire occupe la largeur,
   sans carte ni défilement horizontal.
4. **Given** un pseudo saisi et un mauvais mot de passe, **when** je valide, **then** le message
   « Pseudo ou mot de passe incorrect. » s'affiche, le pseudo est toujours là et le focus est dans le mot de
   passe, vide.
5. **Given** les deux champs vides, **when** je valide, **then** « Saisissez votre pseudo. » apparaît sous le
   champ, le focus y va, et aucun échec n'est compté.
6. **Given** la page de connexion, **when** je déplie « Mot de passe oublié ? », **then** je lis qu'il faut
   demander une réinitialisation à l'administrateur du club.
7. **Given** une page avec barre latérale (accueil, admin), **then** sa mise en page est inchangée.

## 6. Cas limites

| Cas | Comportement |
|---|---|
| Fenêtre très basse (paysage sur téléphone, 360 px de haut) | Pas de centrage vertical forcé : la page défile, le logo n'est pas coupé. |
| Compte verrouillé ou désactivé | Message du serveur inchangé, pseudo conservé. |
| JavaScript indisponible | Le formulaire s'envoie quand même ; les contrôles côté navigateur (champ vide, majuscules, focus) sont absents. |
| Nom de club long | Il passe à la ligne, centré, sans élargir la carte. |
| Gestionnaire de mots de passe | Les attributs `autocomplete` (`username`, `current-password`) sont conservés. |

## 7. Hors périmètre

- Réinitialisation du mot de passe en autonomie, « se souvenir de moi », connexion par un tiers : les comptes
  restent gérés par le club (constitution IV).
- Refonte des écrans d'installation et de changement de mot de passe (seul leur centrage est corrigé).

## 8. Sécurité et données

- Aucune donnée nouvelle, aucune migration.
- Le pseudo renvoyé après un échec est celui que l'utilisateur vient de saisir ; le mot de passe n'est jamais
  renvoyé.
- Le contrôle des champs vides côté navigateur est un confort : le serveur continue de tout vérifier.
