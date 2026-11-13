import { NextResponse, type NextRequest } from "next/server";
import { getSessionUser } from "@/server/auth/session";
import { audit, db } from "@/server/services/common";
import { buildPersonalData, loadPersonalData } from "@/server/services/personal-data";
import { exportFileName } from "@/privacy/personal-data";

/**
 * Spec 008 — FR-801 à FR-806 : téléchargement des données personnelles (JSON).
 * Sans paramètre : ses propres données. `?joueur=<id>` : réservé aux admins (fiche joueur).
 */
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.mustChangePassword) return new NextResponse("Accès refusé", { status: 403 });
  const requested = req.nextUrl.searchParams.get("joueur");
  const targetId = requested ?? user.id;
  if (targetId !== user.id && user.role !== "ADMIN") return new NextResponse("Accès refusé", { status: 403 });

  const raw = await loadPersonalData(targetId);
  if (!raw) return new NextResponse("Compte introuvable", { status: 404 });
  const now = new Date();
  const name = exportFileName(raw.account.pseudo, now);
  await audit(db, user, "Export", "Export des données personnelles", raw.account.pseudo);
  return new NextResponse(JSON.stringify(buildPersonalData(raw, now), null, 2) + "\n", {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
