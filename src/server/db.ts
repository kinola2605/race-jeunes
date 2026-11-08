import "server-only";
import { Prisma, PrismaClient } from "@prisma/client";
import { runtimeDatabaseUrl } from "@/server/db-url";

/**
 * Client Prisma unique par instance (une fonction Vercel réutilise son instance entre requêtes).
 * L'URL est l'URL poolée de Neon (DATABASE_URL), normalisée : SSL obligatoire, pgbouncer, délai de connexion.
 */
function createClient() {
  const raw = process.env.DATABASE_URL;
  const base = new PrismaClient(raw ? { datasourceUrl: runtimeDatabaseUrl(raw) } : undefined);
  return base.$extends({
    query: {
      async $allOperations({ args, query }) {
        return withColdStartRetry(() => query(args));
      },
    },
  });
}

/**
 * Réveil à froid : une base Neon en veille peut refuser la toute première connexion.
 * On ne relance que les erreurs où aucune requête n'a pu s'exécuter (connexion impossible),
 * jamais une erreur survenue après envoi d'une écriture.
 */
const RETRYABLE_CODES = new Set(["P1001", "P1002"]);
const DELAYS_MS = [300, 1000, 2500];

export function isConnectionError(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientInitializationError) return true;
  return e instanceof Prisma.PrismaClientKnownRequestError && RETRYABLE_CODES.has(e.code);
}

async function withColdStartRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt >= DELAYS_MS.length || !isConnectionError(e)) throw e;
      await new Promise((r) => setTimeout(r, DELAYS_MS[attempt]));
    }
  }
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// L'extension n'ajoute qu'un intercepteur : les types du client de base restent exacts.
export const db: PrismaClient = globalForPrisma.prisma ?? (createClient() as unknown as PrismaClient);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
