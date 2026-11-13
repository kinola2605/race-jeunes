import { expect, test } from "@playwright/test";
import { ADMIN, login, uniquePseudo } from "./helpers";

// Spec 009 — envoi du mot de passe par e-mail via la messagerie de l'admin (lien mailto, aucune adresse côté app).
test("création d'un joueur : « Envoyer par e-mail » prépare un message sans destinataire (FR-900 à FR-903)", async ({ page }) => {
  const pseudo = uniquePseudo("Mail");
  await login(page, ADMIN.pseudo, ADMIN.password);
  await page.goto("/admin/joueurs/nouveau");
  // Aucun champ e-mail sur le formulaire de création (constitution III).
  await expect(page.locator('input[type="email"], input[name*="mail" i]')).toHaveCount(0);
  await page.getByLabel(/^Pseudo/).fill(pseudo);
  await page.getByRole("button", { name: "Créer le compte" }).click();
  await expect(page.getByText(`Compte créé : ${pseudo}`)).toBeVisible();
  const temp = (await page.getByTestId("temp-password").textContent())!.trim();

  const link = page.getByRole("link", { name: "Envoyer par e-mail" });
  await expect(link).toBeVisible();
  const href = (await link.getAttribute("href"))!;
  expect(href.startsWith("mailto:?")).toBe(true);
  const url = new URL(href);
  const body = url.searchParams.get("body")!;
  expect(url.searchParams.get("subject")).toContain("vos identifiants");
  expect(body).toContain(`Pseudo : ${pseudo}`);
  expect(body).toContain(`Mot de passe temporaire : ${temp}`);
  expect(body).toContain(`Adresse : ${new URL(page.url()).origin}`);
});

test("réinitialisation : le même bouton est proposé avec le nouveau mot de passe (FR-904)", async ({ page }) => {
  const pseudo = uniquePseudo("MailR");
  await login(page, ADMIN.pseudo, ADMIN.password);
  await page.goto("/admin/joueurs/nouveau");
  await page.getByLabel(/^Pseudo/).fill(pseudo);
  await page.getByRole("button", { name: "Créer le compte" }).click();
  await page.getByLabel(/J'ai remis/).check();
  await page.getByRole("link", { name: "Terminer" }).click();
  await page.getByRole("link", { name: pseudo }).first().click();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Réinitialiser le mot de passe" }).click();
  const temp = (await page.getByTestId("temp-password").textContent())!.trim();
  const href = (await page.getByRole("link", { name: "Envoyer par e-mail" }).getAttribute("href"))!;
  expect(new URL(href).searchParams.get("body")).toContain(`Mot de passe temporaire : ${temp}`);
});
