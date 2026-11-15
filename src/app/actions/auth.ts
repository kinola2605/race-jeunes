"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authenticate, changeOwnPassword } from "@/server/services/accounts";
import { createSession, destroyCurrentSession, requireUser, revokeSessions } from "@/server/auth/session";
import { db } from "@/server/db";
import { attempt, clientIp, str } from "./util";

export type FormState = { error?: string; ok?: string } | undefined;
/** Spec 017, FR-1704 : le pseudo saisi est renvoyé après un échec (jamais le mot de passe). */
export type LoginState = { error: string; pseudo: string } | undefined;

/** FR-001, FR-003, FR-004 */
export async function loginAction(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const pseudo = str(fd, "pseudo").slice(0, 40);
  const password = str(fd, "password").slice(0, 200);
  const result = await authenticate(pseudo, password, await clientIp());
  if (!result.ok) return { error: result.error, pseudo };
  await createSession(result.userId);
  const user = await db.user.findUniqueOrThrow({ where: { id: result.userId } });
  redirect(user.mustChangePassword ? "/mot-de-passe" : user.role === "ADMIN" ? "/admin" : "/accueil");
}

/** FR-005 à FR-007 */
export async function changePasswordAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser({ allowTemporary: true });
  const r = await attempt(() => changeOwnPassword(user.id, str(fd, "current"), str(fd, "next"), str(fd, "confirm")));
  if (!r.ok) return { error: r.error };
  await revokeSessions(user.id, true);
  if (user.mustChangePassword) redirect(user.role === "ADMIN" ? "/admin" : "/accueil");
  return { ok: "Mot de passe modifié. Vos autres sessions ont été déconnectées." };
}

export async function logoutAction(): Promise<void> {
  await destroyCurrentSession();
  redirect("/connexion");
}

/** Préférence d'affichage (cookie fonctionnel, non traçant). */
export async function setThemeAction(fd: FormData): Promise<void> {
  await requireUser({ allowTemporary: true });
  const theme = str(fd, "theme") === "light" ? "light" : "dark";
  (await cookies()).set("theme", theme, { path: "/", sameSite: "lax", httpOnly: true, maxAge: 365 * 24 * 3600 });
  redirect("/compte");
}
