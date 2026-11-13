import { describe, expect, it } from "vitest";
import { GOAL_MAX, countsTowardGoal, goalProgress, parseGoal, retainedGoal } from "./goals";

describe("objectif de matchs (spec 005)", () => {
  const goals = new Map([
    ["mini", 6],
    ["g2", 10],
  ]);

  it("retient l'objectif de l'étiquette (FR-502)", () => {
    expect(retainedGoal(8, goals, ["g2"])).toEqual({ target: 10, tagId: "g2" });
  });

  it("retient le plus élevé quand plusieurs étiquettes ont un objectif (C-502)", () => {
    expect(retainedGoal(null, goals, ["mini", "g2", "autre"])).toEqual({ target: 10, tagId: "g2" });
    expect(retainedGoal(null, goals, ["g2", "mini"])).toEqual({ target: 10, tagId: "g2" });
  });

  it("retombe sur l'objectif par défaut, sinon aucun objectif", () => {
    expect(retainedGoal(8, goals, [])).toEqual({ target: 8, tagId: null });
    expect(retainedGoal(8, goals, ["autre"])).toEqual({ target: 8, tagId: null });
    expect(retainedGoal(null, goals, ["autre"])).toBeNull();
  });

  it("ne compte que les matchs validés hors forfait (FR-503)", () => {
    expect(countsTowardGoal({ status: "VALIDATED", kind: "NORMAL" })).toBe(true);
    expect(countsTowardGoal({ status: "VALIDATED", kind: "RETIREMENT" })).toBe(true);
    expect(countsTowardGoal({ status: "VALIDATED", kind: "WALKOVER" })).toBe(false);
    expect(countsTowardGoal({ status: "PENDING", kind: "NORMAL" })).toBe(false);
    expect(countsTowardGoal({ status: "REFUSED", kind: "NORMAL" })).toBe(false);
  });

  it("calcule la progression, plafonnée à 100 %", () => {
    expect(goalProgress(2, 10)).toEqual({ played: 2, target: 10, remaining: 8, reached: false, percent: 20 });
    expect(goalProgress(12, 10)).toEqual({ played: 12, target: 10, remaining: 0, reached: true, percent: 100 });
    expect(goalProgress(1, 3).percent).toBe(33);
  });

  it("valide la saisie : vide = pas d'objectif, entier de 1 à 200", () => {
    expect(parseGoal("")).toEqual({ ok: true, value: null });
    expect(parseGoal("  12 ")).toEqual({ ok: true, value: 12 });
    expect(parseGoal(String(GOAL_MAX))).toEqual({ ok: true, value: 200 });
    for (const bad of ["0", "-3", "201", "4.5", "dix", "1e2"]) expect(parseGoal(bad).ok).toBe(false);
  });
});
