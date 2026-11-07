/** Échelle des classements FFT, du moins bien au mieux classé. */
export const LADDER = [
  "NC",
  "40",
  "30/5",
  "30/4",
  "30/3",
  "30/2",
  "30/1",
  "30",
  "15/5",
  "15/4",
  "15/3",
  "15/2",
  "15/1",
  "15",
  "5/6",
  "4/6",
  "3/6",
  "2/6",
  "1/6",
  "0",
  "-2/6",
  "-4/6",
  "-15",
  "-30",
] as const;

export type Ranking = (typeof LADDER)[number];

export function isRanking(value: unknown): value is Ranking {
  return typeof value === "string" && (LADDER as readonly string[]).includes(value);
}

/** Position (échelon) d'un classement dans l'échelle ; NC = 0. */
export function rungOf(ranking: Ranking): number {
  return LADDER.indexOf(ranking);
}

/** Série d'affichage utilisée pour les filtres de classement. */
export function seriesOf(ranking: Ranking): "40-NC" | "30" | "15+" {
  const rung = rungOf(ranking);
  if (rung <= 1) return "40-NC";
  if (rung <= rungOf("30")) return "30";
  return "15+";
}
