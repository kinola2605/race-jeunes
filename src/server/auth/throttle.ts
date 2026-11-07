import "server-only";
import { createHash } from "node:crypto";
import { db } from "@/server/db";

/** 5 échecs par pseudo ; 20 par origine réseau (un wifi de club partage souvent une même adresse). */
export const MAX_FAILURES = { pseudo: 5, ip: 20 } as const;
const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;
const PURGE_MS = 24 * 3600 * 1000;

/** Empreinte de la clé : ni pseudo ni adresse IP en clair en base (constitution III). */
export function throttleKey(kind: "pseudo" | "ip", value: string): string {
  return kind + ":" + createHash("sha256").update(value.toLowerCase()).digest("hex");
}

export async function isLocked(keys: string[]): Promise<boolean> {
  const rows = await db.loginThrottle.findMany({ where: { key: { in: keys } } });
  const now = new Date();
  return rows.some((r) => r.lockedUntil !== null && r.lockedUntil > now);
}

/** Enregistre un échec ; renvoie true si un verrouillage vient d'être posé. */
export async function recordFailure(keys: string[]): Promise<boolean> {
  const now = Date.now();
  let locked = false;
  for (const key of keys) {
    const row = await db.loginThrottle.findUnique({ where: { key } });
    const inWindow = row && now - row.windowStart.getTime() < WINDOW_MS;
    const failures = inWindow ? row.failures + 1 : 1;
    const max = key.startsWith("ip:") ? MAX_FAILURES.ip : MAX_FAILURES.pseudo;
    const lockedUntil = failures >= max ? new Date(now + LOCK_MS) : null;
    if (lockedUntil) locked = true;
    await db.loginThrottle.upsert({
      where: { key },
      create: { key, failures, windowStart: new Date(now), lockedUntil },
      update: { failures, windowStart: inWindow ? row.windowStart : new Date(now), lockedUntil },
    });
  }
  await db.loginThrottle.deleteMany({ where: { updatedAt: { lt: new Date(now - PURGE_MS) } } });
  return locked;
}

export async function clearFailures(keys: string[]): Promise<void> {
  await db.loginThrottle.deleteMany({ where: { key: { in: keys } } });
}
