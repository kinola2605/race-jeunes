# Spécification fonctionnelle — Documentation du projet

**Branche** `docs/013-documentation` · **Créée** 2026-11-14 · **Statut** Déployée (v1.11.1, 2026-11-14) · **Origine** demande
du porteur du projet (« mettre à jour le README GitHub et prévoir une vraie documentation »)

> Ce document décrit le **quoi** et le **pourquoi**. La constitution reste la règle
> (`.specify/memory/constitution.md`) ; les exigences existantes sont dans `specs/livrees/001-race-jeunes/spec.md`.

## 1. Besoin

Le README date de la v1.2.1 : il ignore dix évolutions (apparence, objectif de matchs, bonus tournoi, avatars,
espace RGPD, envoi par e-mail, ergonomie, profil mental) et mélange présentation, installation, exploitation et
développement. Il n'existe aucun mode d'emploi : un admin de club qui découvre l'application n'a que les écrans,
et le fonctionnement du barème ne se lit que dans le code ou dans les specs.

## 2. Lecteurs

| Lecteur | Ce qu'il cherche |
|---|---|
| **Admin du club** (enseignant, bénévole) | Comment lancer une saison, régler le barème, créer les comptes, valider les matchs |
| **Joueur** (et ses parents) | Comment se connecter, déclarer un match, comprendre ses points |
| **Exploitant** (celui qui héberge) | Installer, configurer, sauvegarder, mettre à jour |
| **Développeur** | Comprendre l'architecture et contribuer |

## 3. Où publier la documentation — décision

**Retenu : des fichiers Markdown dans `docs/`, dans le dépôt, lus directement sur GitHub.**

| Option | Verdict | Raison |
|---|---|---|
| **Markdown dans `docs/`** | ✅ retenu | Versionné avec le code : une PR qui change un écran corrige le guide dans la même PR (constitution I). Aucun outil, aucun build, aucun coût ; GitHub affiche les tableaux, les images, les schémas Mermaid et un sommaire automatique. |
| GitHub Pages (site généré) | ❌ pour l'instant | Sur un dépôt **privé**, Pages exige une offre payante, et le site publié serait de toute façon public. À reconsidérer si le dépôt devient public : les mêmes fichiers Markdown alimenteraient le site sans réécriture. |
| Wiki GitHub | ❌ | Indisponible sur un dépôt privé en offre gratuite ; surtout, il vit hors des PR : pas de relecture, pas de lien avec une version. |
| Service externe (GitBook, Notion…) | ❌ | Un compte et un outil de plus, un contenu qui se désynchronise du code. |

**Limite assumée** : le dépôt est privé, donc les admins et les joueurs du club **ne peuvent pas ouvrir GitHub**.
Les deux guides d'utilisation sont écrits pour eux et se transmettent tels quels (impression ou PDF depuis
GitHub). Une page d'aide **dans l'application** serait le bon canal pour les joueurs ; c'est une évolution
fonctionnelle, hors périmètre ici (§6).

## 4. Exigences

| ID | Exigence |
|---|---|
| FR-1300 | Le README est la **page d'accueil** du projet : ce que fait l'application, à quoi elle ressemble (captures), ses principes, comment l'essayer en 5 minutes, et un sommaire vers la documentation. Il ne contient plus les procédures détaillées. |
| FR-1301 | Le README reflète la version courante : fonctionnalités des specs 003 à 012, numéro de version identique à `package.json`. |
| FR-1302 | `docs/README.md` est le **sommaire** de la documentation, organisé par lecteur (§2). |
| FR-1303 | **Guide de l'admin** : premiers pas, comptes, saisons, barème, engagements, validation des matchs, suivi, exports, journal, apparence, profil mental, données personnelles. |
| FR-1304 | **Guide du joueur** : connexion, installation sur le téléphone, accueil, déclaration d'un match, classement, détail des points, compte, « Mes données ». Écrit pour un jeune de 8 à 17 ans et ses parents : phrases courtes, pas de vocabulaire technique. |
| FR-1305 | **Référence du barème** : chaque règle de calcul, l'ordre dans lequel elles s'appliquent, des exemples chiffrés vérifiables avec le barème de démonstration. |
| FR-1306 | **Exploitation** : installation Docker, référence de toutes les variables d'environnement, sauvegardes ; le guide Vercel + Neon existant (`docs/DEPLOIEMENT.md`) est conservé à la même adresse. |
| FR-1307 | **Technique** : architecture, modèle de données, sécurité et données personnelles, tests. |
| FR-1308 | Les captures d'écran sont **générées** par une commande (`npm run docs:captures`) à partir des données de démonstration : elles se refont après un changement d'interface et ne montrent jamais de donnée réelle. |
| FR-1309 | Un contrôle automatique (`npm run docs:check`, lancé par la CI) échoue si un lien relatif de la documentation pointe vers un fichier absent ou si la version annoncée par le README diffère de `package.json`. |
| FR-1310 | La procédure de release (`CONTRIBUTING.md`) inclut la mise à jour de la documentation : guide concerné, version du README, captures si l'écran a changé. |

## 5. Décisions par défaut

- **Langue** : français, comme l'interface et les specs.
- **Pas de doublon** : la documentation renvoie aux specs pour le détail des règles (`FR-xxx`) et ne recopie pas
  le CHANGELOG. Les specs disent ce qui a été décidé et pourquoi ; la documentation dit comment s'en servir.
- **Organisation à plat** dans `docs/` (une dizaine de fichiers) : pas de sous-dossiers tant que ce n'est pas
  nécessaire.
- **`docs/DEPLOIEMENT.md` inchangé** de nom et de contenu : il est cité par la constitution, le CHANGELOG et les
  specs livrées.

## 6. Hors périmètre

Page d'aide dans l'application ; site de documentation généré (GitHub Pages) ; traduction ; documentation
d'API (l'application n'expose pas d'API publique).

## 7. Données et migration

Aucune donnée nouvelle, aucune migration, aucun changement de comportement de l'application.

## 8. Vérification

- `npm run docs:check` : liens relatifs et version du README (FR-1309), lancé par la CI.
- `npm run docs:captures` : régénère les captures sur une base de démonstration (FR-1308).
- Relecture des guides écran par écran sur la version déployée.
