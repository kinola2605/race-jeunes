import "server-only";
import { checkAvatar, formatAvatar } from "@/avatar/avatar";
import { UserError, audit, db, type Actor } from "./common";

/** Spec 007 — FR-705, FR-706 : chacun choisit son avatar (ou revient à l'avatar par défaut), pour lui-même seulement. */
export async function setOwnAvatar(actor: Actor, icon: string, color: string): Promise<string | null> {
  let value: string | null = null;
  if (icon || color) {
    const a = checkAvatar(icon, color);
    if (!a) throw new UserError("Choisissez un pictogramme et une couleur dans la galerie.");
    value = formatAvatar(a);
  }
  return db.$transaction(async (tx) => {
    const before = await tx.user.findUniqueOrThrow({ where: { id: actor.id }, select: { avatar: true, pseudo: true } });
    if (before.avatar === value) return value;
    await tx.user.update({ where: { id: actor.id }, data: { avatar: value } });
    await audit(tx, actor, "Compte", value ? "Avatar modifié" : "Avatar par défaut rétabli", before.pseudo, { avant: before.avatar, "après": value });
    return value;
  });
}
