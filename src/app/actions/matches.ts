"use server";
import { revalidatePath } from "next/cache";
import type { MatchKind } from "@prisma/client";
import { requireAdmin, requireUser } from "@/server/auth/session";
import { cancelMatch, declareMatch, refuseMatch, validateMatches } from "@/server/services/matches";
import { run, str } from "./util";

/** FR-100 / FR-101 */
export async function declareMatchAction(fd: FormData): Promise<void> {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";
  const back = isAdmin ? "/admin/matchs/nouveau" : "/matchs/nouveau";
  const sets = [1, 2, 3]
    .map((i) => [str(fd, `s${i}a`), str(fd, `s${i}b`)] as const)
    .filter(([a, b]) => a !== "" && b !== "")
    .map(([a, b], idx, arr) => (idx === 2 && idx === arr.length - 1 && Math.max(Number(a), Number(b)) >= 10 ? `${a}-${b}` : `${a}/${b}`));
  await run(back, async () => {
    await declareMatch(user, {
      seasonId: str(fd, "seasonId"),
      playerAId: str(fd, "playerAId") || undefined,
      playedOn: str(fd, "playedOn"),
      opponentType: str(fd, "opponentType") === "external" ? "external" : "club",
      opponentId: str(fd, "opponentId") || undefined,
      externalLabel: str(fd, "externalLabel"),
      externalRanking: str(fd, "externalRanking"),
      result: str(fd, "result") === "LOSS" ? "LOSS" : "WIN",
      kind: (["NORMAL", "WALKOVER", "RETIREMENT"].includes(str(fd, "kind")) ? str(fd, "kind") : "NORMAL") as MatchKind,
      score: sets.join(" "),
      validateNow: isAdmin && str(fd, "validateNow") === "on",
    });
    revalidatePath("/", "layout");
    return isAdmin ? "Match enregistré." : "Match envoyé : il comptera après validation par le club.";
  });
}

/** FR-103 */
export async function validateMatchesAction(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  const ids = fd.getAll("matchId").filter((v): v is string => typeof v === "string");
  await run("/admin/matchs", async () => {
    await validateMatches(admin, ids);
    revalidatePath("/", "layout");
    return ids.length > 1 ? `${ids.length} matchs validés.` : "Match validé.";
  });
}

/** Validation d'un seul match (bouton de ligne), indépendamment des cases cochées. */
export async function validateOneAction(matchId: string): Promise<void> {
  const admin = await requireAdmin();
  await run("/admin/matchs", async () => {
    await validateMatches(admin, [matchId]);
    revalidatePath("/", "layout");
    return "Match validé.";
  });
}

export async function refuseMatchAction(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  await run("/admin/matchs", async () => {
    await refuseMatch(admin, str(fd, "matchId"), str(fd, "reason"));
    return "Match refusé.";
  });
}

/** FR-107 */
export async function cancelMatchAction(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  const back = str(fd, "back") || "/admin/matchs";
  await run(back.startsWith("/admin") ? back : "/admin/matchs", async () => {
    await cancelMatch(admin, str(fd, "matchId"));
    revalidatePath("/", "layout");
    return "Match annulé.";
  });
}
