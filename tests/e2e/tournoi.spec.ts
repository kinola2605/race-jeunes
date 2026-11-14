import { expect, test, type Page } from "@playwright/test";
import { ADMIN, fillScore, login, logout, uniquePseudo } from "./helpers";

const SEASON = "Race jeunes 2026-2027";

/** Saisie admin d'une victoire validée immédiatement contre un adversaire extérieur, dans un tournoi. */
async function enterTournamentWin(page: Page, pseudo: string, tournament: string, kind: "NORMAL" | "WALKOVER" = "NORMAL") {
  await page.goto("/admin/matchs/nouveau");
  await page.getByLabel("Joueur", { exact: true }).selectOption({ label: `${pseudo} (30/2)` });
  await page.getByRole("button", { name: "Extérieur" }).click();
  await page.getByLabel("Libellé de l'adversaire").fill("Tableau 13 ans");
  await page.getByLabel("Classement de l'adversaire").selectOption("30/2");
  if (kind === "WALKOVER") await page.getByRole("radiogroup", { name: "Type de match" }).getByText("Forfait", { exact: true }).click();
  else await fillScore(page);
  await page.getByLabel("Match joué en tournoi").check();
  await page.getByLabel("Nom du tournoi").fill(tournament);
  await page.getByRole("button", { name: "Enregistrer le match" }).click();
  await expect(page.getByText("Match enregistré.")).toBeVisible();
}

test("bonus tournoi : deux victoires dans le même tournoi rapportent le bonus (spec 006)", async ({ page }) => {
  const pseudo = uniquePseudo("Tournoi");
  const tournament = `Open ${pseudo}`;

  await login(page, ADMIN.pseudo, ADMIN.password);
  await page.goto("/admin/joueurs/nouveau");
  await page.getByLabel(/^Pseudo/).fill(pseudo);
  await page.getByLabel(/Classement FFT/).selectOption("30/2");
  await page.getByLabel("Engager dans une saison").selectOption({ label: SEASON });
  await page.getByRole("button", { name: "Créer le compte" }).click();
  await expect(page.getByText(`Compte créé : ${pseudo}`)).toBeVisible();

  // Le barème de démonstration 2026 : +10 pts par victoire à partir de la 2e dans un même tournoi.
  await enterTournamentWin(page, pseudo, tournament);
  // graphie différente (casse, espaces) : même tournoi (FR-601)
  await enterTournamentWin(page, pseudo, `  ${tournament.toUpperCase()} `);
  // une victoire par forfait ne compte pas (FR-603)
  await enterTournamentWin(page, pseudo, tournament, "WALKOVER");

  await page.goto("/admin/matchs?vue=valides");
  await expect(page.getByText(tournament).first()).toBeVisible();

  await page.goto("/classement");
  await page.getByRole("link", { name: `Détail — ${pseudo}` }).locator("visible=true").click();
  const detail = page.getByRole("region", { name: new RegExp(`Détail du calcul — ${pseudo}`) });
  await expect(detail).toContainText(`Bonus tournoi — ${tournament} (2 victoires)`);
  await expect(detail.locator(".calc-row").filter({ hasText: "Bonus tournoi" })).toContainText("10");
  await logout(page);
});

test("bonus tournoi : réglage dans le brouillon du barème (spec 006)", async ({ page }) => {
  await login(page, ADMIN.pseudo, ADMIN.password);
  await page.goto("/admin/saisons/race-jeunes-2026-27/bareme");
  await page.getByRole("tab", { name: "Paramètres" }).click();
  await expect(page.getByRole("heading", { name: "Bonus tournoi" })).toBeVisible();
  await expect(page.getByText("2 victoires → 10 pts, 3 → 20, 4 → 30")).toBeVisible();
  await logout(page);
});
