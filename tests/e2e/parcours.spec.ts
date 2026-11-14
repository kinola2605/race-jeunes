import { expect, test } from "@playwright/test";
import { ADMIN, alertText, login, logout, uniquePseudo, fillScore } from "./helpers";

test.describe("authentification", () => {
  test("message identique pour pseudo inconnu et mauvais mot de passe (FR-003)", async ({ page }) => {
    await login(page, "pseudo-inexistant", "nimporte-quoi-123");
    const unknown = await alertText(page);
    await login(page, ADMIN.pseudo, "mauvais-mot-de-passe");
    const wrong = await alertText(page);
    expect(unknown).toBe("Pseudo ou mot de passe incorrect.");
    expect(wrong).toBe(unknown);
    // une connexion réussie remet les compteurs à zéro
    await login(page, ADMIN.pseudo, ADMIN.password);
    await expect(page).toHaveURL(/\/admin$/);
    await logout(page);
  });

  test("verrouillage après 5 échecs sur un même pseudo (FR-004)", async ({ page }) => {
    const target = uniquePseudo("verrou");
    for (let i = 0; i < 5; i++) await login(page, target, "faux-mot-de-passe");
    await login(page, target, "faux-mot-de-passe");
    expect(await alertText(page)).toBe("Trop de tentatives. Réessayez dans 15 minutes.");
    await login(page, ADMIN.pseudo, ADMIN.password);
    await expect(page).toHaveURL(/\/admin$/);
    await logout(page);
  });
});

test("parcours complet : création de compte, mot de passe forcé, déclaration et validation d'un match", async ({ page }) => {
  const pseudo = uniquePseudo("Testeur");

  // 1. L'admin crée le compte (engagé dans la saison ouverte) et lit le mot de passe temporaire une seule fois.
  await login(page, ADMIN.pseudo, ADMIN.password);
  await page.goto("/admin/joueurs/nouveau");
  await page.getByLabel(/^Pseudo/).fill(pseudo);
  await page.getByLabel(/Classement FFT/).selectOption("30/2");
  await page.getByLabel("Engager dans une saison").selectOption({ label: "Race jeunes 2026-2027" });
  await page.getByRole("button", { name: "Créer le compte" }).click();
  await expect(page.getByText(`Compte créé : ${pseudo}`)).toBeVisible();
  const temp = (await page.getByTestId("temp-password").textContent())!.trim();
  expect(temp).toMatch(/^[A-Za-z2-9]{4}-[A-Za-z2-9]{4}-[A-Za-z2-9]{4}$/);
  await logout(page);

  // 2. Première connexion : changement obligatoire (FR-005), l'accès à toute autre page est bloqué.
  await login(page, pseudo, temp);
  await expect(page).toHaveURL(/\/mot-de-passe$/);
  await page.goto("/classement");
  await expect(page).toHaveURL(/\/mot-de-passe$/);
  await page.getByLabel("Mot de passe temporaire").fill(temp);
  await page.getByLabel("Nouveau mot de passe", { exact: true }).fill(`${pseudo}-secret`);
  await page.getByLabel("Confirmer le nouveau mot de passe").fill(`${pseudo}-secret`);
  await page.getByRole("button", { name: "Enregistrer et continuer" }).click();
  await expect(page.locator(".alert-title").first()).toHaveText("Le mot de passe ne doit pas contenir votre pseudo.");
  await page.getByLabel("Mot de passe temporaire").fill(temp);
  await page.getByLabel("Nouveau mot de passe", { exact: true }).fill("revers lifté du dimanche");
  await page.getByLabel("Confirmer le nouveau mot de passe").fill("revers lifté du dimanche");
  await page.getByRole("button", { name: "Enregistrer et continuer" }).click();
  await expect(page).toHaveURL(/\/accueil$/);

  // 3. Le joueur déclare une victoire contre SliceMaster (30/1) : perf estimée +20 (barème 2026).
  await page.goto("/matchs/nouveau");
  await page.getByRole("radio", { name: /SliceMaster/ }).check();
  await expect(page.getByRole("status").filter({ hasText: "Points estimés" })).toContainText("+20");
  // spec 010 : le score n'est plus prérempli, l'envoi sans score est bloqué par le navigateur
  await page.getByRole("button", { name: "Envoyer le match" }).click();
  await expect(page).toHaveURL(/\/matchs\/nouveau$/);
  await page.getByRole("button", { name: "Set 1, jeux gagnés par vous : un jeu de plus" }).click();
  await expect(page.locator('input[name="s1a"]')).toHaveValue("6");
  await fillScore(page);
  await page.getByRole("button", { name: "Envoyer le match" }).click();
  await expect(page.getByText("Match envoyé")).toBeVisible();
  await logout(page);

  // 4. L'admin valide le match.
  await login(page, ADMIN.pseudo, ADMIN.password);
  await page.goto("/admin/matchs");
  const row = page.getByRole("listitem").filter({ hasText: `${pseudo} vs SliceMaster` });
  await row.getByRole("button", { name: "Valider" }).click();
  await expect(page.getByText("Match validé.")).toBeVisible();
  await logout(page);

  // 5. Le joueur voit ses points et le détail du calcul (FR-125).
  await login(page, pseudo, "revers lifté du dimanche");
  await page.goto("/matchs");
  await page.getByText("SliceMaster").first().click();
  await expect(page.getByText("Comment ces 20 points sont calculés")).toBeVisible();
  await expect(page.getByText("Race jeunes 2026-2027 · v1")).toBeVisible();
  await logout(page);
});

test("l'admin désactive un compte : la session du joueur est coupée (FR-009, FR-025)", async ({ browser }) => {
  const adminCtx = await browser.newContext();
  const admin = await adminCtx.newPage();
  const pseudo = uniquePseudo("Bloque");
  await login(admin, ADMIN.pseudo, ADMIN.password);
  await admin.goto("/admin/joueurs/nouveau");
  await admin.getByLabel(/^Pseudo/).fill(pseudo);
  await admin.getByRole("button", { name: "Créer le compte" }).click();
  const temp = (await admin.getByTestId("temp-password").textContent())!.trim();

  const playerCtx = await browser.newContext();
  const player = await playerCtx.newPage();
  await login(player, pseudo, temp);
  await expect(player).toHaveURL(/\/mot-de-passe$/);

  await admin.goto("/admin/joueurs?filtre=all&q=" + pseudo.toLowerCase());
  await admin.getByRole("link", { name: new RegExp(pseudo) }).first().click();
  admin.once("dialog", (d) => d.accept());
  await admin.getByRole("button", { name: "Désactiver le compte" }).click();
  await expect(admin.getByText("Compte désactivé : ses sessions sont coupées.")).toBeVisible();

  await player.reload();
  await expect(player).toHaveURL(/\/connexion$/);
  await adminCtx.close();
  await playerCtx.close();
});
