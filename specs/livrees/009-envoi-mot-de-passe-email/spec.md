# Spécification fonctionnelle — Envoi du mot de passe par e-mail

**Branche** `009-envoi-mot-de-passe-email` · **Créée** 2026-11-13 · **Statut** Déployée (v1.8.0, 2026-11-13) · **Origine** EV-12
(`specs/002-evolutions-club/spec.md`)

> Ce document décrit le **quoi** et le **pourquoi**, sans choix technique. La constitution reste la règle
> (`.specify/memory/constitution.md`) ; les exigences existantes sont dans `specs/livrees/001-race-jeunes/spec.md`.

## 1. Besoin

Pouvoir envoyer le mot de passe par e-mail à la création du joueur.

Aujourd'hui, l'admin recopie ou imprime le mot de passe temporaire (FR-021). Quand le joueur n'est pas au club,
il faut le lui transmettre autrement, le plus souvent par e-mail aux parents.

**Contrainte** : la constitution III interdit de collecter ou de stocker une adresse e-mail et d'envoyer des
données à un service externe. L'envoi se fait donc **depuis la messagerie de l'admin** : l'application prépare
le message, l'admin choisit le destinataire et l'envoie. L'application ne connaît jamais l'adresse (voir §8).

## 2. Personas concernés

- **Admin** : crée ou réinitialise un compte et transmet les identifiants par e-mail.
- **Joueur / parents** : reçoivent un message clair avec l'adresse de l'application, le pseudo et le mot de
  passe temporaire.

## 3. User stories

- **US-M1** — En tant qu'admin, après avoir créé un joueur, je clique « Envoyer par e-mail » et ma messagerie
  s'ouvre avec un message prêt : je n'ai qu'à saisir l'adresse et envoyer.
- **US-M2** — En tant qu'admin, après une réinitialisation, j'envoie le nouveau mot de passe de la même façon.

## 4. Exigences fonctionnelles

| ID | Exigence | Écran |
|---|---|---|
| FR-900 | L'écran de remise du mot de passe (E08c) propose, à côté de « Copier » et « Imprimer la fiche », un bouton **« Envoyer par e-mail »**. | E08c |
| FR-901 | Le bouton ouvre la messagerie de l'appareil avec un message pré-rempli : sujet « `<nom de l'app>` — vos identifiants » ; corps avec le nom de l'app (et du club s'il est configuré), l'**adresse de l'application**, le **pseudo**, le **mot de passe temporaire**, les consignes (se connecter, changer immédiatement le mot de passe) et le rappel « ne notez jamais votre nom réel ; supprimez ce message après votre première connexion ». | E08c |
| FR-902 | Le message n'a **aucun destinataire** pré-rempli : l'application ne demande, ne reçoit ni ne conserve aucune adresse e-mail, et n'appelle aucun service d'envoi. Une aide sous les boutons l'explique. | E08c |
| FR-903 | Le formulaire de création de joueur ne comporte toujours **aucun champ e-mail**. | E08b |
| FR-904 | Le même bouton est proposé après une **réinitialisation** du mot de passe (FR-024). | E08a |
| FR-905 | La case de confirmation devient « J'ai remis, imprimé ou envoyé le mot de passe » ; le mot de passe reste affiché une seule fois (FR-021). | E08c |

## 5. Critères d'acceptation (Given / When / Then)

1. **Given** un admin qui vient de créer `ace_01`, **when** il regarde l'écran de remise, **then** un lien
   « Envoyer par e-mail » est visible, de la forme `mailto:?subject=…&body=…`, sans destinataire.
2. **Given** ce lien, **then** le corps contient `Pseudo : ace_01`, le mot de passe temporaire affiché et
   l'adresse de l'application.
3. **Given** le formulaire de création, **then** il ne contient aucun champ e-mail.
4. **Given** un admin qui réinitialise le mot de passe d'un joueur, **then** le lien contient le **nouveau**
   mot de passe.

## 6. Cas limites

| Cas | Comportement |
|---|---|
| Aucune messagerie configurée sur l'appareil | Le navigateur ne fait rien ou propose une application ; « Copier » et « Imprimer » restent disponibles. |
| Import CSV (plusieurs joueurs) | Pas d'envoi groupé : la fiche imprimable reste la solution ; pour un joueur précis, la réinitialisation propose l'envoi. |
| Nom de club non configuré | Le corps mentionne seulement le nom de l'app. |
| Pseudo avec caractères spéciaux (`&`, `.`) | Sujet et corps encodés : le message est fidèle. |
| Message mal adressé ou intercepté | Le mot de passe est temporaire et doit être changé à la première connexion ; l'admin peut réinitialiser. |

## 7. Principes de la constitution concernés

- **III** — aucune adresse e-mail saisie ni stockée par l'application ; aucun service d'envoi externe : le
  message part de la messagerie de l'admin, sous sa responsabilité.
- **IV** — le mot de passe temporaire reste généré aléatoirement, affiché une seule fois, jamais stocké en
  clair ; changement obligatoire à la première connexion.
- **VI** — CSP inchangée (le lien `mailto:` est une navigation locale).
- **VIII** — bouton étiqueté avec icône, cible ≥ 44 px, aide reliée par `aria-describedby`.
- **IX** — un simple lien, sans serveur d'envoi ni file d'attente.

## 8. Clarifications

- **2026-11-13 · Envoi par l'application (SMTP / service d'e-mail)** → **écarté par défaut** : il faudrait
  saisir l'adresse dans l'application et la transmettre à un prestataire, ce que la constitution III interdit.
  Décision : lien `mailto:` vers la messagerie de l'admin. Un envoi direct par l'application demanderait un
  **amendement de la constitution** (version majeure) et un prestataire d'e-mail hébergé dans l'UE.
- **Destinataire pré-rempli** → non : une saisie d'adresse dans l'application, même transitoire, serait une
  collecte au sens de III.
