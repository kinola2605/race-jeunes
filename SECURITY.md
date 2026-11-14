# Politique de sécurité

## Signaler une vulnérabilité

Merci de **ne pas ouvrir de ticket public** pour une faille de sécurité.

Utilisez le signalement privé de GitHub : onglet **Security** du dépôt → **Report a vulnerability**. Décrivez
la faille, la version concernée (badge du README ou `package.json`) et, si possible, les étapes pour la
reproduire.

Vous recevrez une première réponse dès que possible. Une fois la correction publiée, le signalement pourra
être rendu public avec votre accord.

## Versions suivies

Seule la dernière version publiée (voir le [CHANGELOG](CHANGELOG.md)) reçoit des correctifs de sécurité.

## Rappels pour les contributions

- Aucun secret dans le dépôt : `.env` et `.env.*` sont ignorés (seul `.env.example` est versionné).
- Aucune donnée réelle de joueur ni de club dans le code, les tests, les captures ou la documentation : les
  exemples utilisent les données de démonstration (`prisma/seed.ts`, `prisma/seed-volume.ts`).
- Les identifiants de démonstration du README sont publics : la démo ne doit jamais être activée en
  production (`SEED_DEMO=false`).

Les mesures de sécurité de l'application sont décrites dans
[docs/donnees-et-securite.md](docs/donnees-et-securite.md).
