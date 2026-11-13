import { describe, expect, it } from "vitest";
import {
  PRESET_2026,
  emptyRuleSet,
  formatGap,
  invertScore,
  isRanking,
  parseScore,
  ruleSetFromTables,
  rungOf,
  seriesOf,
  validateRuleSet,
  type RuleSet,
  winnerOf,
} from "./index";

describe("échelle des classements", () => {
  it("reconnaît les classements FFT", () => {
    expect(isRanking("30/2")).toBe(true);
    expect(isRanking("30-2")).toBe(false);
    expect(isRanking(42)).toBe(false);
  });
  it("donne l'échelon et la série", () => {
    expect(rungOf("NC")).toBe(0);
    expect(rungOf("30/1") - rungOf("30/2")).toBe(1);
    expect(seriesOf("NC")).toBe("40-NC");
    expect(seriesOf("40")).toBe("40-NC");
    expect(seriesOf("30/5")).toBe("30");
    expect(seriesOf("30")).toBe("30");
    expect(seriesOf("15/5")).toBe("15+");
  });
});

describe("validateRuleSet (FR-062)", () => {
  it("accepte un barème valide, sans avertissement", () => {
    const r = validateRuleSet(PRESET_2026);
    expect(r).toEqual({ ok: true, rules: PRESET_2026, warnings: [] });
  });

  it("refuse une valeur négative ou décimale, avec un message lisible", () => {
    const bad = { ...PRESET_2026, win: { byGap: { ...PRESET_2026.win.byGap, "1": -3 } }, walkoverWin: 1.5 };
    const r = validateRuleSet(bad);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors).toContain("win › byGap › 1 : Valeur positive ou nulle attendue");
      expect(r.errors).toContain("walkoverWin : Valeur entière attendue");
    }
  });

  it("refuse une clé de surcharge invalide", () => {
    const r = validateRuleSet({ ...PRESET_2026, overrides: { win: { "30/2|99": 3, "30/2|30/1|x": 2 }, loss: {} } });
    expect(r.ok).toBe(false);
  });

  it("refuse une entrée qui n'est pas un objet", () => {
    const r = validateRuleSet(null);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[0]).toMatch(/^barème : /);
  });

  it("avertit si la victoire ne croît pas avec l'écart et si le plafond coupe la table", () => {
    const rules = ruleSetFromTables([2, 2, 4, 6, 10, 9, 30, 40, 50], [0, 0, 0, 0, 0, 0, 0, 0, 0], { capPerMatch: 40 });
    const r = validateRuleSet(rules);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.warnings).toEqual([
        "Victoire : l'écart +1 rapporte moins que l'écart 0.",
        "Le plafond (40) est inférieur à certaines valeurs de la table (50).",
      ]);
    }
  });

  it("le barème vide est valide", () => {
    expect(validateRuleSet(emptyRuleSet()).ok).toBe(true);
  });

  it("ruleSetFromTables complète les valeurs manquantes par 0", () => {
    expect(ruleSetFromTables([1], []).win.byGap["4"]).toBe(0);
  });
});

describe("formatGap", () => {
  it.each([
    [-6, "−4 ou moins"],
    [-2, "−2"],
    [0, "0"],
    [3, "+3"],
    [9, "+4 ou plus"],
  ])("%i → %s", (gap, label) => expect(formatGap(gap)).toBe(label));
});

describe("parseScore (FR-108)", () => {
  it.each([
    ["6/4 6/3", "6/4 6/3", 2],
    ["6-4  3-6 10-8", "6/4 3/6 10-8", 3],
    ["7/6 7/5", "7/6 7/5", 2],
    ["4/2 5/4", "4/2 5/4", 2],
    ["6/4 3/6 7/5", "6/4 3/6 7/5", 3],
    ["6/4 4/6 12-10", "6/4 4/6 12-10", 3],
  ])("« %s » → « %s »", (raw, normalized, count) => {
    const r = parseScore(raw);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.normalized).toBe(normalized);
      expect(r.sets).toHaveLength(count);
    }
  });

  it.each([
    ["", "Score manquant."],
    ["6/4 6/3 6/2 6/1", "Trois sets au maximum."],
    ["6:4", "Set 1 illisible : « 6:4 » (attendu 6/4)."],
    ["6/5", "Set 1 invalide : « 6/5 »."],
    ["8/6", "Set 1 invalide : « 8/6 »."],
    ["7/3", "Set 1 invalide : « 7/3 »."],
    ["4/3", "Set 1 invalide : « 4/3 »."],
    ["5/2", "Set 1 invalide : « 5/2 »."],
    ["6/4 3/6 10-9", "Super tie-break invalide : « 10-9 »."],
    ["6/4 3/6 14-10", "Super tie-break invalide : « 14-10 »."],
  ])("« %s » refusé", (raw, error) => {
    expect(parseScore(raw)).toEqual({ ok: false, error });
  });

  it("détermine le vainqueur", () => {
    const ok = (raw: string) => {
      const r = parseScore(raw);
      if (!r.ok) throw new Error(r.error);
      return r.sets;
    };
    expect(winnerOf(ok("6/4 6/3"))).toBe("A");
    expect(winnerOf(ok("4/6 6/3 8-10"))).toBe("B");
    expect(winnerOf(ok("6/4 3/6"))).toBeNull();
  });

  it("inverse un score", () => {
    expect(invertScore("6/4 3/6 10-8")).toBe("4/6 6/3 8-10");
  });
});

describe("bonus tournoi dans le barème (spec 006)", () => {
  it("un barème antérieur sans la règle est lu comme désactivé", () => {
    const legacy: Partial<RuleSet> = emptyRuleSet();
    delete legacy.tournament;
    const r = validateRuleSet(legacy);
    expect(r.ok && r.rules.tournament).toBeNull();
  });

  it("accepte N entre 2 et 20, refuse en dehors", () => {
    expect(validateRuleSet({ ...emptyRuleSet(), tournament: { fromWins: 2, points: 10 } }).ok).toBe(true);
    expect(validateRuleSet({ ...emptyRuleSet(), tournament: { fromWins: 1, points: 10 } }).ok).toBe(false);
    expect(validateRuleSet({ ...emptyRuleSet(), tournament: { fromWins: 21, points: 10 } }).ok).toBe(false);
  });
});
