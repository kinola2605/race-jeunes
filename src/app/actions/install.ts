"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSession } from "@/server/auth/session";
import { install, needsInstallation } from "@/server/services/installation";
import { attempt, clientIp, str } from "./util";

/** Après une erreur, les champs non secrets sont réaffichés (React vide le formulaire à chaque envoi). */
export type InstallState = { error?: string; values?: { clubName: string; clubShortName: string; pseudo: string } } | undefined;

/** Spec 016 — FR-1605 à FR-1607 : crée le premier admin et le nom du club, puis connecte l'admin. */
export async function installAction(_prev: InstallState, fd: FormData): Promise<InstallState> {
  if (!(await needsInstallation())) redirect("/connexion");
  const r = await attempt(async () =>
    install(
      {
        code: str(fd, "code").slice(0, 200),
        clubName: str(fd, "clubName").slice(0, 200),
        clubShortName: str(fd, "clubShortName").slice(0, 50),
        pseudo: str(fd, "pseudo").slice(0, 40),
        password: str(fd, "password").slice(0, 200),
        confirm: str(fd, "confirm").slice(0, 200),
      },
      await clientIp(),
    ),
  );
  if (!r.ok) {
    return {
      error: r.error,
      values: {
        clubName: str(fd, "clubName").slice(0, 80),
        clubShortName: str(fd, "clubShortName").slice(0, 12),
        pseudo: str(fd, "pseudo").slice(0, 20),
      },
    };
  }
  await createSession(r.data);
  revalidatePath("/", "layout");
  redirect("/admin");
}
