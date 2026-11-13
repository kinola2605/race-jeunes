"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/server/auth/session";
import { setOwnAvatar } from "@/server/services/avatar";
import { run, str } from "./util";

/** Spec 007 — FR-705, FR-706 : avatar de l'utilisateur connecté (jamais celui d'un autre compte). */
export async function setAvatarAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  const reset = str(fd, "reset") === "1";
  await run("/compte", async () => {
    const v = await setOwnAvatar(user, reset ? "" : str(fd, "icon"), reset ? "" : str(fd, "color"));
    revalidatePath("/", "layout");
    return v ? "Avatar enregistré." : "Avatar par défaut rétabli.";
  });
}
