import { NextResponse, type NextRequest } from "next/server";
import { isAllowedWrite } from "@/server/origin";

/**
 * 1. CSRF : toute requête d'écriture d'une autre origine (ou sans Origin) est refusée (403).
 * 2. Filtre rapide : sans cookie de session, toute page non publique renvoie vers /connexion.
 * La vraie vérification (session valide, rôle) est faite côté serveur dans chaque page et action.
 */
const PUBLIC = ["/connexion", "/hors-ligne", "/manifest.webmanifest", "/sw.js", "/favicon.ico", "/icon.svg"];

export function middleware(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!isAllowedWrite(req.method, req.headers.get("origin"), host)) {
    return new NextResponse("Origine refusée", { status: 403 });
  }
  const { pathname } = req.nextUrl;
  if (PUBLIC.includes(pathname)) return NextResponse.next();
  if (!req.cookies.get("race_session")) {
    const url = req.nextUrl.clone();
    url.pathname = "/connexion";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|fonts/|logo/|api/health).*)"],
};
