// Captures d'écran de la documentation (spec 013, FR-1308) : npm run docs:captures
// Prérequis : application démarrée sur une base de DÉMONSTRATION (npm run db:seed), jamais sur des données réelles.
// Cible : http://localhost:3000, ou DOCS_BASE_URL.
import { chromium, devices } from "@playwright/test";
import { mkdirSync } from "node:fs";

const base = process.env.DOCS_BASE_URL ?? "http://localhost:3000";
if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(base)) {
  console.error("DOCS_BASE_URL doit viser une application locale de démonstration.");
  process.exit(1);
}
const out = "docs/assets/captures";
// Identifiants de démonstration définis dans prisma/seed.ts (jamais utilisés en production).
const ADMIN = { pseudo: "admin.demo", password: "demo-admin-2026" };
const PLAYER = { pseudo: "AceDuMatin", password: "demo-joueur-2026" };
const SEASON = "race-jeunes-2026-27";

const SHOTS = {
  player: [
    ["joueur-accueil", "/accueil"],
    ["joueur-classement", "/classement"],
    ["joueur-saisir", "/matchs/nouveau"],
  ],
  admin: [
    ["admin-suivi", "/admin"],
    ["admin-matchs", "/admin/matchs"],
    ["admin-bareme", `/admin/saisons/${SEASON}/bareme`],
  ],
};

mkdirSync(out, { recursive: true });
const browser = await chromium.launch();

async function capture(account, shots) {
  const context = await browser.newContext({ ...devices["Pixel 7"], locale: "fr-FR", colorScheme: "dark" });
  const page = await context.newPage();
  await page.goto(`${base}/connexion`);
  await page.getByLabel("Pseudo").fill(account.pseudo);
  await page.getByLabel("Mot de passe", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/connexion"));
  for (const [name, path] of shots) {
    const response = await page.goto(base + path, { waitUntil: "networkidle" });
    if (!response || !response.ok()) throw new Error(`${path} : réponse ${response?.status()}`);
    await page.screenshot({ path: `${out}/${name}.png` });
    console.log(`${out}/${name}.png`);
  }
  await context.close();
}

try {
  await capture(PLAYER, SHOTS.player);
  await capture(ADMIN, SHOTS.admin);
} finally {
  await browser.close();
}
