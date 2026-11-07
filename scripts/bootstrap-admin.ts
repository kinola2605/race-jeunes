/**
 * Crée le premier compte admin (FR-010), jamais via l'interface.
 *   npm run bootstrap-admin -- <pseudo> <mot-de-passe-initial>
 * ou avec les variables ADMIN_PSEUDO et ADMIN_PASSWORD. Sans effet si le pseudo existe déjà.
 * Le mot de passe initial devra être changé à la première connexion.
 */
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/server/auth/password";

async function main() {
  const pseudo = (process.argv[2] ?? process.env.ADMIN_PSEUDO ?? "").trim();
  const password = process.argv[3] ?? process.env.ADMIN_PASSWORD ?? "";
  if (!pseudo || !password) {
    console.log("Bootstrap admin ignoré (ADMIN_PSEUDO / ADMIN_PASSWORD non fournis).");
    return;
  }
  if (!/^[\p{L}\p{N}_.&-]{3,20}$/u.test(pseudo)) throw new Error("Pseudo admin invalide (3 à 20 caractères : lettres, chiffres, _ . - &).");
  if (password.length < 10) throw new Error("Mot de passe admin initial trop court (10 caractères minimum).");

  const db = new PrismaClient();
  try {
    const key = pseudo.toLocaleLowerCase("fr");
    const existing = await db.user.findUnique({ where: { pseudoKey: key } });
    if (existing) {
      console.log(`Admin « ${existing.pseudo} » déjà présent : rien à faire.`);
      return;
    }
    await db.user.create({
      data: { pseudo, pseudoKey: key, passwordHash: await hashPassword(password), role: "ADMIN", mustChangePassword: true },
    });
    await db.auditLog.create({ data: { actorPseudo: "système", type: "Compte", action: "Admin initial créé (bootstrap)", target: pseudo } });
    console.log(`Admin « ${pseudo} » créé. Changement du mot de passe exigé à la première connexion.`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
