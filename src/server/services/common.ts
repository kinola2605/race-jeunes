import "server-only";
import type { Prisma, PrismaClient } from "@prisma/client";
import { db } from "@/server/db";
import type { SessionUser } from "@/server/auth/session";

/** Erreur métier affichable telle quelle à l'utilisateur. */
export class UserError extends Error {}

export type Tx = Prisma.TransactionClient | PrismaClient;
export type Actor = Pick<SessionUser, "id" | "pseudo" | "role">;

export const SYSTEM_ACTOR: Actor = { id: "system", pseudo: "système", role: "ADMIN" };

export type AuditType = "Compte" | "Saison" | "Barème" | "Engagement" | "Match" | "Sécurité" | "Import" | "Export";

/** Ajoute une entrée au journal d'audit. Ne jamais y mettre de mot de passe (constitution III/VI). */
export async function audit(
  tx: Tx,
  actor: Actor,
  type: AuditType,
  action: string,
  target?: string,
  details?: Prisma.InputJsonValue,
): Promise<void> {
  await tx.auditLog.create({
    data: {
      actorId: actor.id === "system" ? null : actor.id,
      actorPseudo: actor.pseudo,
      type,
      action,
      target: target ?? null,
      details: details ?? undefined,
    },
  });
}

export function assertAdmin(actor: Actor): void {
  if (actor.role !== "ADMIN") throw new UserError("Action réservée aux administrateurs.");
}

export { db };
