import { createHash, timingSafeEqual } from "node:crypto";

/** Spec 016 (FR-1601, FR-1606) : code d'installation choisi par le club dans le formulaire de déploiement. */
export const MIN_INSTALL_CODE = 8;

type Env = Record<string, string | undefined>;

export type InstallCodeStatus = "absent" | "trop-court" | "ok";

export function installCodeStatus(env: Env = process.env): InstallCodeStatus {
  const code = (env.INSTALL_CODE ?? "").trim();
  if (!code) return "absent";
  return code.length < MIN_INSTALL_CODE ? "trop-court" : "ok";
}

/**
 * Comparaison à temps constant (sur des empreintes de même longueur) ; espaces de début et de fin ignorés,
 * casse respectée.
 */
export function installCodeMatches(given: string, env: Env = process.env): boolean {
  if (installCodeStatus(env) !== "ok") return false;
  const h = (v: string) => createHash("sha256").update(v.trim(), "utf8").digest();
  return timingSafeEqual(h(given), h(env.INSTALL_CODE ?? ""));
}
