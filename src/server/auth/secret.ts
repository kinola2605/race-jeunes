import { createHmac } from "node:crypto";

/**
 * Clé HMAC (32 caractères minimum) servant à dériver
 * - l'empreinte des jetons de session stockée en base ;
 * - les clés du compteur anti-abus (pseudo, origine réseau), non réversibles par énumération.
 *
 * Source, par priorité : SESSION_SECRET ; sinon la clé générée par l'application et conservée en base
 * (spec 016, chargée par `ensureSessionSecret`) ; sinon, hors production, une valeur de développement.
 * Changer la clé déconnecte tout le monde (toutes les empreintes changent).
 */
export const MIN_SECRET_LENGTH = 32;
const DEV_FALLBACK = "dev-only-secret-never-used-in-production-000";

let storedSecret: string | null = null;

/** Clé conservée en base (spec 016), posée une fois par instance. */
export function setStoredSecret(value: string | null): void {
  storedSecret = value && value.length >= MIN_SECRET_LENGTH ? value : null;
}

export function hasConfiguredSecret(env: NodeJS.ProcessEnv = process.env): boolean {
  return (env.SESSION_SECRET ?? "").length >= MIN_SECRET_LENGTH;
}

export function sessionSecret(env: NodeJS.ProcessEnv = process.env): string {
  const value = env.SESSION_SECRET ?? "";
  if (value.length >= MIN_SECRET_LENGTH) return value;
  if (storedSecret) return storedSecret;
  if (env.NODE_ENV === "production") {
    throw new Error(`SESSION_SECRET absent ou trop court (${MIN_SECRET_LENGTH} caractères minimum).`);
  }
  return DEV_FALLBACK;
}

/** HMAC-SHA256 hexadécimal, avec un domaine pour séparer les usages. */
export function keyedDigest(domain: string, value: string, env: NodeJS.ProcessEnv = process.env): string {
  return createHmac("sha256", sessionSecret(env)).update(`${domain}\u0000${value}`).digest("hex");
}
