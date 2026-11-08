/**
 * Normalise l'URL de connexion utilisée par l'application à l'exécution.
 *
 * - Hôte distant : SSL obligatoire (`sslmode=require`, sauf `verify-full`/`verify-ca` déjà plus stricts).
 * - Pooler Neon (`-pooler` dans l'hôte) : `pgbouncer=true` (mode transaction, pas d'instructions préparées).
 * - `connect_timeout=15` par défaut : laisse le temps à une base Neon en veille de se réveiller.
 *
 * Module pur, sans dépendance serveur : utilisé aussi par les scripts (bootstrap, seed).
 */
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const STRICT_SSL = new Set(["require", "verify-ca", "verify-full"]);

/** Hôte local ou nom de service Docker (sans point) : le SSL n'est pas imposé. */
export function isLocalHost(hostname: string): boolean {
  return LOCAL_HOSTS.has(hostname) || !hostname.includes(".");
}

export function runtimeDatabaseUrl(raw: string): string {
  const url = new URL(raw);
  const p = url.searchParams;
  if (!isLocalHost(url.hostname) && !STRICT_SSL.has(p.get("sslmode") ?? "")) p.set("sslmode", "require");
  if (url.hostname.includes("-pooler") && !p.has("pgbouncer")) p.set("pgbouncer", "true");
  if (!p.has("connect_timeout")) p.set("connect_timeout", "15");
  return url.toString();
}

/** Hôte seul, pour les messages (jamais l'URL complète : elle contient le mot de passe). */
export function describeDatabase(raw: string | undefined): string {
  if (!raw) return "(non définie)";
  try {
    const url = new URL(raw);
    return `${url.hostname}${url.pathname}`;
  } catch {
    return "(URL invalide)";
  }
}
