import { describe, expect, it } from "vitest";
import { installCodeMatches, installCodeStatus } from "./install-code";

describe("code d'installation (spec 016, FR-1601, FR-1606)", () => {
  it("signale un code absent ou trop court", () => {
    expect(installCodeStatus({})).toBe("absent");
    expect(installCodeStatus({ INSTALL_CODE: "   " })).toBe("absent");
    expect(installCodeStatus({ INSTALL_CODE: "court" })).toBe("trop-court");
    expect(installCodeStatus({ INSTALL_CODE: "club-2026" })).toBe("ok");
  });

  it("accepte le bon code (espaces de bord ignorés, casse respectée)", () => {
    const env = { INSTALL_CODE: "Club-2026" };
    expect(installCodeMatches("Club-2026", env)).toBe(true);
    expect(installCodeMatches("  Club-2026 ", env)).toBe(true);
    expect(installCodeMatches("club-2026", env)).toBe(false);
    expect(installCodeMatches("", env)).toBe(false);
  });

  it("refuse tout code quand aucun code valide n'est configuré", () => {
    expect(installCodeMatches("", {})).toBe(false);
    expect(installCodeMatches("court", { INSTALL_CODE: "court" })).toBe(false);
  });
});
