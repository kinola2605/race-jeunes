import "server-only";
import { buildPersonalData, summarize, type RawPersonalData } from "@/privacy/personal-data";
import { db } from "./common";

const AUDIT_MAX = 5000;

/**
 * Spec 008 — FR-802, FR-803 : charge les données d'un compte. Les `select` explicites garantissent qu'aucun
 * secret (empreinte de mot de passe, empreinte de session) ni point d'un autre joueur n'est lu.
 * Renvoie null si le compte n'existe pas.
 */
export async function loadPersonalData(userId: string): Promise<RawPersonalData | null> {
  const account = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      pseudo: true,
      role: true,
      status: true,
      mustChangePassword: true,
      ranking: true,
      avatar: true,
      createdAt: true,
      passwordChangedAt: true,
    },
  });
  if (!account) return null;
  const [tags, rankingChanges, enrollments, matches, audit, sessions] = await Promise.all([
    db.userTag.findMany({ where: { userId }, select: { tag: { select: { name: true } } } }),
    db.rankingChange.findMany({ where: { userId }, select: { from: true, to: true, effectiveAt: true }, orderBy: { effectiveAt: "asc" } }),
    db.enrollment.findMany({
      where: { userId },
      select: { startingRanking: true, matchGoal: true, createdAt: true, season: { select: { slug: true, title: true, status: true } } },
      orderBy: { createdAt: "asc" },
    }),
    db.match.findMany({
      where: { OR: [{ playerAId: userId }, { playerBId: userId }] },
      select: {
        id: true,
        playedOn: true,
        season: { select: { slug: true, title: true } },
        playerAId: true,
        playerA: { select: { pseudo: true } },
        playerBId: true,
        playerB: { select: { pseudo: true } },
        externalLabel: true,
        externalRanking: true,
        winner: true,
        score: true,
        kind: true,
        tournament: true,
        status: true,
        refusalReason: true,
        rankingA: true,
        rankingB: true,
        createdAt: true,
        validatedAt: true,
        // uniquement les points de ce compte (FR-803)
        entries: {
          where: { userId },
          select: { userId: true, points: true, gap: true, isPerf: true, won: true, breakdown: true, ruleSet: { select: { version: true } } },
        },
      },
      orderBy: [{ playedOn: "asc" }, { createdAt: "asc" }],
    }),
    db.auditLog.findMany({
      where: { OR: [{ actorId: userId }, { target: account.pseudo }] },
      select: { at: true, actorPseudo: true, type: true, action: true, target: true },
      orderBy: { at: "desc" },
      take: AUDIT_MAX,
    }),
    db.session.findMany({ where: { userId, expiresAt: { gt: new Date() } }, select: { createdAt: true, expiresAt: true }, orderBy: { createdAt: "asc" } }),
  ]);
  return { account, tags: tags.map((t) => t.tag.name), rankingChanges, enrollments, matches, audit: audit.reverse(), sessions };
}

/** FR-800 : nombres par catégorie (requêtes de comptage, sans charger les données). */
export async function personalDataSummary(userId: string, pseudo: string) {
  const mine = { OR: [{ playerAId: userId }, { playerBId: userId }] };
  const [tags, rankingChanges, enrollments, matches, points, journal, sessions] = await Promise.all([
    db.userTag.count({ where: { userId } }),
    db.rankingChange.count({ where: { userId } }),
    db.enrollment.count({ where: { userId } }),
    db.match.count({ where: mine }),
    db.pointsEntry.count({ where: { userId } }),
    db.auditLog.count({ where: { OR: [{ actorId: userId }, { target: pseudo }] } }),
    db.session.count({ where: { userId, expiresAt: { gt: new Date() } } }),
  ]);
  return summarize({ tags, rankingChanges, enrollments, matches, points, audit: Math.min(journal, AUDIT_MAX), sessions });
}

export { buildPersonalData };
