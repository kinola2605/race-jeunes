import { NextResponse, type NextRequest } from "next/server";
import { getSessionUser } from "@/server/auth/session";
import { db } from "@/server/db";
import { toCsv } from "@/server/services/csv";
import { seasonStandings } from "@/server/services/standings";
import { audit } from "@/server/services/common";

/** FR-141 — exports CSV réservés aux admins. Aucun effet de bord hormis la trace d'audit. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ kind: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN" || user.mustChangePassword) return new NextResponse("Accès refusé", { status: 403 });
  const { kind } = await params;
  const sp = req.nextUrl.searchParams;
  let rows: (string | number | null)[][];
  let name: string;

  if (kind === "classement" || kind === "matchs") {
    const season = await db.season.findUnique({ where: { slug: sp.get("saison") ?? "" } });
    if (!season) return new NextResponse("Saison introuvable", { status: 404 });
    if (kind === "classement") {
      const st = await seasonStandings(season.id);
      rows = [["rang", "pseudo", "classement_depart", "etiquettes", "matchs", "victoires", "defaites", "perfs", "bonus_assiduite", "bonus_tournoi", "bonus", "points"]];
      for (const r of st) rows.push([r.rank, r.pseudo, r.startingRanking, r.tags.join(" / "), r.matches, r.wins, r.losses, r.perfs, r.assiduityBonus, r.tournamentBonus, r.bonus, r.points]);
    } else {
      const matches = await db.match.findMany({
        where: { seasonId: season.id },
        include: { playerA: true, playerB: true, entries: true },
        orderBy: { playedOn: "asc" },
      });
      rows = [["date", "joueur_a", "classement_a", "joueur_b_ou_exterieur", "classement_b", "vainqueur", "score", "type", "statut", "points_a", "points_b"]];
      for (const m of matches) {
        rows.push([
          m.playedOn.toISOString().slice(0, 10),
          m.playerA.pseudo,
          m.rankingA,
          m.playerB?.pseudo ?? `Ext. ${m.externalLabel}`,
          m.rankingB ?? m.externalRanking,
          m.winner,
          m.score,
          m.kind,
          m.status,
          m.entries.find((e) => e.userId === m.playerAId)?.points ?? null,
          m.playerBId ? (m.entries.find((e) => e.userId === m.playerBId)?.points ?? null) : null,
        ]);
      }
    }
    name = `${kind}-${season.slug}.csv`;
  } else if (kind === "journal") {
    const type = sp.get("type");
    const entries = await db.auditLog.findMany({ where: type ? { type } : {}, orderBy: { at: "desc" }, take: 5000 });
    rows = [["date", "auteur", "type", "action", "cible", "detail"]];
    for (const e of entries) rows.push([e.at.toISOString(), e.actorPseudo, e.type, e.action, e.target, e.details ? JSON.stringify(e.details) : null]);
    name = "journal-audit.csv";
  } else {
    return new NextResponse("Export inconnu", { status: 404 });
  }

  await audit(db, user, "Export", `Export CSV ${kind}`, name);
  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
