// Génère, SUR VOTRE POSTE, les secrets de mise en production (rien n'est affiché à l'écran) :
//   - un mot de passe pour le rôle race_app, par branche Neon ;
//   - un SESSION_SECRET, par environnement Vercel.
//
//   node scripts/secrets-neon.mjs --production <hôte-pooler-prod> --preview <hôte-pooler-preview>
//
// Écrit (fichiers ignorés par git, refus d'écraser un fichier existant) :
//   .env.secrets.local       → les instructions SQL Neon et les valeurs à coller dans Vercel
//   .env.neon.production     → DATABASE_URL (race_app) pour `npm run bootstrap-admin`
//   .env.neon.preview        → idem pour la preview
// Supprimez .env.secrets.local une fois les valeurs saisies dans Neon et Vercel.
import { randomBytes } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";

const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : undefined;
};
const hosts = { production: arg("--production"), preview: arg("--preview") };
for (const [env, host] of Object.entries(hosts)) {
  if (!host || !/^ep-[a-z0-9-]+-pooler\.[a-z0-9.-]+\.neon\.tech$/.test(host)) {
    console.error(`Hôte pooler invalide pour ${env} (attendu : ep-…-pooler.….neon.tech).`);
    process.exit(1);
  }
}
const files = [".env.secrets.local", ".env.neon.production", ".env.neon.preview"];
const existing = files.filter((f) => existsSync(f));
if (existing.length) {
  console.error(`Fichier(s) déjà présent(s), rien n'a été écrit : ${existing.join(", ")}`);
  process.exit(1);
}

const secret = (bytes) => randomBytes(bytes).toString("base64url");
const out = {};
for (const [env, host] of Object.entries(hosts)) {
  const password = secret(24); // ~190 bits, uniquement [A-Za-z0-9_-] : sûr dans une URL et en SQL
  out[env] = {
    sql: `ALTER ROLE race_app WITH PASSWORD '${password}';`,
    url: `postgresql://race_app:${password}@${host}/neondb?sslmode=require`,
    session: secret(48),
  };
}

const section = (env, label, branch) => `## ${label}

1. Neon → SQL Editor → branche « ${branch} » → exécuter :

   ${out[env].sql}

2. Vercel → Settings → Environment Variables → environnement « ${label} » uniquement, type Sensitive :

   DATABASE_URL=${out[env].url}
   SESSION_SECRET=${out[env].session}
`;

writeFileSync(
  ".env.secrets.local",
  `# SECRETS — ne jamais versionner ni partager. Supprimer ce fichier après usage.\n\n${section("production", "Production", "production")}\n${section("preview", "Preview", "preview")}`,
  { mode: 0o600 },
);
writeFileSync(".env.neon.production", `DATABASE_URL="${out.production.url}"\n`, { mode: 0o600 });
writeFileSync(".env.neon.preview", `DATABASE_URL="${out.preview.url}"\n`, { mode: 0o600 });
console.log("Secrets générés dans .env.secrets.local, .env.neon.production et .env.neon.preview (ignorés par git).");
console.log("Ouvrez .env.secrets.local et suivez les étapes, puis supprimez-le.");
