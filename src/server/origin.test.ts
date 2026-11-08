import { describe, expect, it } from "vitest";
import { isAllowedWrite } from "./origin";

describe("isAllowedWrite", () => {
  it("laisse passer les lectures", () => {
    expect(isAllowedWrite("GET", null, null)).toBe(true);
    expect(isAllowedWrite("head", "https://ailleurs.example", "race.vercel.app")).toBe(true);
  });

  it("accepte une écriture de même origine", () => {
    expect(isAllowedWrite("POST", "https://race.vercel.app", "race.vercel.app")).toBe(true);
    expect(isAllowedWrite("POST", "http://localhost:3000", "localhost:3000")).toBe(true);
  });

  it("refuse une écriture d'une autre origine, sans origine ou avec une origine invalide", () => {
    expect(isAllowedWrite("POST", "https://evil.example", "race.vercel.app")).toBe(false);
    expect(isAllowedWrite("DELETE", null, "race.vercel.app")).toBe(false);
    expect(isAllowedWrite("POST", "null", "race.vercel.app")).toBe(false);
    expect(isAllowedWrite("POST", "https://race.vercel.app", null)).toBe(false);
  });
});
