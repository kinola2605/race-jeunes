import { expect, test } from "@playwright/test";
import { ADMIN, PLAYER, login, logout, uniquePseudo } from "./helpers";

/** Recette de mise en production : saison + barème, engagement, historique, refus d'accès, CSRF. */

test("l'admin crée une saison (identifiant + titre) avec son propre barème et y engage un joueur", async ({ page }) => {
  const slug = `recette-${Date.now().toString(36)}`;
  const pseudo = uniquePseudo("Recette");
  await login(page, ADMIN.pseudo, ADMIN.password);

  await page.goto("/admin/saisons/nouvelle");
  await page.getByLabel(/^Titre/).fill(`Saison de recette ${slug}`);
  await page.getByLabel(/^Identifiant/).fill(slug);
  await page.getByRole("button", { name: "Créer en brouillon" }).click();
  await expect(page).toHaveURL(new RegExp(`/admin/saisons/${slug}`));
  await expect(page.getByText("Saison créée en brouillon.")).toBeVisible();

  // Barème propre à la saison (copie indépendante publiée en v1).
  await page.goto(`/admin/saisons/${slug}/bareme`);
  await expect(page.getByRole("heading", { name: "Éditeur de barème" })).toBeVisible();
  await expect(page.getByText(/v1/).first()).toBeVisible();

  // Nouveau joueur, puis engagement dans la saison.
  await page.goto("/admin/joueurs/nouveau");
  await page.getByLabel(/^Pseudo/).fill(pseudo);
  await page.getByRole("button", { name: "Créer le compte" }).click();
  await expect(page.getByText(`Compte créé : ${pseudo}`)).toBeVisible();

  await page.goto(`/admin/saisons/${slug}/engagements`);
  await page.getByRole("list", { name: "Joueurs non engagés" }).getByText(pseudo).click();
  await page.getByRole("button", { name: "Engager la sélection" }).click();
  await expect(page.locator("#t-enr").locator("xpath=..")).toContainText(pseudo);
  await logout(page);
});

test("un joueur consulte son historique de saisons", async ({ page }) => {
  await login(page, PLAYER.pseudo, PLAYER.password);
  await page.goto("/saisons");
  await expect(page.getByRole("heading", { name: "Mes saisons" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Race jeunes 2025-2026" })).toBeVisible();
  await page.goto("/matchs");
  await expect(page).toHaveURL(/\/matchs$/);
  await logout(page);
});

test("un joueur n'accède à aucune page ni export d'administration", async ({ page }) => {
  await login(page, PLAYER.pseudo, PLAYER.password);
  for (const path of ["/admin", "/admin/saisons/nouvelle", "/admin/matchs", "/admin/journal"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/acces-refuse$/);
  }
  for (const kind of ["classement?saison=race-jeunes-2026-27", "matchs?saison=race-jeunes-2026-27", "journal"]) {
    expect((await page.request.get(`/api/export/${kind}`)).status()).toBe(403);
  }
  await logout(page);
});

test("CSRF : une écriture venant d'une autre origine est refusée", async ({ request }) => {
  const res = await request.post("/connexion", {
    headers: { Origin: "https://attaquant.example" },
    form: { pseudo: ADMIN.pseudo, password: ADMIN.password },
    maxRedirects: 0,
  });
  expect(res.status()).toBe(403);
});

test("en-têtes de sécurité et API jamais mises en cache", async ({ request }) => {
  const page = await request.get("/connexion");
  const h = page.headers();
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["referrer-policy"]).toBe("no-referrer");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["strict-transport-security"]).toContain("max-age=");
  const api = await request.get("/api/health");
  expect(api.headers()["cache-control"]).toContain("no-store");
});
