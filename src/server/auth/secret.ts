import { createHmac } from "node:crypto";

/**
 * SESSION_SECRET : clé HMAC (32 caractères minimum) servant à dériver
 * - l'empreinte des jetons de session stockée en base ;
 * - les clés du compteur anti-abus (pseudo, origine réseau), non réversibles par énumération.
 * Changer la valeur déconnecte tout le monde (toutes les empreintes changent).
 */
export const MIN_SECRET_LENGTH = 32;
const DEV_FALLBACK = "dev-only-secret-never-used-in-production-000";

export function sessionSecret(env: NodeJS.ProcessEnv = process.env): string {
  const value = env.SESSION_SECRET ?? "";
  if (value.length >= MIN_SECRET_LENGTH) return value;
  if (env.NODE_ENV === "production") {
    throw new Error(`SESSION_SECRET absent ou trop court (${MIN_SECRET_LENGTH} caractères minimum).`);
  }
  return DEV_FALLBACK;
}

/** HMAC-SHA256 hexadécimal, avec un domaine pour séparer les usages. */
export function keyedDigest(domain: string, value: string, env: NodeJS.ProcessEnv = process.env): string {
  return createHmac("sha256", sessionSecret(env)).update(`${domain}\u0000${value}`).digest("hex");
}
