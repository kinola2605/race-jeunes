#!/bin/sh
# Démarrage du conteneur : migrations, admin initial, démo éventuelle, serveur.
set -e
if [ ${#SESSION_SECRET} -lt 32 ]; then
  # Démonstration « docker compose up » sans configuration : secret éphémère.
  # Les sessions sont perdues à chaque redémarrage ; définir SESSION_SECRET dans .env en usage réel.
  echo "SESSION_SECRET absent : secret éphémère généré (définissez-le dans .env pour un usage réel)."
  SESSION_SECRET=$(node -e "process.stdout.write(require('crypto').randomBytes(48).toString('base64url'))")
  export SESSION_SECRET
fi
echo "Migrations…"
npx prisma migrate deploy
npx tsx scripts/bootstrap-admin.ts
if [ "$SEED_DEMO" = "true" ]; then
  echo "Données de démonstration…"
  npx tsx prisma/seed.ts
fi
echo "Race jeunes prête sur le port ${PORT:-3000}."
exec npx next start -p "${PORT:-3000}" -H 0.0.0.0
