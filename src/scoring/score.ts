export interface SetScore {
  a: number;
  b: number;
  superTieBreak: boolean;
}

export type ScoreParse = { ok: true; sets: SetScore[]; normalized: string } | { ok: false; error: string };

/**
 * Analyse un score saisi du point de vue du joueur : « 6/4 6/3 », « 6-4 3-6 10-8 ».
 * Le dernier set peut être un super tie-break (premier à 10, 2 points d'écart).
 */
export function parseScore(raw: string): ScoreParse {
  const parts = raw.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { ok: false, error: "Score manquant." };
  if (parts.length > 3) return { ok: false, error: "Trois sets au maximum." };
  const sets: SetScore[] = [];
  for (const [index, part] of parts.entries()) {
    const m = /^(\d{1,2})[/-](\d{1,2})$/.exec(part);
    if (!m) return { ok: false, error: `Set ${index + 1} illisible : « ${part} » (attendu 6/4).` };
    const a = Number(m[1]);
    const b = Number(m[2]);
    const isLast = index === parts.length - 1;
    const superTieBreak = isLast && index === 2 && Math.max(a, b) >= 10;
    if (superTieBreak) {
      if (Math.abs(a - b) < 2 || (Math.max(a, b) > 10 && Math.abs(a - b) !== 2)) {
        return { ok: false, error: `Super tie-break invalide : « ${part} ».` };
      }
    } else if (!isValidSet(a, b)) {
      return { ok: false, error: `Set ${index + 1} invalide : « ${part} ».` };
    }
    sets.push({ a, b, superTieBreak });
  }
  return { ok: true, sets, normalized: sets.map((s) => (s.superTieBreak ? `${s.a}-${s.b}` : `${s.a}/${s.b}`)).join(" ") };
}

function isValidSet(a: number, b: number): boolean {
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  if (hi === 6) return lo <= 4;
  if (hi === 7) return lo === 5 || lo === 6;
  // formats courts jeunes (sets à 4 jeux) : 4/0 … 4/2, 5/3, 5/4 (jeu décisif)
  if (hi === 4) return lo <= 2;
  if (hi === 5) return lo === 3 || lo === 4;
  return false;
}

/** Vainqueur selon les sets : « A » si le joueur a gagné plus de sets. Égalité → null. */
export function winnerOf(sets: readonly SetScore[]): "A" | "B" | null {
  let a = 0;
  let b = 0;
  for (const s of sets) {
    if (s.a > s.b) a += 1;
    else b += 1;
  }
  if (a === b) return null;
  return a > b ? "A" : "B";
}

/** Inverse un score normalisé (point de vue de l'adversaire). */
export function invertScore(normalized: string): string {
  return normalized
    .split(" ")
    .map((part) => {
      const sep = part.includes("/") ? "/" : "-";
      const [x, y] = part.split(sep);
      return `${y}${sep}${x}`;
    })
    .join(" ");
}
