/**
 * Crée le premier compte admin (FR-010), jamais via l'interface.
 *
 * Usage recommandé (production) — le mot de passe est saisi de façon masquée, jamais en argument :
 *   npm run bootstrap-admin -- --env-file .env.neon.production <pseudo>
 * Le mot de passe choisi ainsi n'a transité nulle part : il n'est pas à changer à la première connexion.
 *
 * Usage Docker : variables ADMIN_PSEUDO et ADMIN_PASSWORD (mot de passe à changer à la première connexion).
 * Sans effet si le pseudo existe déjà.
 */
import { PrismaClient } from "@prisma/client";
import { checkNewPassword, hashPassword } from "../src/server/auth/password";
import { describeDatabase, runtimeDatabaseUrl } from "../src/server/db-url";

const MIN_INTERACTIVE = 12;

function parseArgs(argv: string[]): { envFile?: string; pseudo?: string } {
  const out: { envFile?: string; pseudo?: string } = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i] ?? "";
    if (a === "--env-file") out.envFile = argv[++i];
    else if (!a.startsWith("--") && !out.pseudo) out.pseudo = a;
  }
  return out;
}

/** Lit une saisie sans l'afficher (terminal interactif uniquement). */
function askHidden(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    if (!stdin.isTTY) return reject(new Error("Terminal interactif requis pour saisir le mot de passe."));
    process.stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let buf = "";
    const cleanup = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.off("data", onData);
      process.stdout.write("\n");
    };
    const onData = (chunk: string) => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n") {
          cleanup();
          return resolve(buf);
        }
        if (ch === "\u0003") {
          cleanup();
          return reject(new Error("Annulé."));
        }
        if (ch === "\u007f" || ch === "\b") buf = buf.slice(0, -1);
        else buf += ch;
      }
    };
    stdin.on("data", onData);
  });
}

async function main() {
  const { envFile, pseudo: argPseudo } = parseArgs(process.argv.slice(2));
  if (envFile) process.loadEnvFile(envFile);

  const pseudo = (argPseudo ?? process.env.ADMIN_PSEUDO ?? "").trim();
  if (!pseudo) {
    console.log("Bootstrap admin ignoré (aucun pseudo fourni).");
    return;
  }
  if (!/^[\p{L}\p{N}_.&-]{3,20}$/u.test(pseudo)) throw new Error("Pseudo admin invalide (3 à 20 caractères : lettres, chiffres, _ . - &).");

  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL non définie (utilisez --env-file).");
  const db = new PrismaClient({ datasourceUrl: runtimeDatabaseUrl(raw) });
  try {
    const key = pseudo.toLocaleLowerCase("fr");
    const existing = await db.user.findUnique({ where: { pseudoKey: key } });
    if (existing) {
      console.log(`Admin « ${existing.pseudo} » déjà présent : rien à faire.`);
      return;
    }

    let password = process.env.ADMIN_PASSWORD ?? "";
    let interactive = false;
    if (!password) {
      if (!process.stdin.isTTY) {
        console.log("Bootstrap admin ignoré (ADMIN_PASSWORD non fourni et pas de terminal interactif).");
        return;
      }
      console.log(`Base : ${describeDatabase(raw)} — création de l'admin « ${pseudo} ».`);
      password = await askHidden(`Mot de passe (${MIN_INTERACTIVE} caractères minimum, non affiché) : `);
      const confirm = await askHidden("Confirmez le mot de passe : ");
      if (password !== confirm) throw new Error("Les deux saisies ne correspondent pas.");
      if (password.length < MIN_INTERACTIVE) throw new Error(`Mot de passe trop court (${MIN_INTERACTIVE} caractères minimum).`);
      interactive = true;
    }
    const check = checkNewPassword(pseudo, "", password);
    if (!check.ok) throw new Error(check.error);

    await db.user.create({
      data: { pseudo, pseudoKey: key, passwordHash: await hashPassword(password), role: "ADMIN", mustChangePassword: !interactive },
    });
    await db.auditLog.create({ data: { actorPseudo: "système", type: "Compte", action: "Admin initial créé (bootstrap)", target: pseudo } });
    console.log(
      interactive
        ? `Admin « ${pseudo} » créé.`
        : `Admin « ${pseudo} » créé. Changement du mot de passe exigé à la première connexion.`,
    );
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
