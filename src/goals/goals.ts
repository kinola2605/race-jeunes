// Objectif du nombre de matchs par saison et par étiquette (spec 005). Fonctions pures, sans base.

export const GOAL_MAX = 200;

/** FR-502 : objectif le plus élevé parmi les étiquettes du joueur, sinon l'objectif par défaut. */
export function retainedGoal(
  defaultGoal: number | null,
  tagGoals: ReadonlyMap<string, number>,
  playerTagIds: readonly string[],
): { target: number; tagId: string | null } | null {
  let best: { target: number; tagId: string } | null = null;
  for (const tagId of playerTagIds) {
    const target = tagGoals.get(tagId);
    if (target !== undefined && (!best || target > best.target)) best = { target, tagId };
  }
  if (best) return best;
  return defaultGoal !== null ? { target: defaultGoal, tagId: null } : null;
}

/** FR-503 : matchs validés, hors forfaits. */
export function countsTowardGoal(m: { status: string; kind: string }): boolean {
  return m.status === "VALIDATED" && m.kind !== "WALKOVER";
}

export interface GoalProgress {
  played: number;
  target: number;
  remaining: number;
  reached: boolean;
  /** 0 à 100, arrondi à l'entier inférieur */
  percent: number;
}

export function goalProgress(played: number, target: number): GoalProgress {
  return {
    played,
    target,
    remaining: Math.max(0, target - played),
    reached: played >= target,
    percent: Math.min(100, Math.floor((played / target) * 100)),
  };
}

/** FR-501 : case vide = pas d'objectif ; sinon entier de 1 à GOAL_MAX. */
export function parseGoal(raw: string): { ok: true; value: number | null } | { ok: false } {
  const s = raw.trim();
  if (s === "") return { ok: true, value: null };
  if (!/^\d{1,3}$/.test(s)) return { ok: false };
  const n = Number(s);
  return n >= 1 && n <= GOAL_MAX ? { ok: true, value: n } : { ok: false };
}
