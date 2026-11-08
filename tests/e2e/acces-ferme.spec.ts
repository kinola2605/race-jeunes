import { expect, test } from "@playwright/test";
import { ADMIN, PLAYER, login, logout } from "./helpers";

/** Constitution IV, FR-001, FR-002 : aucune route ne permet de créer un compte sans session admin. */
test.describe("accès fermé", () => {
  test("la page de connexion ne propose aucune inscription", async ({ page }) => {
    await page.goto("/connexion");
    await expect(page.getByRole("heading", { name: "Race jeunes" })).toBeVisible();
    await expect(page.getByRole("link", { name: /inscri|créer un compte|s'inscrire|register|sign ?up/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /inscri|créer un compte|register|sign ?up/i })).toHaveCount(0);
  });

  for (const path of ["/inscription", "/register", "/signup", "/api/auth/signup", "/api/auth/register", "/admin/joueurs/nouveau", "/admin/joueurs/import", "/admin", "/classement"]) {
    test(`anonyme : ${path} renvoie vers la connexion`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/connexion$/);
    });
  }

  test("anonyme : un POST direct vers une route de création ne crée rien", async ({ request }) => {
    for (const path of ["/admin/joueurs/nouveau", "/api/auth/signup", "/inscription"]) {
      const res = await request.post(path, { form: { pseudo: "Intrus", ranking: "40" }, maxRedirects: 0 });
      expect([303, 307, 308, 403, 404, 405]).toContain(res.status());
    }
  });

  test("un joueur connecté ne peut pas accéder à la création de compte", async ({ page }) => {
    await login(page, PLAYER.pseudo, PLAYER.password);
    await expect(page).toHaveURL(/\/accueil$/);
    await page.goto("/admin/joueurs/nouveau");
    await expect(page).toHaveURL(/\/acces-refuse$/);
    await expect(page.getByRole("heading", { name: "Accès refusé" })).toBeVisible();
    const exportRes = await page.request.get("/api/export/journal");
    expect(exportRes.status()).toBe(403);
    await logout(page);
  });

  test("seul un admin connecté atteint le formulaire de création", async ({ page }) => {
    await login(page, ADMIN.pseudo, ADMIN.password);
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto("/admin/joueurs/nouveau");
    await expect(page.getByRole("heading", { name: "Nouveau joueur" })).toBeVisible();
    // Aucun champ de donnée personnelle (constitution III)
    for (const label of [/nom/i, /prénom/i, /e-?mail/i, /naissance/i, /téléphone/i, /photo/i]) {
      await expect(page.getByLabel(label)).toHaveCount(0);
    }
    await logout(page);
  });
});
