import "server-only";
import { countsTowardGoal, goalProgress, parseGoal, type GoalProgress } from "@/goals/goals";
import { UserError, assertAdmin, audit, db } from "./common";
import { assertWritable } from "./seasons";
import type { Actor } from "./common";

export type GoalStatus = GoalProgress & { pending: number };

/** FR-502 : matchs comptés (validés hors forfaits) et en attente d'un joueur, par saison. */
async function countsOf(userId: string, seasonIds: string[]) {
  const matches = await db.match.findMany({
    where: { seasonId: { in: seasonIds }, status: { in: ["VALIDATED", "PENDING"] }, OR: [{ playerAId: userId }, { playerBId: userId }] },
    select: { seasonId: true, status: true, kind: true },
  });
  const out = new Map<string, { played: number; pending: number }>(seasonIds.map((id) => [id, { played: 0, pending: 0 }]));
  for (const m of matches) {
    const c = out.get(m.seasonId)!;
    if (countsTowardGoal(m)) c.played++;
    else if (m.status === "PENDING") c.pending++;
  }
  return out;
}

/** FR-503, FR-505 : objectif et progression d'un engagé pour une saison, ou null sans objectif. */
export async function playerGoal(seasonId: string, userId: string): Promise<GoalStatus | null> {
  const e = await db.enrollment.findUnique({ where: { seasonId_userId: { seasonId, userId } }, select: { matchGoal: true } });
  if (!e?.matchGoal) return null;
  const c = (await countsOf(userId, [seasonId])).get(seasonId)!;
  return { ...goalProgress(c.played, e.matchGoal), pending: c.pending };
}

/** FR-501 : progression par saison pour la fiche joueur (clé = seasonId ; absent = pas d'objectif). */
export async function goalsOfPlayer(userId: string, enrollments: { seasonId: string; matchGoal: number | null }[]): Promise<Map<string, GoalStatus>> {
  const withGoal = enrollments.filter((e) => e.matchGoal);
  const counts = await countsOf(userId, withGoal.map((e) => e.seasonId));
  return new Map(withGoal.map((e) => {
    const c = counts.get(e.seasonId)!;
    return [e.seasonId, { ...goalProgress(c.played, e.matchGoal!), pending: c.pending }];
  }));
}

/** FR-501, FR-504 : fixe, modifie ou efface (saisie vide) l'objectif d'un engagé. */
export async function setMatchGoal(actor: Actor, seasonId: string, userId: string, raw: string): Promise<number | null> {
  assertAdmin(actor);
  const parsed = parseGoal(raw);
  if (!parsed.ok) throw new UserError("Objectif : saisissez un nombre entier de matchs entre 1 et 200, ou laissez vide.");
  return db.$transaction(async (tx) => {
    const season = await tx.season.findUniqueOrThrow({ where: { id: seasonId } });
    assertWritable(season);
    const before = await tx.enrollment.findUnique({ where: { seasonId_userId: { seasonId, userId } }, include: { user: true } });
    if (!before) throw new UserError("Ce joueur n'est pas engagé dans cette saison.");
    if (before.matchGoal === parsed.value) return parsed.value;
    await tx.enrollment.update({ where: { id: before.id }, data: { matchGoal: parsed.value } });
    await audit(tx, actor, "Engagement", "Objectif de matchs modifié", `${season.slug} · ${before.user.pseudo}`, {
      avant: before.matchGoal,
      "après": parsed.value,
    });
    return parsed.value;
  });
}
