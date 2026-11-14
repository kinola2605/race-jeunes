// Vidéo de présentation du README : npm run docs:video
// Prérequis : application démarrée sur une base de DÉMONSTRATION (npm run db:seed), jamais sur des données réelles,
// et ffmpeg (variable FFMPEG, sinon `ffmpeg` du PATH). Cible : http://localhost:3000, ou VIDEO_BASE_URL.
// Sorties : docs/assets/video/presentation.mp4 (1920×1080) et presentation.gif (aperçu du README).
// Attention : la scène admin valide un match de la file de démonstration.
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { FPS, record } from "./captures.mjs";

const base = process.env.VIDEO_BASE_URL ?? "http://localhost:3000";
const ffmpeg = process.env.FFMPEG ?? "ffmpeg";
const work = "test-results/video";
const out = "docs/assets/video";

const INTRO = {
  title: "Race jeunes",
  body: "La Race jeunes de votre club de tennis, dans la poche de chaque joueur.",
  pills: [],
};
const OUTRO = {
  title: "Race jeunes",
  body: "Une application web installable, aux couleurs du club.",
  pills: ["Aucune donnée personnelle", "Marque blanche", "Gratuite à héberger"],
};
const SCENES = [
  [
    "connexion",
    "Accès fermé",
    "Un pseudo, rien de plus",
    "Pas d'inscription libre ni de donnée personnelle : c'est le club qui crée les comptes.",
  ],
  [
    "accueil",
    "Joueur",
    "Où j'en suis ?",
    "Rang, points, bilan de la saison et l'écart avec le joueur de devant, dès l'ouverture.",
  ],
  [
    "saisir",
    "Joueur",
    "Déclarer un match en trois étapes",
    "Adversaire, résultat, score : les points estimés s'affichent en direct, perf comprise.",
  ],
  [
    "classement",
    "Joueur",
    "Le classement de la saison",
    "Filtrable par série ou par groupe, avec « Ma position » toujours à portée de pouce.",
  ],
  [
    "matchs",
    "Joueur",
    "Chaque point s'explique",
    "Le détail du calcul de chaque match, d'après le barème de la saison.",
  ],
  [
    "suivi",
    "Admin",
    "Valider en un geste",
    "Le tableau de bord signale ce qui demande attention ; la file de validation, les doublons.",
  ],
  [
    "bareme",
    "Admin",
    "Un barème par saison",
    "Réglé sans toucher au code, avec simulateur et aperçu d'impact avant tout recalcul.",
  ],
  [
    "fiche",
    "Admin",
    "La fiche joueur",
    "Profil, saisons, compte, et un profil mental calculé à partir des scores.",
  ],
  [
    "apparence",
    "Admin",
    "Aux couleurs du club",
    "Nom, logo et couleurs se règlent depuis l'interface, contraste vérifié.",
  ],
];
const HERO_FRAMES = Math.round(3.2 * FPS);
const FADE = 12; // images de fondu entre deux scènes

console.log("1/3 Tournage de l'application…");
const reels = await record(base, `${work}/frames`);

// Plan de montage : une entrée par image de la vidéo
const plan = [];
for (let i = 0; i < HERO_FRAMES; i++)
  plan.push({ hero: INTRO, alpha: Math.min(1, i / FADE, (HERO_FRAMES - i) / FADE) });
SCENES.forEach(([id, kicker, title, body], chapter) => {
  const frames = reels[id];
  const prevFrames = chapter > 0 ? reels[SCENES[chapter - 1][0]] : null;
  frames.forEach((src, i) => {
    const fadeIn = Math.min(1, i / FADE);
    plan.push({
      kicker,
      title,
      body,
      chapter,
      chapterCount: SCENES.length,
      alpha: Math.min(fadeIn, (frames.length - i) / (FADE / 2)),
      src: pathToFileURL(resolve(src)).href,
      prev: prevFrames && i < FADE ? pathToFileURL(resolve(prevFrames.at(-1))).href : null,
      prevAlpha: 1 - fadeIn,
      phoneAlpha: chapter === 0 ? fadeIn : 1,
    });
  });
});
for (let i = 0; i < HERO_FRAMES + FPS; i++) plan.push({ hero: OUTRO, alpha: Math.min(1, i / FADE) });
plan.forEach((s, i) => (s.progress = i / (plan.length - 1)));

console.log(`2/3 Montage de ${plan.length} images (${(plan.length / FPS).toFixed(1)} s)…`);
mkdirSync(out, { recursive: true });
const mp4 = `${out}/presentation.mp4`;
const encoder = spawn(
  ffmpeg,
  [
    "-y",
    "-loglevel",
    "error",
    "-f",
    "image2pipe",
    "-framerate",
    String(FPS),
    "-c:v",
    "mjpeg",
    "-i",
    "-",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "22",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    mp4,
  ],
  { stdio: ["pipe", "inherit", "inherit"] },
);
const encoded = new Promise((ok, ko) =>
  encoder.on("exit", (c) => (c === 0 ? ok() : ko(new Error(`ffmpeg : code ${c}`)))),
);

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(pathToFileURL(resolve("scripts/video/composer.html")).href);
  await page.evaluate(() => window.ready);
  for (const [i, state] of plan.entries()) {
    await page.evaluate((s) => window.frame(s), state);
    const jpeg = await page.screenshot({ type: "jpeg", quality: 94 });
    if (!encoder.stdin.write(jpeg)) await new Promise((r) => encoder.stdin.once("drain", r));
    if (i % 150 === 0) console.log(`  ${i}/${plan.length}`);
  }
} finally {
  encoder.stdin.end();
  await browser.close();
}
await encoded;

console.log("3/3 Aperçu animé pour le README…");
const gif = `${out}/presentation.gif`;
await new Promise((ok, ko) =>
  spawn(
    ffmpeg,
    [
      "-y",
      "-loglevel",
      "error",
      "-i",
      mp4,
      "-vf",
      "fps=10,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle",
      gif,
    ],
    { stdio: "inherit" },
  ).on("exit", (c) => (c === 0 ? ok() : ko(new Error(`ffmpeg : code ${c}`)))),
);
console.log(`${mp4}\n${gif}`);
