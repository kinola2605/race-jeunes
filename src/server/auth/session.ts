import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Role } from "@prisma/client";
import { db } from "@/server/db";
import { keyedDigest } from "@/server/auth/secret";

export const SESSION_COOKIE = "race_session";
const SESSION_DAYS = 30;

export interface SessionUser {
  id: string;
  pseudo: string;
  role: Role;
  mustChangePassword: boolean;
  ranking: string | null;
}

/** Empreinte HMAC du jeton (seule valeur stockée en base). */
function digest(token: string): string {
  return keyedDigest("session", token);
}

function secureCookie(): boolean {
  if (process.env.COOKIE_SECURE) return process.env.COOKIE_SECURE === "true";
  return process.env.NODE_ENV === "production";
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 3600 * 1000);
  await db.session.create({ data: { id: digest(token), userId, expiresAt } });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie(),
    path: "/",
    expires: expiresAt,
  });
}

export async function destroyCurrentSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { id: digest(token) } });
  jar.delete(SESSION_COOKIE);
}

/** Révoque toutes les sessions d'un utilisateur, sauf éventuellement la session courante. */
export async function revokeSessions(userId: string, keepCurrent = false): Promise<void> {
  let keep: string | undefined;
  if (keepCurrent) {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    keep = token ? digest(token) : undefined;
  }
  await db.session.deleteMany({ where: { userId, ...(keep ? { NOT: { id: keep } } : {}) } });
}

/** Utilisateur de la session courante, ou null (session absente, expirée ou compte désactivé). */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({ where: { id: digest(token) }, include: { user: true } });
  if (!session) return null;
  if (session.expiresAt < new Date() || session.user.status !== "ACTIVE") {
    await db.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }
  const { user } = session;
  return { id: user.id, pseudo: user.pseudo, role: user.role, mustChangePassword: user.mustChangePassword, ranking: user.ranking };
});

/** Exige une session ; un mot de passe temporaire renvoie vers le changement obligatoire (FR-005). */
export async function requireUser(options: { allowTemporary?: boolean } = {}): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/connexion");
  if (user.mustChangePassword && !options.allowTemporary) redirect("/mot-de-passe");
  return user;
}

/** Exige un admin (vérification serveur, constitution VI). */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/acces-refuse");
  return user;
}
