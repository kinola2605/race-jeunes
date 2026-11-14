import { expect, test, type Page } from "@playwright/test";
import { ADMIN, PLAYER, login, logout, openPlayerTab } from "./helpers";

const SEASON = "Race jeunes 2026-2027";

async function setGoal(page: Page, value: string) {
  await page.goto("/admin/joueurs");
  await page.getByRole("link", { name: new RegExp(PLAYER.pseudo) }).first().click();
  await openPlayerTab(page, "Saisons");
  const season = page.getByRole("listitem").filter({ hasText: SEASON });
  await season.getByLabel("Objectif de matchs").fill(value);
  await season.getByRole("button", { name: "Enregistrer" }).click();
}

test("objectif de matchs : l'admin le fixe sur la fiche joueur, le joueur le suit sur son accueil (spec 005)", async ({ page }) => {
  // 1. L'admin fixe 12 matchs pour AceDuMatin dans la saison ouverte.
  await login(page, ADMIN.pseudo, ADMIN.password);
  await setGoal(page, "12");
  await expect(page.locator(".alert-title").first()).toHaveText("Objectif enregistré : 12 matchs.");
  await expect(page.getByRole("listitem").filter({ hasText: SEASON })).toContainText("/ 12 matchs");
  // une valeur hors bornes est refusée (contrôle serveur, au-delà du contrôle du navigateur)
  await page.getByRole("listitem").filter({ hasText: SEASON }).getByLabel("Objectif de matchs").evaluate((el) => el.removeAttribute("max"));
  await page.getByRole("listitem").filter({ hasText: SEASON }).getByLabel("Objectif de matchs").fill("500");
  await page.getByRole("listitem").filter({ hasText: SEASON }).getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.locator(".alert-title").first()).toContainText("entre 1 et 200");
  await page.goto("/admin/journal");
  await expect(page.getByText("Objectif de matchs modifié").first()).toBeVisible();
  await logout(page);

  // 2. Le joueur voit sa progression.
  await login(page, PLAYER.pseudo, PLAYER.password);
  await page.goto("/accueil");
  const section = page.getByRole("region", { name: "Mon objectif de matchs" });
  await expect(section).toContainText("/ 12 matchs");
  await expect(section.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "12");
  await logout(page);

  // 3. Objectif effacé : plus d'indicateur.
  await login(page, ADMIN.pseudo, ADMIN.password);
  await setGoal(page, "");
  await expect(page.locator(".alert-title").first()).toHaveText("Objectif retiré.");
  await logout(page);
  await login(page, PLAYER.pseudo, PLAYER.password);
  await page.goto("/accueil");
  await expect(page.getByRole("heading", { name: "Mon objectif de matchs" })).toHaveCount(0);
  await logout(page);
});
