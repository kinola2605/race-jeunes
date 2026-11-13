# Spécification fonctionnelle — Race jeunes

**Branche** `001-race-jeunes` · **Créée** 2026-11-07 · **Statut** Déployée (v1.0.0, complétée jusqu'en v1.2.1) · **Entrées** : brief du club,
maquettes validées (`design/maquettes/`, direction B), charte (`design/identite.md`).

> Ce document décrit le **quoi** et le **pourquoi**, sans choix technique. Les écrans cités
> (`[E03]`…) renvoient aux maquettes `design/maquettes/03-*.html`, etc.

## 1. Contexte

Chaque année, un club de tennis organise pour ses jeunes compétiteurs une « Race » :
chaque joueur engagé cumule des points selon ses victoires et défaites. Les points dépendent de
l'écart de classement FFT entre les deux joueurs, selon un **barème propre à chaque saison** et
paramétrable par l'admin sans toucher au code. L'application remplace un suivi manuel ; elle est
**fermée** (comptes créés par l'admin) et **ne stocke aucune donnée personnelle** (pseudos uniquement).

## 2. Personas

| Persona | Description | Besoins clés |
|---|---|---|
| **Joueur / joueuse** (8-17 ans) | Consulte depuis un smartphone, souvent au bord du court | voir son rang et ses points, comprendre le calcul, déclarer un match en 30 s |
| **Admin** (enseignant·e ou bénévole) | Gère la Race sur mobile ou ordinateur | créer les comptes, configurer saisons et barèmes, valider les matchs, corriger, exporter |

## 3. User stories priorisées

### P1 — indispensables (v1)

- **US1 · Accès fermé** — En tant que joueur, je me connecte avec le pseudo et le mot de passe remis par
  le club, et je choisis mon propre mot de passe à la première connexion. *Indépendamment testable* :
  un compte créé en base permet la connexion, le changement forcé, la déconnexion.
- **US2 · Gestion des comptes** — En tant qu'admin, je crée des comptes joueurs (un par un ou par CSV),
  je remets un mot de passe temporaire affiché une seule fois, je réinitialise, je désactive.
- **US3 · Saisons et barèmes** — En tant qu'admin, je crée une saison (identifiant + titre) en dupliquant
  le barème d'une saison précédente, je modifie et simule le barème, je publie une version et je lance
  un recalcul explicite après en avoir vu l'impact ; j'ouvre, clôture et archive les saisons.
- **US4 · Engagements** — En tant qu'admin, j'engage des joueurs dans une saison, individuellement ou en
  lot, avec leur classement de départ.
- **US5 · Matchs** — En tant que joueur, je déclare un match (adversaire du club ou extérieur) ; en tant
  qu'admin, je saisis un match et je valide ou refuse les matchs en attente.
- **US6 · Classement et espace joueur** — En tant que joueur, je consulte le classement de la Race, mon
  tableau de bord, mes matchs avec le détail du calcul, et mes saisons passées.

### P2 — importantes (v1 si possible)

- **US7 · Suivi et traçabilité** — En tant qu'admin, je vois un tableau de bord de suivi (matchs à
  valider, anomalies, mots de passe temporaires non changés, engagés sans match), j'exporte en CSV et je
  consulte le journal d'audit.
- **US8 · PWA** — En tant que joueur, j'installe l'application sur mon téléphone et je choisis le thème
  clair en plein soleil.

### P3 — plus tard

- Rôle « saisisseur » ; plafond de points par période ; file de saisie hors ligne ; doubles et matchs par
  équipes ; expiration des mots de passe temporaires.

## 4. Exigences fonctionnelles

### 4.1 Accès et authentification

| ID | Exigence | Écran |
|---|---|---|
| FR-001 | La seule page accessible sans session est la connexion (pseudo + mot de passe). Toute autre page redirige vers la connexion. | E01 |
| FR-002 | Il n'existe **aucune** page, route ou action permettant de créer un compte sans session admin ; la page de connexion ne propose aucun lien d'inscription. | E01 |
| FR-003 | En cas d'échec, le message est identique que le pseudo existe ou non (« Pseudo ou mot de passe incorrect. »). | E14 |
| FR-004 | Après 5 échecs en 15 minutes pour un même pseudo (ou 20 pour une même origine réseau, partagée par exemple par le wifi du club), les tentatives sont bloquées 15 minutes avec un message générique. Une connexion réussie remet les compteurs à zéro. | E14 |
| FR-005 | Un compte dont le mot de passe est temporaire n'accède à rien d'autre que l'écran de changement de mot de passe et la déconnexion. | E02 |
| FR-006 | Un nouveau mot de passe compte au moins 10 caractères, diffère de l'actuel et ne contient pas le pseudo. | E02 |
| FR-007 | Tout utilisateur peut changer son mot de passe ; ses autres sessions sont alors révoquées. | E02 |
| FR-008 | Tout utilisateur peut se déconnecter. | en-tête |
| FR-009 | Une session expire après 30 jours ; la désactivation d'un compte révoque immédiatement ses sessions. | — |
| FR-010 | Le premier admin est créé par une commande d'installation (bootstrap), jamais par l'interface. | — |
| FR-011 | Un joueur ne peut modifier ni son pseudo, ni son classement, ni les données d'un autre joueur. | — |

### 4.2 Comptes joueurs (admin)

| ID | Exigence | Écran |
|---|---|---|
| FR-020 | L'admin crée un joueur avec un pseudo unique (3 à 20 caractères : lettres, chiffres, `_ . - &`, sans distinction de casse pour l'unicité), un classement FFT, des étiquettes facultatives et, en option, un engagement dans une saison ouverte. Aucun autre champ n'existe. | E08b |
| FR-021 | La création génère un mot de passe temporaire aléatoire, affiché **une seule fois** (copiable, fiche imprimable), jamais stocké en clair ni journalisé. | E08c |
| FR-022 | L'admin liste les comptes, recherche par pseudo, filtre par statut (actif, désactivé, mot de passe temporaire) et par étiquette. | E08a |
| FR-023 | L'admin modifie le pseudo, le classement (chaque changement est historisé avec date et auteur) et les étiquettes d'un joueur. | E08a |
| FR-024 | L'admin réinitialise le mot de passe d'un joueur : nouveau mot de passe temporaire (même mécanisme que FR-021), sessions révoquées. | E08c |
| FR-025 | L'admin désactive ou réactive un compte. Un compte n'est jamais supprimé (les classements passés restent intacts). Un compte désactivé ne peut plus se connecter. | E08a |
| FR-026 | L'admin importe un CSV (colonnes `pseudo` et `classement` uniquement, séparateur `;` ou `,`). Toute autre colonne est refusée. Les pseudos existants sont ignorés ou voient leur classement mis à jour (choix de l'admin). Un compte rendu liste créés, ignorés et erreurs par ligne. Les mots de passe temporaires des comptes créés sont affichés une seule fois, avec une fiche imprimable/téléchargeable. | E08d |
| FR-027 | Les rôles sont **Joueur** et **Admin**. | — |

### 4.3 Saisons

| ID | Exigence | Écran |
|---|---|---|
| FR-040 | L'admin crée une saison : identifiant (slug unique, minuscules, chiffres, tirets), titre libre, dates facultatives informatives, mode de classement de référence (figé à l'engagement / évolutif), visibilité du classement (tous les joueurs connectés / engagés seulement / chacun ne voit que son rang), barème initial (copie d'un barème existant ou barème par défaut vide). | E09b |
| FR-041 | Statuts : Brouillon → Ouverte → Clôturée → Archivée. Un brouillon n'est visible que des admins. Une saison clôturée peut être rouverte par l'admin (action exceptionnelle tracée). | E09a |
| FR-042 | La clôture exige la saisie de l'identifiant de la saison ; les matchs encore en attente passent en « Annulé ». | E09c |
| FR-043 | Une saison clôturée ou archivée est en lecture seule (aucune saisie, validation, modification de barème ni engagement), vérifié côté serveur. | E14 |
| FR-044 | L'identifiant n'est plus modifiable une fois la saison ouverte ; le titre reste modifiable. | E09b |
| FR-045 | Plusieurs saisons peuvent être ouvertes simultanément. | E09a |

### 4.4 Barèmes

| ID | Exigence | Écran |
|---|---|---|
| FR-060 | Chaque saison a ses propres versions de barème : au plus un brouillon et une suite de versions publiées numérotées. Modifier le barème d'une saison n'affecte aucune autre saison. | E10 |
| FR-061 | Un barème définit : points de victoire selon l'écart d'échelons (de −4 ou moins à +4 ou plus), points de défaite selon l'écart, surcharges facultatives par couple (classement du joueur × classement de l'adversaire), traitement des adversaires non classés (comme 40 ou échelon propre), points d'une victoire par forfait, plafond de points par match, bonus d'assiduité facultatif (+P points tous les N matchs validés). | E10 |
| FR-062 | Le barème est validé avant publication (valeurs entières positives ou nulles, bornes cohérentes) avec des messages clairs. | E10 |
| FR-063 | Un simulateur indique les points d'un match hypothétique (classements, résultat) pour la version publiée et pour le brouillon. | E10 |
| FR-064 | Les matchs validés après une publication utilisent la dernière version publiée. Chaque match conserve la version utilisée. | E10 |
| FR-065 | Avant tout recalcul, l'admin voit l'impact : nombre de matchs dont les points changent, joueurs impactés, changements de rang. | E10 |
| FR-066 | Le recalcul des matchs passés n'a lieu que sur action explicite ; il est enregistré dans le journal d'audit avec un résumé avant/après. | E10 |
| FR-067 | Le barème d'une saison clôturée ou archivée est verrouillé. | E10 |
| FR-068 | Une saison sans version publiée ne peut pas être ouverte. | E09a |

### 4.5 Engagements

| ID | Exigence | Écran |
|---|---|---|
| FR-080 | L'admin engage des joueurs actifs dans une saison (brouillon ou ouverte), individuellement ou en lot (sélection multiple, sélection par étiquette). Le classement de départ vaut par défaut le classement actuel et reste modifiable tant que le joueur n'a pas de match validé. | E11 |
| FR-081 | L'admin retire un engagé qui n'a aucun match dans la saison. | E11 |
| FR-082 | Un joueur non engagé ne figure pas au classement de la saison et ne peut pas y déclarer de match. | E04 |

### 4.6 Matchs

| ID | Exigence | Écran |
|---|---|---|
| FR-100 | Un joueur engagé déclare un match d'une saison ouverte : date, adversaire (autre engagé, ou extérieur identifié par un libellé libre sans donnée personnelle et un classement), résultat (victoire/défaite), score, type (normal, forfait, abandon). Le match est « En attente ». | E12a |
| FR-101 | L'admin saisit un match pour n'importe quel engagé ; il peut le valider immédiatement. | E12a |
| FR-102 | Pendant la saisie, une estimation des points est affichée. | E12a |
| FR-103 | L'admin traite la file des matchs en attente : valider, refuser avec un motif visible du joueur, annuler. | E12b |
| FR-104 | Un match entre deux engagés compte pour les deux joueurs (points calculés du point de vue de chacun). | E05 |
| FR-105 | Un doublon probable (même paire de joueurs, même date, une autre saisie non refusée) est signalé à l'admin. | E07, E12b |
| FR-106 | Les classements utilisés pour le calcul sont fixés à la validation : classement de départ (mode figé) ou classement en vigueur à la date du match (mode évolutif) ; pour un adversaire extérieur, le classement saisi. | E05 |
| FR-107 | L'admin peut annuler un match validé d'une saison ouverte ; ses points sont retirés et l'action est tracée. | E12b |
| FR-108 | Le score est saisi sous forme de sets (ex. « 6/4 6/3 » ou « 6/4 3/6 10-8 ») ; il est obligatoire sauf forfait. | E12a |

### 4.7 Classement et espace joueur

| ID | Exigence | Écran |
|---|---|---|
| FR-120 | Le classement d'une saison ordonne les engagés par points décroissants, puis nombre de perfs, puis victoires ; les joueurs encore à égalité partagent le même rang. Seuls les matchs validés comptent. | E04 |
| FR-121 | Le classement est filtrable par étiquette et par série de classement (40/NC, 30/x, 15/x et mieux). | E04 |
| FR-122 | Chaque joueur voit le détail agrégé de son propre total ; l'admin voit le détail de tout joueur. | E04 |
| FR-123 | La visibilité du classement suit le paramètre de la saison (FR-040). Les admins voient toujours tout. | E04 |
| FR-124 | Le tableau de bord joueur affiche, pour la saison ouverte où il est engagé : rang, points, victoires, défaites, perfs, classement de référence, dernier match validé, matchs en attente. | E03 |
| FR-125 | « Mes matchs » liste les matchs du joueur d'une saison avec statut et, pour chaque match validé, le détail du calcul (classements, écart, règle et version du barème, bonus, plafond, total). | E05 |
| FR-126 | « Mes saisons » liste les saisons où le joueur a été engagé avec rang final et points, consultables en lecture seule. | E06 |
| FR-127 | Un joueur ne voit pas le détail des matchs des autres joueurs. | — |

### 4.8 Suivi, export, audit

| ID | Exigence | Écran |
|---|---|---|
| FR-140 | Le tableau de bord admin affiche : matchs à valider, anomalies (doublons probables, adversaires extérieurs sans classement), comptes au mot de passe temporaire jamais changé, engagés sans match validé. | E07 |
| FR-141 | L'admin exporte en CSV le classement et les matchs d'une saison, et le journal d'audit. | E07, E13 |
| FR-142 | Toute action d'administration (comptes, saisons, barèmes, engagements, matchs, recalculs) et tout verrouillage de connexion est enregistré dans un journal d'audit non modifiable, consultable et filtrable par type. | E13 |

### 4.9 Exigences transverses

| ID | Exigence | Écran |
|---|---|---|
| FR-160 | L'application est une PWA installable ; hors connexion, une page explique que la consultation nécessite le réseau. | E14 |
| FR-161 | Interface en français ; thème sombre par défaut, thème clair au choix de l'utilisateur. | toutes |
| FR-162 | Aucune ressource n'est chargée depuis un domaine tiers ; aucun cookie autre que celui de session. | toutes |
| FR-163 | Tout champ de saisie libre affiche l'avertissement « Ne saisissez aucune donnée personnelle (nom réel, etc.) ». | E08b, E09b, E12a, E12b |
| FR-164 | Accessibilité WCAG 2.1 AA visée (voir constitution, principe VIII). | toutes |
| FR-165 | Un démarrage de démonstration fournit deux saisons aux barèmes différents, une vingtaine de pseudos, des matchs et un compte admin documenté. | — |

## 5. Critères d'acceptation (Given / When / Then)

### US1 — Accès fermé
1. **Given** un compte joueur actif, **when** je saisis pseudo et mot de passe corrects, **then** j'arrive sur mon tableau de bord.
2. **Given** un pseudo inexistant ou un mauvais mot de passe, **when** je me connecte, **then** je lis exactement « Pseudo ou mot de passe incorrect. » dans les deux cas.
3. **Given** 5 échecs en 15 minutes pour un pseudo, **when** je tente une 6ᵉ fois (même avec le bon mot de passe), **then** la connexion est refusée avec le message de verrouillage.
4. **Given** un compte au mot de passe temporaire, **when** je me connecte puis j'ouvre `/classement`, **then** je suis renvoyé vers le changement de mot de passe.
5. **Given** le formulaire de changement, **when** le nouveau mot de passe contient le pseudo ou fait moins de 10 caractères, **then** il est refusé avec un message explicite.
6. **Given** une visite anonyme, **when** j'appelle n'importe quelle page ou action de création de compte, **then** je suis redirigé vers la connexion et aucun compte n'est créé.

### US2 — Comptes
1. **Given** un admin connecté, **when** il crée « PetitPont » en 30/3, **then** un mot de passe temporaire s'affiche une seule fois, le compte est « mot de passe temporaire » et la création est journalisée.
2. **Given** un pseudo existant « petitpont » (casse différente), **when** l'admin crée « PetitPont », **then** la création est refusée (« Ce pseudo est déjà utilisé »).
3. **Given** un joueur connecté, **when** l'admin le désactive, **then** sa requête suivante le renvoie à la connexion et il ne peut plus se connecter.
4. **Given** un CSV de 17 lignes dont 2 pseudos existants et 1 classement invalide, **when** l'admin l'importe en mode « ignorer », **then** 14 comptes sont créés, 2 ignorés, 1 erreur avec numéro de ligne, et les 14 mots de passe s'affichent une seule fois.
5. **Given** un CSV contenant une colonne `nom`, **when** il est importé, **then** l'import est refusé entièrement.

### US3 — Saisons et barèmes
1. **Given** la saison A (barème v3), **when** l'admin crée la saison B en dupliquant A puis modifie le barème de B, **then** le barème de A est inchangé.
2. **Given** une saison ouverte avec des matchs validés en v1, **when** l'admin publie v2 sans recalcul, **then** les matchs passés gardent leurs points v1 et les nouveaux matchs validés utilisent v2.
3. **Given** un brouillon de barème, **when** l'admin ouvre l'onglet Impact, **then** il voit le nombre de matchs et de joueurs impactés et les changements de rang, sans que rien ne soit modifié.
4. **Given** l'admin lance le recalcul, **then** chaque match prend les points de la nouvelle version, le classement est mis à jour et une entrée d'audit résume l'opération.
5. **Given** une saison clôturée, **when** l'admin tente de modifier son barème ou de valider un match, **then** l'action est refusée côté serveur.
6. **Given** une saison avec 6 matchs en attente, **when** l'admin la clôture en saisissant l'identifiant, **then** elle passe « Clôturée » et les 6 matchs passent « Annulé ».

### US4 — Engagements
1. **Given** 2 joueurs non engagés étiquetés « Groupe B », **when** l'admin sélectionne l'étiquette et valide, **then** les 2 sont engagés avec leur classement actuel comme classement de départ.
2. **Given** un joueur non engagé, **when** il tente de déclarer un match dans la saison, **then** c'est refusé.

### US5 — Matchs
1. **Given** AceDuMatin (30/2) engagé, **when** il déclare une victoire 6/4 6/3 contre SliceMaster (30/1) avec le barème de démonstration, **then** l'estimation affiche +20 (perf) et le match est « En attente ».
2. **Given** ce match en attente, **when** l'admin le valide, **then** AceDuMatin gagne 20 points, SliceMaster gagne les points de défaite correspondants, et le classement est mis à jour.
3. **Given** un match refusé avec le motif « Score incomplet », **then** le joueur voit le statut « Refusé » et le motif.
4. **Given** deux saisies de la même paire à la même date, **then** le tableau de bord admin signale un doublon probable.

### US6 — Classement et espace joueur
1. **Given** deux joueurs à égalité de points, de perfs et de victoires, **then** ils partagent le même rang.
2. **Given** une saison en visibilité « chacun ne voit que son rang », **when** un joueur ouvre le classement, **then** il ne voit que sa propre ligne.
3. **Given** un match validé, **when** le joueur ouvre son détail, **then** il voit classements, écart, version du barème et total.

## 6. Glossaire

| Terme | Définition |
|---|---|
| **Race** | Concours annuel (ou ponctuel) où chaque engagé cumule des points de match. |
| **Saison** | Édition de la Race, identifiée par un **identifiant** stable (slug) et un titre ; indépendante de l'année civile. |
| **Classement** | Classement FFT d'un joueur : NC, 40, 30/5 … 30, 15/5 … 15, 5/6 … 0, etc. |
| **Échelon** | Position dans l'échelle des classements ; l'écart d'échelons sert au calcul. |
| **Écart** | Échelon de l'adversaire − échelon du joueur : positif si l'adversaire est mieux classé. |
| **Perf** | Victoire contre un adversaire mieux classé (écart > 0). |
| **Barème** | Ensemble des règles de calcul des points d'une saison, versionné. |
| **Version publiée** | Version de barème figée, utilisée pour valider les matchs. |
| **Recalcul** | Application explicite d'une nouvelle version aux matchs déjà validés. |
| **Engagé** | Joueur inscrit par l'admin dans une saison, avec un **classement de départ**. |
| **Classement de référence** | Classement utilisé pour un match : de départ (mode figé) ou en vigueur à la date du match (mode évolutif). |
| **Adversaire extérieur** | Adversaire hors application, identifié par un libellé neutre et un classement. |
| **Pseudo** | Seul identifiant d'un joueur, attribué par l'admin, unique sans distinction de casse. |
| **Mot de passe temporaire** | Mot de passe aléatoire remis par l'admin, à changer à la première connexion. |
| **Forfait (WO)** | Match non joué, gagné par l'un des joueurs. |
| **Étiquette** | Regroupement libre défini par l'admin (ex. « Groupe A »). |

## 7. Cas limites

| Cas | Comportement attendu |
|---|---|
| Égalité de classement | Écart 0 : points « victoire à classement égal » / « défaite à classement égal ». |
| Adversaire extérieur | Seul le joueur de l'application marque des points ; le classement saisi sert au calcul. |
| Adversaire extérieur sans classement | Traité comme non classé (paramètre du barème) et signalé en anomalie. |
| Match annulé | Aucun point ; reste visible barré dans l'historique. |
| Forfait | Le vainqueur reçoit les points « victoire par forfait » (0 par défaut), jamais une perf ; le perdant 0. |
| Abandon | Compté comme une victoire normale pour le vainqueur. |
| Correction après clôture | Impossible sans rouvrir la saison (action admin tracée). |
| Changement de classement en cours de saison | Historisé ; sans effet sur les matchs en mode figé ; en mode évolutif, s'applique aux matchs dont la date est postérieure au changement. |
| Modification du barème en cours de saison | Brouillon puis publication ; recalcul uniquement sur action explicite (FR-066). |
| Duplication de barème | Copie indépendante (nouvel enregistrement), modifiable sans effet sur la source. |
| Pseudo en doublon | Refusé, sans distinction de casse. |
| Import CSV avec pseudos existants | Ignorés ou classement mis à jour selon le choix ; jamais de nouveau mot de passe pour eux. |
| Mot de passe temporaire jamais changé | Le compte reste bloqué sur l'écran de changement ; il apparaît au suivi admin. |
| Compte désactivé avec historique | Conservé ; ses matchs et points restent dans les classements ; il disparaît des listes d'engagement. |
| Plafond par match | Le total d'un match (règle + bonus de match) est ramené au plafond. |
| Saison ouverte sans engagé | Classement vide avec message explicite. |
| Deux saisons ouvertes | Le tableau de bord joueur affiche la plus récente où il est engagé ; un sélecteur permet de changer. |

## 8. Clarifications

### Session 2026-11-07

Le porteur du projet a demandé de ne plus être sollicité et de finaliser une v1 ; les propositions par
défaut ci-dessous ont donc été retenues. Elles restent modifiables.

- **Q : Qui saisit et qui valide les matchs ?** → Le joueur déclare ses matchs, l'admin peut en saisir pour tout engagé ; seul l'admin valide. Pas de rôle « saisisseur » en v1 (P3).
- **Q : Forme du barème ?** → Points par écart d'échelons (victoire et défaite), complétés de surcharges facultatives par couple de classements (table complète).
- **Q : Classement de référence figé ou évolutif ?** → Paramètre de saison, figé par défaut.
- **Q : Visibilité du classement ?** → Paramètre de saison, « tous les joueurs connectés » par défaut.
- **Q : Expiration des mots de passe temporaires ?** → Aucune en v1 ; signalement au tableau de bord admin.
- **Q : Un joueur voit-il les matchs des autres ?** → Non : classement uniquement (FR-127).
- **Q : Doubles et équipes ?** → Hors périmètre.
- **Q : Logo du club ?** → Utilisé tel quel, sous réserve de l'accord du club ; remplaçable par un simple fichier.
- **Q : Correction après clôture ?** → Réouverture exceptionnelle par l'admin, tracée (FR-041).
- **Q : Hors ligne ?** → Page d'information ; pas de file de saisie hors ligne en v1.
- **Q : Forfait et abandon ?** → Forfait : points « victoire par forfait » (0 par défaut) ; abandon : victoire normale.
- **Q : Licence ?** → Tous droits réservés en attendant la décision du club (`LICENSE`).
