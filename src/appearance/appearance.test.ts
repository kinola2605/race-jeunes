import { describe, expect, it } from "vitest";
import { DEFAULT_COLORS, checkColor, contrast, normalizeHex, onColor, themeCss, COLOR_KEYS } from "./colors";
import { LOGO_MAX_BYTES, checkLogo, sniffLogoType } from "./logo";

const none = { accentDark: null, actionDark: null, accentLight: null, actionLight: null };

describe("couleurs du club (spec 004)", () => {
  it("reprend les valeurs par défaut de design/tokens.json", () => {
    expect(DEFAULT_COLORS).toEqual({
      accentDark: "#FDC2B2",
      actionDark: "#FF7F5C",
      accentLight: "#14293E",
      actionLight: "#B8432C",
    });
  });

  it("calcule les ratios comme design/identite.md §3", () => {
    expect(contrast("#F6F6F6", "#14293E")).toBeCloseTo(13.72, 1);
    expect(contrast("#FF7F5C", "#1B3550")).toBeCloseTo(5.05, 1);
    expect(contrast("#FFFFFF", "#FF7F5C")).toBeCloseTo(2.49, 1);
  });

  it("accepte toutes les couleurs par défaut, avec le texte d'origine", () => {
    for (const k of COLOR_KEYS) expect(checkColor(k, DEFAULT_COLORS[k]).ok).toBe(true);
    expect(onColor("#FDC2B2")).toBe("#14293E");
    expect(onColor("#B8432C")).toBe("#FFFFFF");
  });

  it("refuse une couleur illisible avec le ratio mesuré", () => {
    const r = checkColor("accentLight", "#FFE600");
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/minimum 3,00:1/);
    expect(checkColor("accentLight", "#1E6FD9").ok).toBe(true);
    expect(checkColor("actionDark", "#426486").ok).toBe(false);
  });

  it("normalise les saisies", () => {
    expect(normalizeHex(" 1e6fd9 ")).toBe("#1E6FD9");
    expect(normalizeHex("")).toBeNull();
    expect(normalizeHex("#12")).toBeUndefined();
    expect(normalizeHex("bleu")).toBeUndefined();
  });

  it("ne produit une surcharge CSS que pour des couleurs personnalisées et valides", () => {
    expect(themeCss(none)).toBe("");
    const css = themeCss({ ...none, accentLight: "#1E6FD9" });
    expect(css).toContain('[data-theme="light"]{--accent:#1E6FD9;--on-accent:#FFFFFF');
    expect(css).toContain(":root{--accent:#FDC2B2");
    expect(themeCss({ ...none, accentLight: "red;}body{x" })).toBe("");
  });
});

const bytes = (...b: number[]) => new Uint8Array(b);
const text = (s: string) => new TextEncoder().encode(s);

describe("logo du club (spec 003)", () => {
  it("reconnaît le type d'après le contenu", () => {
    expect(sniffLogoType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0))).toBe("image/png");
    expect(sniffLogoType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg");
    expect(sniffLogoType(bytes(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50))).toBe(
      "image/webp",
    );
    expect(
      sniffLogoType(
        text('<?xml version="1.0"?>\n<!-- logo -->\n<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
      ),
    ).toBe("image/svg+xml");
    expect(sniffLogoType(text("<html><svg></svg></html>"))).toBeNull();
    expect(sniffLogoType(text("pseudo;classement"))).toBeNull();
  });

  it("refuse un fichier vide, trop lourd ou d'un autre type", () => {
    expect(checkLogo(new Uint8Array(0))).toEqual({ ok: false, error: "Choisissez un fichier de logo." });
    const big = new Uint8Array(LOGO_MAX_BYTES + 1);
    big.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(checkLogo(big).ok).toBe(false);
    expect(checkLogo(text("bonjour"))).toMatchObject({
      ok: false,
      error: expect.stringMatching(/Format non reconnu/),
    });
    expect(checkLogo(bytes(0xff, 0xd8, 0xff, 0xe0))).toEqual({ ok: true, type: "image/jpeg" });
  });
});
