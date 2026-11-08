# Constitution — Race jeunes

**Version** 1.1.0 · **Ratifiée** 2026-11-07 · **Dernier amendement** 2026-11-08

Cette constitution fixe les principes **non négociables** du projet. Toute spécification, tout plan,
toute tâche et toute PR doivent s'y conformer. En cas de conflit, la constitution l'emporte.

## Principes

### I. La spécification est la source de vérité (Spec-Driven Development)
- Chaque fonctionnalité naît d'une exigence numérotée (`FR-xxx`) de `specs/001-race-jeunes/spec.md`,
  reliée à un écran des maquettes validées (`design/maquettes/`).
- Le code, la spec, le plan, les tâches et les maquettes sont tenus synchronisés : une PR qui change un
  comportement met à jour la spec dans la même PR.
- Toute ambiguïté est marquée `[NEEDS CLARIFICATION]` ; une décision par défaut est consignée dans la spec.

### II. Tests d'abord
- Cycle **rouge → vert → refactor**. Une exigence sans test d'acceptation n'est pas terminée.
- Le **moteur de points** est une bibliothèque pure (aucune dépendance à la base ni au framework),
  couverte à **100 %** (lignes, branches, fonctions), par des tables d'exemples issues de la spec,
  incluant au moins **deux barèmes différents** pour prouver l'indépendance des saisons.
- Les parcours critiques (connexion, changement de mot de passe forcé, création de compte, saisie et
  validation de match, classement) sont couverts par des tests E2E.
- La CI (lint, typage, tests unitaires, E2E, build) doit être verte pour fusionner.

### III. Zéro donnée personnelle
- L'application ne collecte ni ne stocke **nom, prénom, e-mail, date de naissance, téléphone, photo,
  âge, sexe**. Un joueur est identifié uniquement par un **pseudo** attribué par l'admin.
- Tout champ de saisie libre (pseudo, titre de saison, libellé d'adversaire extérieur, notes, motifs)
  affiche l'avertissement « Ne saisissez aucune donnée personnelle (nom réel, etc.) ».
- Les regroupements passent par des **étiquettes libres** sans lien avec une donnée personnelle.
- Aucun cookie de traçage, aucun outil d'analytics, **aucune ressource chargée depuis un tiers**
  (polices, icônes, scripts : tout est auto-hébergé). Aucun envoi de données à un service externe.
  L'hébergeur de l'application et de la base (ex. Vercel + Neon) n'est pas un « service externe » au sens
  de ce principe, à condition que les données restent hébergées dans l'Union européenne.
- Les journaux techniques ne contiennent ni mot de passe, ni jeton, ni adresse IP persistée.
- Conservation : les saisons archivées et leurs matchs sont conservés sans limite de durée (données
  pseudonymes, intérêt historique du club) ; le journal d'audit est conservé 5 ans ; les sessions
  expirent au plus tard après 30 jours ; les compteurs anti-abus sont purgés après 24 h.

### IV. Accès fermé — comptes créés par l'admin uniquement
- **Aucune** inscription libre : pas de page, pas de route, pas d'OAuth, pas de lien d'invitation public.
  La seule route publique est la connexion (plus les ressources statiques).
- Seul un admin authentifié crée des comptes (unitaire ou import CSV). Le mot de passe temporaire est
  généré aléatoirement, affiché **une seule fois**, jamais stocké en clair ; changement obligatoire à la
  première connexion et après chaque réinitialisation.
- Le premier admin est créé par une **commande de bootstrap** (variables d'environnement / CLI).
- Anti-abus : limitation des tentatives, verrouillage temporaire, message d'erreur identique pour pseudo
  inconnu et mot de passe erroné.
- Un test automatisé prouve qu'aucune route ne crée de compte sans session admin.

### V. Un barème propre à chaque saison, et un historique fidèle
- Chaque saison possède son barème, versionné. Modifier le barème d'une saison ne touche jamais une autre
  saison. Une saison clôturée a un barème verrouillé et est en lecture seule.
- Chaque match conserve la version de barème et les classements utilisés pour son calcul.
- **Aucun recalcul silencieux** : un changement de barème ne s'applique aux matchs passés qu'après un
  recalcul explicite de l'admin, précédé d'une prévisualisation d'impact et tracé dans l'audit.

### VI. Sécurité par défaut
- Mots de passe hachés avec **argon2id**. Sessions côté serveur, cookie `HttpOnly`, `Secure` en
  production, `SameSite=Lax` ; la désactivation d'un compte révoque immédiatement ses sessions.
- Contrôle d'accès par rôle **vérifié côté serveur** sur chaque action et chaque page, jamais seulement
  dans l'interface. Toutes les entrées sont validées (Zod). Requêtes paramétrées uniquement (ORM).
- Protection CSRF (vérification d'origine des mutations), en-têtes de sécurité stricts (CSP sans
  domaine tiers), échappement systématique du rendu.
- Secrets hors du dépôt (`.env` ignoré, `.env.example` documenté).

### VII. Fidélité à l'identité visuelle validée
- L'interface respecte la direction **B « Court »** validée le 2026-11-07 et les tokens de
  `design/tokens.json` (seule source des couleurs, typographies, espacements, rayons).
- Toute nouvelle couleur passe par les tokens et par une vérification de contraste documentée dans
  `design/identite.md`.

### VIII. Accessibilité
- Objectif **WCAG 2.1 AA / RGAA** : contrastes ≥ 4,5:1 (texte) et 3:1 (composants), navigation clavier,
  focus visible, libellés de formulaire, cibles tactiles ≥ 44 px, états jamais signalés par la seule
  couleur (icône ou libellé en plus), respect de `prefers-reduced-motion`.

### IX. Simplicité
- C'est une application de club (quelques centaines de joueurs). On choisit la solution la plus simple
  qui respecte les principes : pas de micro-services, pas de file de messages, pas de cache distribué.
- Déploiement auto-hébergeable : `docker compose up` suffit. Un hébergement géré gratuit (Vercel + Neon)
  est aussi supporté, sans infrastructure supplémentaire (voir `docs/DEPLOIEMENT.md`).

### X. Conventions
- TypeScript strict, ESLint, Prettier. Pas de `any` non justifié.
- **Conventional Commits** (`feat:`, `fix:`, `docs:`, `test:`, `chore:`…), en français ou en anglais.
- Une branche et une PR par user story (ou par lot cohérent), revue avant fusion, `main` protégée.
- Chaque PR d'interface joint des captures Playwright et coche la conformité à la constitution.

## Gouvernance
- Toute modification de cette constitution se fait par PR dédiée, avec incrément de version
  (MAJEUR : principe retiré ou contredit ; MINEUR : principe ajouté ; CORRECTIF : reformulation).
- Le modèle de PR contient une case « conforme à la constitution » ; un relecteur peut bloquer une PR
  qui viole un principe.
