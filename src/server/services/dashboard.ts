import "server-only";
import { db } from "./common";
import { findDuplicates, matchesOfSeason, pendingMatches } from "./matches";

/** FR-140 */
export async function adminDashboard(seasonId: string | null) {
  const pending = await pendingMatches(seasonId ?? undefined);
  const all = seasonId ? await matchesOfSeason(seasonId) : pending;
  const duplicates = findDuplicates(pending, all);
  const externalNc = pending.filter((m) => m.externalLabel && m.externalRanking === "NC");
  const temporary = await db.user.findMany({
    where: { role: "PLAYER", status: "ACTIVE", mustChangePassword: true },
    orderBy: { updatedAt: "asc" },
    select: { id: true, pseudo: true, updatedAt: true, passwordChangedAt: true },
  });
  let withoutMatch: { pseudo: string; startingRanking: string }[] = [];
  let enrolledCount = 0;
  if (seasonId) {
    const enrollments = await db.enrollment.findMany({ where: { seasonId }, include: { user: true } });
    enrolledCount = enrollments.length;
    const played = new Set(
      all.filter((m) => m.status === "VALIDATED").flatMap((m) => [m.playerAId, ...(m.playerBId ? [m.playerBId] : [])]),
    );
    withoutMatch = enrollments
      .filter((e) => !played.has(e.userId))
      .map((e) => ({ pseudo: e.user.pseudo, startingRanking: e.startingRanking }))
      .sort((a, b) => a.pseudo.localeCompare(b.pseudo, "fr"));
  }
  return { pending, duplicates, externalNc, temporary, withoutMatch, enrolledCount };
}

export async function auditEntries(opts: { type?: string; q?: string; take?: number }) {
  return db.auditLog.findMany({
    where: {
      ...(opts.type ? { type: opts.type } : {}),
      ...(opts.q
        ? { OR: [{ target: { contains: opts.q, mode: "insensitive" } }, { action: { contains: opts.q, mode: "insensitive" } }, { actorPseudo: { contains: opts.q, mode: "insensitive" } }] }
        : {}),
    },
    orderBy: { at: "desc" },
    take: opts.take ?? 100,
  });
}
