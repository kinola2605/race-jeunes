import { describe, expect, it } from "vitest";
import { keyedDigest, sessionSecret } from "./secret";

const strong = "x".repeat(32);

describe("sessionSecret", () => {
  it("exige un secret d'au moins 32 caractères en production", () => {
    expect(() => sessionSecret({ NODE_ENV: "production" })).toThrow(/SESSION_SECRET/);
    expect(() => sessionSecret({ NODE_ENV: "production", SESSION_SECRET: "court" })).toThrow(/SESSION_SECRET/);
    expect(sessionSecret({ NODE_ENV: "production", SESSION_SECRET: strong })).toBe(strong);
  });

  it("utilise une valeur de développement hors production", () => {
    expect(sessionSecret({ NODE_ENV: "development" })).toMatch(/^dev-only/);
  });
});

describe("keyedDigest", () => {
  it("dépend du secret et du domaine", () => {
    const a = keyedDigest("session", "jeton", { NODE_ENV: "production", SESSION_SECRET: strong });
    const b = keyedDigest("session", "jeton", { NODE_ENV: "production", SESSION_SECRET: "y".repeat(32) });
    const c = keyedDigest("ip", "jeton", { NODE_ENV: "production", SESSION_SECRET: strong });
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toBe(b);
    expect(a).not.toBe(c);
  });
});
