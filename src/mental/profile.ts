// Profil mental calculé à partir des scores enregistrés (spec 012). Fonctions pures, sans base.
import { parseScore } from "@/scoring/score";

/** Un match validé, vu du côté du joueur. */
export interface MentalMatch {
  /** score normalisé du point de vue du joueur (« 6/4 3/6 10-8 »), null s'il n'y en a pas */
  score: string | null;
  won: boolean;
  kind: "NORMAL" | "WALKOVER" | "RETIREMENT";
  /** échelon de l'adversaire − échelon du joueur, tel qu'enregistré à la validation (positif : adversaire mieux classé) */
  gap: number;
}

/** `count` occurrences sur `total` situations rencontrées. */
export interface Ratio {
  count: number;
  total: number;
}

export interface MentalProfile {
  /** matchs joués pris en compte (validés, hors forfaits) */
  matches: number;
  /** FR-1201 : tie-breaks gagnés / joués */
  tieBreaks: Ratio;
  /** FR-1202 : sets décisifs gagnés / joués */
  decidingSets: Ratio;
  /** FR-1203 : victoires / matchs où le premier set a été perdu */
  comebacks: Ratio;
  /** FR-1204 : perfs / matchs contre un mieux classé */
  vsHigher: Ratio;
  /** FR-1205 : contre-perfs / matchs contre un moins bien classé */
  vsLower: Ratio;
}

export type IndicatorKey = Exclude<keyof MentalProfile, "matches">;

export interface Indicator {
  key: IndicatorKey;
  label: string;
  /** ce que compte `count` */
  countLabel: (n: number) => string;
  /** ce que compte `total` */
  totalLabel: (n: number) => string;
  /** vrai quand un pourcentage bas est le bon signe (contre-perfs) */
  lowerIsBetter: boolean;
}

const s = (n: number) => (n > 1 ? "s" : "");

export const INDICATORS: readonly Indicator[] = [
  { key: "tieBreaks", label: "Tie-breaks", countLabel: (n) => `gagné${s(n)}`, totalLabel: (n) => `joué${s(n)}`, lowerIsBetter: false },
  { key: "decidingSets", label: "Sets décisifs", countLabel: (n) => `gagné${s(n)}`, totalLabel: (n) => `joué${s(n)}`, lowerIsBetter: false },
  { key: "comebacks", label: "Retours", countLabel: (n) => `victoire${s(n)}`, totalLabel: (n) => `premier${s(n)} set${s(n)} perdu${s(n)}`, lowerIsBetter: false },
  { key: "vsHigher", label: "Face à un mieux classé", countLabel: (n) => `perf${s(n)}`, totalLabel: (n) => `match${s(n)}`, lowerIsBetter: false },
  { key: "vsLower", label: "Face à un moins bien classé", countLabel: (n) => `contre-perf${s(n)}`, totalLabel: (n) => `match${s(n)}`, lowerIsBetter: true },
];

export function emptyProfile(): MentalProfile {
  const zero = (): Ratio => ({ count: 0, total: 0 });
  return { matches: 0, tieBreaks: zero(), decidingSets: zero(), comebacks: zero(), vsHigher: zero(), vsLower: zero() };
}

/** Set conclu par un jeu décisif : 7/6, ou 5/4 dans les formats courts jeunes. Le super tie-break n'en est pas un. */
function isTieBreak(a: number, b: number): boolean {
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  return (hi === 7 && lo === 6) || (hi === 5 && lo === 4);
}

function add(r: Ratio, hit: boolean): void {
  r.total += 1;
  if (hit) r.count += 1;
}

/** Cumule les indicateurs sur une liste de matchs (un joueur, ou tout un groupe). */
export function mentalProfile(matches: readonly MentalMatch[]): MentalProfile {
  const p = emptyProfile();
  for (const match of matches) {
    // FR-1206 : un forfait n'a pas été joué
    if (match.kind === "WALKOVER") continue;
    p.matches += 1;
    if (match.gap > 0) add(p.vsHigher, match.won);
    else if (match.gap < 0) add(p.vsLower, !match.won);

    const parsed = match.score ? parseScore(match.score) : null;
    if (!parsed?.ok) continue;
    const sets = parsed.sets;
    for (const set of sets) {
      if (!set.superTieBreak && isTieBreak(set.a, set.b)) add(p.tieBreaks, set.a > set.b);
    }
    // FR-1206 : après un abandon, le dernier set et l'issue du match ne disent rien du mental
    if (match.kind !== "NORMAL") continue;
    const third = sets[2];
    if (third) add(p.decidingSets, third.a > third.b);
    const first = sets[0]!;
    if (sets.length >= 2 && first.a < first.b) add(p.comebacks, match.won);
  }
  return p;
}

/** Pourcentage entier, null quand la situation ne s'est jamais présentée. */
export function percentOf(r: Ratio): number | null {
  return r.total === 0 ? null : Math.round((r.count / r.total) * 100);
}
