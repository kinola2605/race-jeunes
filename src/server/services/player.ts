import "server-only";
import type { Season } from "@prisma/client";
import type { SessionUser } from "@/server/auth/session";
import { db } from "./common";

/** Saison affichée par défaut : la saison ouverte la plus récente où le joueur est engagé, sinon la plus récente. */
export async function defaultSeasonFor(user: SessionUser): Promise<Season | null> {
  if (user.role === "ADMIN") {
    return (
      (await db.season.findFirst({ where: { status: "OPEN" }, orderBy: { createdAt: "desc" } })) ??
      (await db.season.findFirst({ where: { status: { not: "DRAFT" } }, orderBy: { createdAt: "desc" } }))
    );
  }
  const enrollments = await db.enrollment.findMany({
    where: { userId: user.id, season: { status: { not: "DRAFT" } } },
    include: { season: true },
    orderBy: { season: { createdAt: "desc" } },
  });
  return enrollments.find((e) => e.season.status === "OPEN")?.season ?? enrollments[0]?.season ?? null;
}

/** Résout ?saison=slug en respectant les droits (un joueur ne voit pas les brouillons). */
export async function resolveSeason(user: SessionUser, slug: string | undefined): Promise<Season | null> {
  if (slug) {
    const s = await db.season.findUnique({ where: { slug } });
    if (s && (s.status !== "DRAFT" || user.role === "ADMIN")) return s;
    return null;
  }
  return defaultSeasonFor(user);
}

export async function isEnrolled(seasonId: string, userId: string): Promise<boolean> {
  return (await db.enrollment.count({ where: { seasonId, userId } })) > 0;
}
