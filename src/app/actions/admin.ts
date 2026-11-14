"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { RankingMode, RankingVisibility } from "@prisma/client";
import { requireAdmin } from "@/server/auth/session";
import { createPlayer, importPlayersCsv, resetPassword, setAccountStatus, updatePlayer, type ImportReport } from "@/server/services/accounts";
import { enrollPlayers, setStartingRanking, unenroll } from "@/server/services/enrollments";
import {
  createSeason,
  discardDraft,
  previewImpact,
  publishDraft,
  recalculateWithPublished,
  saveDraft,
  transitionSeason,
  updateSeasonTitle,
  type Impact,
} from "@/server/services/seasons";
import { validateRuleSet } from "@/scoring";
import { db } from "@/server/db";
import { attempt, run, str } from "./util";

// ---------------------------------------------------------------- comptes

export type HandoverState =
  | { error?: string; handover?: { pseudo: string; password: string; context: "creation" | "reset" } }
  | undefined;

/** FR-020/021 : le mot de passe ne transite que dans la réponse de l'action, jamais dans l'URL ni en base. */
export async function createPlayerAction(_prev: HandoverState, fd: FormData): Promise<HandoverState> {
  const admin = await requireAdmin();
  const r = await attempt(() =>
    createPlayer(admin, {
      pseudo: str(fd, "pseudo"),
      ranking: str(fd, "ranking"),
      tags: fd.getAll("tags").filter((t): t is string => typeof t === "string").concat(str(fd, "newTag") ? [str(fd, "newTag")] : []),
      enrollSeasonId: str(fd, "enrollSeasonId") || null,
    }),
  );
  if (!r.ok) return { error: r.error };
  revalidatePath("/admin/joueurs");
  return { handover: { pseudo: r.data.pseudo, password: r.data.password, context: "creation" } };
}

export async function resetPasswordAction(_prev: HandoverState, fd: FormData): Promise<HandoverState> {
  const admin = await requireAdmin();
  const r = await attempt(() => resetPassword(admin, str(fd, "userId")));
  if (!r.ok) return { error: r.error };
  return { handover: { pseudo: r.data.pseudo, password: r.data.password, context: "reset" } };
}

export async function setStatusAction(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = str(fd, "userId");
  const status = str(fd, "status") === "DISABLED" ? "DISABLED" : "ACTIVE";
  await run(`/admin/joueurs/${id}?onglet=compte`, async () => {
    await setAccountStatus(admin, id, status);
    return status === "DISABLED" ? "Compte désactivé : ses sessions sont coupées." : "Compte réactivé.";
  });
}

export async function updatePlayerAction(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = str(fd, "userId");
  await run(`/admin/joueurs/${id}`, async () => {
    await updatePlayer(admin, id, {
      pseudo: str(fd, "pseudo"),
      ranking: str(fd, "ranking"),
      tags: fd.getAll("tags").filter((t): t is string => typeof t === "string").concat(str(fd, "newTag") ? [str(fd, "newTag")] : []),
    });
    return "Modifications enregistrées.";
  });
}

export type ImportState = { error?: string; report?: ImportReport } | undefined;

export async function importCsvAction(_prev: ImportState, fd: FormData): Promise<ImportState> {
  const admin = await requireAdmin();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choisissez un fichier CSV." };
  if (file.size > 200_000) return { error: "Fichier trop volumineux (200 Ko maximum)." };
  const text = await file.text();
  const r = await attempt(() =>
    importPlayersCsv(admin, text, {
      onExisting: str(fd, "onExisting") === "update" ? "update" : "ignore",
      enrollSeasonId: str(fd, "enrollSeasonId") || null,
    }),
  );
  if (!r.ok) return { error: r.error };
  revalidatePath("/admin/joueurs");
  return { report: r.data };
}

// ---------------------------------------------------------------- saisons

export async function createSeasonAction(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  const r = await attempt(() =>
    createSeason(admin, {
      slug: str(fd, "slug"),
      title: str(fd, "title"),
      startsOn: str(fd, "startsOn") || null,
      endsOn: str(fd, "endsOn") || null,
      rankingMode: (str(fd, "rankingMode") === "EVOLVING" ? "EVOLVING" : "FROZEN") as RankingMode,
      visibility: (["ALL", "ENROLLED", "SELF"].includes(str(fd, "visibility")) ? str(fd, "visibility") : "ALL") as RankingVisibility,
      copyFromRuleSetId: str(fd, "bareme") === "copy" ? str(fd, "copyFromRuleSetId") || null : null,
    }),
  );
  if (!r.ok) redirect(`/admin/saisons/nouvelle?erreur=${encodeURIComponent(r.error)}`);
  redirect(`/admin/saisons/${r.data.slug}?ok=${encodeURIComponent("Saison créée en brouillon.")}`);
}

export async function seasonTransitionAction(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = str(fd, "seasonId");
  const to = str(fd, "to") as "OPEN" | "CLOSED" | "ARCHIVED" | "REOPEN";
  const season = await db.season.findUniqueOrThrow({ where: { id } });
  const labels = { OPEN: "Saison ouverte.", CLOSED: "Saison clôturée.", ARCHIVED: "Saison archivée.", REOPEN: "Saison rouverte." };
  await run(`/admin/saisons/${season.slug}`, async () => {
    await transitionSeason(admin, id, to, str(fd, "confirmSlug"));
    revalidatePath("/", "layout");
    return labels[to];
  });
}

export async function seasonTitleAction(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  const season = await db.season.findUniqueOrThrow({ where: { id: str(fd, "seasonId") } });
  await run(`/admin/saisons/${season.slug}`, async () => {
    await updateSeasonTitle(admin, season.id, str(fd, "title"));
    return "Titre enregistré.";
  });
}

// ---------------------------------------------------------------- barèmes

export type DraftState = { error?: string; ok?: string; warnings?: string[]; impact?: Impact } | undefined;

export async function saveDraftAction(_prev: DraftState, fd: FormData): Promise<DraftState> {
  const admin = await requireAdmin();
  let rules: unknown;
  try {
    rules = JSON.parse(str(fd, "rules"));
  } catch {
    return { error: "Barème illisible." };
  }
  const r = await attempt(() => saveDraft(admin, str(fd, "seasonId"), rules));
  if (!r.ok) return { error: r.error };
  revalidatePath("/admin/saisons", "layout");
  return { ok: "Brouillon enregistré.", warnings: r.data.warnings };
}

/** FR-065 : aperçu sans écriture. */
export async function impactAction(_prev: DraftState, fd: FormData): Promise<DraftState> {
  await requireAdmin();
  let rules: unknown;
  try {
    rules = JSON.parse(str(fd, "rules"));
  } catch {
    return { error: "Barème illisible." };
  }
  const v = validateRuleSet(rules);
  if (!v.ok) return { error: "Barème invalide : " + v.errors.join(" ; ") };
  return { impact: await previewImpact(str(fd, "seasonId"), v.rules), warnings: v.warnings };
}

export async function publishAction(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  const season = await db.season.findUniqueOrThrow({ where: { id: str(fd, "seasonId") } });
  const recalc = str(fd, "recalculate") === "yes";
  await run(`/admin/saisons/${season.slug}/bareme`, async () => {
    await publishDraft(admin, season.id, recalc);
    revalidatePath("/", "layout");
    return recalc ? "Version publiée et matchs recalculés." : "Version publiée pour les prochains matchs validés.";
  });
}

export async function recalcAction(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  const season = await db.season.findUniqueOrThrow({ where: { id: str(fd, "seasonId") } });
  await run(`/admin/saisons/${season.slug}/bareme`, async () => {
    await recalculateWithPublished(admin, season.id);
    revalidatePath("/", "layout");
    return "Recalcul appliqué avec la version publiée.";
  });
}

export async function discardDraftAction(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  const season = await db.season.findUniqueOrThrow({ where: { id: str(fd, "seasonId") } });
  await run(`/admin/saisons/${season.slug}/bareme`, async () => {
    await discardDraft(admin, season.id);
    return "Brouillon abandonné.";
  });
}

// ---------------------------------------------------------------- engagements

export async function enrollAction(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  const season = await db.season.findUniqueOrThrow({ where: { id: str(fd, "seasonId") } });
  const ids = fd.getAll("userId").filter((v): v is string => typeof v === "string");
  await run(`/admin/saisons/${season.slug}/engagements`, async () => {
    const n = await enrollPlayers(admin, season.id, ids);
    revalidatePath("/", "layout");
    return `${n} joueur${n > 1 ? "s" : ""} engagé${n > 1 ? "s" : ""}.`;
  });
}

export async function unenrollAction(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  const season = await db.season.findUniqueOrThrow({ where: { id: str(fd, "seasonId") } });
  await run(`/admin/saisons/${season.slug}/engagements`, async () => {
    await unenroll(admin, season.id, str(fd, "userId"));
    return "Engagement retiré.";
  });
}

export async function startingRankingAction(fd: FormData): Promise<void> {
  const admin = await requireAdmin();
  const season = await db.season.findUniqueOrThrow({ where: { id: str(fd, "seasonId") } });
  await run(`/admin/saisons/${season.slug}/engagements`, async () => {
    await setStartingRanking(admin, season.id, str(fd, "userId"), str(fd, "ranking"));
    return "Classement de départ modifié.";
  });
}
