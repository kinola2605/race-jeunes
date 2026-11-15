import { describe, expect, it } from "vitest";
import { migrationPlan } from "../../scripts/vercel-build.mjs";

describe("migrationPlan (spec 016, FR-1602)", () => {
  it("migre quand l'URL directe de l'intégration Neon est fournie", () => {
    const plan = migrationPlan({ DATABASE_URL_UNPOOLED: "postgresql://u:p@ep-x-123.eu-central-1.aws.neon.tech/neondb" });
    expect(plan.migrate).toBe(true);
    expect(plan.reason).toContain("ep-x-123.eu-central-1.aws.neon.tech");
    expect(plan.reason).not.toContain("u:p");
  });

  it("ne migre pas sans URL directe (installation avancée)", () => {
    expect(migrationPlan({ DATABASE_URL: "postgresql://u:p@ep-x-pooler.neon.tech/db" })).toMatchObject({ migrate: false });
  });

  it("ne migre pas si SKIP_AUTO_MIGRATIONS=true", () => {
    expect(migrationPlan({ DATABASE_URL_UNPOOLED: "postgresql://u:p@ep-x.neon.tech/db", SKIP_AUTO_MIGRATIONS: "true" }).migrate).toBe(false);
  });

  it("refuse une URL directe qui pointe vers le pooler ou invalide", () => {
    expect(migrationPlan({ DATABASE_URL_UNPOOLED: "postgresql://u:p@ep-x-pooler.neon.tech/db" }).error).toMatch(/pooler/);
    expect(migrationPlan({ DATABASE_URL_UNPOOLED: "pas une url" }).error).toMatch(/URL valide/);
  });
});
