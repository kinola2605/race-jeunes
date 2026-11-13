# Contribuer

Ce projet suit le **Spec-Driven Development** : la spécification est la source de vérité.

1. Lisez la [constitution](.specify/memory/constitution.md) : ses principes sont non négociables
   (zéro donnée personnelle, accès fermé, barème par saison, tests d'abord, accessibilité, identité visuelle).
2. Toute évolution part d'une exigence `FR-xxx` de [spec.md](specs/livrees/001-race-jeunes/spec.md) (à créer ou
   modifier dans la même PR) et d'une tâche de [tasks.md](specs/livrees/001-race-jeunes/tasks.md).
3. **TDD** : écrivez le test (unitaire pour le moteur `src/scoring`, E2E pour un parcours) avant le code.
   Le moteur de points doit rester pur et couvert à 100 %.
4. Une branche et une PR par user story : `feat/us5-validation-groupee`, `fix/…`, `docs/…`.
5. Messages en **Conventional Commits** : `feat: …`, `fix: …`, `docs: …`, `test: …`, `chore: …`.
6. Avant d'ouvrir la PR :

   ```bash
   npm run lint && npm run typecheck && npm run test:coverage && npm run build && npm run test:e2e
   ```

7. Interface : utilisez uniquement les tokens (`design/tokens.json` → `npm run tokens`) et les composants
   existants ; joignez des captures Playwright ; vérifiez les contrastes (`design/identite.md`).
8. `main` est protégée : fusion par PR après CI verte et relecture.

## Release

**Chaque évolution poussée en production donne lieu à une release GitHub.** Dans la PR de l'évolution :

1. Version [SemVer](https://semver.org/lang/fr/) dans `package.json` (et `package-lock.json`) ; section
   `## [X.Y.Z] — AAAA-MM-JJ` et lien de version dans le [CHANGELOG](CHANGELOG.md).
2. Spec passée au statut « Déployée (vX.Y.Z) » et déplacée dans [`specs/livrees/`](specs/README.md).
3. Migration éventuelle appliquée en production **avant** la fusion
   (`npm run db:migrate:remote -- .env.neon.production`, voir [DEPLOIEMENT.md](docs/DEPLOIEMENT.md)).

Après la fusion et le déploiement Vercel de production prêt :

```bash
gh release create vX.Y.Z --target main --title "Race jeunes X.Y.Z" --notes "…section du CHANGELOG…"
```

Ne committez jamais de secret (`.env` est ignoré) ni de donnée réelle de joueur.
