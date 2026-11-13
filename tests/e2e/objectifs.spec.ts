import { expect, test } from "@playwright/test";
import { ADMIN, PLAYER, login, logout } from "./helpers";

const PAGE = "/admin/saisons/race-jeunes-2026-27/objectifs";

test("objectif de matchs : l'admin remplit le tableau, le joueur suit sa progression (spec 005)", async ({ page }) => {
  // 1. L'admin fixe 12 matchs pour l'étiquette « Groupe B » (celle d'AceDuMatin) et 3 par défaut.
  await login(page, ADMIN.pseudo, ADMIN.password);
  await page.goto(PAGE);
  await page.getByLabel("Groupe B").fill("12");
  await page.getByLabel("Tous les engagés (par défaut)").fill("3");
  await page.getByRole("button", { name: "Enregistrer les objectifs" }).click();
  await expect(page.locator(".alert-title").first()).toHaveText("Objectifs enregistrés.");
  await expect(page.getByLabel("Groupe B")).toHaveValue("12");
  await page.goto("/admin/journal");
  await expect(page.getByText("Objectifs de matchs modifiés").first()).toBeVisible();
  await logout(page);

  // 2. Le joueur voit l'objectif de son étiquette (le plus précis prime sur le défaut), sans les points.
  await login(page, PLAYER.pseudo, PLAYER.password);
  await page.goto("/accueil");
  const section = page.getByRole("region", { name: "Mon objectif de matchs" });
  await expect(section).toContainText("/ 12 matchs");
  await expect(section.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "12");
  await logout(page);

  // 3. Retour à l'état initial : cases vides = aucun objectif, plus d'indicateur pour le joueur.
  await login(page, ADMIN.pseudo, ADMIN.password);
  await page.goto(PAGE);
  await page.getByLabel("Groupe B").fill("");
  await page.getByLabel("Tous les engagés (par défaut)").fill("");
  await page.getByRole("button", { name: "Enregistrer les objectifs" }).click();
  await expect(page.locator(".alert-title").first()).toHaveText("Objectifs enregistrés.");
  await logout(page);
  await login(page, PLAYER.pseudo, PLAYER.password);
  await page.goto("/accueil");
  await expect(page.getByRole("heading", { name: "Mon objectif de matchs" })).toHaveCount(0);
  await logout(page);
});
