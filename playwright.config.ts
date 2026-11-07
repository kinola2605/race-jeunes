import { defineConfig, devices } from "@playwright/test";

/**
 * Tests E2E. Prérequis : base migrée et données de démonstration (npm run db:seed), application construite.
 * En local : `npm run build && npm run test:e2e` (le serveur est démarré automatiquement).
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:3000",
    locale: "fr-FR",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "mobile", use: { ...devices["Pixel 7"] } }],
  webServer: {
    command: "npx next start -p 3000",
    url: "http://localhost:3000/connexion",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { COOKIE_SECURE: "false" },
  },
});
