#!/bin/sh
# Démarrage du conteneur : migrations, admin initial, démo éventuelle, serveur.
set -e
echo "Migrations…"
npx prisma migrate deploy
npx tsx scripts/bootstrap-admin.ts
if [ "$SEED_DEMO" = "true" ]; then
  echo "Données de démonstration…"
  npx tsx prisma/seed.ts
fi
echo "Race jeunes prête sur le port ${PORT:-3000}."
exec npx next start -p "${PORT:-3000}" -H 0.0.0.0
