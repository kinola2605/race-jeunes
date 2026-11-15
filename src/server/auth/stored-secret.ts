import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "@/server/db";
import { hasConfiguredSecret, setStoredSecret } from "@/server/auth/secret";

const ID = "session";
let loading: Promise<void> | null = null;

/**
 * Spec 016 (FR-1603) : sans SESSION_SECRET, l'application génère sa clé de session au premier besoin et la
 * conserve en base. L'insertion « si absente » garantit une seule clé, même si plusieurs instances démarrent
 * en même temps. Chargée une fois par instance ; à appeler avant tout calcul d'empreinte (sessions, anti-abus).
 */
export function ensureSessionSecret(): Promise<void> {
  if (hasConfiguredSecret() || process.env.NODE_ENV !== "production") return Promise.resolve();
  loading ??= load().catch((e) => {
    loading = null;
    throw e;
  });
  return loading;
}

async function load(): Promise<void> {
  const candidate = randomBytes(48).toString("base64url");
  await db.$executeRaw`INSERT INTO "AppSecret" ("id", "value") VALUES (${ID}, ${candidate}) ON CONFLICT ("id") DO NOTHING`;
  const row = await db.appSecret.findUniqueOrThrow({ where: { id: ID } });
  setStoredSecret(row.value);
}
