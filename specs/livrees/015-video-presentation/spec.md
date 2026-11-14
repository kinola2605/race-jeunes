# Spécification fonctionnelle — Vidéo de présentation

**Branche** `docs/015-video-presentation` · **Créée** 2026-11-14 · **Statut** Déployée (v1.12.1, 2026-11-14) ·
**Origine** demande du porteur du projet (« prépare une vidéo de présentation et colle-la sur la première page
GitHub »)

> Ce document décrit le **quoi** et le **pourquoi**. La constitution reste la règle
> (`.specify/memory/constitution.md`) ; les exigences existantes sont dans `specs/livrees/001-race-jeunes/spec.md`.

## 1. Besoin

Le README montre quatre captures fixes. Un club qui découvre le projet ne voit ni l'enchaînement des écrans, ni
ce qui fait la valeur de l'application en usage : les points estimés en direct pendant la saisie, la validation
par l'admin, le barème réglable. Une courte vidéo en tête du README le montre en moins d'une minute.

## 2. Exigences

- **FR-1501** — Le README s'ouvre, sous la présentation, sur une vidéo de moins d'une minute qui parcourt
  l'application côté joueur (connexion, accueil, déclaration d'un match, classement, détail du calcul) puis côté
  admin (suivi et validation, barème, fiche joueur, apparence), avec une légende par écran.
- **FR-1502** — La vidéo se lit **dans la page GitHub** sans clic : GitHub ne lit pas une vidéo versionnée dans
  le dépôt, la page affiche donc un **aperçu animé (GIF, moins de 10 Mo)** qui renvoie au **MP4 1920×1080**.
- **FR-1503** — La vidéo est tournée **uniquement sur les données de démonstration**, sur une application
  locale (le script refuse toute autre adresse), comme les captures d'écran (spec 013).
- **FR-1504** — Elle se régénère par une commande (`npm run docs:video`) quand un écran filmé change.
- **FR-1505** — Aucun changement de l'application, aucune migration, aucune dépendance npm nouvelle (ffmpeg est
  un outil externe, indiqué par `FFMPEG` ou le `PATH`).

## 3. Réalisation

- `scripts/video/captures.mjs` : Playwright filme l'application image par image (30 images/s, Pixel 7, thème
  sombre) ; défilements et saisies sont pilotés pour un rendu fluide et reproductible.
- `scripts/video/composer.html` : mise en page 1920×1080 aux couleurs du projet (Poppins, bleu nuit, corail) :
  téléphone, légende, chapitres, fondus.
- `scripts/video/build.mjs` : enchaîne tournage, montage et encodage (H.264 pour le MP4, palette réduite pour le
  GIF). Sorties dans `docs/assets/video/`.
