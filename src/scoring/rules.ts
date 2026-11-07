import { z } from "zod";
import { isRanking } from "./ladder";

/** Écarts couverts par les tables : -4 signifie « -4 ou moins », 4 « +4 ou plus ». */
export const GAP_KEYS = [-4, -3, -2, -1, 0, 1, 2, 3, 4] as const;
export type GapKey = (typeof GAP_KEYS)[number];

const points = z.number().int("Valeur entière attendue").min(0, "Valeur positive ou nulle attendue").max(1000, "Valeur trop grande (1000 max)");

const gapTable = z.object(
  Object.fromEntries(GAP_KEYS.map((k) => [String(k), points])) as Record<`${GapKey}`, typeof points>,
);

const overrideKey = z.string().refine((key) => {
  const [player, opponent, extra] = key.split("|");
  return extra === undefined && isRanking(player) && isRanking(opponent);
}, "Clé de surcharge invalide (attendu « classement|classement »)");

const overrides = z.record(overrideKey, points);

export const ruleSetSchema = z.object({
  unrankedAs: z.enum(["40", "NC"]),
  win: z.object({ byGap: gapTable }),
  loss: z.object({ byGap: gapTable }),
  overrides: z.object({ win: overrides, loss: overrides }),
  walkoverWin: points,
  capPerMatch: points.nullable(),
  assiduity: z
    .object({
      every: z.number().int().min(1, "Au moins 1 match").max(100),
      points,
    })
    .nullable(),
});

export type RuleSet = z.infer<typeof ruleSetSchema>;
export type GapTable = RuleSet["win"]["byGap"];

function table(values: readonly number[]): GapTable {
  return Object.fromEntries(GAP_KEYS.map((k, i) => [String(k), values[i] ?? 0])) as GapTable;
}

/** Barème « vide » : toutes les valeurs à zéro, NC traité comme 40. */
export function emptyRuleSet(): RuleSet {
  return {
    unrankedAs: "40",
    win: { byGap: table([0, 0, 0, 0, 0, 0, 0, 0, 0]) },
    loss: { byGap: table([0, 0, 0, 0, 0, 0, 0, 0, 0]) },
    overrides: { win: {}, loss: {} },
    walkoverWin: 0,
    capPerMatch: null,
    assiduity: null,
  };
}

/** Construit un barème à partir de deux listes de 9 valeurs (écarts -4 … +4). */
export function ruleSetFromTables(win: readonly number[], loss: readonly number[], extra: Partial<RuleSet> = {}): RuleSet {
  return { ...emptyRuleSet(), win: { byGap: table(win) }, loss: { byGap: table(loss) }, ...extra };
}

export type ValidationResult =
  | { ok: true; rules: RuleSet; warnings: string[] }
  | { ok: false; errors: string[] };

/** Valide un barème et signale les incohérences non bloquantes. */
export function validateRuleSet(input: unknown): ValidationResult {
  const parsed = ruleSetSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((issue) => `${issue.path.join(" › ") || "barème"} : ${issue.message}`),
    };
  }
  const rules = parsed.data;
  const warnings: string[] = [];
  for (let i = 1; i < GAP_KEYS.length; i++) {
    const prev = GAP_KEYS[i - 1] as GapKey;
    const cur = GAP_KEYS[i] as GapKey;
    if (rules.win.byGap[`${cur}`] < rules.win.byGap[`${prev}`]) {
      warnings.push(`Victoire : l'écart ${formatGap(cur)} rapporte moins que l'écart ${formatGap(prev)}.`);
    }
  }
  if (rules.capPerMatch !== null) {
    const max = Math.max(...Object.values(rules.win.byGap), ...Object.values(rules.overrides.win));
    if (max > rules.capPerMatch) {
      warnings.push(`Le plafond (${rules.capPerMatch}) est inférieur à certaines valeurs de la table (${max}).`);
    }
  }
  return { ok: true, rules, warnings };
}

export function formatGap(gap: number): string {
  if (gap <= -4) return "−4 ou moins";
  if (gap >= 4) return "+4 ou plus";
  if (gap > 0) return `+${gap}`;
  if (gap < 0) return `−${Math.abs(gap)}`;
  return "0";
}

