import { expect, test } from "@playwright/test";
import { ADMIN, PLAYER, login, logout, openPlayerTab } from "./helpers";

test("profil mental : l'admin lit les cinq indicateurs d'un joueur, saison par saison (spec 012)", async ({ page }) => {
  await login(page, ADMIN.pseudo, ADMIN.password);
  await page.goto("/admin/joueurs");
  await page.getByRole("link", { name: new RegExp(PLAYER.pseudo) }).first().click();
  await openPlayerTab(page, "Mental");

  const card = page.getByRole("region", { name: "Profil mental" });
  const current = card.getByRole("list", { name: "Indicateurs, Race jeunes 2026-2027" });
  await expect(current.getByRole("listitem")).toHaveCount(5);
  for (const label of ["Tie-breaks", "Sets décisifs", "Retours", "Face à un mieux classé", "Face à un moins bien classé"]) {
    await expect(current.getByText(label, { exact: true })).toBeVisible();
  }
  // comparaison au groupe, écrite en toutes lettres
  await expect(current.getByText(/^Groupe (\d+ %|—)/)).toHaveCount(5);
  await expect(card).toContainText("validé");

  // d'une saison à l'autre : tableau, puis détail d'une saison passée
  await expect(card.getByRole("table")).toContainText("Race jeunes 2025-2026");
  await card.getByRole("link", { name: "Race jeunes 2025-2026" }).click();
  await expect(card.getByRole("list", { name: "Indicateurs, Race jeunes 2025-2026" })).toBeVisible();
  await logout(page);

  // réservé à l'encadrement : rien sur les écrans du joueur
  await login(page, PLAYER.pseudo, PLAYER.password);
  for (const path of ["/accueil", "/matchs", "/compte"]) {
    await page.goto(path);
    await expect(page.getByText("Profil mental")).toHaveCount(0);
  }
  await logout(page);
});
