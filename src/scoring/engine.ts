import { rungOf, type Ranking } from "./ladder";
import { formatGap, type GapKey, type RuleSet } from "./rules";

export type MatchResult = "WIN" | "LOSS";
export type MatchKind = "NORMAL" | "WALKOVER" | "RETIREMENT";

export interface MatchInput {
  playerRanking: Ranking;
  opponentRanking: Ranking;
  result: MatchResult;
  kind: MatchKind;
}

export interface BreakdownLine {
  label: string;
  value: string;
}

export interface MatchPoints {
  points: number;
  /** Échelon adversaire − échelon joueur (positif : adversaire mieux classé). */
  gap: number;
  isPerf: boolean;
  rule: "gap" | "override" | "walkover";
  capped: boolean;
  breakdown: BreakdownLine[];
}

function effectiveRung(rules: RuleSet, ranking: Ranking): number {
  return ranking === "NC" && rules.unrankedAs === "40" ? rungOf("40") : rungOf(ranking);
}

function clampGap(gap: number): GapKey {
  return Math.max(-4, Math.min(4, gap)) as GapKey;
}

/** Points d'un match du point de vue d'un joueur, selon un barème. Fonction pure. */
export function computeMatchPoints(rules: RuleSet, input: MatchInput): MatchPoints {
  const gap = effectiveRung(rules, input.opponentRanking) - effectiveRung(rules, input.playerRanking);
  const win = input.result === "WIN";
  const breakdown: BreakdownLine[] = [
    { label: "Classement du joueur", value: input.playerRanking },
    { label: "Classement de l'adversaire", value: input.opponentRanking },
    { label: "Écart", value: formatGap(gap) + (gap > 0 && win && input.kind !== "WALKOVER" ? " (perf)" : "") },
  ];

  if (input.kind === "WALKOVER") {
    const points = win ? rules.walkoverWin : 0;
    breakdown.push({ label: win ? "Victoire par forfait" : "Défaite par forfait", value: `${points} pts` });
    return { points, gap, isPerf: false, rule: "walkover", capped: false, breakdown };
  }

  const table = win ? rules.overrides.win : rules.overrides.loss;
  const override = table[`${input.playerRanking}|${input.opponentRanking}`];
  let base: number;
  let rule: MatchPoints["rule"];
  if (override !== undefined) {
    base = override;
    rule = "override";
    breakdown.push({
      label: `${win ? "Victoire" : "Défaite"} ${input.playerRanking} contre ${input.opponentRanking} (table complète)`,
      value: `${base} pts`,
    });
  } else {
    const key = clampGap(gap);
    base = (win ? rules.win.byGap : rules.loss.byGap)[`${key}`];
    rule = "gap";
    breakdown.push({ label: `${win ? "Victoire" : "Défaite"} écart ${formatGap(key)}`, value: `${base} pts` });
  }

  let points = base;
  let capped = false;
  if (rules.capPerMatch !== null && points > rules.capPerMatch) {
    points = rules.capPerMatch;
    capped = true;
  }
  breakdown.push({
    label: rules.capPerMatch === null ? "Plafond par match" : `Plafond ${rules.capPerMatch} pts / match`,
    value: rules.capPerMatch === null ? "aucun" : capped ? "atteint" : "non atteint",
  });

  return { points, gap, isPerf: win && gap > 0, rule, capped, breakdown };
}

export interface ScoredEntry {
  playerId: string;
  points: number;
  isPerf: boolean;
  result: MatchResult;
  /** forfait : la victoire ne compte pas pour le bonus tournoi (FR-603) */
  walkover?: boolean;
  /** nom du tournoi tel que saisi, null hors tournoi (FR-600) */
  tournament?: string | null;
}

export interface TournamentBonus {
  /** nom affiché (première graphie rencontrée) */
  name: string;
  wins: number;
  points: number;
}

export interface Standing {
  playerId: string;
  matchPoints: number;
  /** assiduité + tournois */
  bonus: number;
  assiduityBonus: number;
  tournamentBonus: number;
  tournaments: TournamentBonus[];
  points: number;
  matches: number;
  wins: number;
  losses: number;
  perfs: number;
}

/** Clé de regroupement d'un tournoi : casse, accents et espaces ignorés (FR-601). */
export function tournamentKey(name: string | null | undefined): string | null {
  const key = (name ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  return key === "" ? null : key;
}

/** Bonus d'un tournoi selon le nombre de victoires (FR-602). */
export function tournamentBonusFor(rules: RuleSet, wins: number): number {
  const t = rules.tournament;
  if (!t || wins < t.fromWins) return 0;
  return (wins - t.fromWins + 1) * t.points;
}

/** Agrège les points des matchs validés par joueur et ajoute les bonus d'assiduité et de tournoi. */
export function aggregate(rules: RuleSet, playerIds: readonly string[], entries: readonly ScoredEntry[]): Standing[] {
  const byPlayer = new Map<string, Standing>();
  const tournamentWins = new Map<string, Map<string, { name: string; wins: number }>>();
  for (const id of playerIds) {
    byPlayer.set(id, {
      playerId: id,
      matchPoints: 0,
      bonus: 0,
      assiduityBonus: 0,
      tournamentBonus: 0,
      tournaments: [],
      points: 0,
      matches: 0,
      wins: 0,
      losses: 0,
      perfs: 0,
    });
    tournamentWins.set(id, new Map());
  }
  for (const entry of entries) {
    const row = byPlayer.get(entry.playerId);
    if (!row) continue;
    row.matchPoints += entry.points;
    row.matches += 1;
    if (entry.result === "WIN") row.wins += 1;
    else row.losses += 1;
    if (entry.isPerf) row.perfs += 1;
    const key = tournamentKey(entry.tournament);
    if (key && entry.result === "WIN" && !entry.walkover) {
      const byKey = tournamentWins.get(entry.playerId)!;
      const t = byKey.get(key) ?? { name: entry.tournament!.trim().replace(/\s+/g, " "), wins: 0 };
      t.wins += 1;
      byKey.set(key, t);
    }
  }
  for (const row of byPlayer.values()) {
    row.assiduityBonus = rules.assiduity ? Math.floor(row.matches / rules.assiduity.every) * rules.assiduity.points : 0;
    row.tournaments = [...tournamentWins.get(row.playerId)!.values()]
      .map((t) => ({ ...t, points: tournamentBonusFor(rules, t.wins) }))
      .filter((t) => t.points > 0)
      .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name, "fr"));
    row.tournamentBonus = row.tournaments.reduce((sum, t) => sum + t.points, 0);
    row.bonus = row.assiduityBonus + row.tournamentBonus;
    row.points = row.matchPoints + row.bonus;
  }
  return [...byPlayer.values()];
}

export interface RankedStanding extends Standing {
  rank: number;
}

/**
 * Trie par points, perfs puis victoires (décroissants) ; égalité parfaite = même rang (1, 1, 3).
 * `nameOf` ne sert qu'à stabiliser l'ordre d'affichage des ex æquo.
 */
export function rankStandings(rows: readonly Standing[], nameOf: (id: string) => string = (id) => id): RankedStanding[] {
  const sorted = [...rows].sort(
    (a, b) =>
      b.points - a.points ||
      b.perfs - a.perfs ||
      b.wins - a.wins ||
      nameOf(a.playerId).localeCompare(nameOf(b.playerId), "fr", { sensitivity: "base" }),
  );
  const ranked: RankedStanding[] = [];
  sorted.forEach((row, index) => {
    const prev = ranked[index - 1];
    const tied = prev !== undefined && prev.points === row.points && prev.perfs === row.perfs && prev.wins === row.wins;
    ranked.push({ ...row, rank: tied ? prev.rank : index + 1 });
  });
  return ranked;
}
