# Spécification fonctionnelle — Couleurs du site

**Branche** `003-004-identite-club` · **Créée** 2026-11-13 · **Statut** Implémentée · **Origine** EV-07
(`specs/002-evolutions-club/spec.md`)

> Ce document décrit le **quoi** et le **pourquoi**, sans choix technique. La constitution reste la règle
> (`.specify/memory/constitution.md`) ; les exigences existantes sont dans `specs/001-race-jeunes/spec.md`.

## 1. Besoin

Possibilité de configurer les deux couleurs principales (thème noir et thème clair) depuis l'interface admin.

## 2. Personas concernés

- **Admin** : choisit les couleurs du club.
- **Tous les utilisateurs** : voient l'application aux couleurs du club.

## 3. User stories

- **US-C1** — En tant qu'admin, je choisis la couleur d'accent et la couleur d'action de chaque thème
  (sombre et clair) ; l'application les applique immédiatement pour tout le monde.
- **US-C2** — En tant qu'admin, si une couleur rend l'application illisible, elle est refusée et je sais
  pourquoi.
- **US-C3** — En tant qu'admin, je reviens aux couleurs par défaut.

## 4. Exigences fonctionnelles

| ID | Exigence | Écran |
|---|---|---|
| FR-310 | Sur la page « Apparence », l'admin configure **4 couleurs** : pour chaque thème (sombre, clair), la **couleur d'accent** (bandeau, onglet actif, filets, boutons secondaires pleins, mise en avant de « ma ligne ») et la **couleur d'action** (bouton principal, sur-titres, perfs). | Apparence |
| FR-311 | Chaque couleur se choisit avec un sélecteur de couleur ou en saisissant son code `#RRGGBB`. Une couleur laissée vide reprend sa valeur par défaut (`design/tokens.json`). | Apparence |
| FR-312 | **Contrôle de lisibilité** (WCAG 2.1) avant enregistrement ; une couleur qui échoue est **refusée** avec le ratio mesuré et le minimum exigé : couleur d'action et accent du thème sombre ≥ 4,5:1 sur le fond et les cartes de leur thème (ils servent de texte) ; accent du thème clair ≥ 3:1 sur le fond et les cartes (composants) ; le texte posé sur chaque couleur (bleu marine ou blanc, choisi automatiquement) ≥ 4,5:1. | Apparence |
| FR-313 | La page affiche un aperçu des deux thèmes et le résultat du contrôle de chaque couleur pendant la saisie, avant enregistrement. | Apparence |
| FR-314 | L'admin peut revenir aux couleurs par défaut en une action. | Apparence |
| FR-315 | Chaque changement est tracé dans le journal d'audit (type « Apparence ») avec les couleurs avant / après. | Journal |
| FR-316 | Aucune information n'est portée par la couleur seule (règle existante) ; les couleurs choisies ne changent ni les icônes ni les libellés. | toutes |

## 5. Critères d'acceptation (Given / When / Then)

1. **Given** un admin sur « Apparence », **when** il choisit `#1E6FD9` comme accent du thème clair et
   enregistre, **then** les boutons, onglets et filets du thème clair passent à cette couleur pour tous les
   utilisateurs, et le journal trace l'ancienne et la nouvelle valeur.
2. **Given** l'accent du thème clair à `#FFE600` (jaune vif, contraste < 3:1 sur fond clair), **when**
   l'admin enregistre, **then** l'enregistrement est refusé avec le ratio mesuré et aucune couleur n'est
   modifiée.
3. **Given** des couleurs personnalisées, **when** l'admin clique « Revenir aux couleurs par défaut »,
   **then** l'application reprend les couleurs de `design/tokens.json`.

## 6. Cas limites

| Cas | Comportement |
|---|---|
| Code couleur mal formé (`#12`, `bleu`) | Refusé : format `#RRGGBB` attendu. |
| Une seule couleur échoue sur les quatre | Rien n'est enregistré ; le message cite la couleur fautive. |
| Base de données indisponible | Couleurs par défaut ; l'application reste utilisable. |
| Couleurs sémantiques (succès, erreur, alerte, info), fond, texte | Non configurables, pour garantir la lisibilité des statuts. |

## 7. Principes de la constitution concernés

- **VII** — `design/tokens.json` reste la source des couleurs **par défaut** ; les couleurs du club en
  sont une surcharge contrôlée, toujours soumise à la vérification de contraste (formule identique à
  `design/identite.md` §3).
- **VI** — page et action réservées à l'admin, vérifiées côté serveur ; action tracée.

## 8. Clarifications

### Session 2026-11-13

- **Q : Quelles couleurs ?** → Accent + action, pour chacun des deux thèmes (4 couleurs).
- **Q : Couleur peu lisible ?** → Refusée, avec le ratio mesuré et le minimum exigé.
