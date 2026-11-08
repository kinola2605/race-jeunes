-- Rôle applicatif à moindres privilèges (lecture/écriture des données, aucun DDL).
--
-- À exécuter UNE FOIS par branche Neon (production, puis preview), dans le SQL Editor de Neon,
-- connecté avec le rôle propriétaire (neondb_owner), APRÈS la première migration (npm run db:migrate).
--
-- 1. Remplacez <MOT_DE_PASSE_FORT> directement dans l'éditeur Neon (60 bits d'entropie minimum,
--    exigés par Neon), exécutez, puis effacez-le de l'éditeur. Ne l'enregistrez jamais dans ce fichier.
-- 2. Construisez DATABASE_URL avec ce rôle et l'hôte « -pooler » (voir docs/DEPLOIEMENT.md).
--
-- Un rôle créé en SQL n'appartient PAS à neon_superuser (contrairement à un rôle créé dans la console).

CREATE ROLE race_app WITH LOGIN PASSWORD '<MOT_DE_PASSE_FORT>' NOCREATEDB NOCREATEROLE NOINHERIT;

-- Personne d'autre que le propriétaire ne crée d'objets dans le schéma.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO race_app;

-- Données : lecture et écriture uniquement.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO race_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO race_app;

-- Tables créées par les migrations futures (exécutées par neondb_owner) : mêmes droits, automatiquement.
ALTER DEFAULT PRIVILEGES FOR ROLE neondb_owner IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO race_app;
ALTER DEFAULT PRIVILEGES FOR ROLE neondb_owner IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO race_app;

-- L'historique des migrations ne concerne pas l'application.
REVOKE ALL ON TABLE "_prisma_migrations" FROM race_app;

-- Vérification (doit renvoyer : race_app | f | f | f)
SELECT rolname, rolsuper, rolcreatedb, rolcreaterole FROM pg_roles WHERE rolname = 'race_app';
