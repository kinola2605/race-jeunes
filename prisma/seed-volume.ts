/**
 * Jeu de données volumineux et FICTIF : 4 saisons, 64 joueurs, environ 1 400 matchs aux scores réalistes
 * (tie-breaks, troisièmes sets, super tie-breaks, abandons, forfaits, tournois).
 *
 *   npm run db:seed:volume                                              base locale
 *   npm run db:seed:volume -- --env-file <fichier-env> --base-distante  base distante (Neon…)
 *   npm run db:seed:volume -- [mêmes options] --purge                   retire tout ce que ce script a créé
 *
 * - Ajout seul : ne modifie ni ne supprime aucune donnée existante. Ne fait rien si le jeu est déjà présent.
 * - Tout est repérable, donc purgeable : saisons au slug « demo-… » (titre « Démo · … »), joueurs portant
 *   l'étiquette « Jeu de données ».
 * - Tous les pseudos sont inventés (constitution III). Les comptes créés ont un mot de passe aléatoire que
 *   personne ne connaît : pour se connecter avec l'un d'eux, l'admin réinitialise son mot de passe.
 * - Un compte admin doit exister (npm run bootstrap-admin ou npm run db:seed).
 */
import { randomBytes, randomUUID } from "node:crypto";
import { PrismaClient, type Prisma } from "@prisma/client";
import { LADDER, PRESET_2025, PRESET_2026, computeMatchPoints, parseScore, rungOf, type Ranking, type RuleSet } from "../src/scoring";
import { AVATAR_COLORS, AVATAR_ICONS } from "../src/avatar/avatar";
import { hashPassword } from "../src/server/auth/password";
import { describeDatabase, isLocalHost, runtimeDatabaseUrl } from "../src/server/db-url";
import { loadEnvFileOverride } from "../scripts/env-file";

const argv = process.argv.slice(2);
const envFileIndex = argv.indexOf("--env-file");
if (envFileIndex >= 0 && argv[envFileIndex + 1]) loadEnvFileOverride(argv[envFileIndex + 1]!);
const rawUrl = process.env.DATABASE_URL ?? "";

export const VOLUME_TAG = "Jeu de données";
export const VOLUME_SLUG_PREFIX = "demo-";

function refusal(): string | null {
  let host: string;
  try {
    host = new URL(rawUrl).hostname;
  } catch {
    return "DATABASE_URL absente ou invalide.";
  }
  if (!isLocalHost(host) && !argv.includes("--base-distante")) {
    return `Base distante (${describeDatabase(rawUrl)}) : relancez avec --base-distante pour confirmer la cible.`;
  }
  return null;
}

const db = new PrismaClient(rawUrl ? { datasourceUrl: runtimeDatabaseUrl(rawUrl) } : undefined);

// Générateur déterministe (mulberry32) : le jeu est identique d'une base à l'autre.
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ["Lob", "Smash", "Ace", "Slice", "Lift", "Volée", "Amorti", "Passing", "Revers", "Service", "Balle", "Filet", "Court", "Set", "Break", "Chop"];
const SECOND = ["Express", "Éclair", "Royal", "Turbo", "Zen", "Magique", "Canon", "Fusée", "Malin", "Soleil", "Tornade", "Pirate", "Ninja", "Comète", "Mistral", "Tempo"];
const GROUPS = ["Démo · Groupe A", "Démo · Groupe B", "Démo · Compétition", "Démo · École de tennis"];
const TOURNAMENTS = ["Open jeunes des Coteaux", "Tournoi de la Toussaint", "Tournoi d'hiver du Parc", "Open de printemps", "Tournoi des Petits As du coin", "Tournoi de Pâques", "Grand Prix jeunes", "Tournoi d'été"];
const EXTERNALS = ["Interclubs, club voisin", "Match amical, club voisin", "Championnat départemental", "Rencontre par équipes"];

interface Player {
  id: string;
  pseudo: string;
  /** échelon cette saison (2026-27) */
  rung: number;
  /** forme du joueur, indépendante du classement */
  form: number;
  /** sang-froid : pèse sur les tie-breaks et les sets décisifs */
  clutch: number;
  /** envie de jouer (poids dans le tirage des matchs) */
  activity: number;
  /** première saison du jeu où le joueur est engagé (0 à 3) */
  since: number;
}

interface SeasonPlan {
  slug: string;
  title: string;
  status: "ARCHIVED" | "CLOSED" | "OPEN";
  startsOn: string;
  endsOn: string;
  rules: RuleSet;
  validated: number;
  pending: number;
  refused: number;
  cancelled: number;
}

const SEASONS: SeasonPlan[] = [
  { slug: "demo-race-2023-24", title: "Démo · Race jeunes 2023-2024", status: "ARCHIVED", startsOn: "2023-09-18", endsOn: "2024-06-30", rules: PRESET_2025, validated: 300, pending: 0, refused: 3, cancelled: 2 },
  { slug: "demo-race-2024-25", title: "Démo · Race jeunes 2024-2025", status: "ARCHIVED", startsOn: "2024-09-16", endsOn: "2025-06-30", rules: PRESET_2025, validated: 360, pending: 0, refused: 4, cancelled: 2 },
  { slug: "demo-race-2025-26", title: "Démo · Race jeunes 2025-2026", status: "CLOSED", startsOn: "2025-09-15", endsOn: "2026-06-30", rules: PRESET_2026, validated: 420, pending: 0, refused: 4, cancelled: 3 },
  { slug: "demo-race-2026-27", title: "Démo · Race jeunes 2026-2027", status: "OPEN", startsOn: "2026-09-14", endsOn: "2027-06-30", rules: PRESET_2026, validated: 260, pending: 16, refused: 4, cancelled: 2 },
];

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

/** Score vu du côté A : sets joués, vainqueur, et nature du match. */
function playMatch(rand: () => number, edge: number, clutch: number) {
  const pSet = clamp(sigmoid(edge), 0.06, 0.94);
  const roll = rand();
  if (roll < 0.03) return { kind: "WALKOVER" as const, score: null, aWins: rand() < pSet };

  const weighted = <T,>(items: [T, number][]): T => {
    let x = rand() * items.reduce((s, [, w]) => s + w, 0);
    for (const [item, w] of items) if ((x -= w) < 0) return item;
    return items[items.length - 1]![0];
  };
  const set = (): [number, number] => {
    // plus les joueurs sont proches, plus le set est serré
    const tight = 1 - Math.abs(pSet - 0.5) * 2;
    const shape = weighted<[number, number]>([
      [[6, 0], 3 + 6 * (1 - tight)],
      [[6, 1], 7 + 6 * (1 - tight)],
      [[6, 2], 14],
      [[6, 3], 20],
      [[6, 4], 20 + 6 * tight],
      [[7, 5], 6 + 10 * tight],
      [[7, 6], 6 + 14 * tight],
    ]);
    const aTakesIt = shape[1] === 6 ? rand() < clamp(0.5 + (pSet - 0.5) * 0.5 + clutch, 0.08, 0.92) : rand() < pSet;
    return aTakesIt ? shape : [shape[1], shape[0]];
  };

  const sets: [number, number][] = [set()];
  const retirement = roll < 0.05;
  if (retirement && rand() < 0.5) return { kind: "RETIREMENT" as const, score: fmt(sets, false), aWins: sets[0]![0] > sets[0]![1] ? rand() < 0.75 : rand() < 0.25 };
  sets.push(set());
  const aSets = sets.filter(([a, b]) => a > b).length;
  if (aSets !== 1) return { kind: retirement ? ("RETIREMENT" as const) : ("NORMAL" as const), score: fmt(sets, false), aWins: aSets === 2 };
  if (retirement) return { kind: "RETIREMENT" as const, score: fmt(sets, false), aWins: rand() < pSet };

  // un set partout : set décisif, le plus souvent en super tie-break
  const aTakesDecider = rand() < clamp(0.5 + (pSet - 0.5) * 0.6 + clutch, 0.08, 0.92);
  if (rand() < 0.65) {
    const loser = weighted<number>([[3, 4], [4, 6], [5, 9], [6, 12], [7, 14], [8, 16]]);
    const tb: [number, number] = rand() < 0.12 ? [12, 10] : [10, loser];
    sets.push(aTakesDecider ? tb : [tb[1], tb[0]]);
    return { kind: "NORMAL" as const, score: fmt(sets, true), aWins: aTakesDecider };
  }
  const third = weighted<[number, number]>([[[6, 2], 10], [[6, 3], 20], [[6, 4], 30], [[7, 5], 20], [[7, 6], 20]]);
  sets.push(aTakesDecider ? third : [third[1], third[0]]);
  return { kind: "NORMAL" as const, score: fmt(sets, false), aWins: aTakesDecider };
}

function fmt(sets: [number, number][], superTieBreak: boolean): string {
  const score = sets.map(([a, b], i) => (superTieBreak && i === 2 ? `${a}-${b}` : `${a}/${b}`)).join(" ");
  const parsed = parseScore(score);
  if (!parsed.ok || parsed.normalized !== score) throw new Error(`Score généré invalide : ${score}`);
  return score;
}

async function inBatches<T>(rows: T[], size: number, write: (batch: T[]) => Promise<unknown>) {
  for (let i = 0; i < rows.length; i += size) await write(rows.slice(i, i + size));
}

async function purge() {
  const seasons = await db.season.findMany({ where: { slug: { startsWith: VOLUME_SLUG_PREFIX } }, select: { id: true } });
  const users = await db.user.findMany({ where: { tags: { some: { tag: { name: VOLUME_TAG } } } }, select: { id: true } });
  const userIds = users.map((u) => u.id);
  const seasonIds = seasons.map((s) => s.id);
  // Les matchs des saisons « demo- », et ceux qu'un joueur fictif aurait joués ailleurs depuis l'injection.
  const ofVolume: Prisma.MatchWhereInput = { OR: [{ seasonId: { in: seasonIds } }, { playerAId: { in: userIds } }, { playerBId: { in: userIds } }] };
  // L'ordre suit les clés étrangères : points, matchs, engagements, saisons (barèmes en cascade), comptes.
  const [, matches, , seasonsGone, usersGone] = await db.$transaction([
    db.pointsEntry.deleteMany({ where: { match: ofVolume } }),
    db.match.deleteMany({ where: ofVolume }),
    db.enrollment.deleteMany({ where: { OR: [{ seasonId: { in: seasonIds } }, { userId: { in: userIds } }] } }),
    db.season.deleteMany({ where: { id: { in: seasonIds } } }),
    db.user.deleteMany({ where: { id: { in: userIds } } }),
    db.tag.deleteMany({ where: { OR: [{ name: VOLUME_TAG }, { name: { in: GROUPS } }] } }),
  ]);
  console.log(`Purge : ${seasonsGone.count} saisons, ${usersGone.count} joueurs et ${matches.count} matchs retirés.`);
}

async function main() {
  const refused = refusal();
  if (refused) {
    console.error("Refusé. " + refused);
    process.exitCode = 1;
    return;
  }
  console.log(`Base : ${describeDatabase(rawUrl)}`);
  if (argv.includes("--purge")) return purge();

  if ((await db.season.count({ where: { slug: { startsWith: VOLUME_SLUG_PREFIX } } })) > 0) {
    console.log("Jeu de données déjà présent : rien à faire (--purge pour le retirer).");
    return;
  }
  const admin = await db.user.findFirst({ where: { role: "ADMIN", status: "ACTIVE" }, orderBy: { createdAt: "asc" } });
  if (!admin) {
    console.error("Aucun compte admin : lancez d'abord npm run bootstrap-admin (ou npm run db:seed).");
    process.exitCode = 1;
    return;
  }

  const rand = rng(20261114);
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)] as T;
  const today = new Date();

  // ── Joueurs ────────────────────────────────────────────────────────────────
  const taken = new Set((await db.user.findMany({ select: { pseudoKey: true } })).map((u) => u.pseudoKey));
  const passwordHash = await hashPassword(randomBytes(24).toString("base64url"));
  const icons = Object.keys(AVATAR_ICONS);
  const colors = Object.keys(AVATAR_COLORS);
  const players: Player[] = [];
  const userRows: Prisma.UserCreateManyInput[] = [];
  while (players.length < 64) {
    const pseudo = `${pick(FIRST)}${pick(SECOND)}`;
    const pseudoKey = pseudo.toLocaleLowerCase("fr");
    if (taken.has(pseudoKey) || pseudo.length > 20) continue;
    taken.add(pseudoKey);
    // du 40 au 15/1, avec une majorité de quatrième série
    const rung = clamp(Math.round(1 + rand() * 4 + rand() * 4 + rand() * 3.5), 1, rungOf("15/1"));
    const player: Player = {
      id: randomUUID(),
      pseudo,
      rung,
      form: (rand() - 0.5) * 0.9,
      clutch: (rand() - 0.5) * 0.44,
      activity: 0.4 + rand() * rand() * 3,
      since: pick([0, 0, 0, 0, 0, 1, 1, 2, 2, 3]),
    };
    players.push(player);
    userRows.push({
      id: player.id,
      pseudo,
      pseudoKey,
      passwordHash,
      ranking: LADDER[rung]!,
      avatar: rand() < 0.7 ? `${pick(icons)}:${pick(colors)}` : null,
      mustChangePassword: false,
      passwordChangedAt: today,
    });
  }
  await db.user.createMany({ data: userRows });

  const tagIds = new Map<string, string>();
  for (const name of [VOLUME_TAG, ...GROUPS]) tagIds.set(name, (await db.tag.upsert({ where: { name }, create: { name }, update: {} })).id);
  await db.userTag.createMany({
    data: players.flatMap((p, i) => [
      { userId: p.id, tagId: tagIds.get(VOLUME_TAG)! },
      { userId: p.id, tagId: tagIds.get(GROUPS[i % GROUPS.length]!)! },
    ]),
  });

  // ── Saisons ────────────────────────────────────────────────────────────────
  let matchTotal = 0;
  const rankingRows: Prisma.RankingChangeCreateManyInput[] = [];
  for (const [index, plan] of SEASONS.entries()) {
    const start = new Date(plan.startsOn + "T00:00:00Z");
    const end = new Date(plan.endsOn + "T00:00:00Z");
    const span = Math.min(today.getTime(), end.getTime()) - start.getTime();
    const closed = plan.status !== "OPEN";
    const season = await db.season.create({
      data: {
        slug: plan.slug,
        title: plan.title,
        status: plan.status,
        startsOn: start,
        endsOn: end,
        openedAt: start,
        closedAt: closed ? end : null,
        // les saisons passées sont antidatées ; la saison ouverte devient la saison par défaut de l'admin
        createdAt: closed ? start : today,
      },
    });
    const ruleSet = await db.scoringRuleSet.create({
      data: { seasonId: season.id, version: 1, status: "PUBLISHED", publishedAt: start, rules: plan.rules as unknown as Prisma.InputJsonValue },
    });

    // classement de départ : un échelon de moins par saison d'ancienneté, sauf stagnation
    const enrolled = players
      .filter((p) => p.since <= index)
      .map((p) => {
        let rung = p.rung;
        for (let back = SEASONS.length - 1; back > index; back--) if (rng(p.rung * 97 + back * 13 + p.pseudo.length)() < 0.75) rung -= 1;
        return { ...p, rung: Math.max(0, rung) };
      });
    await db.enrollment.createMany({
      data: enrolled.map((p) => ({ seasonId: season.id, userId: p.id, startingRanking: LADDER[p.rung]!, matchGoal: plan.status === "OPEN" && rand() < 0.6 ? pick([8, 10, 12, 15, 20]) : null, createdAt: start })),
    });
    for (const p of enrolled) {
      const previous = rankingRows.findLast((r) => r.userId === p.id);
      if (previous?.to !== LADDER[p.rung]) rankingRows.push({ userId: p.id, from: previous?.to ?? null, to: LADDER[p.rung]!, effectiveAt: start, changedById: admin.id });
    }

    const totalActivity = enrolled.reduce((s, p) => s + p.activity, 0);
    const drawPlayer = () => {
      let x = rand() * totalActivity;
      for (const p of enrolled) if ((x -= p.activity) < 0) return p;
      return enrolled[enrolled.length - 1]!;
    };

    const matchRows: Prisma.MatchCreateManyInput[] = [];
    const entryRows: Prisma.PointsEntryCreateManyInput[] = [];
    const make = (status: "VALIDATED" | "PENDING" | "REFUSED" | "CANCELLED") => {
      const a = drawPlayer();
      const external = rand() < 0.3;
      // adversaire du club : le plus proche au classement parmi quelques candidats
      const b = external
        ? null
        : Array.from({ length: 4 }, drawPlayer)
            .filter((p) => p.id !== a.id)
            .sort((x, y) => Math.abs(x.rung - a.rung) - Math.abs(y.rung - a.rung))[0] ?? null;
      const oppRung = b ? b.rung : clamp(a.rung + Math.round((rand() - 0.45) * 6), 0, rungOf("15"));
      const rankingA = LADDER[a.rung]!;
      const rankingB = LADDER[oppRung]!;
      const edge = 0.5 * (a.rung - oppRung) + a.form - (b?.form ?? 0);
      const played = playMatch(rand, edge, a.clutch - (b?.clutch ?? 0));
      const playedOn = new Date(start.getTime() + Math.floor(rand() * span));
      playedOn.setUTCHours(0, 0, 0, 0);
      const validated = status === "VALIDATED";
      const id = randomUUID();
      matchRows.push({
        id,
        seasonId: season.id,
        playedOn,
        playerAId: a.id,
        playerBId: b?.id ?? null,
        externalLabel: b ? null : pick(EXTERNALS),
        externalRanking: b ? null : rankingB,
        winner: played.aWins ? "A" : "B",
        score: played.score,
        kind: played.kind,
        tournament: !b && rand() < 0.6 ? pick(TOURNAMENTS) : null,
        status,
        refusalReason: status === "REFUSED" ? pick(["Score incomplet, à ressaisir", "Match déjà déclaré par l'adversaire", "Date à vérifier"]) : null,
        createdById: a.id,
        validatedById: validated ? admin.id : null,
        validatedAt: validated ? new Date(playedOn.getTime() + (1 + Math.floor(rand() * 3)) * 86400000) : null,
        rankingA: validated ? rankingA : null,
        rankingB: validated ? rankingB : null,
        createdAt: playedOn,
      });
      if (!validated) return;
      const sides: [string, Ranking, Ranking, boolean][] = [[a.id, rankingA, rankingB, played.aWins]];
      if (b) sides.push([b.id, rankingB, rankingA, !played.aWins]);
      for (const [userId, me, them, won] of sides) {
        const r = computeMatchPoints(plan.rules, { playerRanking: me, opponentRanking: them, result: won ? "WIN" : "LOSS", kind: played.kind });
        entryRows.push({ matchId: id, userId, ruleSetId: ruleSet.id, points: r.points, gap: r.gap, isPerf: r.isPerf, won, breakdown: r.breakdown as unknown as Prisma.InputJsonValue });
      }
    };
    for (let i = 0; i < plan.validated; i++) make("VALIDATED");
    for (let i = 0; i < plan.pending; i++) make("PENDING");
    for (let i = 0; i < plan.refused; i++) make("REFUSED");
    for (let i = 0; i < plan.cancelled; i++) make("CANCELLED");

    await inBatches(matchRows, 200, (batch) => db.match.createMany({ data: batch }));
    await inBatches(entryRows, 200, (batch) => db.pointsEntry.createMany({ data: batch }));
    matchTotal += matchRows.length;
    console.log(`  ${plan.title} : ${enrolled.length} engagés, ${matchRows.length} matchs.`);
  }
  await db.rankingChange.createMany({ data: rankingRows });
  await db.auditLog.create({
    data: { actorId: admin.id, actorPseudo: admin.pseudo, type: "Import", action: "Jeu de données de démonstration injecté", target: `${SEASONS.length} saisons`, details: { joueurs: players.length, matchs: matchTotal } },
  });
  console.log(`Jeu de données prêt : ${SEASONS.length} saisons, ${players.length} joueurs, ${matchTotal} matchs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
