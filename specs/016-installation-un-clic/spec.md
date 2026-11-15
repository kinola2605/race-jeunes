# Spécification fonctionnelle — Installation en un clic

**Branche** `feat/016-installation-un-clic` · **Créée** 2026-11-15 · **Statut** En développement · **Origine**
demande du mainteneur après la publication du dépôt

> Ce document décrit le **quoi** et le **pourquoi**. La constitution reste la règle
> (`.specify/memory/constitution.md`) ; les exigences existantes sont dans `specs/livrees/001-race-jeunes/spec.md`.

## 1. Besoin

Permettre à un club de tennis d'installer **sa propre** Race jeunes sans compétence technique.

Aujourd'hui, la mise en ligne ([docs/DEPLOIEMENT.md](../../docs/DEPLOIEMENT.md)) demande de créer une base Neon,
de recopier des URL de connexion, de créer un rôle SQL, de lancer des migrations et un script d'admin en ligne
de commande, et de générer un secret. C'est hors de portée d'un bénévole de club.

**Décisions du mainteneur** (2026-11-15) :
- le projet **n'héberge pas** l'application pour les clubs : chaque club a sa propre installation, sur ses
  propres comptes (gratuits) ;
- **une installation = un club** : aucune donnée partagée entre clubs (pas de multi-club dans une même base).

## 2. Personas concernés

- **Responsable du club** (bénévole, non technicien) : installe l'application, devient le premier admin.
- **Mainteneur du projet** : publie les nouvelles versions.
- **Exploitant avancé** : garde la procédure détaillée actuelle (rôle applicatif sans droits sur le schéma).

## 3. User stories

- **US-I1** — En tant que responsable de club, je clique sur « Déployer » dans le README, je crée un compte
  Vercel (avec GitHub), j'accepte la base de données proposée, je choisis un **code d'installation**, et
  j'obtiens l'adresse de mon application, sans terminal ni copier-coller d'URL technique.
- **US-I2** — À la première ouverture de l'application, un écran d'installation me demande le code choisi,
  le nom du club et mon compte admin (pseudo, mot de passe). Je suis ensuite connecté comme admin.
- **US-I3** — Quand une nouvelle version sort, je la récupère depuis GitHub en un clic ; la base se met à
  jour toute seule au déploiement.
- **US-I4** — En tant qu'exploitant avancé, je garde ma configuration : rien ne change si je fournis déjà
  `SESSION_SECRET` et que je migre moi-même.

## 4. Exigences fonctionnelles

| ID | Exigence |
|---|---|
| FR-1600 | Le README propose un bouton **« Déployer sur Vercel »** qui crée le projet du club à partir du dépôt public et lui associe une base **Neon** gratuite (intégration Vercel), sans saisie d'URL de base de données. |
| FR-1601 | Le formulaire de déploiement ne demande qu'**une** valeur : le **code d'installation** (`INSTALL_CODE`), choisi librement, 8 caractères minimum, avec une explication en français. |
| FR-1602 | Au **déploiement**, si l'URL directe de la base est disponible (`DATABASE_URL_UNPOOLED`, fournie par l'intégration Neon), les migrations en attente sont appliquées automatiquement avant la construction. Sans URL directe (configuration avancée actuelle), rien ne change : les migrations restent manuelles. |
| FR-1603 | Sans `SESSION_SECRET` fourni, l'application **génère elle-même** sa clé de session au premier besoin, la conserve en base et la réutilise ensuite (y compris entre plusieurs instances). Un `SESSION_SECRET` fourni reste prioritaire. |
| FR-1604 | Tant qu'**aucun admin** n'existe, la page de connexion renvoie vers un **écran d'installation** (`/installation`). Dès qu'un admin existe, cet écran n'existe plus (404). |
| FR-1605 | L'écran d'installation demande : le **code d'installation**, le **nom du club** (obligatoire), son **sigle** (facultatif), le **pseudo** et le **mot de passe** (avec confirmation) du premier admin. Rappel « aucune donnée personnelle » sous le pseudo, comme partout. |
| FR-1606 | Le code est vérifié côté serveur (comparaison à temps constant). Les échecs comptent dans le verrouillage anti-abus par origine réseau existant (FR-004). Sans `INSTALL_CODE` configuré, l'écran explique où l'ajouter dans Vercel et ne permet pas de créer de compte. |
| FR-1607 | L'installation crée, en une seule opération : l'admin (mot de passe choisi, pas de changement forcé), le nom et le sigle du club, une entrée au journal d'audit « Installation ». Deux installations simultanées ne peuvent pas créer deux admins. L'admin est ensuite connecté et arrive sur le tableau de bord. |
| FR-1608 | Le **nom** et le **sigle** du club sont modifiables par l'admin dans **Apparence**. Ils priment sur les variables `CLUB_NAME` / `CLUB_SHORT_NAME`, qui restent des valeurs par défaut. |
| FR-1609 | Un club installé par le bouton récupère une nouvelle version par un **workflow GitHub « Mettre à jour Race jeunes »** lancé à la main depuis l'onglet Actions de son dépôt : il intègre la dernière version publiée et déclenche le redéploiement (donc les migrations, FR-1602). Le workflow ne fait rien dans le dépôt du projet lui-même. |
| FR-1610 | Un **guide d'installation pas à pas** pour non-techniciens (captures, vocabulaire simple, durée, coûts : 0 €) est la première entrée de la documentation ; la procédure actuelle devient « installation avancée ». |

## 5. Critères d'acceptation (Given / When / Then)

1. **Given** une base vide et `INSTALL_CODE=club-2026`, **when** j'ouvre `/connexion`, **then** je suis
   renvoyé vers `/installation`.
2. **Given** l'écran d'installation, **when** je saisis un mauvais code, **then** un message d'erreur
   s'affiche et aucun compte n'est créé.
3. **Given** le bon code, un nom de club, un pseudo et un mot de passe valide confirmé, **when** je valide,
   **then** je suis connecté comme admin sur `/admin`, le nom du club apparaît sur la page de connexion et le
   journal contient « Installation ».
4. **Given** un admin existant, **when** j'ouvre `/installation`, **then** la page n'existe pas (404).
5. **Given** aucun `SESSION_SECRET`, **when** l'application démarre en production et qu'on se connecte, **then**
   la connexion fonctionne et reste valide après redémarrage (clé conservée en base).
6. **Given** un déploiement Vercel avec `DATABASE_URL_UNPOOLED`, **then** les migrations en attente sont
   appliquées avant `next build` ; **given** un déploiement sans cette variable, **then** aucune migration
   n'est tentée.
7. **Given** l'admin dans Apparence, **when** il change le nom du club, **then** le nouveau nom s'affiche sur la
   connexion et dans le manifeste de l'application.

## 6. Cas limites

| Cas | Comportement |
|---|---|
| Quelqu'un découvre l'adresse avant le club | Il ne peut rien faire sans le code d'installation. |
| Code d'installation oublié | Le responsable le relit ou le change dans Vercel (Settings → Environment Variables), puis redéploie. |
| Base Neon en veille au premier accès | Relance automatique de la connexion (existant) ; l'écran s'affiche après ~1 s. |
| Migration destructive dans une future version | Le CHANGELOG le signale ; le déploiement automatique l'applique : le mainteneur s'interdit les migrations destructives sans étape de transition. |
| Workflow de mise à jour en conflit (le club a modifié son code) | Le workflow échoue avec un message ; aucune modification n'est poussée. |
| Version publiée qui modifie les workflows GitHub | Le workflow ne peut pas les pousser avec ses droits : il le signale et indique la marche manuelle. |
| Installation Docker | Inchangée (admin par `ADMIN_PSEUDO`/`ADMIN_PASSWORD`) ; sans `SESSION_SECRET`, la clé est désormais conservée en base au lieu d'être régénérée à chaque redémarrage. |

## 7. Hors périmètre

- Hébergement mutualisé par le projet, multi-club dans une même base.
- Création automatique du rôle applicatif sans droits sur le schéma : l'installation en un clic utilise le
  rôle fourni par l'intégration Neon (voir §8).
- Mises à jour automatiques sans action du club.

## 8. Sécurité et données

- **Rôle de base** : en installation en un clic, l'application utilise le rôle propriétaire fourni par
  l'intégration (droits sur le schéma). C'est un compromis assumé au profit de la simplicité ; l'installation
  avancée garde le rôle `race_app` sans droits sur le schéma.
- **Clé de session en base** : quelqu'un qui lit la base y trouve aussi la clé. Elle ne permet pas de
  retrouver les jetons de session (seules leurs empreintes sont stockées) ; changer la clé (supprimer la ligne
  ou fournir `SESSION_SECRET`) déconnecte tout le monde.
- **Aucune donnée personnelle nouvelle** : nom et sigle du club seulement (constitution III).
- Le code d'installation n'est jamais stocké en base ni journalisé.
