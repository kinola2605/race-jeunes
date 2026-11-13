import "server-only";
import { countsTowardGoal, goalProgress, parseGoal, retainedGoal, type GoalProgress } from "@/goals/goals";
import { UserError, assertAdmin, audit, db, type Actor, type Tx } from "./common";
import { assertWritable } from "./seasons";

/** Matchs comptés pour l'objectif (FR-503) et matchs en attente, par joueur. */
async function matchCounts(tx: Tx, seasonId: string, userId?: string) {
  const matches = await tx.match.findMany({
    where: {
      seasonId,
      status: { in: ["VALIDATED", "PENDING"] },
      ...(userId ? { OR: [{ playerAId: userId }, { playerBId: userId }] } : {}),
    },
    select: { playerAId: true, playerBId: true, status: true, kind: true },
  });
  const played = new Map<string, number>();
  const pending = new Map<string, number>();
  for (const m of matches) {
    const target = countsTowardGoal(m) ? played : m.status === "PENDING" ? pending : null;
    if (!target) continue;
    for (const id of [m.playerAId, m.playerBId]) if (id) target.set(id, (target.get(id) ?? 0) + 1);
  }
  return { played, pending };
}

async function goalsOf(tx: Tx, seasonId: string) {
  const [season, rows] = await Promise.all([
    tx.season.findUniqueOrThrow({ where: { id: seasonId }, select: { matchGoal: true } }),
    tx.matchGoal.findMany({ where: { seasonId } }),
  ]);
  return { defaultGoal: season.matchGoal, tagGoals: new Map(rows.map((r) => [r.tagId, r.target])) };
}

export interface GoalRow {
  /** null = ligne « Tous les engagés (par défaut) » */
  tagId: string | null;
  label: string;
  target: number | null;
  concerned: number;
  reached: number;
}

/** E-Objectifs — FR-501, FR-504 : tableau admin (ligne par défaut puis une ligne par étiquette). */
export async function goalBoard(seasonId: string): Promise<GoalRow[]> {
  const [{ defaultGoal, tagGoals }, tags, enrollments, { played }] = await Promise.all([
    goalsOf(db, seasonId),
    db.tag.findMany({ orderBy: { name: "asc" } }),
    db.enrollment.findMany({ where: { seasonId }, select: { userId: true, user: { select: { tags: { select: { tagId: true } } } } } }),
    matchCounts(db, seasonId),
  ]);
  const rows: GoalRow[] = [
    { tagId: null, label: "Tous les engagés (par défaut)", target: defaultGoal, concerned: 0, reached: 0 },
    ...tags.map((t) => ({ tagId: t.id, label: t.name, target: tagGoals.get(t.id) ?? null, concerned: 0, reached: 0 })),
  ];
  const byTag = new Map(rows.map((r) => [r.tagId, r]));
  for (const e of enrollments) {
    const goal = retainedGoal(defaultGoal, tagGoals, e.user.tags.map((t) => t.tagId));
    if (!goal) continue;
    const row = byTag.get(goal.tagId)!;
    row.concerned++;
    if ((played.get(e.userId) ?? 0) >= goal.target) row.reached++;
  }
  return rows;
}

/** FR-501, FR-506, FR-507 : enregistre tout le tableau. `input` : clé "default" ou id d'étiquette → saisie brute. */
export async function saveGoals(actor: Actor, seasonId: string, input: Record<string, string>): Promise<void> {
  assertAdmin(actor);
  await db.$transaction(async (tx) => {
    const season = await tx.season.findUniqueOrThrow({ where: { id: seasonId } });
    assertWritable(season);
    const tags = await tx.tag.findMany();
    const parse = (key: string, label: string) => {
      const r = parseGoal(input[key] ?? "");
      if (!r.ok) throw new UserError(`« ${label} » : saisissez un nombre entier de matchs entre 1 et 200, ou laissez vide.`);
      return r.value;
    };
    const nextDefault = parse("default", "Tous les engagés");
    const next = new Map<string, number>();
    for (const t of tags) {
      const v = parse(t.id, t.name);
      if (v !== null) next.set(t.id, v);
    }

    const before = await goalsOf(tx, seasonId);
    const named = (m: ReadonlyMap<string, number>, d: number | null) => ({
      "par défaut": d,
      ...Object.fromEntries(tags.filter((t) => m.has(t.id)).map((t) => [t.name, m.get(t.id)!])),
    });

    await tx.season.update({ where: { id: seasonId }, data: { matchGoal: nextDefault } });
    await tx.matchGoal.deleteMany({ where: { seasonId, tagId: { notIn: [...next.keys()] } } });
    for (const [tagId, target] of next) {
      await tx.matchGoal.upsert({
        where: { seasonId_tagId: { seasonId, tagId } },
        create: { seasonId, tagId, target },
        update: { target },
      });
    }
    await audit(tx, actor, "Saison", "Objectifs de matchs modifiés", season.slug, {
      avant: named(before.tagGoals, before.defaultGoal),
      "après": named(next, nextDefault),
    });
  });
}

/** FR-505, FR-508 : objectif et progression d'un engagé, ou null s'il n'a pas d'objectif. */
export async function playerGoal(seasonId: string, userId: string): Promise<(GoalProgress & { pending: number }) | null> {
  const enrollment = await db.enrollment.findUnique({
    where: { seasonId_userId: { seasonId, userId } },
    select: { user: { select: { tags: { select: { tagId: true } } } } },
  });
  if (!enrollment) return null;
  const { defaultGoal, tagGoals } = await goalsOf(db, seasonId);
  const goal = retainedGoal(defaultGoal, tagGoals, enrollment.user.tags.map((t) => t.tagId));
  if (!goal) return null;
  const { played, pending } = await matchCounts(db, seasonId, userId);
  return { ...goalProgress(played.get(userId) ?? 0, goal.target), pending: pending.get(userId) ?? 0 };
}
