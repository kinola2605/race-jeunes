import { describe, expect, it } from "vitest";
import {
  PRESET_2025,
  PRESET_2026,
  aggregate,
  tournamentBonusFor,
  tournamentKey,
  computeMatchPoints,
  emptyRuleSet,
  rankStandings,
  type MatchInput,
  type RuleSet,
  type Standing,
} from "./index";

const win = (playerRanking: MatchInput["playerRanking"], opponentRanking: MatchInput["opponentRanking"]): MatchInput => ({
  playerRanking,
  opponentRanking,
  result: "WIN",
  kind: "NORMAL",
});
const loss = (playerRanking: MatchInput["playerRanking"], opponentRanking: MatchInput["opponentRanking"]): MatchInput => ({
  playerRanking,
  opponentRanking,
  result: "LOSS",
  kind: "NORMAL",
});

describe("computeMatchPoints — barème 2026 (spec US5, exemples)", () => {
  it.each([
    // [cas, entrée, points, écart, perf]
    ["30/2 bat 30/1 : perf +1 (spec US5.1)", win("30/2", "30/1"), 20, 1, true],
    ["30/2 bat 30/2 : égalité", win("30/2", "30/2"), 10, 0, false],
    ["30/2 bat 30/3 : écart −1", win("30/2", "30/3"), 6, -1, false],
    ["30/2 bat 30/4 : écart −2", win("30/2", "30/4"), 4, -2, false],
    ["30/2 bat 30/5 : écart −3", win("30/2", "30/5"), 2, -3, false],
    ["15/1 bat 40 : écart très négatif borné à −4", win("15/1", "40"), 2, -11, false],
    ["30/2 bat 30 : perf +2", win("30/2", "30"), 30, 2, true],
    ["30/2 bat 15/5 : perf +3", win("30/2", "15/5"), 40, 3, true],
    ["40 bat 15/2 : perf bornée à +4", win("40", "15/2"), 50, 10, true],
    ["30/2 perd contre 30/1 : défaite contre mieux classé", loss("30/2", "30/1"), 2, 1, false],
    ["30/2 perd contre 30/2 : défaite à égalité", loss("30/2", "30/2"), 1, 0, false],
    ["30/2 perd contre 30/3 : défaite contre moins bien classé", loss("30/2", "30/3"), 0, -1, false],
    ["NC traité comme 40 : 40 bat NC = égalité", win("40", "NC"), 10, 0, false],
    ["NC traité comme 40 : NC bat 30/5 = perf +1", win("NC", "30/5"), 20, 1, true],
  ])("%s", (_label, input, points, gap, isPerf) => {
    const r = computeMatchPoints(PRESET_2026, input);
    expect(r.points).toBe(points);
    expect(r.gap).toBe(gap);
    expect(r.isPerf).toBe(isPerf);
    expect(r.rule).toBe("gap");
  });

  it("indique « non atteint » quand le plafond n'est pas atteint", () => {
    const r = computeMatchPoints(PRESET_2026, win("30/2", "30/1"));
    expect(r.capped).toBe(false);
    expect(r.breakdown.at(-1)).toEqual({ label: "Plafond 60 pts / match", value: "non atteint" });
    expect(r.breakdown[2]).toEqual({ label: "Écart", value: "+1 (perf)" });
  });
});

describe("computeMatchPoints — barème 2025 (indépendance des saisons)", () => {
  it.each([
    ["30/2 bat 30/1 : perf +1", win("30/2", "30/1"), 15, 1, true],
    ["30/2 bat 30/2 : égalité", win("30/2", "30/2"), 8, 0, false],
    ["30/2 perd contre 30/1", loss("30/2", "30/1"), 1, 1, false],
    ["30/2 perd contre 30/2", loss("30/2", "30/2"), 0, 0, false],
    ["NC échelon propre : NC bat 40 = perf +1", win("NC", "40"), 15, 1, true],
    ["NC échelon propre : 40 bat NC = écart −1", win("40", "NC"), 5, -1, false],
  ])("%s", (_label, input, points, gap, isPerf) => {
    const r = computeMatchPoints(PRESET_2025, input);
    expect(r).toMatchObject({ points, gap, isPerf });
  });

  it("le même match rapporte des points différents selon le barème de la saison", () => {
    const match = win("30/2", "30/1");
    expect(computeMatchPoints(PRESET_2026, match).points).toBe(20);
    expect(computeMatchPoints(PRESET_2025, match).points).toBe(15);
  });

  it("sans plafond, la ligne de détail l'indique", () => {
    const r = computeMatchPoints(PRESET_2025, win("40", "15/1"));
    expect(r.points).toBe(45);
    expect(r.breakdown.at(-1)).toEqual({ label: "Plafond par match", value: "aucun" });
  });
});

describe("cas particuliers", () => {
  it("forfait gagné : points fixes, jamais une perf", () => {
    const r = computeMatchPoints(PRESET_2025, { ...win("30/2", "15/1"), kind: "WALKOVER" });
    expect(r).toMatchObject({ points: 3, isPerf: false, rule: "walkover" });
    expect(r.breakdown.at(-1)).toEqual({ label: "Victoire par forfait", value: "3 pts" });
    expect(r.breakdown[2]?.value).toBe("+4 ou plus");
  });

  it("forfait perdu : 0 point", () => {
    const r = computeMatchPoints(PRESET_2025, { ...loss("30/2", "15/1"), kind: "WALKOVER" });
    expect(r).toMatchObject({ points: 0, rule: "walkover" });
    expect(r.breakdown.at(-1)?.label).toBe("Défaite par forfait");
  });

  it("abandon : compté comme une victoire normale", () => {
    const r = computeMatchPoints(PRESET_2026, { ...win("30/2", "30/1"), kind: "RETIREMENT" });
    expect(r).toMatchObject({ points: 20, isPerf: true });
  });

  it("surcharge par couple (table complète) prioritaire sur l'écart, victoire et défaite", () => {
    const rules: RuleSet = {
      ...PRESET_2026,
      overrides: { win: { "30/2|30/1": 25 }, loss: { "30/2|30/1": 3 } },
    };
    expect(computeMatchPoints(rules, win("30/2", "30/1"))).toMatchObject({ points: 25, rule: "override" });
    expect(computeMatchPoints(rules, loss("30/2", "30/1"))).toMatchObject({ points: 3, rule: "override" });
    expect(computeMatchPoints(rules, win("30/3", "30/2")).rule).toBe("gap");
  });

  it("plafond par match appliqué", () => {
    const rules: RuleSet = { ...PRESET_2026, capPerMatch: 35 };
    const r = computeMatchPoints(rules, win("40", "15/2"));
    expect(r).toMatchObject({ points: 35, capped: true });
    expect(r.breakdown.at(-1)?.value).toBe("atteint");
  });

  it("barème vide : 0 point partout", () => {
    expect(computeMatchPoints(emptyRuleSet(), win("30/2", "30/1")).points).toBe(0);
  });
});

describe("aggregate", () => {
  const entries = [
    { playerId: "a", points: 20, isPerf: true, result: "WIN" as const },
    { playerId: "a", points: 2, isPerf: false, result: "LOSS" as const },
    { playerId: "b", points: 10, isPerf: false, result: "WIN" as const },
    { playerId: "inconnu", points: 99, isPerf: true, result: "WIN" as const },
  ];

  it("cumule points, victoires, défaites et perfs ; ignore les non-engagés", () => {
    const rows = aggregate(PRESET_2025, ["a", "b", "c"], entries);
    expect(rows).toEqual([
      { playerId: "a", assiduityBonus: 0, tournamentBonus: 0, tournaments: [], matchPoints: 22, bonus: 0, points: 22, matches: 2, wins: 1, losses: 1, perfs: 1 },
      { playerId: "b", assiduityBonus: 0, tournamentBonus: 0, tournaments: [], matchPoints: 10, bonus: 0, points: 10, matches: 1, wins: 1, losses: 0, perfs: 0 },
      { playerId: "c", assiduityBonus: 0, tournamentBonus: 0, tournaments: [], matchPoints: 0, bonus: 0, points: 0, matches: 0, wins: 0, losses: 0, perfs: 0 },
    ]);
  });

  it("ajoute le bonus d'assiduité (+5 tous les 5 matchs, barème 2026)", () => {
    const many = Array.from({ length: 11 }, () => ({ playerId: "a", points: 1, isPerf: false, result: "WIN" as const }));
    const [row] = aggregate(PRESET_2026, ["a"], many);
    expect(row).toMatchObject({ matchPoints: 11, bonus: 10, assiduityBonus: 10, tournamentBonus: 0, points: 21 });
  });
});

describe("bonus tournoi (spec 006)", () => {
  const rules = { ...PRESET_2025, tournament: { fromWins: 2, points: 10 } };
  const win = (tournament: string | null, extra: Partial<{ walkover: boolean; playerId: string }> = {}) => ({
    playerId: "a",
    points: 1,
    isPerf: false,
    result: "WIN" as const,
    tournament,
    ...extra,
  });

  it("FR-602 : (victoires − N + 1) × P à partir de N victoires", () => {
    expect(tournamentBonusFor(rules, 1)).toBe(0);
    expect(tournamentBonusFor(rules, 2)).toBe(10);
    expect(tournamentBonusFor(rules, 4)).toBe(30);
    expect(tournamentBonusFor(PRESET_2025, 5)).toBe(0);
  });

  it("FR-601 : casse, accents et espaces ignorés ; FR-604 : ajouté aux points", () => {
    const [row] = aggregate(rules, ["a"], [win("TMC Pâques"), win("tmc  paques "), win("TMC PAQUES"), win("Open d'hiver")]);
    expect(row).toMatchObject({ matchPoints: 4, tournamentBonus: 20, bonus: 20, points: 24 });
    expect(row?.tournaments).toEqual([{ name: "TMC Pâques", wins: 3, points: 20 }]);
  });

  it("FR-603 : forfaits, défaites et matchs hors tournoi ne comptent pas", () => {
    const [row] = aggregate(rules, ["a"], [
      win("TMC"),
      win("TMC", { walkover: true }),
      { ...win("TMC"), result: "LOSS" as const },
      win(null),
      win("   "),
    ]);
    expect(row?.tournamentBonus).toBe(0);
  });

  it("cumule avec le bonus d'assiduité et sépare les joueurs", () => {
    const both = { ...rules, assiduity: { every: 2, points: 5 } };
    const rows = aggregate(both, ["a", "b"], [win("T"), win("T"), win("T", { playerId: "b" })]);
    expect(rows[0]).toMatchObject({ assiduityBonus: 5, tournamentBonus: 10, bonus: 15, points: 17 });
    expect(rows[1]).toMatchObject({ bonus: 0, points: 1 });
  });

  it("tournamentKey", () => {
    expect(tournamentKey("  Été  Club ")).toBe("ete club");
    expect(tournamentKey("")).toBeNull();
    expect(tournamentKey(null)).toBeNull();
  });
});

describe("rankStandings (spec FR-120, US6.1)", () => {
  const s = (playerId: string, points: number, perfs = 0, wins = 0): Standing => ({
    playerId,
    points,
    perfs,
    wins,
    matchPoints: points,
    bonus: 0,
    assiduityBonus: 0,
    tournamentBonus: 0,
    tournaments: [],
    matches: wins,
    losses: 0,
  });

  it("trie par points, puis perfs, puis victoires", () => {
    const ranked = rankStandings([s("c", 10, 0, 1), s("a", 20), s("b", 10, 1, 0), s("d", 10, 0, 2)]);
    expect(ranked.map((r) => [r.playerId, r.rank])).toEqual([
      ["a", 1],
      ["b", 2],
      ["d", 3],
      ["c", 4],
    ]);
  });

  it("égalité parfaite : même rang, rang suivant sauté (1, 1, 3)", () => {
    const names: Record<string, string> = { x: "Zèbre", y: "Abeille", z: "Mouche" };
    const ranked = rankStandings([s("x", 10), s("y", 10), s("z", 5)], (id) => names[id] ?? id);
    expect(ranked.map((r) => [r.playerId, r.rank])).toEqual([
      ["y", 1],
      ["x", 1],
      ["z", 3],
    ]);
  });

  it("fonctionne avec la fonction de nom par défaut", () => {
    expect(rankStandings([s("b", 1), s("a", 1)]).map((r) => r.playerId)).toEqual(["a", "b"]);
  });
});
