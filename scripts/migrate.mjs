// Applique les migrations Prisma sur une base distante (Neon), de façon contrôlée.
//
//   npm run db:migrate:remote -- <fichier-env> [--yes] [--allow-destructive]
//
// - Le fichier d'environnement (ignoré par git, ex. .env.neon.production) contient DATABASE_URL
//   et DATABASE_URL_UNPOOLED. Rien n'est affiché hormis l'hôte de la base.
// - Utilise exclusivement l'URL directe (rôle propriétaire) via `prisma migrate deploy`,
//   qui n'efface jamais de données de lui-même (pas de reset, pas de db push).
// - Refuse une migration en attente contenant DROP / TRUNCATE / DELETE sans --allow-destructive.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { parseEnv } from "node:util";

const args = process.argv.slice(2);
const envFile = args.find((a) => !a.startsWith("--"));
const yes = args.includes("--yes");
const allowDestructive = args.includes("--allow-destructive");

if (!envFile || !existsSync(envFile)) {
  console.error("Usage : npm run db:migrate:remote -- <fichier-env> [--yes] [--allow-destructive]");
  process.exit(1);
}
// Écrase les variables déjà présentes (shell, .env) : la cible est TOUJOURS celle du fichier.
Object.assign(process.env, parseEnv(readFileSync(envFile, "utf8")));
const direct = process.env.DATABASE_URL_UNPOOLED;
if (!process.env.DATABASE_URL || !direct) {
  console.error(`${envFile} doit définir DATABASE_URL et DATABASE_URL_UNPOOLED.`);
  process.exit(1);
}
const target = (() => {
  try {
    const u = new URL(direct);
    if (u.hostname.includes("-pooler")) {
      console.error("DATABASE_URL_UNPOOLED pointe vers le pooler : utilisez l'URL directe (sans « -pooler »).");
      process.exit(1);
    }
    return `${u.hostname}${u.pathname}`;
  } catch {
    console.error("DATABASE_URL_UNPOOLED n'est pas une URL valide.");
    process.exit(1);
  }
})();

const prisma = (sub) =>
  spawnSync(process.platform === "win32" ? "npx.cmd" : "npx", ["prisma", "migrate", sub], {
    encoding: "utf8",
    shell: process.platform === "win32",
    env: process.env,
  });

console.log(`Base cible : ${target}`);
const status = prisma("status");
const out = `${status.stdout ?? ""}${status.stderr ?? ""}`;
const pending = [...new Set(out.match(/\b\d{14}_[A-Za-z0-9_]+\b/g) ?? [])].filter((name) => existsSync(`prisma/migrations/${name}/migration.sql`));
if (status.status !== 0 && pending.length === 0) {
  console.error("Impossible de lire l'état des migrations :\n" + out.replace(/postgres(ql)?:\/\/\S+/g, "<url masquée>"));
  process.exit(1);
}
if (pending.length === 0) {
  console.log("Base à jour : aucune migration en attente.");
  process.exit(0);
}
console.log("Migrations en attente :\n  - " + pending.join("\n  - "));

const DESTRUCTIVE = /\b(DROP\s+(TABLE|COLUMN|SCHEMA|TYPE|INDEX)|TRUNCATE|DELETE\s+FROM|ALTER\s+TABLE\s+\S+\s+DROP)\b/i;
const risky = pending.filter((name) => DESTRUCTIVE.test(readFileSync(`prisma/migrations/${name}/migration.sql`, "utf8")));
if (risky.length && !allowDestructive) {
  console.error("Migration(s) destructive(s) détectée(s) : " + risky.join(", "));
  console.error("Faites une sauvegarde (voir docs/DEPLOIEMENT.md), puis relancez avec --allow-destructive.");
  process.exit(1);
}

if (!yes) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`Appliquer ${pending.length} migration(s) sur ${target} ? Tapez « oui » : `);
  rl.close();
  if (answer.trim().toLowerCase() !== "oui") {
    console.log("Annulé.");
    process.exit(1);
  }
}

const deploy = prisma("deploy");
process.stdout.write((deploy.stdout ?? "").replace(/postgres(ql)?:\/\/\S+/g, "<url masquée>"));
process.stderr.write((deploy.stderr ?? "").replace(/postgres(ql)?:\/\/\S+/g, "<url masquée>"));
process.exit(deploy.status ?? 1);
