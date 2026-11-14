import { describe, expect, it } from "vitest";
import { INDICATORS, emptyProfile, mentalProfile, percentOf, type MentalMatch } from "./profile";

const m = (score: string | null, won: boolean, gap = 0, kind: MentalMatch["kind"] = "NORMAL"): MentalMatch => ({ score, won, gap, kind });

describe("profil mental (spec 012)", () => {
  it("part de zéro et ignore les matchs non joués ou sans score lisible", () => {
    expect(mentalProfile([])).toEqual(emptyProfile());
    // forfait : rien n'est compté, même l'écart de classement (FR-1206)
    expect(mentalProfile([m(null, true, 2, "WALKOVER"), m("6/0 6/0", true, 2, "WALKOVER")])).toEqual(emptyProfile());
    // score absent ou illisible : seuls les indicateurs de classement comptent
    const p = mentalProfile([m(null, true, 1), m("n'importe quoi", false, -1)]);
    expect(p.matches).toBe(2);
    expect(p.tieBreaks.total + p.decidingSets.total + p.comebacks.total).toBe(0);
    expect(p.vsHigher).toEqual({ count: 1, total: 1 });
    expect(p.vsLower).toEqual({ count: 1, total: 1 });
  });

  it("compte les tie-breaks gagnés, sets à 6 jeux et formats courts (FR-1201)", () => {
    const p = mentalProfile([m("7/6 6/7 6/4", true), m("6/4 6/3", true), m("5/4 4/5 10-8", true), m("6/7 7/5 6/7", false)]);
    // 7/6 gagné, 6/7 perdu · 5/4 gagné, 4/5 perdu · 6/7 perdu deux fois ; 7/5 n'est pas un tie-break
    expect(p.tieBreaks).toEqual({ count: 2, total: 6 });
  });

  it("ne range pas le super tie-break parmi les tie-breaks mais parmi les sets décisifs (FR-1202)", () => {
    const p = mentalProfile([m("6/4 3/6 10-8", true), m("6/4 3/6 8-10", false), m("3/6 6/4 6/2", true), m("6/4 6/3", true)]);
    expect(p.tieBreaks.total).toBe(0);
    expect(p.decidingSets).toEqual({ count: 2, total: 3 });
  });

  it("compte les retours après la perte du premier set (FR-1203)", () => {
    const p = mentalProfile([m("3/6 6/4 10-7", true), m("4/6 6/3 6/2", true), m("2/6 3/6", false), m("4/6 6/4 5/7", false), m("6/4 6/4", true)]);
    expect(p.comebacks).toEqual({ count: 2, total: 4 });
    // un match en un seul set ne laisse aucune chance de retour
    expect(mentalProfile([m("4/6", false)]).comebacks.total).toBe(0);
  });

  it("écarte les abandons des sets décisifs et des retours, pas des tie-breaks (FR-1206)", () => {
    const p = mentalProfile([m("6/7 7/6 6/4", true, 1, "RETIREMENT")]);
    expect(p.tieBreaks).toEqual({ count: 1, total: 2 });
    expect(p.decidingSets.total).toBe(0);
    expect(p.comebacks.total).toBe(0);
    expect(p.vsHigher).toEqual({ count: 1, total: 1 });
  });

  it("compte perfs et contre-perfs selon l'écart de classement (FR-1204, FR-1205)", () => {
    const p = mentalProfile([m("6/4 6/4", true, 2), m("4/6 4/6", false, 1), m("6/4 6/4", true, -1), m("4/6 4/6", false, -3), m("6/4 6/4", true, 0), m("4/6 4/6", false, 0)]);
    expect(p.vsHigher).toEqual({ count: 1, total: 2 });
    expect(p.vsLower).toEqual({ count: 1, total: 2 });
    expect(p.matches).toBe(6);
  });

  it("donne un pourcentage arrondi, ou rien sans match", () => {
    expect(percentOf({ count: 0, total: 0 })).toBeNull();
    expect(percentOf({ count: 1, total: 3 })).toBe(33);
    expect(percentOf({ count: 2, total: 3 })).toBe(67);
    expect(percentOf({ count: 4, total: 4 })).toBe(100);
  });

  it("décrit cinq indicateurs, dont un seul où « moins » est mieux", () => {
    expect(INDICATORS.map((i) => i.key)).toEqual(["tieBreaks", "decidingSets", "comebacks", "vsHigher", "vsLower"]);
    expect(INDICATORS.filter((i) => i.lowerIsBetter).map((i) => i.key)).toEqual(["vsLower"]);
  });
});
