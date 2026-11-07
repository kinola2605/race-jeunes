import "server-only";
import type { MatchKind, Prisma } from "@prisma/client";
import { isRanking, parseScore } from "@/scoring";
import { UserError, assertAdmin, audit, db, type Actor, type Tx } from "./common";
import { computeEntries, latestPublished, referenceRanking } from "./scoring";
import { assertWritable } from "./seasons";

export interface DeclareMatchInput {
  seasonId: string;
  /** joueur côté A ; ignoré pour un joueur (c'est lui-même) */
  playerAId?: string;
  playedOn: string;
  opponentType: "club" | "external";
  opponentId?: string;
  externalLabel?: string;
  externalRanking?: string;
  result: "WIN" | "LOSS";
  kind: MatchKind;
  score?: string;
  validateNow?: boolean;
}

/** FR-100, FR-101, FR-108 */
export async function declareMatch(actor: Actor, input: DeclareMatchInput): Promise<string> {
  const isAdmin = actor.role === "ADMIN";
  const playerAId = isAdmin ? input.playerAId : actor.id;
  if (!playerAId) throw new UserError("Choisissez le joueur.");

  const playedOn = new Date(input.playedOn + "T00:00:00Z");
  if (Number.isNaN(playedOn.getTime())) throw new UserError("Date invalide.");
  if (playedOn.getTime() > Date.now() + 24 * 3600 * 1000) throw new UserError("La date du match est dans le futur.");

  let score: string | null = null;
  if (input.kind !== "WALKOVER") {
    const parsed = parseScore(input.score ?? "");
    if (!parsed.ok) throw new UserError(parsed.error);
    score = parsed.normalized;
  }

  let playerBId: string | null = null;
  let externalLabel: string | null = null;
  let externalRanking: string | null = null;
  if (input.opponentType === "club") {
    if (!input.opponentId) throw new UserError("Choisissez l'adversaire.");
    if (input.opponentId === playerAId) throw new UserError("Un joueur ne peut pas jouer contre lui-même.");
    playerBId = input.opponentId;
  } else {
    externalLabel = (input.externalLabel ?? "").trim();
    if (externalLabel.length < 2 || externalLabel.length > 80) throw new UserError("Libellé de l'adversaire : 2 à 80 caractères.");
    if (!isRanking(input.externalRanking)) throw new UserError("Classement de l'adversaire invalide.");
    externalRanking = input.externalRanking;
  }

  const id = await db.$transaction(async (tx) => {
    const season = await tx.season.findUniqueOrThrow({ where: { id: input.seasonId } });
    assertWritable(season);
    if (season.status !== "OPEN") throw new UserError("La saison n'est pas ouverte.");
    const enrolled = await tx.enrollment.findMany({
      where: { seasonId: season.id, userId: { in: [playerAId, ...(playerBId ? [playerBId] : [])] } },
    });
    if (!enrolled.some((e) => e.userId === playerAId)) throw new UserError("Ce joueur n'est pas engagé dans la saison.");
    if (playerBId && !enrolled.some((e) => e.userId === playerBId)) throw new UserError("L'adversaire n'est pas engagé dans la saison.");

    const match = await tx.match.create({
      data: {
        seasonId: season.id,
        playedOn,
        playerAId,
        playerBId,
        externalLabel,
        externalRanking,
        winner: input.result === "WIN" ? "A" : "B",
        score,
        kind: input.kind,
        createdById: actor.id,
      },
      include: { playerA: true, playerB: true },
    });
    const label = `${match.playerA.pseudo} vs ${match.playerB?.pseudo ?? "Ext. " + externalLabel}`;
    if (isAdmin) await audit(tx, actor, "Match", "Match saisi", label, { season: season.slug, score });
    if (isAdmin && input.validateNow) await validateInTx(tx, actor, match.id);
    return match.id;
  });
  return id;
}

async function validateInTx(tx: Tx, actor: Actor, matchId: string): Promise<void> {
  const match = await tx.match.findUnique({ where: { id: matchId }, include: { season: true, playerA: true, playerB: true } });
  if (!match) throw new UserError("Match introuvable.");
  assertWritable(match.season);
  if (match.status !== "PENDING") throw new UserError("Ce match n'est plus en attente.");
  const published = await latestPublished(tx, match.seasonId);
  if (!published) throw new UserError("Aucun barème publié pour cette saison.");
  const rankingA = await referenceRanking(tx, match.seasonId, match.playerAId, match.playedOn);
  const rankingB = match.playerBId ? await referenceRanking(tx, match.seasonId, match.playerBId, match.playedOn) : match.externalRanking;
  const updated = await tx.match.update({
    where: { id: match.id },
    data: { status: "VALIDATED", validatedById: actor.id, validatedAt: new Date(), rankingA, rankingB },
  });
  const entries = computeEntries(published.parsed, updated);
  for (const e of entries) {
    await tx.pointsEntry.create({
      data: {
        matchId: match.id,
        userId: e.userId,
        ruleSetId: published.id,
        points: e.points,
        gap: e.gap,
        isPerf: e.isPerf,
        won: e.won,
        breakdown: e.breakdown as unknown as Prisma.InputJsonValue,
      },
    });
  }
  await audit(tx, actor, "Match", "Match validé", `${match.playerA.pseudo} vs ${match.playerB?.pseudo ?? "Ext. " + match.externalLabel}`, {
    season: match.season.slug,
    ruleSetVersion: published.version,
    points: entries.map((e) => e.points),
  });
}

/** FR-103 */
export async function validateMatches(actor: Actor, matchIds: string[]): Promise<void> {
  assertAdmin(actor);
  if (matchIds.length === 0) throw new UserError("Sélectionnez au moins un match.");
  await db.$transaction(async (tx) => {
    for (const id of matchIds) await validateInTx(tx, actor, id);
  });
}

export async function refuseMatch(actor: Actor, matchId: string, reason: string): Promise<void> {
  assertAdmin(actor);
  const r = reason.trim();
  if (r.length < 3 || r.length > 200) throw new UserError("Motif : 3 à 200 caractères.");
  await db.$transaction(async (tx) => {
    const m = await tx.match.findUniqueOrThrow({ where: { id: matchId }, include: { season: true, playerA: true } });
    assertWritable(m.season);
    if (m.status !== "PENDING") throw new UserError("Ce match n'est plus en attente.");
    await tx.match.update({ where: { id: matchId }, data: { status: "REFUSED", refusalReason: r } });
    await audit(tx, actor, "Match", "Match refusé", `${m.playerA.pseudo} · ${m.id.slice(-6)}`, { reason: r });
  });
}

/** FR-107 : annule un match en attente ou validé (points retirés). */
export async function cancelMatch(actor: Actor, matchId: string): Promise<void> {
  assertAdmin(actor);
  await db.$transaction(async (tx) => {
    const m = await tx.match.findUniqueOrThrow({ where: { id: matchId }, include: { season: true, playerA: true } });
    assertWritable(m.season);
    if (m.status === "CANCELLED" || m.status === "REFUSED") throw new UserError("Ce match est déjà clos.");
    await tx.pointsEntry.deleteMany({ where: { matchId } });
    await tx.match.update({ where: { id: matchId }, data: { status: "CANCELLED" } });
    await audit(tx, actor, "Match", "Match annulé", `${m.playerA.pseudo} · ${m.id.slice(-6)}`, { previous: m.status });
  });
}

const matchInclude = {
  playerA: { select: { id: true, pseudo: true } },
  playerB: { select: { id: true, pseudo: true } },
  season: { select: { slug: true, title: true, status: true } },
  entries: { include: { ruleSet: { select: { version: true } } } },
} satisfies Prisma.MatchInclude;

export type MatchWithRelations = Prisma.MatchGetPayload<{ include: typeof matchInclude }>;

export async function matchesOfPlayer(seasonId: string, userId: string) {
  return db.match.findMany({
    where: { seasonId, OR: [{ playerAId: userId }, { playerBId: userId }] },
    include: matchInclude,
    orderBy: [{ playedOn: "desc" }, { createdAt: "desc" }],
  });
}

export async function pendingMatches(seasonId?: string) {
  return db.match.findMany({
    where: { status: "PENDING", ...(seasonId ? { seasonId } : {}), season: { status: "OPEN" } },
    include: matchInclude,
    orderBy: [{ playedOn: "asc" }, { createdAt: "asc" }],
  });
}

export async function matchesOfSeason(seasonId: string, status?: "VALIDATED" | "REFUSED" | "CANCELLED") {
  return db.match.findMany({
    where: { seasonId, ...(status ? { status } : {}) },
    include: matchInclude,
    orderBy: [{ playedOn: "desc" }, { createdAt: "desc" }],
  });
}

/** FR-105 : même paire, même date, plusieurs saisies non refusées/annulées. */
export function findDuplicates(matches: MatchWithRelations[], all: MatchWithRelations[]): Set<string> {
  const key = (m: MatchWithRelations) =>
    m.playerBId ? [m.playerAId, m.playerBId].sort().join("|") + "|" + m.playedOn.toISOString().slice(0, 10) : null;
  const counts = new Map<string, number>();
  for (const m of all) {
    const k = key(m);
    if (k && (m.status === "PENDING" || m.status === "VALIDATED")) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return new Set(matches.filter((m) => (counts.get(key(m) ?? "") ?? 0) > 1).map((m) => m.id));
}

/** Sides from the point of view of a player. */
export function viewOf(m: MatchWithRelations, userId: string) {
  const isA = m.playerAId === userId;
  const won = (m.winner === "A") === isA;
  const opponent = isA ? (m.playerB ? m.playerB.pseudo : `Ext. · ${m.externalLabel}`) : m.playerA.pseudo;
  const opponentRanking = isA ? m.rankingB ?? m.externalRanking : m.rankingA;
  const entry = m.entries.find((e) => e.userId === userId) ?? null;
  const score = m.score ? (isA ? m.score : invert(m.score)) : null;
  return { won, opponent, opponentRanking, entry, score };
}

function invert(score: string): string {
  return score
    .split(" ")
    .map((p) => {
      const sep = p.includes("/") ? "/" : "-";
      const [x, y] = p.split(sep);
      return `${y}${sep}${x}`;
    })
    .join(" ");
}
