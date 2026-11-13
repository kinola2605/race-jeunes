// Génère src/styles/tokens.css depuis design/tokens.json (source unique, constitution VII).
//   npm run tokens
import { readFileSync, writeFileSync } from "node:fs";

const tokens = JSON.parse(readFileSync("design/tokens.json", "utf8"));

function resolve(value, path = []) {
  if (typeof value !== "string") return value;
  const m = /^\{(.+)\}$/.exec(value);
  if (!m) return value;
  const node = m[1].split(".").reduce((o, k) => o?.[k], tokens);
  if (!node) throw new Error(`Référence inconnue ${value} (${path.join(".")})`);
  return resolve(node.$value, path);
}

function vars(group, prefix) {
  return Object.entries(group)
    .filter(([k, v]) => !k.startsWith("$") && v && typeof v === "object" && "$value" in v)
    .map(([k, v]) => `  --${prefix}${k}: ${resolve(v.$value, [prefix, k])};`);
}

const lines = [];
lines.push("/* Fichier généré par scripts/build-tokens.mjs depuis design/tokens.json — ne pas modifier à la main. */");
lines.push(":root {");
lines.push(...vars(tokens.color.brand, "brand-"));
lines.push(...vars(tokens.color.avatar, "avatar-"));
lines.push(...vars(tokens.theme.dark, ""));
lines.push("  --on-highlight: #1F2B42;");
lines.push("  --highlight: #EBB08C;");
lines.push(`  --font-sans: ${tokens.font.family.sans.$value.map((f) => (f.includes(" ") ? `"${f}"` : f)).join(", ")};`);
lines.push(`  --font-mono: ${tokens.font.family.mono.$value.join(", ")};`);
lines.push(...vars(tokens.font.size, "fs-"));
lines.push(...vars(tokens.font.lineHeight, "lh-"));
lines.push(`  --ls-caps: ${tokens.font.letterSpacing.caps.$value};`);
lines.push(...vars(tokens.space, "s-"));
lines.push(`  --r-sm: ${tokens.radius.sm.$value}; --r-button: ${tokens.radius.button.$value}; --r-card: ${tokens.radius.card.$value}; --r-pill: ${tokens.radius.pill.$value};`);
lines.push(`  --hairline: ${tokens.border.hairline.$value}; --thick: ${tokens.border.thick.$value};`);
lines.push(`  --touch-min: ${tokens.size["touch-min"].$value}; --touch-court: ${tokens.size["touch-court"].$value}; --content-max: ${tokens.size["content-max"].$value};`);
lines.push(`  --dur-fast: ${tokens.motion.fast.$value}; --dur-base: ${tokens.motion.base.$value};`);
lines.push("  color-scheme: dark;");
lines.push("}");
lines.push('[data-theme="light"] {');
lines.push(...vars(tokens.theme.light, ""));
lines.push("  --on-highlight: #1F2B42;");
lines.push("  color-scheme: light;");
lines.push("}");
lines.push("@media (prefers-reduced-motion: reduce) { :root { --dur-fast: 0ms; --dur-base: 0ms; } }");

writeFileSync("src/styles/tokens.css", lines.join("\n") + "\n");
console.log("src/styles/tokens.css généré.");
