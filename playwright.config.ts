import { defineConfig, devices } from "@playwright/test";
import { randomBytes } from "node:crypto";

/**
 * Tests E2E. Prérequis : base migrée et données de démonstration (npm run db:seed), application construite.
 * En local : `npm run build && npm run test:e2e` (le serveur est démarré automatiquement).
 */
// Port configurable (E2E_PORT) pour ne pas réutiliser par erreur un serveur déjà lancé sur 3000.
const port = Number(process.env.E2E_PORT ?? 3000);

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    locale: "fr-FR",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "mobile", use: { ...devices["Pixel 7"] } }],
  webServer: {
    command: `npx next start -p ${port}`,
    url: `http://localhost:${port}/connexion`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // Secret éphémère propre au run de tests (aucun secret versionné).
    env: { COOKIE_SECURE: "false", SESSION_SECRET: process.env.SESSION_SECRET ?? randomBytes(32).toString("hex") },
  },
});
