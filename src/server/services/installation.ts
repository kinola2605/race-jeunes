import "server-only";
import { checkNewPassword, hashPassword } from "@/server/auth/password";
import { ensureSessionSecret } from "@/server/auth/stored-secret";
import { clearFailures, isLocked, recordFailure, throttleKey } from "@/server/auth/throttle";
import { normalizePseudo } from "./accounts";
import { checkClubIdentity } from "./appearance";
import { SYSTEM_ACTOR, UserError, audit, db } from "./common";
import { installCodeMatches, installCodeStatus } from "./install-code";

const APPEARANCE_ID = "club";

/** FR-1604 : l'installation n'est possible que tant qu'aucun admin n'existe. */
export async function needsInstallation(): Promise<boolean> {
  return (await db.user.count({ where: { role: "ADMIN" } })) === 0;
}

export interface InstallInput {
  code: string;
  clubName: string;
  clubShortName: string;
  pseudo: string;
  password: string;
  confirm: string;
}

/** FR-1605 à FR-1607. Renvoie l'identifiant de l'admin créé. */
export async function install(input: InstallInput, ip: string): Promise<string> {
  if (installCodeStatus() !== "ok") {
    throw new UserError("Le code d'installation n'est pas configuré : ajoutez INSTALL_CODE dans Vercel, puis redéployez.");
  }
  await ensureSessionSecret();
  const keys = [throttleKey("ip", ip)];
  if (await isLocked(keys)) throw new UserError("Trop de tentatives. Réessayez dans 15 minutes.");
  if (!installCodeMatches(input.code)) {
    await recordFailure(keys);
    throw new UserError("Code d'installation incorrect.");
  }

  const club = checkClubIdentity(input.clubName, input.clubShortName);
  const { pseudo, key } = normalizePseudo(input.pseudo);
  if (input.password !== input.confirm) throw new UserError("Les deux mots de passe ne correspondent pas.");
  const check = checkNewPassword(pseudo, "", input.password);
  if (!check.ok) throw new UserError(check.error);
  const passwordHash = await hashPassword(input.password);

  // Verrou transactionnel : deux installations simultanées ne créent jamais deux admins (FR-1607).
  const userId = await db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(16016)`;
    if ((await tx.user.count({ where: { role: "ADMIN" } })) > 0) {
      throw new UserError("L'application est déjà installée : connectez-vous.");
    }
    if (await tx.user.findUnique({ where: { pseudoKey: key }, select: { id: true } })) {
      throw new UserError("Ce pseudo est déjà utilisé : choisissez-en un autre.");
    }
    const admin = await tx.user.create({
      data: { pseudo, pseudoKey: key, passwordHash, role: "ADMIN", mustChangePassword: false, passwordChangedAt: new Date() },
    });
    await tx.clubAppearance.upsert({
      where: { id: APPEARANCE_ID },
      create: { id: APPEARANCE_ID, ...club },
      update: club,
    });
    await audit(tx, SYSTEM_ACTOR, "Compte", "Installation", pseudo, {
      club: club.clubName,
      ...(club.clubShortName ? { sigle: club.clubShortName } : {}),
    });
    return admin.id;
  });
  await clearFailures(keys);
  return userId;
}
