import { expect, test } from "@playwright/test";
import { PLAYER, login, logout } from "./helpers";

test("avatar : le joueur choisit un pictogramme et une couleur, visible au classement (spec 007)", async ({ page }) => {
  await login(page, PLAYER.pseudo, PLAYER.password);
  await page.goto("/compte");
  await expect(page.getByRole("heading", { name: "Mon avatar" })).toBeVisible();
  // aucun dépôt de fichier possible (constitution III)
  await expect(page.locator('input[type="file"]')).toHaveCount(0);

  // spec 010 : le choix de l'avatar est dans une section repliable
  await page.getByRole("heading", { name: "Mon avatar" }).click();
  await page.locator("label.avatar-opt", { hasText: "Étoile" }).click();
  await page.locator("label.avatar-opt", { hasText: "Ciel" }).click();
  await expect(page.getByText("Aperçu : Étoile, ciel")).toBeVisible();
  await page.getByRole("button", { name: "Enregistrer mon avatar" }).click();
  await expect(page.getByText("Avatar enregistré.")).toBeVisible();
  await expect(page.locator(".page-head .avatar.av-ciel svg")).toBeVisible();

  await page.goto("/classement");
  const row = page.locator(".rank-row", { hasText: PLAYER.pseudo });
  await expect(row.locator(".avatar.av-ciel svg")).toBeVisible();

  // retour à l'avatar par défaut : initiale du pseudo (FR-703, FR-706)
  await page.goto("/compte");
  await page.getByRole("heading", { name: "Mon avatar" }).click();
  await page.getByRole("button", { name: "Revenir à l'avatar par défaut" }).click();
  await expect(page.getByText("Avatar par défaut rétabli.")).toBeVisible();
  await expect(page.locator(".page-head .avatar .avatar-initial")).toHaveText(PLAYER.pseudo[0]!.toUpperCase());
  await logout(page);
});
