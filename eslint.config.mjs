import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  { ignores: [".next/**", "node_modules/**", "design/**", "next-env.d.ts", "coverage/**", "playwright-report/**", "test-results/**", ".local-db/**", "public/sw.js"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Logos SVG locaux : next/image n'apporte rien ici.
  { rules: { "@next/next/no-img-element": "off" } },
  {
    files: ["src/scoring/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: ["@/*", "../*", "next/*", "@prisma/*", "react"] }],
    },
  },
];

export default config;
