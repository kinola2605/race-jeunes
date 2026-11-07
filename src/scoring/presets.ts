import { ruleSetFromTables, type RuleSet } from "./rules";

/** Barème de démonstration « Race jeunes 2026-2027 » (fictif). */
export const PRESET_2026: RuleSet = ruleSetFromTables([2, 2, 4, 6, 10, 20, 30, 40, 50], [0, 0, 0, 0, 1, 2, 2, 2, 2], {
  unrankedAs: "40",
  capPerMatch: 60,
  assiduity: { every: 5, points: 5 },
});

/** Barème de démonstration « Race jeunes 2025-2026 » (fictif, volontairement différent). */
export const PRESET_2025: RuleSet = ruleSetFromTables([1, 2, 3, 5, 8, 15, 25, 35, 45], [0, 0, 0, 0, 0, 1, 1, 1, 1], {
  unrankedAs: "NC",
  walkoverWin: 3,
  capPerMatch: null,
  assiduity: null,
});
