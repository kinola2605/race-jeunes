"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { authenticate, changeOwnPassword } from "@/server/services/accounts";
import { createSession, destroyCurrentSession, requireUser, revokeSessions } from "@/server/auth/session";
import { db } from "@/server/db";
import { attempt, str } from "./util";

export type FormState = { error?: string; ok?: string } | undefined;

/** Origine réseau du client. Sur Vercel, `x-vercel-forwarded-for` est posé par la plateforme (non falsifiable). */
async function clientIp(): Promise<string> {
  const h = await headers();
  const first = (v: string | null) => v?.split(",")[0]?.trim();
  return first(h.get("x-vercel-forwarded-for")) || first(h.get("x-forwarded-for")) || h.get("x-real-ip") || "local";
}

/** FR-001, FR-003, FR-004 */
export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const pseudo = str(fd, "pseudo").slice(0, 40);
  const password = str(fd, "password").slice(0, 200);
  const result = await authenticate(pseudo, password, await clientIp());
  if (!result.ok) return { error: result.error };
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
