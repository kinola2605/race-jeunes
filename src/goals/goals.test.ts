import { describe, expect, it } from "vitest";
import { GOAL_MAX, countsTowardGoal, goalMessage, goalProgress, goalTier, parseGoal } from "./goals";

describe("objectif de matchs (spec 005)", () => {
  it("ne compte que les matchs validés hors forfait (FR-502)", () => {
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

  it("place le joueur sur un palier du court (variante « L'échange »)", () => {
    const tier = (played: number) => goalTier(goalProgress(played, 12));
    expect([0, 1, 5, 6, 8, 9, 11, 12, 14].map(tier)).toEqual(["start", "route", "route", "mid", "mid", "last", "last", "done", "over"]);
  });

  it("formule un message d'encouragement avec les matchs restants", () => {
    expect(goalMessage(goalProgress(0, 12))).toBe("Premier service ! Joue ton premier match pour lancer l'échange.");
    expect(goalMessage(goalProgress(2, 12))).toBe("La balle est partie : encore 10 matchs pour gagner le point.");
    expect(goalMessage(goalProgress(7, 12))).toBe("Balle au filet ! Plus que 5 matchs.");
    expect(goalMessage(goalProgress(11, 12))).toBe("Dernière ligne droite : 1 match et le point est à toi.");
    expect(goalMessage(goalProgress(12, 12))).toBe("Jeu, set et match ! Objectif atteint.");
    expect(goalMessage(goalProgress(14, 12))).toBe("Objectif dépassé : +2 en prolongations !");
  });
});
