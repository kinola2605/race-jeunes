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

/** Palier sur le court (variante « L'échange ») : service 25 %, filet 50 %, service adverse 75 %, point 100 %. */
export type GoalTier = "start" | "route" | "mid" | "last" | "done" | "over";

export function goalTier(g: GoalProgress): GoalTier {
  if (g.played > g.target) return "over";
  if (g.reached) return "done";
  if (g.played === 0) return "start";
  const ratio = g.played / g.target;
  return ratio >= 0.75 ? "last" : ratio >= 0.5 ? "mid" : "route";
}

export const TIER_LABEL: Record<GoalTier, string> = {
  start: "Départ",
  route: "En route",
  mid: "Mi-parcours",
  last: "Dernière ligne droite",
  done: "Objectif atteint",
  over: "Objectif dépassé",
};

/** Message d'encouragement, avec le nombre de matchs restants. */
export function goalMessage(g: GoalProgress): string {
  const n = (k: number) => `${k} match${k > 1 ? "s" : ""}`;
  switch (goalTier(g)) {
    case "start":
      return "Premier service ! Joue ton premier match pour lancer l'échange.";
    case "route":
      return `La balle est partie : encore ${n(g.remaining)} pour gagner le point.`;
    case "mid":
      return `Balle au filet ! Plus que ${n(g.remaining)}.`;
    case "last":
      return `Dernière ligne droite : ${n(g.remaining)} et le point est à toi.`;
    case "done":
      return "Jeu, set et match ! Objectif atteint.";
    case "over":
      return `Objectif dépassé : +${g.played - g.target} en prolongations !`;
  }
}
