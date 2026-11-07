import "server-only";
import { isRanking } from "@/scoring";
import { UserError, assertAdmin, audit, db, type Actor } from "./common";
import { assertWritable } from "./seasons";

/** FR-080 : engagement individuel ou en lot, classement de départ = classement actuel. */
export async function enrollPlayers(actor: Actor, seasonId: string, userIds: string[]): Promise<number> {
  assertAdmin(actor);
  if (userIds.length === 0) throw new UserError("Sélectionnez au moins un joueur.");
  return db.$transaction(async (tx) => {
    const season = await tx.season.findUniqueOrThrow({ where: { id: seasonId } });
    assertWritable(season);
    const users = await tx.user.findMany({ where: { id: { in: userIds }, role: "PLAYER", status: "ACTIVE" } });
    let count = 0;
    for (const u of users) {
      if (!u.ranking) continue;
      const exists = await tx.enrollment.findUnique({ where: { seasonId_userId: { seasonId, userId: u.id } } });
      if (exists) continue;
      await tx.enrollment.create({ data: { seasonId, userId: u.id, startingRanking: u.ranking } });
      count++;
    }
    await audit(tx, actor, "Engagement", "Joueurs engagés", season.slug, { count, pseudos: users.map((u) => u.pseudo) });
    return count;
  });
}

export async function setStartingRanking(actor: Actor, seasonId: string, userId: string, ranking: string): Promise<void> {
  assertAdmin(actor);
  if (!isRanking(ranking)) throw new UserError("Classement inconnu.");
  await db.$transaction(async (tx) => {
    const season = await tx.season.findUniqueOrThrow({ where: { id: seasonId } });
    assertWritable(season);
    const validated = await tx.match.count({
      where: { seasonId, status: "VALIDATED", OR: [{ playerAId: userId }, { playerBId: userId }] },
    });
    if (validated > 0) throw new UserError("Ce joueur a déjà des matchs validés : son classement de départ est figé.");
    const e = await tx.enrollment.update({
      where: { seasonId_userId: { seasonId, userId } },
      data: { startingRanking: ranking },
      include: { user: true },
    });
    await audit(tx, actor, "Engagement", "Classement de départ modifié", `${season.slug} · ${e.user.pseudo}`, { ranking });
  });
}

/** FR-081 */
export async function unenroll(actor: Actor, seasonId: string, userId: string): Promise<void> {
  assertAdmin(actor);
  await db.$transaction(async (tx) => {
    const season = await tx.season.findUniqueOrThrow({ where: { id: seasonId } });
    assertWritable(season);
    const any = await tx.match.count({ where: { seasonId, OR: [{ playerAId: userId }, { playerBId: userId }] } });
    if (any > 0) throw new UserError("Impossible de retirer un engagé qui a des matchs dans la saison.");
    const e = await tx.enrollment.delete({ where: { seasonId_userId: { seasonId, userId } }, include: { user: true } });
    await audit(tx, actor, "Engagement", "Engagement retiré", `${season.slug} · ${e.user.pseudo}`);
  });
}

export async function enrollmentBoard(seasonId: string) {
  const [players, enrollments] = await Promise.all([
    db.user.findMany({
      where: { role: "PLAYER", status: "ACTIVE" },
      orderBy: { pseudoKey: "asc" },
      include: { tags: { include: { tag: true } } },
    }),
    db.enrollment.findMany({ where: { seasonId } }),
  ]);
  const byUser = new Map(enrollments.map((e) => [e.userId, e]));
  return players.map((p) => ({
    id: p.id,
    pseudo: p.pseudo,
    ranking: p.ranking,
    tags: p.tags.map((t) => t.tag.name),
    enrollment: byUser.get(p.id) ?? null,
  }));
}

export async function enrolledSeasonsOf(userId: string) {
  return db.enrollment.findMany({ where: { userId }, include: { season: true }, orderBy: { season: { createdAt: "desc" } } });
}
