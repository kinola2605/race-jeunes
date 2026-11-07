import "server-only";
import type { Prisma, RankingMode, RankingVisibility, Season } from "@prisma/client";
import { emptyRuleSet, validateRuleSet, type RuleSet } from "@/scoring";
import { UserError, assertAdmin, audit, db, type Actor } from "./common";
import { computeEntries, latestPublished, parseRules } from "./scoring";
import { seasonStandings } from "./standings";

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function assertWritable(season: Pick<Season, "status" | "title">): void {
  if (season.status === "CLOSED" || season.status === "ARCHIVED") {
    throw new UserError(`« ${season.title} » est en lecture seule (saison ${season.status === "CLOSED" ? "clôturée" : "archivée"}).`);
  }
}

export interface CreateSeasonInput {
  slug: string;
  title: string;
  startsOn?: string | null;
  endsOn?: string | null;
  rankingMode: RankingMode;
  visibility: RankingVisibility;
  copyFromRuleSetId?: string | null;
}

/** FR-040, FR-068 : duplication = copie indépendante (nouvel enregistrement). */
export async function createSeason(actor: Actor, input: CreateSeasonInput): Promise<Season> {
  assertAdmin(actor);
  const slug = input.slug.trim();
  const title = input.title.trim();
  if (!SLUG_RE.test(slug) || slug.length > 60) throw new UserError("Identifiant invalide : minuscules, chiffres et tirets (60 max).");
  if (title.length < 3 || title.length > 80) throw new UserError("Titre : 3 à 80 caractères.");
  const startsOn = input.startsOn ? new Date(input.startsOn) : null;
  const endsOn = input.endsOn ? new Date(input.endsOn) : null;
  if (startsOn && endsOn && endsOn < startsOn) throw new UserError("La date de fin précède la date de début.");

  return db.$transaction(async (tx) => {
    if (await tx.season.findUnique({ where: { slug } })) throw new UserError("Cet identifiant est déjà utilisé.");
    const season = await tx.season.create({
      data: { slug, title, startsOn, endsOn, rankingMode: input.rankingMode, visibility: input.visibility },
    });
    let rules: RuleSet = emptyRuleSet();
    let copiedFromId: string | null = null;
    if (input.copyFromRuleSetId) {
      const source = await tx.scoringRuleSet.findUnique({ where: { id: input.copyFromRuleSetId } });
      if (!source) throw new UserError("Barème source introuvable.");
      rules = parseRules(source.rules);
      copiedFromId = source.id;
    }
    // Un barème copié est déjà éprouvé : il est publié en v1. Un barème vide reste en brouillon.
    await tx.scoringRuleSet.create({
      data: {
        seasonId: season.id,
        version: 1,
        status: copiedFromId ? "PUBLISHED" : "DRAFT",
        publishedAt: copiedFromId ? new Date() : null,
        rules: rules as unknown as Prisma.InputJsonValue,
        copiedFromId,
      },
    });
    await audit(tx, actor, "Saison", "Saison créée", slug, { title, copiedFromId });
    return season;
  });
}

export async function updateSeasonTitle(actor: Actor, seasonId: string, title: string): Promise<void> {
  assertAdmin(actor);
  const t = title.trim();
  if (t.length < 3 || t.length > 80) throw new UserError("Titre : 3 à 80 caractères.");
  await db.$transaction(async (tx) => {
    const s = await tx.season.update({ where: { id: seasonId }, data: { title: t } });
    await audit(tx, actor, "Saison", "Titre modifié", s.slug, { title: t });
  });
}

/** FR-041, FR-042 */
export async function transitionSeason(
  actor: Actor,
  seasonId: string,
  to: "OPEN" | "CLOSED" | "ARCHIVED" | "REOPEN",
  confirmSlug?: string,
): Promise<void> {
  assertAdmin(actor);
  await db.$transaction(async (tx) => {
    const s = await tx.season.findUniqueOrThrow({ where: { id: seasonId } });
    if (to === "OPEN") {
      if (s.status !== "DRAFT") throw new UserError("Seule une saison brouillon peut être ouverte.");
      if (!(await latestPublished(tx, s.id))) throw new UserError("Publiez d'abord une version du barème.");
      await tx.season.update({ where: { id: s.id }, data: { status: "OPEN", openedAt: new Date() } });
      await audit(tx, actor, "Saison", "Saison ouverte", s.slug);
    } else if (to === "CLOSED") {
      if (s.status !== "OPEN") throw new UserError("Seule une saison ouverte peut être clôturée.");
      if (confirmSlug !== s.slug) throw new UserError("L'identifiant saisi ne correspond pas.");
      const cancelled = await tx.match.updateMany({ where: { seasonId: s.id, status: "PENDING" }, data: { status: "CANCELLED" } });
      await tx.season.update({ where: { id: s.id }, data: { status: "CLOSED", closedAt: new Date() } });
      await tx.scoringRuleSet.deleteMany({ where: { seasonId: s.id, status: "DRAFT" } });
      await audit(tx, actor, "Saison", "Saison clôturée", s.slug, { pendingCancelled: cancelled.count });
    } else if (to === "REOPEN") {
      if (s.status !== "CLOSED") throw new UserError("Seule une saison clôturée peut être rouverte.");
      await tx.season.update({ where: { id: s.id }, data: { status: "OPEN", closedAt: null } });
      await audit(tx, actor, "Saison", "Saison rouverte (exceptionnel)", s.slug);
    } else {
      if (s.status !== "CLOSED") throw new UserError("Seule une saison clôturée peut être archivée.");
      await tx.season.update({ where: { id: s.id }, data: { status: "ARCHIVED" } });
      await audit(tx, actor, "Saison", "Saison archivée", s.slug);
    }
  });
}

// ---------------------------------------------------------------- barèmes (FR-060 à FR-067)

export async function ruleSetsOf(seasonId: string) {
  const all = await db.scoringRuleSet.findMany({ where: { seasonId }, orderBy: { version: "desc" } });
  const draft = all.find((r) => r.status === "DRAFT") ?? null;
  const published = all.find((r) => r.status === "PUBLISHED") ?? null;
  return { all, draft, published };
}

export async function saveDraft(actor: Actor, seasonId: string, input: unknown): Promise<{ warnings: string[] }> {
  assertAdmin(actor);
  const v = validateRuleSet(input);
  if (!v.ok) throw new UserError("Barème invalide : " + v.errors.join(" ; "));
  await db.$transaction(async (tx) => {
    const season = await tx.season.findUniqueOrThrow({ where: { id: seasonId } });
    assertWritable(season);
    const draft = await tx.scoringRuleSet.findFirst({ where: { seasonId, status: "DRAFT" } });
    const data = { rules: v.rules as unknown as Prisma.InputJsonValue };
    if (draft) {
      await tx.scoringRuleSet.update({ where: { id: draft.id }, data });
    } else {
      const last = await tx.scoringRuleSet.findFirst({ where: { seasonId }, orderBy: { version: "desc" } });
      await tx.scoringRuleSet.create({ data: { ...data, seasonId, version: (last?.version ?? 0) + 1, status: "DRAFT" } });
    }
    await audit(tx, actor, "Barème", "Brouillon enregistré", season.slug);
  });
  return { warnings: v.warnings };
}

export async function discardDraft(actor: Actor, seasonId: string): Promise<void> {
  assertAdmin(actor);
  await db.$transaction(async (tx) => {
    const season = await tx.season.findUniqueOrThrow({ where: { id: seasonId } });
    assertWritable(season);
    await tx.scoringRuleSet.deleteMany({ where: { seasonId, status: "DRAFT" } });
    await audit(tx, actor, "Barème", "Brouillon abandonné", season.slug);
  });
}

export interface ImpactRow {
  pseudo: string;
  pointsBefore: number;
  pointsAfter: number;
  rankBefore: number;
  rankAfter: number;
}

export interface Impact {
  matchCount: number;
  changedMatches: number;
  playersImpacted: number;
  rankChanges: number;
  rows: ImpactRow[];
}

/** FR-065 : calcule l'effet d'un barème sur les matchs validés, sans rien écrire. */
export async function previewImpact(seasonId: string, rules: RuleSet): Promise<Impact> {
  const matches = await db.match.findMany({ where: { seasonId, status: "VALIDATED" }, include: { entries: true } });
  let changedMatches = 0;
  const newEntries = [];
  for (const m of matches) {
    const computed = computeEntries(rules, m);
    if (computed.some((c) => m.entries.find((e) => e.userId === c.userId)?.points !== c.points)) changedMatches++;
    newEntries.push(
      ...computed.map((c) => ({ playerId: c.userId, points: c.points, isPerf: c.isPerf, result: c.won ? ("WIN" as const) : ("LOSS" as const) })),
    );
  }
  const before = await seasonStandings(seasonId);
  const after = await seasonStandings(seasonId, rules, newEntries);
  const afterById = new Map(after.map((r) => [r.playerId, r]));
  const rows: ImpactRow[] = before
    .map((b) => {
      const a = afterById.get(b.playerId)!;
      return { pseudo: b.pseudo, pointsBefore: b.points, pointsAfter: a.points, rankBefore: b.rank, rankAfter: a.rank };
    })
    .filter((r) => r.pointsBefore !== r.pointsAfter || r.rankBefore !== r.rankAfter)
    .sort((x, y) => x.rankAfter - y.rankAfter);
  return {
    matchCount: matches.length,
    changedMatches,
    playersImpacted: rows.filter((r) => r.pointsBefore !== r.pointsAfter).length,
    rankChanges: rows.filter((r) => r.rankBefore !== r.rankAfter).length,
    rows,
  };
}

/** FR-064, FR-066 : publie le brouillon ; recalcule les matchs passés seulement si demandé. */
export async function publishDraft(actor: Actor, seasonId: string, recalculate: boolean): Promise<void> {
  assertAdmin(actor);
  const season = await db.season.findUniqueOrThrow({ where: { id: seasonId } });
  assertWritable(season);
  const draft = await db.scoringRuleSet.findFirst({ where: { seasonId, status: "DRAFT" } });
  if (!draft) throw new UserError("Aucun brouillon à publier.");
  const v = validateRuleSet(draft.rules);
  if (!v.ok) throw new UserError("Barème invalide : " + v.errors.join(" ; "));
  const impact = recalculate ? await previewImpact(seasonId, v.rules) : null;

  await db.$transaction(async (tx) => {
    await tx.scoringRuleSet.update({ where: { id: draft.id }, data: { status: "PUBLISHED", publishedAt: new Date() } });
    await audit(tx, actor, "Barème", "Version publiée", `${season.slug} v${draft.version}`, { recalculate });
    if (recalculate && impact) await recalculateAll(tx, actor, season, draft.id, v.rules, impact);
  });
}

/** Recalcul explicite avec la dernière version publiée (si une publication s'est faite sans recalcul). */
export async function recalculateWithPublished(actor: Actor, seasonId: string): Promise<void> {
  assertAdmin(actor);
  const season = await db.season.findUniqueOrThrow({ where: { id: seasonId } });
  assertWritable(season);
  const published = await latestPublished(db, seasonId);
  if (!published) throw new UserError("Aucune version publiée.");
  const impact = await previewImpact(seasonId, published.parsed);
  await db.$transaction((tx) => recalculateAll(tx, actor, season, published.id, published.parsed, impact));
}

async function recalculateAll(
  tx: Prisma.TransactionClient,
  actor: Actor,
  season: Season,
  ruleSetId: string,
  rules: RuleSet,
  impact: Impact,
): Promise<void> {
  const matches = await tx.match.findMany({ where: { seasonId: season.id, status: "VALIDATED" } });
  for (const m of matches) {
    await tx.pointsEntry.deleteMany({ where: { matchId: m.id } });
    for (const c of computeEntries(rules, m)) {
      await tx.pointsEntry.create({
        data: {
          matchId: m.id,
          userId: c.userId,
          ruleSetId,
          points: c.points,
          gap: c.gap,
          isPerf: c.isPerf,
          won: c.won,
          breakdown: c.breakdown as unknown as Prisma.InputJsonValue,
        },
      });
    }
  }
  const summary = { rows: impact.rows } as unknown as Prisma.InputJsonValue;
  await tx.recalcRun.create({
    data: { seasonId: season.id, ruleSetId, matchCount: impact.matchCount, changedCount: impact.changedMatches, summary, createdById: actor.id },
  });
  await audit(tx, actor, "Barème", "Recalcul appliqué", season.slug, {
    matches: impact.matchCount,
    changedMatches: impact.changedMatches,
    playersImpacted: impact.playersImpacted,
    beforeAfter: impact.rows.map((r) => `${r.pseudo}: ${r.pointsBefore}→${r.pointsAfter} (rang ${r.rankBefore}→${r.rankAfter})`),
  });
}

// ---------------------------------------------------------------- lecture

export async function listSeasons() {
  const seasons = await db.season.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      _count: { select: { enrollments: true } },
      ruleSets: { orderBy: { version: "desc" }, select: { id: true, version: true, status: true } },
    },
  });
  const counts = await db.match.groupBy({ by: ["seasonId", "status"], _count: true });
  return seasons.map((s) => ({
    ...s,
    validated: counts.find((c) => c.seasonId === s.id && c.status === "VALIDATED")?._count ?? 0,
    pending: counts.find((c) => c.seasonId === s.id && c.status === "PENDING")?._count ?? 0,
  }));
}

export async function getSeason(slug: string) {
  return db.season.findUnique({ where: { slug } });
}

/** Saisons visibles d'un joueur : ouvertes, clôturées, archivées (jamais les brouillons). */
export async function visibleSeasons() {
  return db.season.findMany({ where: { status: { not: "DRAFT" } }, orderBy: { createdAt: "desc" } });
}

export async function publishedRuleSetsForCopy() {
  return db.scoringRuleSet.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ season: { createdAt: "desc" } }, { version: "desc" }],
    include: { season: { select: { slug: true, title: true } } },
  });
}
