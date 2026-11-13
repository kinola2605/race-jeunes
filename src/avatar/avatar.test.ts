import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { AVATAR_COLORS, COLOR_KEYS, ICON_KEYS, checkAvatar, defaultAvatar, formatAvatar, parseAvatar, shownAvatar } from "./avatar";
import { contrast } from "@/appearance/colors";

describe("avatars (spec 007)", () => {
  it("lit et écrit « icône:couleur »", () => {
    expect(parseAvatar("etoile:ciel")).toEqual({ icon: "etoile", color: "ciel" });
    expect(formatAvatar({ icon: "balle", color: "terre" })).toBe("balle:terre");
    for (const icon of ICON_KEYS) for (const color of COLOR_KEYS) expect(parseAvatar(formatAvatar({ icon, color }))).toEqual({ icon, color });
  });

  it("refuse toute valeur hors galerie (FR-704)", () => {
    for (const bad of [null, undefined, "", "etoile", "etoile:", ":ciel", "photo:ciel", "etoile:rose", "etoile:ciel:x", "https://x/y.png"]) expect(parseAvatar(bad)).toBeNull();
    expect(checkAvatar("etoile", "ciel")).toEqual({ icon: "etoile", color: "ciel" });
    expect(checkAvatar("<script>", "ciel")).toBeNull();
    expect(checkAvatar("etoile", "#fff")).toBeNull();
  });

  it("donne un avatar par défaut stable, sans distinction de casse (FR-703)", () => {
    const a = defaultAvatar("Lola75");
    expect(a).toEqual(defaultAvatar("lola75"));
    expect(a.kind).toBe("initial");
    if (a.kind === "initial") expect(a.initial).toBe("L");
    expect(COLOR_KEYS).toContain(a.color);
    expect(defaultAvatar("élise")).toMatchObject({ initial: "É" });
    expect(defaultAvatar("  ")).toMatchObject({ initial: "?" });
    const colors = new Set(["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"].map((p) => defaultAvatar(p).color));
    expect(colors.size).toBeGreaterThan(3);
  });

  it("affiche l'avatar choisi, sinon l'avatar par défaut", () => {
    expect(shownAvatar("Lola", "coeur:gazon")).toEqual({ kind: "icon", icon: "coeur", color: "gazon" });
    expect(shownAvatar("Lola", "inconnu")).toEqual(defaultAvatar("Lola"));
    expect(shownAvatar("Lola", null)).toEqual(defaultAvatar("Lola"));
  });

  it("chaque couleur a son token et un pictogramme lisible (≥ 4,5:1, FR-702)", () => {
    const tokens = JSON.parse(readFileSync("design/tokens.json", "utf8"));
    const resolve = (v: string): string => {
      const m = /^\{(.+)\}$/.exec(v);
      return m ? resolve(m[1]!.split(".").reduce((o, k) => o[k], tokens).$value) : v;
    };
    expect(Object.keys(AVATAR_COLORS).sort()).toEqual(Object.keys(tokens.color.avatar).filter((k) => !k.startsWith("$") && !k.endsWith("-ink")).sort());
    for (const c of COLOR_KEYS) {
      const bg = resolve(tokens.color.avatar[c].$value);
      const ink = resolve(tokens.color.avatar[`${c}-ink`].$value);
      expect(contrast(bg, ink), c).toBeGreaterThanOrEqual(4.5);
    }
  });
});
