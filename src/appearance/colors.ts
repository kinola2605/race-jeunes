/**
 * Couleurs du club configurables par l'admin (spec 004) : 4 couleurs, contrôle de contraste WCAG 2.1.
 * Module pur (aucun accès serveur) : utilisé par l'action admin, l'aperçu côté client et le rendu.
 * Les valeurs par défaut et les surfaces viennent de design/tokens.json (constitution VII).
 */
import tokens from "../../design/tokens.json";

export type ColorKey = "accentDark" | "actionDark" | "accentLight" | "actionLight";
export type ColorSet = Record<ColorKey, string | null>;

export const COLOR_KEYS: ColorKey[] = ["accentDark", "actionDark", "accentLight", "actionLight"];

export const COLOR_LABELS: Record<ColorKey, string> = {
  accentDark: "Accent · thème sombre",
  actionDark: "Action · thème sombre",
  accentLight: "Accent · thème clair",
  actionLight: "Action · thème clair",
};

type Tok = { $value: unknown };
type Tree = { [k: string]: Tree | Tok | unknown };

function resolve(value: unknown): string {
  if (typeof value !== "string") throw new Error("Token de couleur invalide");
  const m = /^\{(.+)\}$/.exec(value);
  if (!m) return value.toUpperCase();
  const node = m[1]!.split(".").reduce<unknown>((o, k) => (o as Tree | undefined)?.[k], tokens) as
    Tok | undefined;
  if (!node) throw new Error(`Référence de token inconnue ${value}`);
  return resolve(node.$value);
}

const theme = (name: "dark" | "light", key: string) =>
  resolve((tokens.theme[name] as unknown as Record<string, Tok>)[key]!.$value);

export const DEFAULT_COLORS: Record<ColorKey, string> = {
  accentDark: theme("dark", "accent"),
  actionDark: theme("dark", "accent-2"),
  accentLight: theme("light", "accent"),
  actionLight: theme("light", "accent-2"),
};

/** Surfaces sur lesquelles chaque couleur est posée (fond, cartes, zones en creux). */
const SURFACES = {
  dark: [theme("dark", "bg"), theme("dark", "surface-raised"), theme("dark", "surface-sunken")],
  light: [theme("light", "bg"), theme("light", "surface-raised"), theme("light", "surface-sunken")],
};

/** Fond, texte et filet discret de chaque thème (pour les aperçus). */
export const THEME_BASE = {
  dark: { bg: theme("dark", "bg"), text: theme("dark", "text"), lineSoft: theme("dark", "line-soft") },
  light: { bg: theme("light", "bg"), text: theme("light", "text"), lineSoft: theme("light", "line-soft") },
};

/** Textes possibles posés sur une couleur pleine : bleu nuit de marque ou blanc. */
const ON_COLORS = [resolve("{color.brand.midnight}"), "#FFFFFF"];

/** Minimum exigé contre les surfaces : 4,5:1 quand la couleur sert de texte, 3:1 pour un composant. */
const MIN_ON_SURFACE: Record<ColorKey, number> = {
  accentDark: 4.5,
  actionDark: 4.5,
  accentLight: 3,
  actionLight: 4.5,
};
const MIN_TEXT = 4.5;

export const HEX = /^#[0-9A-F]{6}$/;

/** Normalise une saisie (« 1e6fd9 », « #1E6FD9 ») ; null si vide ; undefined si mal formée. */
export function normalizeHex(input: string): string | null | undefined {
  const v = input.trim();
  if (v === "") return null;
  const hex = (v.startsWith("#") ? v : `#${v}`).toUpperCase();
  return HEX.test(hex) ? hex : undefined;
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** Texte le plus lisible sur une couleur pleine. */
export function onColor(hex: string): string {
  return ON_COLORS.reduce((best, c) => (contrast(c, hex) > contrast(best, hex) ? c : best));
}

export type ColorCheck = {
  key: ColorKey;
  color: string;
  ok: boolean;
  /** pire ratio mesuré contre les surfaces du thème, et minimum exigé */
  surfaceRatio: number;
  surfaceMin: number;
  /** ratio du texte posé sur la couleur */
  textOn: string;
  textRatio: number;
  textMin: number;
  message?: string;
};

const fmt = (r: number) => r.toFixed(2).replace(".", ",");

export function checkColor(key: ColorKey, color: string): ColorCheck {
  const surfaces = key.endsWith("Dark") ? SURFACES.dark : SURFACES.light;
  const surfaceRatio = Math.min(...surfaces.map((s) => contrast(color, s)));
  const surfaceMin = MIN_ON_SURFACE[key];
  const textOn = onColor(color);
  const textRatio = contrast(textOn, color);
  const problems: string[] = [];
  if (surfaceRatio < surfaceMin)
    problems.push(`contraste ${fmt(surfaceRatio)}:1 sur le fond du thème (minimum ${fmt(surfaceMin)}:1)`);
  if (textRatio < MIN_TEXT)
    problems.push(`texte posé dessus à ${fmt(textRatio)}:1 (minimum ${fmt(MIN_TEXT)}:1)`);
  return {
    key,
    color,
    ok: problems.length === 0,
    surfaceRatio,
    surfaceMin,
    textOn,
    textRatio,
    textMin: MIN_TEXT,
    message: problems.length ? `${COLOR_LABELS[key]} ${color} refusée : ${problems.join(" ; ")}.` : undefined,
  };
}

/** Couleur effective (personnalisée sinon par défaut). */
export function effective(set: ColorSet): Record<ColorKey, string> {
  return {
    accentDark: set.accentDark ?? DEFAULT_COLORS.accentDark,
    actionDark: set.actionDark ?? DEFAULT_COLORS.actionDark,
    accentLight: set.accentLight ?? DEFAULT_COLORS.accentLight,
    actionLight: set.actionLight ?? DEFAULT_COLORS.actionLight,
  };
}

/**
 * Surcharge CSS des variables de thème. Chaîne vide si aucune couleur personnalisée.
 * Sûr à injecter dans <style> : chaque valeur est revalidée contre HEX.
 */
export function themeCss(set: ColorSet): string {
  if (COLOR_KEYS.every((k) => set[k] === null)) return "";
  const c = effective(set);
  if (!COLOR_KEYS.every((k) => HEX.test(c[k]))) return "";
  const dark = [
    `--accent:${c.accentDark}`,
    `--on-accent:${onColor(c.accentDark)}`,
    `--line:${c.accentDark}`,
    `--accent-2:${c.actionDark}`,
    `--on-accent-2:${onColor(c.actionDark)}`,
    `--highlight:${c.accentDark}`,
    `--on-highlight:${onColor(c.accentDark)}`,
  ];
  const light = [
    `--accent:${c.accentLight}`,
    `--on-accent:${onColor(c.accentLight)}`,
    `--line:${c.accentLight}`,
    `--accent-2:${c.actionLight}`,
    `--on-accent-2:${onColor(c.actionLight)}`,
    `--highlight:${c.accentDark}`,
    `--on-highlight:${onColor(c.accentDark)}`,
  ];
  return `:root{${dark.join(";")}}[data-theme="light"]{${light.join(";")}}`;
}
