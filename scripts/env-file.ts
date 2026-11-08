import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";

/**
 * Charge un fichier d'environnement en ÉCRASANT les variables déjà présentes.
 * (`process.loadEnvFile` ne les écrase pas, et Prisma charge `.env` dès son import :
 * sans cela, un script viserait la base locale au lieu de la base demandée.)
 */
export function loadEnvFileOverride(file: string): void {
  Object.assign(process.env, parseEnv(readFileSync(file, "utf8")));
}
