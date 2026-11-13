// Objectif du nombre de matchs par joueur et par saison (spec 005). Fonctions pures, sans base.

export const GOAL_MAX = 200;

/** FR-502 : matchs validés, hors forfaits. */
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

/** FR-500/501 : case vide = pas d'objectif ; sinon entier de 1 à GOAL_MAX. */
export function parseGoal(raw: string): { ok: true; value: number | null } | { ok: false } {
  const s = raw.trim();
  if (s === "") return { ok: true, value: null };
  if (!/^\d{1,3}$/.test(s)) return { ok: false };
  const n = Number(s);
  return n >= 1 && n <= GOAL_MAX ? { ok: true, value: n } : { ok: false };
}
