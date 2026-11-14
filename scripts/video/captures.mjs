// Vidéo de présentation, étape 1 : on filme l'application de DÉMONSTRATION (npm run db:seed), image par image.
// Chaque scène est une suite de captures du téléphone (30 images/s) ; les pauses réutilisent la même capture.
// Appelé par scripts/video/build.mjs ; écrit dans test-results/video/frames (ignoré par git).
import { chromium, devices } from "@playwright/test";
import { mkdirSync, rmSync } from "node:fs";

export const FPS = 30;

// Identifiants de démonstration définis dans prisma/seed.ts (jamais utilisés en production).
const ADMIN = { pseudo: "admin.demo", password: "demo-admin-2026" };
const PLAYER = { pseudo: "AceDuMatin", password: "demo-joueur-2026" };
const SEASON = "race-jeunes-2026-27";

const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

class Reel {
  constructor(dir) {
    this.dir = dir;
    this.n = 0;
    this.scenes = {};
    this.current = null;
  }
  use(page) {
    this.page = page;
  }
  scene(id) {
    this.current = this.scenes[id] = [];
  }
  async snap() {
    const path = `${this.dir}/${String(this.n++).padStart(5, "0")}.jpg`;
    await this.page.screenshot({ path, type: "jpeg", quality: 92 });
    return path;
  }
  async hold(seconds) {
    const path = await this.snap();
    for (let i = 0; i < Math.round(seconds * FPS); i++) this.current.push(path);
  }
  /** chaque action produit `frames` images identiques (rythme de frappe, de clic…) */
  async step(action, frames = 3) {
    await action();
    await this.page.waitForTimeout(60);
    const path = await this.snap();
    for (let i = 0; i < frames; i++) this.current.push(path);
  }
  async scrollTo(target, seconds) {
    const page = this.page;
    const [from, max] = await page.evaluate(() => [
      window.scrollY,
      document.documentElement.scrollHeight - window.innerHeight,
    ]);
    const to = Math.max(0, Math.min(target, max));
    const count = Math.round(seconds * FPS);
    for (let i = 1; i <= count; i++) {
      const y = Math.round(from + (to - from) * ease(i / count));
      await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
      this.current.push(await this.snap());
    }
  }
  /** fait défiler jusqu'à placer l'élément à `offset` px du haut de l'écran */
  async scrollToElement(locator, seconds, offset = 160) {
    const top = await locator.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    await this.scrollTo(top - offset, seconds);
  }
  async type(locator, text, framesPerChar = 2) {
    for (let i = 1; i <= text.length; i++)
      await this.step(() => locator.fill(text.slice(0, i)), framesPerChar);
  }
}

export async function record(base, dir) {
  if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(base)) {
    throw new Error("VIDEO_BASE_URL doit viser une application locale de démonstration.");
  }
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const reel = new Reel(dir);
  const browser = await chromium.launch();
  const newPage = async () => {
    const context = await browser.newContext({
      ...devices["Pixel 7"],
      deviceScaleFactor: 2,
      locale: "fr-FR",
      colorScheme: "dark",
    });
    const page = await context.newPage();
    reel.use(page);
    return page;
  };
  const go = async (page, path) => {
    const response = await page.goto(base + path, { waitUntil: "networkidle" });
    if (!response || !response.ok()) throw new Error(`${path} : réponse ${response?.status()}`);
    await page.evaluate(() => document.fonts.ready);
  };
  const login = async (page, account, filmed) => {
    await go(page, "/connexion");
    const pseudo = page.getByLabel("Pseudo");
    const password = page.getByLabel("Mot de passe", { exact: true });
    if (filmed) {
      await reel.hold(0.6);
      await reel.type(pseudo, account.pseudo, 2);
      await reel.type(password, account.password, 1);
      await reel.hold(0.5);
    } else {
      await pseudo.fill(account.pseudo);
      await password.fill(account.password);
    }
    await page.getByRole("button", { name: "Se connecter" }).click();
    await page.waitForURL((u) => !u.pathname.startsWith("/connexion"));
    await page.waitForLoadState("networkidle");
  };

  try {
    // ——— Joueur ———
    let page = await newPage();
    reel.scene("connexion");
    await login(page, PLAYER, true);

    reel.scene("accueil");
    await go(page, "/accueil");
    await reel.hold(4.2);

    reel.scene("saisir");
    await go(page, "/matchs/nouveau");
    await reel.hold(0.8);
    await reel.type(page.getByPlaceholder("Rechercher un pseudo"), "Revers", 3);
    await reel.hold(0.4);
    await reel.step(
      () => page.getByRole("radiogroup", { name: "Adversaire" }).locator("label").first().click(),
      18,
    );
    await reel.scrollToElement(
      page.getByText("Score", { exact: false }).locator("xpath=ancestor::fieldset"),
      1.0,
      120,
    );
    // le bouton + part de 6 jeux, le bouton − de 0 (spec 010) : on clique comme un joueur le ferait
    const button = (set, side, sign) =>
      page.getByRole("button", { name: `Set ${set}, ${side} : un jeu de ${sign}` });
    const setGames = async (set, side, games) => {
      if (games >= 6)
        for (let i = 0; i <= games - 6; i++) await reel.step(() => button(set, side, "plus").click(), 5);
      else {
        await reel.step(() => button(set, side, "moins").click(), 5);
        for (let i = 0; i < games; i++) await reel.step(() => button(set, side, "plus").click(), 4);
      }
    };
    for (const [set, me, them] of [
      [1, 6, 4],
      [2, 7, 5],
    ]) {
      await setGames(set, "jeux gagnés par vous", me);
      await setGames(set, "jeux de l'adversaire", them);
    }
    await reel.hold(2.4);

    reel.scene("classement");
    await go(page, "/classement");
    await reel.hold(1.4);
    await reel.scrollToElement(page.getByText("Vous", { exact: true }).first(), 2.0, 380);
    await reel.hold(1.4);

    reel.scene("matchs");
    await go(page, "/matchs");
    await reel.hold(1.2);
    await reel.step(() => page.locator("details.disclose summary").first().click(), 6);
    await reel.scrollTo(220, 0.8);
    await reel.hold(2.0);
    await page.context().close();

    // ——— Admin ———
    page = await newPage();
    await login(page, ADMIN, false);

    reel.scene("suivi");
    await go(page, "/admin");
    await reel.hold(2.0);
    await go(page, "/admin/matchs");
    await reel.hold(1.4);
    await reel.step(async () => {
      await page.getByRole("button", { name: "Valider", exact: true }).first().click();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400);
    }, 50);

    reel.scene("bareme");
    await go(page, `/admin/saisons/${SEASON}/bareme`);
    await reel.hold(1.8);
    await reel.step(() => page.getByRole("tab", { name: "Simulateur" }).click(), 70);

    reel.scene("fiche");
    await page.goto(`${base}/admin/joueurs?q=${PLAYER.pseudo}`, { waitUntil: "networkidle" });
    await page
      .getByRole("link", { name: new RegExp(PLAYER.pseudo) })
      .first()
      .click();
    await page.waitForURL(/\/admin\/joueurs\/[^/?]+$/);
    await go(page, new URL(page.url()).pathname + "?onglet=mental");
    await reel.hold(1.4);
    await reel.scrollTo(520, 1.4);
    await reel.hold(1.4);

    reel.scene("apparence");
    await go(page, "/admin/apparence");
    await reel.hold(1.4);
    await reel.scrollTo(700, 1.2);
    await reel.hold(1.2);
    await page.context().close();
  } finally {
    await browser.close();
  }
  return reel.scenes;
}
