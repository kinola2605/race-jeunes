import "server-only";
import type { AccountStatus, Prisma } from "@prisma/client";
import { isRanking, type Ranking } from "@/scoring";
import { burnPasswordCheck, checkNewPassword, generateTemporaryPassword, hashPassword, verifyPassword } from "@/server/auth/password";
import { clearFailures, isLocked, recordFailure, throttleKey } from "@/server/auth/throttle";
import { SYSTEM_ACTOR, UserError, assertAdmin, audit, db, type Actor, type Tx } from "./common";
import { parseCsv } from "./csv";

export const PSEUDO_RE = /^[\p{L}\p{N}_.&-]{3,20}$/u;

export function normalizePseudo(pseudo: string): { pseudo: string; key: string } {
  const p = pseudo.trim().normalize("NFC");
  if (!PSEUDO_RE.test(p)) {
    throw new UserError("Pseudo invalide : 3 à 20 caractères (lettres, chiffres, _ . - &).");
  }
  return { pseudo: p, key: p.toLocaleLowerCase("fr") };
}

function ensureRanking(value: string): Ranking {
  if (!isRanking(value)) throw new UserError(`Classement inconnu : « ${value} ».`);
  return value;
}

async function setTags(tx: Tx, userId: string, tagNames: string[]): Promise<void> {
  await tx.userTag.deleteMany({ where: { userId } });
  for (const raw of tagNames) {
    const name = raw.trim();
    if (!name) continue;
    if (name.length > 40) throw new UserError("Étiquette trop longue (40 caractères maximum).");
    const tag = await tx.tag.upsert({ where: { name }, create: { name }, update: {} });
    await tx.userTag.create({ data: { userId, tagId: tag.id } });
  }
}

// ---------------------------------------------------------------- authentification

export type LoginResult = { ok: true; userId: string } | { ok: false; error: string };
export const GENERIC_LOGIN_ERROR = "Pseudo ou mot de passe incorrect.";
export const LOCKED_LOGIN_ERROR = "Trop de tentatives. Réessayez dans 15 minutes.";

/** FR-001, FR-003, FR-004 : message identique, verrouillage temporaire. */
export async function authenticate(pseudoInput: string, password: string, ip: string): Promise<LoginResult> {
  const key = pseudoInput.trim().toLocaleLowerCase("fr");
  const keys = [throttleKey("pseudo", key), throttleKey("ip", ip)];
  if (await isLocked(keys)) return { ok: false, error: LOCKED_LOGIN_ERROR };

  const user = key ? await db.user.findUnique({ where: { pseudoKey: key } }) : null;
  const valid = user ? await verifyPassword(user.passwordHash, password) : (await burnPasswordCheck(password), false);

  if (!user || !valid) {
    const lockedNow = await recordFailure(keys);
    if (lockedNow) await audit(db, SYSTEM_ACTOR, "Sécurité", "Verrouillage temporaire", "connexion", { minutes: 15 });
    return { ok: false, error: GENERIC_LOGIN_ERROR };
  }
  await clearFailures(keys);
  if (user.status !== "ACTIVE") return { ok: false, error: "Ce compte est désactivé. Adressez-vous au club." };
  return { ok: true, userId: user.id };
}

/** FR-005 à FR-007. */
export async function changeOwnPassword(userId: string, current: string, next: string, confirm: string): Promise<void> {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  if (!(await verifyPassword(user.passwordHash, current))) throw new UserError("Le mot de passe actuel est incorrect.");
  if (next !== confirm) throw new UserError("Les deux mots de passe ne correspondent pas.");
  const check = checkNewPassword(user.pseudo, current, next);
  if (!check.ok) throw new UserError(check.error);
  await db.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(next), mustChangePassword: false, passwordChangedAt: new Date() },
  });
}

// ---------------------------------------------------------------- gestion des comptes (admin)

export interface CreatePlayerInput {
  pseudo: string;
  ranking: string;
  tags: string[];
  enrollSeasonId?: string | null;
}

/** FR-020, FR-021 : le mot de passe temporaire est renvoyé une seule fois et jamais stocké en clair. */
export async function createPlayer(actor: Actor, input: CreatePlayerInput): Promise<{ id: string; pseudo: string; password: string }> {
  assertAdmin(actor);
  const { pseudo, key } = normalizePseudo(input.pseudo);
  const ranking = ensureRanking(input.ranking);
  const password = generateTemporaryPassword();
  const passwordHash = await hashPassword(password);

  const user = await db.$transaction(async (tx) => {
    if (await tx.user.findUnique({ where: { pseudoKey: key } })) throw new UserError("Ce pseudo est déjà utilisé.");
    const created = await tx.user.create({
      data: { pseudo, pseudoKey: key, passwordHash, role: "PLAYER", ranking, mustChangePassword: true },
    });
    await tx.rankingChange.create({ data: { userId: created.id, from: null, to: ranking, changedById: actor.id } });
    await setTags(tx, created.id, input.tags);
    if (input.enrollSeasonId) {
      const season = await tx.season.findUnique({ where: { id: input.enrollSeasonId } });
      if (!season || !["DRAFT", "OPEN"].includes(season.status)) throw new UserError("Saison non disponible pour l'engagement.");
      await tx.enrollment.create({ data: { seasonId: season.id, userId: created.id, startingRanking: ranking } });
    }
    await audit(tx, actor, "Compte", "Compte créé", pseudo, { ranking, tags: input.tags, enrolled: Boolean(input.enrollSeasonId) });
    return created;
  });
  return { id: user.id, pseudo: user.pseudo, password };
}

/** FR-024 */
export async function resetPassword(actor: Actor, userId: string): Promise<{ pseudo: string; password: string }> {
  assertAdmin(actor);
  const password = generateTemporaryPassword();
  const user = await db.$transaction(async (tx) => {
    const u = await tx.user.update({
      where: { id: userId },
      data: { passwordHash: await hashPassword(password), mustChangePassword: true },
    });
    await tx.session.deleteMany({ where: { userId } });
    await audit(tx, actor, "Compte", "Mot de passe réinitialisé", u.pseudo);
    return u;
  });
  return { pseudo: user.pseudo, password };
}

/** FR-025 : désactivation = révocation immédiate des sessions ; jamais de suppression. */
export async function setAccountStatus(actor: Actor, userId: string, status: AccountStatus): Promise<void> {
  assertAdmin(actor);
  if (userId === actor.id && status === "DISABLED") throw new UserError("Vous ne pouvez pas désactiver votre propre compte.");
  await db.$transaction(async (tx) => {
    const u = await tx.user.update({ where: { id: userId }, data: { status } });
    if (status === "DISABLED") await tx.session.deleteMany({ where: { userId } });
    await audit(tx, actor, "Compte", status === "DISABLED" ? "Compte désactivé" : "Compte réactivé", u.pseudo);
  });
}

/** FR-023 */
export async function updatePlayer(actor: Actor, userId: string, input: { pseudo: string; ranking: string; tags: string[] }): Promise<void> {
  assertAdmin(actor);
  const { pseudo, key } = normalizePseudo(input.pseudo);
  const ranking = ensureRanking(input.ranking);
  await db.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    if (key !== user.pseudoKey && (await tx.user.findUnique({ where: { pseudoKey: key } }))) {
      throw new UserError("Ce pseudo est déjà utilisé.");
    }
    await tx.user.update({ where: { id: userId }, data: { pseudo, pseudoKey: key, ranking } });
    if (user.ranking !== ranking) {
      await tx.rankingChange.create({ data: { userId, from: user.ranking, to: ranking, changedById: actor.id } });
    }
    await setTags(tx, userId, input.tags);
    const changes: Prisma.InputJsonObject = {
      ...(user.pseudo !== pseudo ? { pseudo: [user.pseudo, pseudo] } : {}),
      ...(user.ranking !== ranking ? { ranking: [user.ranking, ranking] } : {}),
      tags: input.tags,
    };
    await audit(tx, actor, "Compte", "Compte modifié", pseudo, changes);
  });
}

// ---------------------------------------------------------------- import CSV (FR-026)

export interface ImportReport {
  created: { line: number; pseudo: string; password: string }[];
  updated: { line: number; pseudo: string; from: string | null; to: string }[];
  ignored: { line: number; pseudo: string; reason: string }[];
  errors: { line: number; pseudo: string; reason: string }[];
}

export async function importPlayersCsv(
  actor: Actor,
  text: string,
  options: { onExisting: "ignore" | "update"; enrollSeasonId?: string | null },
): Promise<ImportReport> {
  assertAdmin(actor);
  const rows = parseCsv(text);
  const header = rows.shift()?.map((h) => h.trim().toLowerCase());
  if (!header || header.length !== 2 || header[0] !== "pseudo" || header[1] !== "classement") {
    throw new UserError("En-tête attendu : « pseudo;classement » (deux colonnes uniquement, aucune donnée personnelle).");
  }
  if (rows.length > 500) throw new UserError("500 lignes au maximum par import.");

  const report: ImportReport = { created: [], updated: [], ignored: [], errors: [] };
  const seen = new Set<string>();
  for (const [index, row] of rows.entries()) {
    const line = index + 2;
    if (row.every((c) => c.trim() === "")) continue;
    const [rawPseudo = "", rawRanking = ""] = row;
    if (row.length !== 2) {
      report.errors.push({ line, pseudo: rawPseudo, reason: "Nombre de colonnes incorrect." });
      continue;
    }
    let norm: { pseudo: string; key: string };
    try {
      norm = normalizePseudo(rawPseudo);
    } catch (e) {
      report.errors.push({ line, pseudo: rawPseudo, reason: (e as Error).message });
      continue;
    }
    const ranking = rawRanking.trim();
    if (!isRanking(ranking)) {
      report.errors.push({ line, pseudo: norm.pseudo, reason: `Classement « ${ranking} » invalide.` });
      continue;
    }
    if (seen.has(norm.key)) {
      report.ignored.push({ line, pseudo: norm.pseudo, reason: "Pseudo en double dans le fichier." });
      continue;
    }
    seen.add(norm.key);
    const existing = await db.user.findUnique({ where: { pseudoKey: norm.key } });
    if (existing) {
      if (options.onExisting === "update" && existing.ranking !== ranking) {
        await db.$transaction(async (tx) => {
          await tx.user.update({ where: { id: existing.id }, data: { ranking } });
          await tx.rankingChange.create({ data: { userId: existing.id, from: existing.ranking, to: ranking, changedById: actor.id } });
        });
        report.updated.push({ line, pseudo: existing.pseudo, from: existing.ranking, to: ranking });
      } else {
        report.ignored.push({ line, pseudo: existing.pseudo, reason: "Pseudo existant." });
      }
      continue;
    }
    const created = await createPlayerSilently(actor, norm, ranking, options.enrollSeasonId ?? null);
    report.created.push({ line, pseudo: created.pseudo, password: created.password });
  }
  await audit(db, actor, "Import", "Import CSV", `${rows.length} lignes`, {
    created: report.created.length,
    updated: report.updated.length,
    ignored: report.ignored.length,
    errors: report.errors.length,
  });
  return report;
}

async function createPlayerSilently(actor: Actor, norm: { pseudo: string; key: string }, ranking: Ranking, seasonId: string | null) {
  const password = generateTemporaryPassword();
  const passwordHash = await hashPassword(password);
  const user = await db.$transaction(async (tx) => {
    const u = await tx.user.create({ data: { pseudo: norm.pseudo, pseudoKey: norm.key, passwordHash, ranking, mustChangePassword: true } });
    await tx.rankingChange.create({ data: { userId: u.id, from: null, to: ranking, changedById: actor.id } });
    if (seasonId) await tx.enrollment.create({ data: { seasonId, userId: u.id, startingRanking: ranking } });
    return u;
  });
  return { pseudo: user.pseudo, password };
}

// ---------------------------------------------------------------- lecture

export type AccountFilter = "active" | "disabled" | "temporary" | "all";

export async function listAccounts(opts: { q?: string; filter?: AccountFilter; tag?: string }) {
  const where: Prisma.UserWhereInput = { role: "PLAYER" };
  if (opts.q) where.pseudoKey = { contains: opts.q.toLocaleLowerCase("fr") };
  if (opts.filter === "active") where.status = "ACTIVE";
  if (opts.filter === "disabled") where.status = "DISABLED";
  if (opts.filter === "temporary") Object.assign(where, { status: "ACTIVE", mustChangePassword: true });
  if (opts.tag) where.tags = { some: { tag: { name: opts.tag } } };
  return db.user.findMany({
    where,
    orderBy: { pseudoKey: "asc" },
    include: { tags: { include: { tag: true } }, _count: { select: { enrollments: true } } },
  });
}

export async function accountCounts() {
  const [active, disabled, temporary] = await Promise.all([
    db.user.count({ where: { role: "PLAYER", status: "ACTIVE" } }),
    db.user.count({ where: { role: "PLAYER", status: "DISABLED" } }),
    db.user.count({ where: { role: "PLAYER", status: "ACTIVE", mustChangePassword: true } }),
  ]);
  return { active, disabled, temporary, total: active + disabled };
}

export async function listTags() {
  return db.tag.findMany({ orderBy: { name: "asc" } });
}
