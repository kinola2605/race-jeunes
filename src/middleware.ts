import { NextResponse, type NextRequest } from "next/server";

/**
 * Filtre rapide : sans cookie de session, toute page non publique renvoie vers /connexion.
 * La vraie vérification (session valide, rôle) est faite côté serveur dans chaque page et action.
 */
const PUBLIC = ["/connexion", "/hors-ligne", "/manifest.webmanifest", "/sw.js", "/favicon.ico", "/icon.svg"];

export function middleware(req: NextRequest) {
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
