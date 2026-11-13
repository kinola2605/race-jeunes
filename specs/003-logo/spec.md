# Spécification fonctionnelle — Logo

**Branche** `003-004-identite-club` · **Créée** 2026-11-13 · **Statut** Implémentée · **Origine** EV-06
(`specs/002-evolutions-club/spec.md`)

> Ce document décrit le **quoi** et le **pourquoi**, sans choix technique. La constitution reste la règle
> (`.specify/memory/constitution.md`) ; les exigences existantes sont dans `specs/001-race-jeunes/spec.md`.

## 1. Besoin

Pouvoir configurer un logo côté admin pour remplacer le logo par défaut.

## 2. Personas concernés

- **Admin** : dépose, remplace ou retire le logo du club.
- **Tous les utilisateurs** (y compris non connectés sur la page de connexion) : voient le logo.

## 3. User stories

- **US-L1** — En tant qu'admin, je dépose le logo du club depuis l'interface d'administration ; il remplace
  le logo par défaut partout dans l'application, sans redéploiement.
- **US-L2** — En tant qu'admin, je reviens au logo par défaut.

## 4. Exigences fonctionnelles

| ID | Exigence | Écran |
|---|---|---|
| FR-300 | Depuis la page « Apparence » (`/admin/apparence`, accessible depuis « Mon compte »), l'admin dépose **un seul logo** : PNG, JPEG, WebP ou SVG, 512 Ko au plus. | Apparence |
| FR-301 | Le logo déposé est utilisé dans les **deux thèmes** et partout où le logo apparaît : en-tête, navigation, connexion, fiche imprimable des mots de passe, **icône de l'application** (onglet du navigateur, icône de l'appli installée). | toutes |
| FR-302 | La page montre l'aperçu du logo actuel sur fond sombre et sur fond clair. | Apparence |
| FR-303 | L'admin peut retirer le logo déposé : l'application revient au logo par défaut (celui de la configuration du serveur s'il existe, sinon le logo du projet). | Apparence |
| FR-304 | Le type réel du fichier est contrôlé d'après son contenu (et non son nom) ; un fichier vide, trop lourd ou d'un autre type est refusé avec un message explicite. | Apparence |
| FR-305 | Le logo est servi par l'application elle-même (aucune origine tierce, constitution III) et accessible sans connexion (page de connexion). | — |
| FR-306 | Chaque dépôt ou retrait est tracé dans le journal d'audit (type « Apparence »), sans le contenu du fichier. | Journal |

## 5. Critères d'acceptation (Given / When / Then)

1. **Given** un admin sur « Apparence », **when** il dépose un PNG de 40 Ko, **then** le logo apparaît
   dans l'en-tête des deux thèmes et sur la page de connexion, et une entrée « Apparence » est ajoutée au
   journal.
2. **Given** un fichier `logo.png` qui contient en réalité du texte, **when** l'admin le dépose, **then**
   il est refusé (« Format non reconnu… ») et le logo actuel est conservé.
3. **Given** un logo déposé, **when** l'admin clique « Revenir au logo par défaut », **then** le logo
   par défaut réapparaît partout.
4. **Given** un joueur, **when** il ouvre `/admin/apparence`, **then** l'accès est refusé.

## 6. Cas limites

| Cas | Comportement |
|---|---|
| Logo non carré | Affiché en entier, proportions conservées, dans le cadre prévu. |
| Application déjà installée sur un téléphone | La nouvelle icône peut n'apparaître qu'après réinstallation (dépend du téléphone). |
| SVG contenant du script | Le fichier n'est jamais exécuté : il est affiché comme une image et servi avec une politique qui interdit tout script. |
| Base de données indisponible | Le logo par défaut est affiché ; l'application reste utilisable. |

## 7. Principes de la constitution concernés

- **III** — fichier servi par l'application, aucune ressource tierce ; aucune donnée personnelle.
- **VI** — page et action réservées à l'admin, vérifiées côté serveur ; action tracée.

## 8. Clarifications

### Session 2026-11-13

- **Q : Combien de logos ?** → Un seul, utilisé dans les deux thèmes.
- **Q : Le logo remplace-t-il l'icône de l'application ?** → Oui (onglet et icône de l'appli installée).
