import { describe, expect, it } from "vitest";
import { describeDatabase, isLocalHost, runtimeDatabaseUrl } from "./db-url";

const params = (u: string) => new URL(u).searchParams;

describe("runtimeDatabaseUrl", () => {
  it("impose le SSL et pgbouncer sur le pooler Neon", () => {
    const p = params(runtimeDatabaseUrl("postgresql://u:p@ep-x-pooler.eu-central-1.aws.neon.tech/neondb"));
    expect(p.get("sslmode")).toBe("require");
    expect(p.get("pgbouncer")).toBe("true");
    expect(p.get("connect_timeout")).toBe("15");
  });

  it("remplace un sslmode faible mais garde un mode plus strict", () => {
    expect(params(runtimeDatabaseUrl("postgresql://u:p@db.example.org/x?sslmode=prefer")).get("sslmode")).toBe("require");
    expect(params(runtimeDatabaseUrl("postgresql://u:p@db.example.org/x?sslmode=verify-full")).get("sslmode")).toBe("verify-full");
  });

  it("respecte les paramètres déjà fournis", () => {
    const p = params(runtimeDatabaseUrl("postgresql://u:p@ep-x-pooler.neon.tech/x?pgbouncer=false&connect_timeout=5"));
    expect(p.get("pgbouncer")).toBe("false");
    expect(p.get("connect_timeout")).toBe("5");
  });

  it("n'impose pas le SSL en local ni dans Docker", () => {
    expect(params(runtimeDatabaseUrl("postgresql://race:race@localhost:54329/race")).has("sslmode")).toBe(false);
    expect(params(runtimeDatabaseUrl("postgresql://race:race@db:5432/race")).has("sslmode")).toBe(false);
    expect(isLocalHost("127.0.0.1")).toBe(true);
    expect(isLocalHost("ep-x.neon.tech")).toBe(false);
  });
});

describe("describeDatabase", () => {
  it("n'affiche jamais les identifiants", () => {
    expect(describeDatabase("postgresql://user:secret@ep-x.neon.tech/neondb")).toBe("ep-x.neon.tech/neondb");
    expect(describeDatabase(undefined)).toBe("(non définie)");
    expect(describeDatabase("pas une url")).toBe("(URL invalide)");
  });
});
