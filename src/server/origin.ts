/**
 * Protection CSRF en profondeur (constitution VI) : toute requête d'écriture doit venir de la même origine.
 * Les Server Actions de Next.js vérifient déjà l'origine ; ce contrôle couvre aussi les routes d'API
 * et refuse une requête d'écriture sans en-tête Origin (les navigateurs l'envoient toujours en POST).
 * Module pur, compatible avec le runtime Edge du middleware.
 */
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function isAllowedWrite(method: string, origin: string | null, host: string | null): boolean {
  if (SAFE_METHODS.has(method.toUpperCase())) return true;
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
