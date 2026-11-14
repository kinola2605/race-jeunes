import "server-only";
import { invertScore } from "@/scoring";
import { mentalProfile, type MentalMatch, type MentalProfile } from "@/mental/profile";
import { db } from "./common";

export interface SeasonMental {
  /** indicateurs du joueur sur la saison */
  player: MentalProfile;
  /** mêmes indicateurs cumulés sur tous les engagés de la saison, joueur compris (FR-1208) */
  group: MentalProfile;
}

/**
 * FR-1200 : profil mental d'un joueur, saison par saison (clé = seasonId), calculé à la lecture à partir des
 * matchs validés. Rien n'est enregistré : une correction de match se reflète aussitôt.
 */
export async function mentalOfPlayer(userId: string, seasonIds: string[]): Promise<Map<string, SeasonMental>> {
  const entries = await db.pointsEntry.findMany({
    where: { match: { seasonId: { in: seasonIds }, status: "VALIDATED", kind: { not: "WALKOVER" } } },
    select: { userId: true, gap: true, won: true, match: { select: { seasonId: true, playerAId: true, score: true, kind: true } } },
  });
  const mine = new Map<string, MentalMatch[]>(seasonIds.map((id) => [id, []]));
  const all = new Map<string, MentalMatch[]>(seasonIds.map((id) => [id, []]));
  for (const e of entries) {
    // le score est enregistré du point de vue du côté A
    const score = e.match.score === null || e.userId === e.match.playerAId ? e.match.score : invertScore(e.match.score);
    const view: MentalMatch = { score, won: e.won, kind: e.match.kind, gap: e.gap };
    all.get(e.match.seasonId)!.push(view);
    if (e.userId === userId) mine.get(e.match.seasonId)!.push(view);
  }
  return new Map(seasonIds.map((id) => [id, { player: mentalProfile(mine.get(id)!), group: mentalProfile(all.get(id)!) }]));
}
