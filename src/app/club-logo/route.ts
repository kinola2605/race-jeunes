import { NextResponse, type NextRequest } from "next/server";
import { getLogo } from "@/server/services/appearance";

export const dynamic = "force-dynamic";

/**
 * Logo déposé par l'admin (spec 003, FR-305). Public : nécessaire sur la page de connexion et pour l'icône.
 * Le fichier est servi comme image inerte : type contrôlé au dépôt, nosniff, et une CSP qui interdit
 * tout script (un SVG ouvert directement ne peut rien exécuter) — CSP déclarée dans next.config.mjs.
 */
export async function GET(req: NextRequest) {
  const logo = await getLogo().catch(() => null);
  if (!logo) return NextResponse.redirect(new URL("/icon.svg", req.url), 307);
  // URL versionnée (?v=) : cache long ; sinon revalidation à chaque fois.
  const versioned = req.nextUrl.searchParams.get("v") === String(logo.version);
  return new NextResponse(Buffer.from(logo.bytes), {
    headers: {
      "Content-Type": logo.type,
      "Content-Length": String(logo.bytes.length),
      "Cache-Control": versioned ? "public, max-age=31536000, immutable" : "no-cache",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
}
