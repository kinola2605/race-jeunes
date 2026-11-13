import "server-only";
import { aggregate, emptyRuleSet, rankStandings, type RankedStanding, type RuleSet, type ScoredEntry } from "@/scoring";
import { db } from "./common";
import { latestPublished } from "./scoring";

export interface StandingRow extends RankedStanding {
  pseudo: string;
  startingRanking: string;
  currentRanking: string | null;
  tags: string[];
  disabled: boolean;
}

/** Calcule le classement d'une saison à partir des points enregistrés (FR-120). */
export async function seasonStandings(seasonId: string, rulesOverride?: RuleSet, entriesOverride?: ScoredEntry[]): Promise<StandingRow[]> {
  const enrollments = await db.enrollment.findMany({
    where: { seasonId },
    include: { user: { include: { tags: { include: { tag: true } } } } },
  });
  const rules = rulesOverride ?? (await latestPublished(db, seasonId))?.parsed ?? emptyRuleSet();
  const entries: ScoredEntry[] =
    entriesOverride ??
    (
      await db.pointsEntry.findMany({
        where: { match: { seasonId, status: "VALIDATED" } },
        select: { userId: true, points: true, isPerf: true, won: true, match: { select: { kind: true, tournament: true } } },
      })
    ).map((e) => ({
      playerId: e.userId,
      points: e.points,
      isPerf: e.isPerf,
      result: e.won ? ("WIN" as const) : ("LOSS" as const),
      walkover: e.match.kind === "WALKOVER",
      tournament: e.match.tournament,
    }));

  const byId = new Map(enrollments.map((e) => [e.userId, e]));
  const rows = aggregate(
    rules,
    enrollments.map((e) => e.userId),
    entries,
  );
  return rankStandings(rows, (id) => byId.get(id)?.user.pseudo ?? id).map((r) => {
    const e = byId.get(r.playerId)!;
    return {
      ...r,
      pseudo: e.user.pseudo,
      startingRanking: e.startingRanking,
      currentRanking: e.user.ranking,
      tags: e.user.tags.map((t) => t.tag.name),
      disabled: e.user.status === "DISABLED",
    };
  });
}

/** Résumé par type de règle pour le détail agrégé d'un joueur (FR-122). */
export async function playerBreakdown(seasonId: string, userId: string) {
  const entries = await db.pointsEntry.findMany({
    where: { userId, match: { seasonId, status: "VALIDATED" } },
    include: { ruleSet: { select: { version: true } } },
  });
  const groups = new Map<string, { label: string; count: number; points: number }>();
  for (const e of entries) {
    const lines = e.breakdown as { label: string; value: string }[];
    const ruleLine = lines.find((l) => /^(Victoire|Défaite)/.test(l.label));
    const label = ruleLine?.label ?? "Autre";
    const g = groups.get(label) ?? { label, count: 0, points: 0 };
    g.count += 1;
    g.points += e.points;
    groups.set(label, g);
  }
  return [...groups.values()].sort((a, b) => b.points - a.points);
}
