# Données personnelles et sécurité

L'application s'adresse à des mineurs. Son principe est de **ne rien savoir d'eux** : pas de nom, pas d'e-mail,
pas de date de naissance, pas de photo. C'est le principe III de la
[constitution](../.specify/memory/constitution.md), et aucune évolution ne peut y déroger sans l'amender.

## 1. Ce qui est enregistré

| Donnée | Détail |
|---|---|
| Compte | Pseudo (attribué par le club), rôle, statut, classement FFT, avatar (un pictogramme et une couleur), empreinte du mot de passe |
| Étiquettes | Regroupements libres (« Groupe A ») |
| Historique du classement | Date et auteur de chaque changement |
| Engagements | Saison, classement de départ, objectif de matchs |
| Matchs | Date, adversaire (pseudo, ou libellé neutre pour un extérieur), score, type, tournoi, statut |
| Points | Par match, avec le détail du calcul |
| Journal d'audit | Actions d'administration et actions sur le compte |
| Sessions | Date de création et d'expiration ; le jeton n'est conservé que sous forme d'empreinte |

## 2. Ce qui n'est jamais enregistré

Nom, prénom, adresse e-mail, téléphone, date de naissance, âge, sexe, photo, adresse IP persistée.

Chaque champ de saisie libre rappelle : « Ne saisissez aucune donnée personnelle (nom réel, etc.) ». L'import
CSV refuse tout fichier contenant une autre colonne que `pseudo` et `classement`.

Trois demandes du club ont été adaptées pour respecter ce principe :

| Demande | Réponse |
|---|---|
| Photos de profil | Des **avatars** composés d'un pictogramme et d'une couleur, sans dépôt de fichier ([spec 007](../specs/livrees/007-photos-profil/spec.md)) |
| Envoi du mot de passe par e-mail | Un bouton qui ouvre la **messagerie de l'admin** avec un message prêt ; l'application ne connaît aucune adresse et n'envoie rien elle-même ([spec 009](../specs/livrees/009-envoi-mot-de-passe-email/spec.md)) |
| Suivi du mental | Des indicateurs **calculés** à partir des scores, sans questionnaire ni saisie ([spec 012](../specs/livrees/012-profil-mental/spec.md)) |

## 3. Aucun tiers

Aucun cookie de suivi, aucun outil de statistiques, aucune ressource chargée depuis un autre domaine : polices
et icônes sont auto-hébergées, et la politique de sécurité du contenu (`default-src 'self'`) l'impose au
navigateur. Le seul cookie est celui de session.

L'hébergeur (Vercel et Neon, région Francfort) n'est pas un tiers au sens de ce principe tant que les données
restent dans l'Union européenne.

## 4. Durées de conservation

| Donnée | Durée |
|---|---|
| Saisons archivées et leurs matchs | Sans limite (données pseudonymes, historique du club) |
| Journal d'audit | 5 ans |
| Sessions | 30 jours au plus |
| Compteurs anti-abus | 24 heures |
| Comptes | Jamais supprimés s'ils ont un historique : **désactivés**, pour que les classements passés restent exacts |

## 5. Droits des personnes (RGPD)

Un pseudo reste une donnée à caractère personnel dès lors que le club sait qui est derrière. L'application
outille donc les droits ([spec 008](../specs/livrees/008-espace-rgpd/spec.md)) :

| Droit | Comment |
|---|---|
| **Accès** | Mon compte → Mes données : la liste de ce qui est enregistré, par catégorie |
| **Portabilité** | « Télécharger mes données » : un fichier JSON avec le compte, les saisons, les matchs vus par le joueur, ses points et leur détail, son journal, ses sessions. Jamais de mot de passe, de jeton, ni de donnée d'un autre joueur |
| **Par l'admin** | Fiche joueur → onglet Compte → « Télécharger ses données (RGPD) », y compris pour un compte désactivé |
| **Rectification, effacement** | Sur demande au club, qui corrige ou désactive le compte |

Chacun ne télécharge que ses propres données (contrôle côté serveur) et chaque téléchargement est tracé au
journal. Le club reste le responsable du traitement : c'est à lui d'informer les familles.

## 6. Accès fermé

- **Aucune inscription libre** : pas de page, pas de route, pas d'OAuth, pas de lien d'invitation. Un test
  automatisé le prouve (`tests/e2e/acces-ferme.spec.ts`).
- Seul un admin connecté crée des comptes. Le premier admin est créé par une commande d'installation.
- Mot de passe temporaire aléatoire, affiché **une seule fois**, jamais stocké en clair ni journalisé ;
  changement obligatoire à la première connexion et après chaque réinitialisation.
- Nouveau mot de passe : 10 caractères au moins, différent de l'actuel, sans le pseudo.

## 7. Mesures de sécurité

| Sujet | Mesure |
|---|---|
| Mots de passe | Hachage **argon2id** |
| Sessions | Côté serveur, révocables ; cookie `HttpOnly`, `Secure`, `SameSite=Lax`, 30 jours au plus ; empreinte HMAC en base. Désactiver un compte ou changer de mot de passe coupe les sessions |
| Anti-abus | Message d'erreur identique que le pseudo existe ou non ; blocage 15 minutes après 5 échecs par pseudo ou 20 par origine réseau |
| Contrôle d'accès | Rôle vérifié **côté serveur** sur chaque page et chaque action |
| Entrées | Validées avec Zod ; requêtes paramétrées par l'ORM |
| CSRF | Vérification d'origine des server actions, et refus (403) par le middleware de toute écriture d'une autre origine |
| En-têtes | CSP sans tiers, HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy: no-referrer` ; API en `no-store` |
| Logo déposé | Type contrôlé d'après le contenu, 512 Ko au plus, servi sous une CSP qui interdit tout script |
| Base de données | En production, l'application utilise un rôle **sans droit de modifier le schéma** ; les migrations partent du poste de l'exploitant, avec confirmation |
| Secrets | Hors du dépôt ; `SESSION_SECRET` obligatoire en production |
| Journaux techniques | Ni mot de passe, ni jeton, ni adresse IP persistée |
| Traçabilité | Journal d'audit en ajout seul pour toute action d'administration |

Détail côté hébergement : [DEPLOIEMENT.md § 11](DEPLOIEMENT.md#11-récapitulatif-sécurité).

## 8. Signaler un problème de sécurité

N'ouvrez pas de ticket public : contactez directement le mainteneur du dépôt. En cas de doute sur une fuite,
changez `SESSION_SECRET` et redéployez : toutes les sessions sont coupées.
