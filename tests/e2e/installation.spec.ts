import { expect, test } from "@playwright/test";

/**
 * Spec 016 (FR-1604) : l'écran d'installation n'existe que tant qu'aucun admin n'existe.
 * La base de test contient l'admin de démonstration : l'écran doit être introuvable et la connexion normale.
 * Le parcours d'installation complet (base vide) est vérifié à la main : voir la PR de la spec 016.
 */
test.describe("installation (spec 016)", () => {
  test("avec un admin existant, /installation n'existe pas", async ({ page }) => {
    const res = await page.goto("/installation");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /Installer/ })).toHaveCount(0);
  });

  test("avec un admin existant, la connexion ne renvoie pas vers l'installation", async ({ page }) => {
    await page.goto("/connexion");
    await expect(page).toHaveURL(/\/connexion$/);
    await expect(page.getByLabel("Pseudo")).toBeVisible();
  });

  test("un POST vers /installation ne crée aucun compte", async ({ request }) => {
    const res = await request.post("/installation", {
      form: { code: "x".repeat(12), clubName: "Intrus", pseudo: "Intrus", password: "x".repeat(12), confirm: "x".repeat(12) },
      maxRedirects: 0,
    });
    expect([403, 404, 405]).toContain(res.status());
  });
});
