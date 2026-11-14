// Contrôle de la documentation (spec 013, FR-1309) : npm run docs:check
// - chaque lien ou image relatif des fichiers Markdown suivis pointe vers un fichier existant ;
// - la version annoncée par le README est celle de package.json.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const files = [
  "README.md",
  "CONTRIBUTING.md",
  "CHANGELOG.md",
  "specs/README.md",
  ...readdirSync("docs")
    .filter((f) => f.endsWith(".md"))
    .map((f) => `docs/${f}`),
];

const errors = [];
// [texte](cible), ![alt](cible), src="cible", href="cible"
const LINK = /\]\(([^)\s]+)(?:\s+"[^"]*")?\)|(?:src|href)="([^"]+)"/g;

for (const file of files) {
  // les blocs de code contiennent des exemples, pas des liens
  const text = readFileSync(file, "utf8").replace(/```[\s\S]*?```/g, "");
  for (const match of text.matchAll(LINK)) {
    const target = match[1] ?? match[2];
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    const path = decodeURIComponent(target.split("#")[0]);
    if (path && !existsSync(resolve(join(dirname(file), path))))
      errors.push(`${file} : lien cassé vers « ${target} »`);
  }
}

const { version } = JSON.parse(readFileSync("package.json", "utf8"));
const badge = readFileSync("README.md", "utf8").match(/badge\/version-([0-9.]+)-/);
if (!badge) errors.push("README.md : badge de version introuvable");
else if (badge[1] !== version)
  errors.push(`README.md : version ${badge[1]} annoncée, package.json est en ${version}`);

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Documentation : ${files.length} fichiers vérifiés, liens valides, version ${version}.`);
