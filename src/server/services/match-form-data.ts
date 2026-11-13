import "server-only";
import type { SessionUser } from "@/server/auth/session";
import { db } from "./common";
import { latestPublished } from "./scoring";
import { seasonTournaments } from "./matches";

/** Saisons ouvertes où l'utilisateur peut saisir, avec barème et engagés (pour l'estimation côté client). */
export async function matchFormSeasons(user: SessionUser) {
  const seasons = await db.season.findMany({
    where: { status: "OPEN", ...(user.role === "ADMIN" ? {} : { enrollments: { some: { userId: user.id } } }) },
    orderBy: { createdAt: "desc" },
    include: { enrollments: { include: { user: true } } },
  });
  return Promise.all(
    seasons.map(async (s) => {
      const published = await latestPublished(db, s.id);
      return {
        id: s.id,
        title: s.title,
        rules: published?.parsed ?? null,
        tournaments: await seasonTournaments(s.id),
        players: s.enrollments
          .filter((e) => e.user.status === "ACTIVE")
          .map((e) => ({ id: e.userId, pseudo: e.user.pseudo, ranking: s.rankingMode === "FROZEN" ? e.startingRanking : (e.user.ranking ?? e.startingRanking) }))
          .sort((a, b) => a.pseudo.localeCompare(b.pseudo, "fr")),
      };
    }),
  );
}

export function todayIso(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" });
}
