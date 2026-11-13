import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { ADMIN, PLAYER, login, logout } from "./helpers";

test("espace RGPD : le joueur voit et télécharge ses données, sans secret (spec 008)", async ({ page }) => {
  await login(page, PLAYER.pseudo, PLAYER.password);
  await page.goto("/compte");
  await expect(page.getByRole("heading", { name: "Mes données" })).toBeVisible();
  const list = page.getByRole("list", { name: "Données enregistrées" });
  await expect(list.getByText("Matchs")).toBeVisible();
  await expect(list.getByText("Actions au journal")).toBeVisible();

  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: "Télécharger mes données" }).click()]);
  expect(download.suggestedFilename()).toMatch(new RegExp(`^mes-donnees-${PLAYER.pseudo}-\\d{4}-\\d{2}-\\d{2}\\.json$`));
  const text = await readFile((await download.path())!, "utf-8");
  const data = JSON.parse(text);
  expect(data.format).toBe("race-jeunes/donnees-personnelles");
  expect(data.compte.pseudo).toBe(PLAYER.pseudo);
  expect(Array.isArray(data.matchs)).toBe(true);
  expect(data.sessions.length).toBeGreaterThan(0);
  for (const secret of ["passwordHash", "argon2", "race_session"]) expect(text).not.toContain(secret);

  // FR-804 : un joueur ne télécharge pas les données d'un autre compte
  const other = await page.request.get("/api/mes-donnees?joueur=un-autre-compte");
  expect(other.status()).toBe(403);
  await logout(page);

  // sans session : aucune donnée
  const anon = await page.request.get("/api/mes-donnees", { maxRedirects: 0 });
  expect(anon.status()).not.toBe(200);
});

test("espace RGPD : l'admin télécharge les données d'un joueur depuis sa fiche, tracé au journal (spec 008)", async ({ page }) => {
  await login(page, ADMIN.pseudo, ADMIN.password);
  await page.goto("/admin/joueurs");
  await page.getByRole("link", { name: PLAYER.pseudo }).first().click();
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: "Télécharger ses données (RGPD)" }).click()]);
  expect(download.suggestedFilename()).toContain(`mes-donnees-${PLAYER.pseudo}-`);
  const data = JSON.parse(await readFile((await download.path())!, "utf-8"));
  expect(data.compte.pseudo).toBe(PLAYER.pseudo);

  await page.goto("/admin/journal?type=Export");
  await expect(page.getByText("Export des données personnelles").first()).toBeVisible();
  await logout(page);
});
