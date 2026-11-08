/**
 * Données de démonstration (FR-165) : deux saisons aux barèmes différents, ~20 pseudos, des matchs.
 * Tous les pseudos sont inventés. Idempotent : ne fait rien si une saison existe déjà.
 * Lancement : npm run db:seed (ou automatiquement au démarrage Docker si SEED_DEMO=true).
 *
 * Données de TEST uniquement : l'admin de démo a un mot de passe public. Garde-fous :
 * - refus absolu en production Vercel (VERCEL_ENV=production) ;
 * - refus sur une base distante (Neon…) sauf `--base-de-test` explicite (ex. branche Neon « preview »).
 */
import { PrismaClient, type Prisma } from "@prisma/client";
import { PRESET_2025, PRESET_2026, computeMatchPoints, type Ranking, type RuleSet, rungOf } from "../src/scoring";
import { hashPassword } from "../src/server/auth/password";
import { describeDatabase, isLocalHost, runtimeDatabaseUrl } from "../src/server/db-url";

const rawUrl = process.env.DATABASE_URL ?? "";

/** Raison du refus, ou null si le seed peut tourner sur cette base. */
export function seedRefusal(env: NodeJS.ProcessEnv, url: string, argv: string[]): string | null {
  if (env.VERCEL_ENV === "production") return "VERCEL_ENV=production : le seed de démonstration est interdit en production.";
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return "DATABASE_URL absente ou invalide.";
  }
  if (!isLocalHost(host) && !argv.includes("--base-de-test")) {
    return `Base distante (${describeDatabase(url)}) : relancez avec --base-de-test si, et seulement si, c'est une base de test.`;
  }
  return null;
}

const db = new PrismaClient(rawUrl ? { datasourceUrl: runtimeDatabaseUrl(rawUrl) } : undefined);

export const DEMO_ADMIN = { pseudo: "admin.demo", password: "demo-admin-2026" };
export const DEMO_PLAYER_PASSWORD = "demo-joueur-2026";

const PLAYERS: [string, Ranking, string | null, boolean][] = [
  // pseudo, classement, étiquette, mot de passe temporaire jamais changé
  ["TieBreakeuse", "15/4", "Groupe A", false],
  ["LiftCroisé", "15/5", "Groupe A", false],
  ["SmashTonic", "30", "Groupe A", false],
  ["AceDuMatin", "30/2", "Groupe B", false],
  ["Revers2Feu", "30/1", "Groupe B", false],
  ["PetitPont", "30/3", "Groupe B", false],
  ["AmortiZen", "30/1", "Groupe A", false],
  ["Volée92", "30/4", "Groupe B", false],
  ["TopSpinou", "30/2", "Groupe B", false],
  ["SliceMaster", "30/1", "Groupe A", false],
  ["LobFantôme", "30/3", "Entraînement mercredi", false],
  ["PassingShot", "30/3", "Groupe A", false],
  ["RetourGagnant", "30/2", null, false],
  ["DoubleFaute", "30/4", "Groupe B", false],
  ["BalleNeuve", "40", "Groupe B", false],
  ["CoupDroit", "30/5", "Groupe B", false],
  ["FiletMignon", "40", null, true],
  ["LigneDeFond", "30/5", "Entraînement mercredi", true],
  ["JeuBlanc", "NC", null, true],
  ["Chip&Charge", "40", null, true],
];

// Générateur pseudo-aléatoire déterministe (mulberry32) : la démo est identique à chaque installation.
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WIN_SCORES = ["6/4 6/3", "6/2 6/4", "7/5 6/4", "6/3 3/6 10-7", "6/1 6/2", "7/6 6/4", "4/6 6/4 10-8", "6/4 7/5"];
const EXTERNALS = ["Tournoi des Tilleuls, tableau 13 ans", "Interclubs, TC voisin", "Tournoi des Érables", "Open jeunes des Peupliers", "Tournoi des Charmes 15 ans"];

function invert(score: string) {
  return score
    .split(" ")
    .map((p) => {
      const sep = p.includes("/") ? "/" : "-";
      const [x, y] = p.split(sep);
      return `${y}${sep}${x}`;
    })
    .join(" ");
}

async function seedSeason(opts: {
  slug: string;
  title: string;
  status: "OPEN" | "CLOSED";
  startsOn: string;
  endsOn: string;
  rules: RuleSet;
  players: { id: string; pseudo: string; ranking: Ranking }[];
  validated: number;
  pending: number;
  seed: number;
  adminId: string;
}) {
  const rand = rng(opts.seed);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)] as T;
  const start = new Date(opts.startsOn + "T00:00:00Z").getTime();
  const span = Math.min(Date.now(), new Date(opts.endsOn + "T00:00:00Z").getTime()) - start;

  const season = await db.season.create({
    data: {
      slug: opts.slug,
      title: opts.title,
      status: opts.status,
      startsOn: new Date(opts.startsOn),
      endsOn: new Date(opts.endsOn),
      openedAt: new Date(start),
      closedAt: opts.status === "CLOSED" ? new Date(opts.endsOn) : null,
    },
  });
  const ruleSet = await db.scoringRuleSet.create({
    data: { seasonId: season.id, version: 1, status: "PUBLISHED", publishedAt: new Date(start), rules: opts.rules as unknown as Prisma.InputJsonValue },
  });
  for (const p of opts.players) {
    await db.enrollment.create({ data: { seasonId: season.id, userId: p.id, startingRanking: p.ranking } });
  }

  const makeMatch = async (status: "VALIDATED" | "PENDING") => {
    const a = pick(opts.players);
    const external = rand() < 0.25;
    const b = external ? null : pick(opts.players.filter((p) => p.id !== a.id));
    const rankingB: Ranking = b ? b.ranking : pick<Ranking>(["30/3", "30/2", "30/1", "30", "40", "30/4"]);
    const aStronger = rungOf(a.ranking) >= rungOf(rankingB);
    const aWins = rand() < (aStronger ? 0.68 : 0.38);
    const kind = rand() < 0.04 ? "WALKOVER" : "NORMAL";
    const winScore = pick(WIN_SCORES);
    const score = kind === "WALKOVER" ? null : aWins ? winScore : invert(winScore);
    const playedOn = new Date(start + Math.floor(rand() * span));
    playedOn.setUTCHours(0, 0, 0, 0);
    const match = await db.match.create({
      data: {
        seasonId: season.id,
        playedOn,
        playerAId: a.id,
        playerBId: b?.id ?? null,
        externalLabel: b ? null : pick(EXTERNALS),
        externalRanking: b ? null : rankingB,
        winner: aWins ? "A" : "B",
        score,
        kind,
        status,
        createdById: a.id,
        validatedById: status === "VALIDATED" ? opts.adminId : null,
        validatedAt: status === "VALIDATED" ? new Date(playedOn.getTime() + 86400000) : null,
        rankingA: status === "VALIDATED" ? a.ranking : null,
        rankingB: status === "VALIDATED" ? rankingB : null,
      },
    });
    if (status !== "VALIDATED") return match;
    const sides: [string, Ranking, Ranking, boolean][] = [[a.id, a.ranking, rankingB, aWins]];
    if (b) sides.push([b.id, b.ranking, a.ranking, !aWins]);
    for (const [userId, me, them, won] of sides) {
      const r = computeMatchPoints(opts.rules, { playerRanking: me, opponentRanking: them, result: won ? "WIN" : "LOSS", kind });
      await db.pointsEntry.create({
        data: {
          matchId: match.id,
          userId,
          ruleSetId: ruleSet.id,
          points: r.points,
          gap: r.gap,
          isPerf: r.isPerf,
          won,
          breakdown: r.breakdown as unknown as Prisma.InputJsonValue,
        },
      });
    }
    return match;
  };

  for (let i = 0; i < opts.validated; i++) await makeMatch("VALIDATED");
  for (let i = 0; i < opts.pending; i++) await makeMatch("PENDING");
  return { season, ruleSet };
}

async function main() {
  const refusal = seedRefusal(process.env, rawUrl, process.argv.slice(2));
  if (refusal) {
    console.error("Seed refusé. " + refusal);
    process.exitCode = 1;
    return;
  }
  if ((await db.season.count()) > 0) {
    console.log("Seed ignoré : des saisons existent déjà.");
    return;
  }
  const adminHash = await hashPassword(DEMO_ADMIN.password);
  const admin = await db.user.upsert({
    where: { pseudoKey: DEMO_ADMIN.pseudo },
    create: { pseudo: DEMO_ADMIN.pseudo, pseudoKey: DEMO_ADMIN.pseudo, passwordHash: adminHash, role: "ADMIN", mustChangePassword: false },
    update: {},
  });

  const playerHash = await hashPassword(DEMO_PLAYER_PASSWORD);
  const tempHash = await hashPassword("temporaire-" + Math.random());
  const users: { id: string; pseudo: string; ranking: Ranking }[] = [];
  for (const [pseudo, ranking, tag, temporary] of PLAYERS) {
    const u = await db.user.create({
      data: {
        pseudo,
        pseudoKey: pseudo.toLocaleLowerCase("fr"),
        passwordHash: temporary ? tempHash : playerHash,
        ranking,
        mustChangePassword: temporary,
        passwordChangedAt: temporary ? null : new Date(),
      },
    });
    await db.rankingChange.create({ data: { userId: u.id, from: null, to: ranking, changedById: admin.id, effectiveAt: new Date("2025-09-01") } });
    if (tag) {
      const t = await db.tag.upsert({ where: { name: tag }, create: { name: tag }, update: {} });
      await db.userTag.create({ data: { userId: u.id, tagId: t.id } });
    }
    users.push({ id: u.id, pseudo, ranking });
  }

  // Saison passée : barème 2025 (NC = échelon propre, forfait 3 pts, sans plafond ni bonus).
  // Classements de départ un cran en dessous (les joueurs ont progressé depuis).
  const lastYear = users.slice(0, 16).map((u) => ({ ...u, ranking: (["NC", "40", "30/5", "30/4", "30/3", "30/2", "30/1", "30", "15/5", "15/4"] as Ranking[])[Math.max(0, rungOf(u.ranking) - 1)] ?? u.ranking }));
  await seedSeason({
    slug: "race-jeunes-2025-26",
    title: "Race jeunes 2025-2026",
    status: "CLOSED",
    startsOn: "2025-09-15",
    endsOn: "2026-06-30",
    rules: PRESET_2025,
    players: lastYear,
    validated: 70,
    pending: 0,
    seed: 2025,
    adminId: admin.id,
  });

  // Saison en cours : barème 2026 (NC = 40, plafond 60, bonus d'assiduité).
  const current = users.slice(0, 18);
  const { season } = await seedSeason({
    slug: "race-jeunes-2026-27",
    title: "Race jeunes 2026-2027",
    status: "OPEN",
    startsOn: "2026-09-14",
    endsOn: "2027-06-30",
    rules: PRESET_2026,
    players: current,
    validated: 48,
    pending: 4,
    seed: 2026,
    adminId: admin.id,
  });

  // Un refus et une annulation pour illustrer les statuts.
  const [ace, lift, amorti] = [users[3]!, users[1]!, users[6]!];
  await db.match.create({
    data: { seasonId: season.id, playedOn: new Date("2026-10-18"), playerAId: ace.id, playerBId: lift.id, winner: "B", score: "4/6 6/7", status: "REFUSED", refusalReason: "Score incomplet, à ressaisir", createdById: ace.id },
  });
  await db.match.create({
    data: { seasonId: season.id, playedOn: new Date("2026-10-15"), playerAId: ace.id, playerBId: amorti.id, winner: "A", score: "6/2", status: "CANCELLED", createdById: ace.id },
  }).catch(() => undefined);

  // Saison brouillon dont le barème est dupliqué de la saison en cours.
  const draft = await db.season.create({ data: { slug: "race-printemps-2027", title: "Race de printemps 2027", startsOn: new Date("2027-03-01"), endsOn: new Date("2027-06-30") } });
  await db.scoringRuleSet.create({
    data: { seasonId: draft.id, version: 1, status: "PUBLISHED", publishedAt: new Date(), rules: PRESET_2026 as unknown as Prisma.InputJsonValue },
  });

  await db.auditLog.createMany({
    data: [
      { actorId: admin.id, actorPseudo: admin.pseudo, type: "Saison", action: "Saison ouverte", target: "race-jeunes-2026-27", at: new Date("2026-09-14T09:00:00Z") },
      { actorId: admin.id, actorPseudo: admin.pseudo, type: "Import", action: "Import CSV", target: "20 lignes", details: { created: 20 }, at: new Date("2026-09-10T18:00:00Z") },
      { actorId: admin.id, actorPseudo: admin.pseudo, type: "Saison", action: "Saison clôturée", target: "race-jeunes-2025-26", at: new Date("2026-07-01T10:00:00Z") },
    ],
  });
  console.log(`Démo prête : admin « ${DEMO_ADMIN.pseudo} », joueurs (ex. « AceDuMatin »).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
