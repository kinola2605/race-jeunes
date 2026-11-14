# Documentation — Race jeunes

Choisissez votre entrée selon ce que vous venez faire.

## J'utilise l'application

| Document | Pour qui | Contenu |
|---|---|---|
| [Guide de l'admin](guide-admin.md) | Enseignant ou bénévole qui gère la Race | Lancer une saison, créer les comptes, valider les matchs, suivre, exporter |
| [Guide du joueur](guide-joueur.md) | Joueurs et parents | Se connecter, déclarer un match, lire le classement et ses points |
| [Le barème expliqué](bareme.md) | Admin, et tout joueur curieux | Comment un match devient des points, avec des exemples chiffrés |

> Le dépôt GitHub est privé : les joueurs et les admins du club n'y ont pas accès. Pour leur transmettre un
> guide, ouvrez-le sur GitHub puis imprimez la page (ou « Enregistrer au format PDF »).

## J'héberge l'application

| Document | Contenu |
|---|---|
| [Mise en ligne gratuite : Vercel + Neon](DEPLOIEMENT.md) | Procédure complète, mises à jour, rollback, sauvegardes, limites des offres gratuites |
| [Installation avec Docker](installation-docker.md) | Démonstration en 5 minutes, production auto-hébergée, sauvegardes |
| [Configuration](configuration.md) | Toutes les variables d'environnement, la marque blanche, les commandes |

## Je développe

| Document | Contenu |
|---|---|
| [Architecture](architecture.md) | Organisation du code, modèle de données, parcours d'un match, tests |
| [Données personnelles et sécurité](donnees-et-securite.md) | Ce qui est enregistré, durées de conservation, RGPD, mesures de sécurité |
| [Contribuer](../CONTRIBUTING.md) | Méthode (Spec-Driven Development), conventions, procédure de release |
| [Constitution](../.specify/memory/constitution.md) | Les dix principes non négociables du projet |
| [Spécifications](../specs/README.md) | Une spec par évolution, avec la version qui l'a livrée |
| [Journal des versions](../CHANGELOG.md) | Ce qui a changé, version par version |
| [Charte et contrastes](../design/identite.md) | Couleurs, typographie, contrastes vérifiés |

## Tenir la documentation à jour

- Une PR qui change un écran ou une règle corrige le guide concerné **dans la même PR**.
- `npm run docs:check` vérifie les liens et la version annoncée par le README (lancé par la CI).
- `npm run docs:captures` régénère les captures d'écran à partir des données de démonstration
  (application démarrée en local, voir [Architecture § Captures](architecture.md#captures-décran)).
