import { expect, test, type Page } from "@playwright/test";
import { ADMIN, alertText, logout } from "./helpers";

/** Spec 017 — page de connexion revue : centrage, erreurs, aide. */

/** Écart entre le centre de l'élément et le centre de la fenêtre. */
async function offCenter(page: Page, selector: string) {
  return page.locator(selector).evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { x: Math.abs(r.left + r.width / 2 - window.innerWidth / 2), y: Math.abs(r.top + r.height / 2 - window.innerHeight / 2) };
  });
}

test.describe("sur PC", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("la connexion est centrée dans la fenêtre (FR-1700, FR-1701)", async ({ page }) => {
    await page.goto("/connexion");
    const off = await offCenter(page, ".auth-inner");
    expect(off.x).toBeLessThanOrEqual(2);
    expect(off.y).toBeLessThanOrEqual(2);
  });

  test("les pages sans navigation sont centrées horizontalement (FR-1700)", async ({ page }) => {
    await page.goto("/hors-ligne");
    expect((await offCenter(page, "main")).x).toBeLessThanOrEqual(2);
  });
});

test("sur téléphone, pas de carte ni de défilement horizontal (FR-1702)", async ({ page }) => {
  await page.goto("/connexion");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(page.locator(".auth-card")).toHaveCSS("padding-left", "0px");
});

test("champs vides : message sous le champ, aucune requête (FR-1705)", async ({ page }) => {
  await page.goto("/connexion");
  let posts = 0;
  page.on("request", (r) => {
    if (r.method() === "POST") posts++;
  });
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByText("Saisissez votre pseudo.")).toBeVisible();
  await expect(page.getByText("Saisissez votre mot de passe.")).toBeVisible();
  await expect(page.getByLabel("Pseudo")).toBeFocused();
  expect(posts).toBe(0);
  await page.getByLabel("Pseudo").fill("x");
  await expect(page.getByText("Saisissez votre pseudo.")).toHaveCount(0);
});

test("après un échec, le pseudo est conservé et le focus va au mot de passe (FR-1704)", async ({ page }) => {
  await page.goto("/connexion");
  await page.getByLabel("Pseudo").fill(ADMIN.pseudo);
  await page.getByLabel("Mot de passe", { exact: true }).fill("mauvais-mot-de-passe");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.locator(".alert-title").first().waitFor();
  expect(await alertText(page)).toBe("Pseudo ou mot de passe incorrect.");
  await expect(page.getByLabel("Pseudo")).toHaveValue(ADMIN.pseudo);
  const password = page.getByLabel("Mot de passe", { exact: true });
  await expect(password).toHaveValue("");
  await expect(password).toBeFocused();
  // une connexion réussie remet les compteurs d'échecs à zéro
  await password.fill(ADMIN.password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await logout(page);
});

test("l'aide est repliée et ne propose aucune inscription (FR-1708, FR-1709)", async ({ page }) => {
  await page.goto("/connexion");
  const reset = page.getByText(/Demandez une réinitialisation/);
  await expect(reset).toBeHidden();
  await page.getByText("Mot de passe oublié ?").click();
  await expect(reset).toBeVisible();
  await page.getByText("Pas encore de compte ?").click();
  await expect(page.getByText(/créés uniquement par le club/)).toBeVisible();
  await expect(page.getByText(/Aucune donnée personnelle collectée/)).toBeVisible();
  await expect(page.getByRole("main").getByRole("link")).toHaveCount(0);
});
