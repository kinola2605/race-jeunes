import { describe, expect, it } from "vitest";
import { afterEach } from "vitest";
import { keyedDigest, sessionSecret, setStoredSecret } from "./secret";

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

describe("clé conservée en base (spec 016, FR-1603)", () => {
  afterEach(() => setStoredSecret(null));
  const stored = "s".repeat(64);

  it("sert de clé en production quand SESSION_SECRET est absent", () => {
    setStoredSecret(stored);
    expect(sessionSecret({ NODE_ENV: "production" })).toBe(stored);
  });

  it("SESSION_SECRET reste prioritaire", () => {
    setStoredSecret(stored);
    expect(sessionSecret({ NODE_ENV: "production", SESSION_SECRET: strong })).toBe(strong);
  });

  it("ignore une clé stockée trop courte", () => {
    setStoredSecret("court");
    expect(() => sessionSecret({ NODE_ENV: "production" })).toThrow(/SESSION_SECRET/);
  });
});
