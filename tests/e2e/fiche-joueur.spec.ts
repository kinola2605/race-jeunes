import { expect, test } from "@playwright/test";
import { ADMIN, PLAYER, login, logout, openPlayerTab } from "./helpers";

// Spec 014 — fiche joueur de l'admin en quatre onglets portés par l'URL.
test("fiche joueur : quatre onglets, chacun avec son contenu (FR-1400 à FR-1404)", async ({ page }, testInfo) => {
  await login(page, ADMIN.pseudo, ADMIN.password);
  await page.goto("/admin/joueurs");
  await page.getByRole("link", { name: new RegExp(PLAYER.pseudo) }).first().click();

  const tabs = page.getByRole("navigation", { name: "Sections de la fiche" });
  await expect(tabs.getByRole("link")).toHaveText(["Profil", "Saisons", "Mental", "Compte"]);

  // Profil, par défaut : identité du joueur et historique du classement, rien d'autre.
  await expect(tabs.getByRole("link", { name: "Profil" })).toHaveAttribute("aria-current", "true");
  await expect(page.getByLabel("Pseudo")).toHaveValue(PLAYER.pseudo);
  await expect(page.getByRole("heading", { name: "Historique du classement" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Désactiver le compte" })).toHaveCount(0);
  await expect(page.getByLabel("Objectif de matchs")).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("profil.png") });

  await openPlayerTab(page, "Saisons");
  await expect(page).toHaveURL(/\?onglet=saisons$/);
  await expect(page.getByLabel("Objectif de matchs").first()).toBeVisible();
  await expect(page.getByLabel("Pseudo")).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath("saisons.png") });

  await openPlayerTab(page, "Mental");
  await expect(page.getByRole("region", { name: "Profil mental" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("mental.png") });

  await openPlayerTab(page, "Compte");
  await expect(page.getByRole("button", { name: "Réinitialiser le mot de passe" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Télécharger ses données (RGPD)" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Désactiver le compte" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("compte.png") });

  // Un onglet inconnu retombe sur Profil.
  await page.goto(page.url().replace("onglet=compte", "onglet=inconnu"));
  await expect(tabs.getByRole("link", { name: "Profil" })).toHaveAttribute("aria-current", "true");
  await logout(page);
});

test("fiche joueur : après un enregistrement, on reste sur l'onglet d'où l'on vient (FR-1403)", async ({ page }) => {
  await login(page, ADMIN.pseudo, ADMIN.password);
  await page.goto("/admin/joueurs");
  await page.getByRole("link", { name: new RegExp(PLAYER.pseudo) }).first().click();

  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.locator(".alert-title").first()).toHaveText("Modifications enregistrées.");
  await expect(page.getByRole("navigation", { name: "Sections de la fiche" }).getByRole("link", { name: "Profil" })).toHaveAttribute("aria-current", "true");

  await openPlayerTab(page, "Saisons");
  const goal = page.getByLabel("Objectif de matchs").first();
  const before = await goal.inputValue();
  await goal.fill("9");
  await page.getByRole("button", { name: "Enregistrer" }).first().click();
  await expect(page.locator(".alert-title").first()).toHaveText("Objectif enregistré : 9 matchs.");
  await expect(page.getByRole("navigation", { name: "Sections de la fiche" }).getByRole("link", { name: "Saisons" })).toHaveAttribute("aria-current", "true");
  // remise en état
  await page.getByLabel("Objectif de matchs").first().fill(before);
  await page.getByRole("button", { name: "Enregistrer" }).first().click();
  await logout(page);
});
