"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth/session";
import { setMatchGoal } from "@/server/services/goals";
import { run, str } from "./util";

/** Spec 005 — FR-501, FR-504 : objectif de matchs d'un joueur pour une saison, depuis sa fiche. */
export async function setMatchGoalAction(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  const userId = str(fd, "userId");
  await run(`/admin/joueurs/${userId}`, async () => {
    const goal = await setMatchGoal(admin, str(fd, "seasonId"), userId, str(fd, "matchGoal"));
    revalidatePath("/accueil");
    return goal ? `Objectif enregistré : ${goal} matchs.` : "Objectif retiré.";
  });
}
