// Construction sur Vercel (script « vercel-build », appelé par Vercel à la place de « build »).
//
// Spec 016 (FR-1602) : si l'URL DIRECTE de la base est disponible (DATABASE_URL_UNPOOLED, fournie par
// l'intégration Neon de Vercel), les migrations en attente sont appliquées avant la construction.
// Sans cette variable (installation avancée, docs/DEPLOIEMENT.md), aucune migration n'est tentée : elles
// restent lancées depuis le poste de l'exploitant (npm run db:migrate:remote).
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

/** Décide si les migrations doivent tourner ; renvoie la raison, sans jamais exposer l'URL. */
export function migrationPlan(env) {
  if (env.SKIP_AUTO_MIGRATIONS === "true") return { migrate: false, reason: "SKIP_AUTO_MIGRATIONS=true" };
  const direct = env.DATABASE_URL_UNPOOLED ?? "";
  if (!direct) return { migrate: false, reason: "pas d'URL directe (DATABASE_URL_UNPOOLED) : migrations manuelles" };
  let host;
  try {
    host = new URL(direct).hostname;
  } catch {
    return { migrate: false, error: "DATABASE_URL_UNPOOLED n'est pas une URL valide." };
  }
  if (host.includes("-pooler")) {
    return { migrate: false, error: "DATABASE_URL_UNPOOLED pointe vers le pooler : il faut l'URL directe (sans « -pooler »)." };
  }
  return { migrate: true, reason: `base ${host}` };
}

const mask = (s) => (s ?? "").replace(/postgres(ql)?:\/\/\S+/g, "<url masquée>");

function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: "utf8", env: process.env, shell: process.platform === "win32" });
  process.stdout.write(mask(r.stdout));
  process.stderr.write(mask(r.stderr));
  return r.status ?? 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const plan = migrationPlan(process.env);
  if (plan.error) {
    console.error(`Migrations : ${plan.error}`);
    process.exit(1);
  }
  if (plan.migrate) {
    console.log(`Migrations automatiques (${plan.reason})…`);
    const code = run("npx", ["prisma", "migrate", "deploy"]);
    if (code !== 0) process.exit(code);
  } else {
    console.log(`Migrations automatiques ignorées : ${plan.reason}.`);
  }
  process.exit(run("npx", ["next", "build"]));
}
