# Identité visuelle — Race jeunes

> Phase 0 · relevé effectué le **7 novembre 2026** sur
> <le site d'un club de référence> (site Webflow).
> Les valeurs marquées **relevé** proviennent de la feuille de style officielle
> (`club.webflow.shared.be91bfc4e.css`), des styles calculés dans le navigateur ou des
> fichiers SVG du site. Les valeurs marquées **créé** sont des ajouts pour l'application (accessibilité,
> états sémantiques, thème clair) : ce ne sont **pas** des couleurs officielles du club.
> Source machine : [`tokens.json`](tokens.json).

## 0. Direction retenue : B « Court » (7 novembre 2026)

Choix du club parmi les deux directions maquettées. Règles propres à B, qui s'ajoutent aux sections suivantes :

- **Navigation** : barre d'onglets fixe en bas sur mobile (5 entrées max, icône + libellé, onglet actif = libellé gras + icône corail + trait corail 3 px en haut, donc jamais la couleur seule) ; barre latérale de 248 px à partir de 1024 px.
- **Cartes** : surface `surface-raised`, rayon 20 px, pas de filet (en thème clair : filet allégé 1 px pour délimiter la carte). Les filets saumon de la grille du site ne servent plus qu'à l'en-tête et aux tableaux.
- **Bloc « score »** (rang et points) : aplat saumon, texte bleu nuit, chiffres 64 px en graisse 700, lignes de court en décor à 12 % d'opacité.
- **Action primaire** : corail `#FF7F5C` + texte bleu nuit (sombre), `#B8432C` + texte blanc (clair), 52 px de haut, graisse 700.
- **Titres** : alignés à gauche, graisse 700, sur-titre en capitales corail ; intertitres de section en capitales 12 px avec un filet allégé à droite.
- **Actions collantes** (saisie de match, engagements) : posées au-dessus de la barre d'onglets.

La direction A reste visible dans les maquettes pour mémoire (« A · non retenue »), mais elle ne sera pas implémentée.

## 1. Ce que le relevé a corrigé par rapport aux estimations

| Élément | Estimation de départ | Valeur relevée | Source |
|---|---|---|---|
| Fond principal | `#16273F` | **`#14293E`** | variable CSS `--midnight-blue`, `body` calculé |
| Fond profond | — | **`#0F1F30`** | variable CSS `--midnight-blue-2` |
| Saumon (bandeau de sous-menu) | `#FFBEB0` | **`#FDC2B2`** | variable CSS `--white-smoke-2`, `.menu-block-general` |
| Texte / titres | `#FFFFFF` | **`#F6F6F6`** (titres) et **`#D6D6D6`** (texte courant) | `--white-smoke`, `--light-grey`, `h1` calculé |
| Filets de grille | blanc à opacité réduite | **saumon `#FDC2B2` plein, 1 px** (2 px par endroits) | bordures calculées (`1px solid rgb(253,194,178)`) |
| Corail (terre battue) | `#F4795B` | **`#FF7F5C`** (et `#F78F77` dans d'autres pictos) | SVG des pictogrammes |
| Bleu-violet (court dur) | `#4A45D6` | **`#4E39EA`** | SVG des pictogrammes |
| Bleu de court | `#4C78B4` (photo) | **`#426486`** | variable CSS `--royal-blue` (une photo n'est pas une source fiable) |
| Typographie | Poppins (à confirmer) | **Poppins confirmée** (112 déclarations ; Montserrat et Merriweather chargées mais quasi inutilisées) | CSS + chargement WebFont du site |
| Trait sous les titres | « court trait blanc épais » | **40 × 5 px, `#F6F6F6`** | `.div-block-42` calculé |
| Arrondis | ~16 px | **20 px** photos ; **15 px** boutons | `.padel-img1`, `.button-inline-blue` |
| Logo | médaillon blanc / bleu | **confirmé** : `logo.svg` (blanc, détails `#15293E` et `#C4E5F4`) et `logo.svg` (`#0E263C`) | SVG du site, copiés sans modification dans `assets/logo/` |

> ⚠️ **Le site du club charge ses polices depuis Google Fonts.** L'application ne le fera pas :
> Poppins (licence SIL OFL 1.1, voir [`assets/fonts/OFL.txt`](assets/fonts/OFL.txt)) est
> auto-hébergée en WOFF2, sous-ensemble latin (accents français inclus), graisses 400/500/600/700.

> ⚠️ **Logo** : copié tel quel depuis le site pour les maquettes uniquement. Son usage dans
> l'application reste **soumis à l'accord du club** (question à trancher en clarification).

## 2. Palette

### 2.1 Couleurs de marque (relevé)

| Token | Hex | Rôle dans l'application |
|---|---|---|
| `brand.midnight` | `#14293E` | Fond principal (sombre) · texte et aplats forts (clair) |
| `brand.midnight-deep` | `#0F1F30` | Zones en creux : champs de saisie, pied de page |
| `brand.salmon` | `#FDC2B2` | Accent primaire (sombre) : boutons primaires, bandeau de navigation, filets, onglet actif · aplat de mise en avant (clair) |
| `brand.white-smoke` | `#F6F6F6` | Texte principal (sombre) · fond (clair) |
| `brand.light-grey` | `#D6D6D6` | Texte secondaire (sombre) |
| `brand.coral` | `#FF7F5C` | Accent secondaire : **perfs**, chiffres clés (sombre uniquement) |
| `brand.violet` | `#4E39EA` | Liens et focus en thème clair ; décoratif (graphiques) |
| `brand.steel` | `#426486` | Décoratif uniquement |
| `brand.logo-ink` | `#0E263C` | Réservé au logo |

### 2.2 Variantes accessibles (créé)

| Token | Hex | Pourquoi |
|---|---|---|
| `accessible.violet-on-dark` | `#9A9CF5` | Le violet de marque fait 2,19:1 sur bleu nuit |
| `accessible.coral-on-light` | `#B8432C` | Le corail de marque fait 2,49:1 sur blanc |
| `accessible.steel-on-dark` | `#8AA3BE` | Bordures de champs visibles (≥ 3:1) sur fond sombre |
| `accessible.steel-on-light` | `#5F7186` | Métadonnées et bordures de champs en thème clair |

### 2.3 Rôles par thème

| Rôle | Sombre (défaut) | Clair (option plein soleil) |
|---|---|---|
| Fond `bg` | `#14293E` | `#F6F6F6` |
| Surface en creux | `#0F1F30` | `#FFFFFF` |
| Surface carte (direction B) | `#1B3550` *(créé)* | `#FFFFFF` |
| Texte principal | `#F6F6F6` | `#14293E` |
| Texte secondaire | `#D6D6D6` | `#2B4058` *(créé)* |
| Métadonnées | `#B4BCC6` *(créé)* | `#5F7186` |
| Filet de grille | `#FDC2B2` 1 px | `#14293E` 1 px |
| Filet allégé (décoratif) | `#3E5671` | `#C9D2DC` |
| Bordure de champ | `#8AA3BE` | `#5F7186` |
| Accent primaire / texte dessus | `#FDC2B2` / `#14293E` | `#14293E` / `#FFFFFF` |
| Accent secondaire (perf) / texte dessus | `#FF7F5C` / `#14293E` | `#B8432C` / `#FFFFFF` |
| Aplat de mise en avant | `#FDC2B2` + texte `#14293E` | `#FDC2B2` + texte `#14293E` |
| Focus | anneau blanc 2 px | anneau violet `#4E39EA` 2 px |
| Succès · Erreur · Alerte · Info | `#6FDC9C` · `#FF8A80` · `#FFD166` · `#7CC4FF` | `#1E7B46` · `#B3261E` · `#8A5A00` · `#1D5FA8` |

Les couleurs de statut sont toutes **créées** : le site du club n'en définit pas.

## 3. Contrastes WCAG 2.1 (calculés)

Formule de luminance relative WCAG 2.1. Seuils : 4,5:1 pour le texte, 3:1 pour les grands textes
(≥ 24 px, ou ≥ 18,66 px en gras) et les composants d'interface.

| Thème | Usage | Texte / élément | Fond | Ratio | Seuil | Verdict |
|---|---|---|---|---|---|---|
| Sombre | Texte principal | `#F6F6F6` | `#14293E` | 13.72:1 | 4.5:1 | ✅ AAA |
| Sombre | Texte principal sur creux | `#F6F6F6` | `#0F1F30` | 15.43:1 | 4.5:1 | ✅ AAA |
| Sombre | Texte principal sur carte | `#F6F6F6` | `#1B3550` | 11.62:1 | 4.5:1 | ✅ AAA |
| Sombre | Texte secondaire | `#D6D6D6` | `#14293E` | 10.20:1 | 4.5:1 | ✅ AAA |
| Sombre | Texte secondaire sur carte | `#D6D6D6` | `#1B3550` | 8.64:1 | 4.5:1 | ✅ AAA |
| Sombre | Métadonnées | `#B4BCC6` | `#14293E` | 7.73:1 | 4.5:1 | ✅ AAA |
| Sombre | Métadonnées sur carte | `#B4BCC6` | `#1B3550` | 6.55:1 | 4.5:1 | ✅ AA |
| Sombre | Métadonnées sur creux | `#B4BCC6` | `#0F1F30` | 8.70:1 | 4.5:1 | ✅ AAA |
| Sombre | Gris du site `#A0A0A0` (non retenu en texte courant) | `#A0A0A0` | `#1B3550` | 4.80:1 | 4.5:1 | ✅ AA (juste) |
| Sombre | Saumon (titre, lien, filet) | `#FDC2B2` | `#14293E` | 9.56:1 | 4.5:1 | ✅ AAA |
| Sombre | Bleu nuit sur saumon (bouton primaire, bandeau) | `#14293E` | `#FDC2B2` | 9.56:1 | 4.5:1 | ✅ AAA |
| Sombre | Corail (perf, chiffre clé) | `#FF7F5C` | `#14293E` | 5.96:1 | 4.5:1 | ✅ AA |
| Sombre | Corail sur carte | `#FF7F5C` | `#1B3550` | 5.05:1 | 4.5:1 | ✅ AA |
| Sombre | Bleu nuit sur corail (badge perf) | `#14293E` | `#FF7F5C` | 5.96:1 | 4.5:1 | ✅ AA |
| Sombre | Blanc sur corail | `#FFFFFF` | `#FF7F5C` | 2.49:1 | 4.5:1 | ❌ refusé |
| Sombre | Violet de marque en texte | `#4E39EA` | `#14293E` | 2.19:1 | 4.5:1 | ❌ refusé |
| Sombre | Violet accessible | `#9A9CF5` | `#14293E` | 5.96:1 | 4.5:1 | ✅ AA |
| Sombre | Violet accessible sur carte | `#9A9CF5` | `#1B3550` | 5.05:1 | 4.5:1 | ✅ AA |
| Sombre | Bleu acier de marque en bordure | `#426486` | `#14293E` | 2.40:1 | 3.0:1 | ❌ refusé |
| Sombre | Bordure de champ (sur creux) | `#8AA3BE` | `#0F1F30` | 6.40:1 | 3.0:1 | ✅ AA |
| Sombre | Bordure de champ (sur fond) | `#8AA3BE` | `#14293E` | 5.69:1 | 3.0:1 | ✅ AA |
| Sombre | Filet saumon (grille) | `#FDC2B2` | `#14293E` | 9.56:1 | 3.0:1 | ✅ AA |
| Sombre | Anneau de focus blanc | `#FFFFFF` | `#14293E` | 14.83:1 | 3.0:1 | ✅ AA |
| Sombre | Succès (Validé, Victoire) | `#6FDC9C` | `#14293E` | 8.75:1 | 4.5:1 | ✅ AAA |
| Sombre | Succès sur carte | `#6FDC9C` | `#1B3550` | 7.41:1 | 4.5:1 | ✅ AAA |
| Sombre | Erreur (Refusé, Défaite) | `#FF8A80` | `#14293E` | 6.49:1 | 4.5:1 | ✅ AA |
| Sombre | Erreur sur carte | `#FF8A80` | `#1B3550` | 5.50:1 | 4.5:1 | ✅ AA |
| Sombre | Alerte (En attente) | `#FFD166` | `#14293E` | 10.28:1 | 4.5:1 | ✅ AAA |
| Sombre | Alerte sur carte | `#FFD166` | `#1B3550` | 8.71:1 | 4.5:1 | ✅ AAA |
| Sombre | Info | `#7CC4FF` | `#14293E` | 7.90:1 | 4.5:1 | ✅ AAA |
| Sombre | Info sur carte | `#7CC4FF` | `#1B3550` | 6.70:1 | 4.5:1 | ✅ AA |
| Clair | Texte principal | `#14293E` | `#F6F6F6` | 13.72:1 | 4.5:1 | ✅ AAA |
| Clair | Texte principal sur surface | `#14293E` | `#FFFFFF` | 14.83:1 | 4.5:1 | ✅ AAA |
| Clair | Texte secondaire | `#2B4058` | `#F6F6F6` | 9.83:1 | 4.5:1 | ✅ AAA |
| Clair | Métadonnées | `#5F7186` | `#F6F6F6` | 4.63:1 | 4.5:1 | ✅ AA |
| Clair | Métadonnées sur surface | `#5F7186` | `#FFFFFF` | 5.01:1 | 4.5:1 | ✅ AA |
| Clair | Blanc sur bleu nuit (bouton primaire) | `#FFFFFF` | `#14293E` | 14.83:1 | 4.5:1 | ✅ AAA |
| Clair | Bleu nuit sur saumon (bandeau, sélection) | `#14293E` | `#FDC2B2` | 9.56:1 | 4.5:1 | ✅ AAA |
| Clair | Aplat saumon vs fond (limite de composant) | `#FDC2B2` | `#F6F6F6` | 1.44:1 | 3.0:1 | ❌ refusé comme seul indicateur |
| Clair | Saumon en texte | `#FDC2B2` | `#FFFFFF` | 1.55:1 | 4.5:1 | ❌ refusé |
| Clair | Corail de marque en texte | `#FF7F5C` | `#FFFFFF` | 2.49:1 | 4.5:1 | ❌ refusé |
| Clair | Corail accessible (perf) | `#B8432C` | `#FFFFFF` | 5.42:1 | 4.5:1 | ✅ AA |
| Clair | Corail accessible sur fond | `#B8432C` | `#F6F6F6` | 5.01:1 | 4.5:1 | ✅ AA |
| Clair | Blanc sur corail accessible (badge perf) | `#FFFFFF` | `#B8432C` | 5.42:1 | 4.5:1 | ✅ AA |
| Clair | Violet de marque (liens, focus) | `#4E39EA` | `#FFFFFF` | 6.78:1 | 4.5:1 | ✅ AA |
| Clair | Violet de marque sur fond | `#4E39EA` | `#F6F6F6` | 6.27:1 | 4.5:1 | ✅ AA |
| Clair | Bordure de champ | `#5F7186` | `#FFFFFF` | 5.01:1 | 3.0:1 | ✅ AA |
| Clair | Filet bleu nuit (grille) | `#14293E` | `#F6F6F6` | 13.72:1 | 3.0:1 | ✅ AA |
| Clair | Succès | `#1E7B46` | `#FFFFFF` | 5.28:1 | 4.5:1 | ✅ AA |
| Clair | Succès sur fond | `#1E7B46` | `#F6F6F6` | 4.89:1 | 4.5:1 | ✅ AA |
| Clair | Erreur | `#B3261E` | `#F6F6F6` | 6.05:1 | 4.5:1 | ✅ AA |
| Clair | Alerte | `#8A5A00` | `#F6F6F6` | 5.48:1 | 4.5:1 | ✅ AA |
| Clair | Info | `#1D5FA8` | `#F6F6F6` | 5.97:1 | 4.5:1 | ✅ AA |

### 3.1 Combinaisons refusées et remplacements

1. **Blanc sur corail (2,49:1)** → texte bleu nuit sur corail (5,96:1) en sombre ; corail foncé `#B8432C` + texte blanc en clair.
2. **Violet `#4E39EA` sur bleu nuit (2,19:1)** → `#9A9CF5` en texte ; le violet de marque reste réservé au thème clair (6,78:1) et aux graphiques.
3. **Bleu acier `#426486` sur bleu nuit (2,40:1)** → décoratif uniquement ; bordures de champs en `#8AA3BE`.
4. **Saumon ou corail en texte sur fond clair (1,55:1 et 2,49:1)** → jamais. En clair, le saumon n'est utilisé qu'en **aplat** avec texte bleu nuit (9,56:1).
5. **Aplat saumon vs fond clair (1,44:1)** : un aplat saumon n'est jamais le seul indicateur d'état (onglet actif, ligne sélectionnée). Il est toujours doublé d'un **trait bleu nuit de 2 px**, d'une graisse ou d'une icône.
6. **Gris du site `#A0A0A0`** : passe de justesse sur carte (4,80:1) ; remplacé par `#B4BCC6` (≥ 6,5:1 partout) pour les métadonnées.
7. **Corps 14 px du site** → 16 px dans l'application (lecture en extérieur, petits écrans).

## 4. États sémantiques — jamais la couleur seule

| État | Icône | Libellé | Couleur |
|---|---|---|---|
| Match validé | coche | « Validé » | succès |
| Match en attente | horloge | « En attente » | alerte |
| Match refusé | croix | « Refusé » | erreur |
| Match annulé | cercle barré | « Annulé » (texte barré) | métadonnée |
| Victoire | triangle haut | « V » + « Victoire » (lecteur d'écran) | succès |
| Défaite | triangle bas | « D » + « Défaite » | erreur |
| Perf | flèche montante | « Perf » | accent secondaire (corail) |
| Forfait | drapeau | « WO » + « Forfait » | métadonnée |
| Compte désactivé | cadenas | « Désactivé » | métadonnée |
| Mot de passe temporaire | clé | « Mdp temporaire » | alerte |

## 5. Typographie

- **Famille** : Poppins, repli `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- **Graisses** : 400 (corps), 500 (titres, comme le site), 600 (chiffres, boutons), 700 (chiffres clés en direction B).
- **Menus et étiquettes** : capitales, 12 px, interlettrage 0,08 em, graisse 500 (site : 12 px, 1 px d'interlettrage).
- **Chiffres** : `font-variant-numeric: tabular-nums` dans les tableaux et classements.

| Token | Taille | Usage |
|---|---|---|
| `xs` | 12 px | Menus capitales, étiquettes, badges |
| `sm` | 14 px | Métadonnées, cellules de tableau denses |
| `base` | 16 px | Corps |
| `lg` | 18 px | Intertitres de carte |
| `xl` | 20 px | Titres de section mobile |
| `2xl` | 24 px | Titres de section (H3 du site) |
| `3xl` | 32 px | Titre de page (H1 du site, graisse 500) |
| `display` | 56 px | Points et rang sur le tableau de bord |

## 6. Grille, filets, formes

- **Grille de cases** (direction A) : cases séparées par un filet de 1 px saumon (sombre) ou bleu nuit (clair) — technique « fond = couleur du filet, gap 1 px ».
- **Arbitrage mobile** : sous 768 px, les cases s'empilent en pleine largeur avec **filets horizontaux uniquement** (pas de bordures verticales ni de cadre extérieur), pour récupérer environ 2 × 16 px de largeur utile. Les listes denses (classement, journal) utilisent le filet allégé décoratif entre lignes.
- **Titres de page** : centrés + trait 40 × 5 px (direction A) ; alignés à gauche avec sur-titre en capitales (direction B).
- **Aucune ombre portée.** Seule exception : l'anneau de focus.
- **Rayons** : 15 px boutons et champs, 20 px cartes et photos, 999 px pastilles.
- **Espacements** : base 4 px (4, 8, 12, 16, 20, 24, 32, 40, 48, 64).
- **Cibles tactiles** : 44 px minimum ; 52 px sur l'écran de saisie de match (bord de court).
- **Icônes** : jeu au trait 2 px dessiné pour l'application, embarqué en SVG (aucune bibliothèque ni CDN). Les pictogrammes isométriques du site ne sont pas réutilisés dans l'interface (trop détaillés à 24 px).
- **Mouvement** : transitions ≤ 200 ms, supprimées si `prefers-reduced-motion`.
