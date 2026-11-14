import { expect, type Page } from "@playwright/test";

/** Identifiants de démonstration définis dans prisma/seed.ts (jamais utilisés en production). */
export const ADMIN = { pseudo: "admin.demo", password: "demo-admin-2026" };
export const PLAYER = { pseudo: "AceDuMatin", password: "demo-joueur-2026" };

export async function login(page: Page, pseudo: string, password: string) {
  await page.goto("/connexion");
  await page.getByLabel("Pseudo").fill(pseudo);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  // attend soit la redirection (succès), soit le message d'erreur
  await Promise.race([
    page.waitForURL((u) => !u.pathname.startsWith("/connexion")),
    page.locator(".alert-title").first().waitFor(),
  ]);
}

/** Texte du premier message d'alerte de l'application (Next.js ajoute un role=alert vide pour ses annonces). */
export async function alertText(page: Page): Promise<string> {
  return ((await page.locator(".alert-title").first().textContent()) ?? "").trim();
}

export async function logout(page: Page) {
  await page.goto("/compte");
  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await expect(page).toHaveURL(/\/connexion$/);
}

/** Saisie du score dans le formulaire de match : il n'est plus prérempli (spec 010, FR-1009). */
export async function fillScore(page: Page, sets: [number, number][] = [[6, 4], [6, 3]]) {
  for (const [i, [a, b]] of sets.entries()) {
    await page.locator(`input[name="s${i + 1}a"]`).fill(String(a));
    await page.locator(`input[name="s${i + 1}b"]`).fill(String(b));
  }
}

export function uniquePseudo(prefix: string): string {
  return `${prefix}${Date.now().toString(36).slice(-6)}`;
}
