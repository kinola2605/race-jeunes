import "server-only";
import type { Match } from "@prisma/client";
import { computeMatchPoints, isRanking, ruleSetSchema, type BreakdownLine, type MatchKind, type Ranking, type RuleSet } from "@/scoring";
import { UserError, db, type Tx } from "./common";

export function parseRules(json: unknown): RuleSet {
  const parsed = ruleSetSchema.safeParse(json);
  if (!parsed.success) throw new UserError("Barème enregistré invalide.");
  return parsed.data;
}

export async function latestPublished(tx: Tx, seasonId: string) {
  const rs = await tx.scoringRuleSet.findFirst({
    where: { seasonId, status: "PUBLISHED" },
    orderBy: { version: "desc" },
  });
  return rs ? { ...rs, parsed: parseRules(rs.rules) } : null;
}

export interface ComputedEntry {
  userId: string;
  points: number;
  gap: number;
  isPerf: boolean;
  won: boolean;
  breakdown: BreakdownLine[];
}

type ScorableMatch = Pick<Match, "playerAId" | "playerBId" | "winner" | "kind" | "rankingA" | "rankingB">;

/** Points de chaque joueur de l'application impliqué dans un match (FR-104). */
export function computeEntries(rules: RuleSet, match: ScorableMatch): ComputedEntry[] {
  const rA = match.rankingA;
  const rB = match.rankingB;
  if (!isRanking(rA) || !isRanking(rB)) throw new UserError("Classements du match manquants.");
  const kind = match.kind as MatchKind;
  const out: ComputedEntry[] = [];
  const side = (userId: string, me: Ranking, them: Ranking, won: boolean) => {
    const r = computeMatchPoints(rules, { playerRanking: me, opponentRanking: them, result: won ? "WIN" : "LOSS", kind });
    out.push({ userId, points: r.points, gap: r.gap, isPerf: r.isPerf, won, breakdown: r.breakdown });
  };
  side(match.playerAId, rA, rB, match.winner === "A");
  if (match.playerBId) side(match.playerBId, rB, rA, match.winner === "B");
  return out;
}

/** Classement de référence d'un engagé pour un match (FR-106). */
export async function referenceRanking(tx: Tx, seasonId: string, userId: string, playedOn: Date): Promise<Ranking> {
  const season = await tx.season.findUniqueOrThrow({ where: { id: seasonId } });
  const enrollment = await tx.enrollment.findUnique({ where: { seasonId_userId: { seasonId, userId } } });
  if (!enrollment) throw new UserError("Joueur non engagé dans cette saison.");
  let ranking: string = enrollment.startingRanking;
  if (season.rankingMode === "EVOLVING") {
    const endOfDay = new Date(playedOn);
    endOfDay.setUTCHours(23, 59, 59, 999);
    const change = await tx.rankingChange.findFirst({
      where: { userId, effectiveAt: { lte: endOfDay } },
      orderBy: { effectiveAt: "desc" },
    });
    if (change) ranking = change.to;
  }
  if (!isRanking(ranking)) throw new UserError("Classement de référence invalide.");
  return ranking;
}

export { db };
