import "server-only";
import { cache } from "react";
import {
  COLOR_KEYS,
  COLOR_LABELS,
  checkColor,
  normalizeHex,
  type ColorKey,
  type ColorSet,
} from "@/appearance/colors";
import { checkLogo } from "@/appearance/logo";
import { UserError, assertAdmin, audit, db, type Actor } from "./common";

const ID = "club";
const NO_COLORS: ColorSet = { accentDark: null, actionDark: null, accentLight: null, actionLight: null };

export type Appearance = {
  logoVersion: number | null;
  logoType: string | null;
  colors: ColorSet;
  /** spec 016 : nom et sigle saisis à l'installation ou dans Apparence (null : variables d'environnement) */
  clubName: string | null;
  clubShortName: string | null;
};

const EMPTY: Appearance = { logoVersion: null, logoType: null, colors: NO_COLORS, clubName: null, clubShortName: null };

/**
 * Identité configurée par l'admin (specs 003 et 004), lue une fois par requête.
 * Base indisponible ou table absente : valeurs par défaut, l'application reste utilisable.
 */
export const getAppearance = cache(async (): Promise<Appearance> => {
  try {
    const row = await db.clubAppearance.findUnique({
      where: { id: ID },
      select: {
        logoType: true,
        logoVersion: true,
        accentDark: true,
        actionDark: true,
        accentLight: true,
        actionLight: true,
        clubName: true,
        clubShortName: true,
      },
    });
    if (!row) return EMPTY;
    return {
      logoVersion: row.logoType ? row.logoVersion : null,
      logoType: row.logoType,
      colors: {
        accentDark: row.accentDark,
        actionDark: row.actionDark,
        accentLight: row.accentLight,
        actionLight: row.actionLight,
      },
      clubName: row.clubName,
      clubShortName: row.clubShortName,
    };
  } catch {
    return EMPTY;
  }
});

export async function getLogo(): Promise<{ bytes: Uint8Array; type: string; version: number } | null> {
  const row = await db.clubAppearance.findUnique({
    where: { id: ID },
    select: { logo: true, logoType: true, logoVersion: true },
  });
  if (!row?.logo || !row.logoType) return null;
  return { bytes: row.logo, type: row.logoType, version: row.logoVersion };
}

/** FR-300, FR-304, FR-306 */
export async function setLogo(actor: Actor, bytes: Uint8Array<ArrayBuffer>): Promise<void> {
  assertAdmin(actor);
  const check = checkLogo(bytes);
  if (!check.ok) throw new UserError(check.error);
  await db.$transaction(async (tx) => {
    await tx.clubAppearance.upsert({
      where: { id: ID },
      create: { id: ID, logo: bytes, logoType: check.type, logoVersion: 1 },
      update: { logo: bytes, logoType: check.type, logoVersion: { increment: 1 } },
    });
    await audit(tx, actor, "Apparence", "Logo déposé", undefined, {
      format: check.type,
      taille: `${Math.ceil(bytes.length / 1024)} Ko`,
    });
  });
}

/** FR-303 */
export async function clearLogo(actor: Actor): Promise<void> {
  assertAdmin(actor);
  await db.$transaction(async (tx) => {
    const r = await tx.clubAppearance.updateMany({
      where: { id: ID, logoType: { not: null } },
      data: { logo: null, logoType: null, logoVersion: { increment: 1 } },
    });
    if (r.count === 0) throw new UserError("Aucun logo déposé : le logo par défaut est déjà utilisé.");
    await audit(tx, actor, "Apparence", "Logo retiré (retour au logo par défaut)");
  });
}

/** FR-310 à FR-312, FR-315. Tout ou rien : une seule couleur refusée bloque l'enregistrement. */
export async function setColors(actor: Actor, input: Record<ColorKey, string>): Promise<void> {
  assertAdmin(actor);
  const next = { ...NO_COLORS };
  const errors: string[] = [];
  for (const k of COLOR_KEYS) {
    const v = normalizeHex(input[k]);
    if (v === undefined) errors.push(`${COLOR_LABELS[k]} : format #RRGGBB attendu.`);
    else if (v !== null) {
      const c = checkColor(k, v);
      if (!c.ok) errors.push(c.message!);
      next[k] = v;
    }
  }
  if (errors.length) throw new UserError(errors.join(" "));
  await saveColors(actor, next, "Couleurs modifiées");
}

/** FR-314 */
export async function resetColors(actor: Actor): Promise<void> {
  assertAdmin(actor);
  await saveColors(actor, NO_COLORS, "Couleurs par défaut rétablies");
}

async function saveColors(actor: Actor, next: ColorSet, action: string): Promise<void> {
  await db.$transaction(async (tx) => {
    const before = await tx.clubAppearance.findUnique({ where: { id: ID } });
    const prev: ColorSet = before
      ? {
          accentDark: before.accentDark,
          actionDark: before.actionDark,
          accentLight: before.accentLight,
          actionLight: before.actionLight,
        }
      : NO_COLORS;
    const changed = COLOR_KEYS.filter((k) => prev[k] !== next[k]);
    if (changed.length === 0) throw new UserError("Aucune couleur modifiée.");
    await tx.clubAppearance.upsert({ where: { id: ID }, create: { id: ID, ...next }, update: next });
    const show = (v: string | null) => v ?? "par défaut";
    await audit(
      tx,
      actor,
      "Apparence",
      action,
      undefined,
      Object.fromEntries(changed.map((k) => [COLOR_LABELS[k], `${show(prev[k])} → ${show(next[k])}`])),
    );
  });
}

// ---------------------------------------------------------------- nom du club (spec 016)

export const CLUB_NAME_MAX = 80;
export const CLUB_SHORT_NAME_MAX = 12;

/** Contrôle du nom (obligatoire) et du sigle (facultatif) ; renvoie les valeurs nettoyées. */
export function checkClubIdentity(nameInput: string, shortInput: string): { clubName: string; clubShortName: string | null } {
  const clubName = nameInput.trim().replace(/\s+/g, " ");
  const short = shortInput.trim().replace(/\s+/g, " ");
  if (!clubName) throw new UserError("Indiquez le nom du club.");
  if (clubName.length > CLUB_NAME_MAX) throw new UserError(`Nom du club trop long (${CLUB_NAME_MAX} caractères maximum).`);
  if (short.length > CLUB_SHORT_NAME_MAX) throw new UserError(`Sigle trop long (${CLUB_SHORT_NAME_MAX} caractères maximum).`);
  return { clubName, clubShortName: short || null };
}

/** FR-1608 */
export async function setClubIdentity(actor: Actor, nameInput: string, shortInput: string): Promise<void> {
  assertAdmin(actor);
  const next = checkClubIdentity(nameInput, shortInput);
  await db.$transaction(async (tx) => {
    const before = await tx.clubAppearance.findUnique({ where: { id: ID }, select: { clubName: true, clubShortName: true } });
    if (before?.clubName === next.clubName && before?.clubShortName === next.clubShortName) {
      throw new UserError("Aucune modification.");
    }
    await tx.clubAppearance.upsert({ where: { id: ID }, create: { id: ID, ...next }, update: next });
    await audit(tx, actor, "Apparence", "Nom du club modifié", undefined, {
      nom: `${before?.clubName ?? "non défini"} → ${next.clubName}`,
      sigle: `${before?.clubShortName ?? "aucun"} → ${next.clubShortName ?? "aucun"}`,
    });
  });
}
