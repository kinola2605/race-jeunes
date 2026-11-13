"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth/session";
import { db } from "@/server/db";
import { saveGoals } from "@/server/services/goals";
import { run, str } from "./util";

/** Spec 005 — FR-501, FR-506, FR-507 */
export async function saveGoalsAction(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  const seasonId = str(fd, "seasonId");
  const season = await db.season.findUnique({ where: { id: seasonId }, select: { slug: true } });
  await run(`/admin/saisons/${season?.slug ?? ""}/objectifs`, async () => {
    const input: Record<string, string> = {};
    for (const [k, v] of fd.entries()) if (k.startsWith("goal:") && typeof v === "string") input[k.slice(5)] = v;
    await saveGoals(admin, seasonId, input);
    revalidatePath("/accueil");
    return "Objectifs enregistrés.";
  });
}
