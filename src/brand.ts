import "server-only";
import { themeCss } from "@/appearance/colors";
import { getAppearance } from "@/server/services/appearance";

/**
 * Marque blanche : l'identité du club combine la configuration faite par l'admin (page « Apparence »,
 * specs 003 et 004) et des variables d'environnement lues à l'exécution. Sans configuration, l'app reste neutre.
 *
 * - APP_NAME              nom de l'application (défaut « Race jeunes »)
 * - CLUB_NAME             nom complet du club, affiché sur la connexion et les fiches (défaut : aucun)
 * - CLUB_SHORT_NAME       sigle affiché sous le nom de l'app dans l'en-tête (défaut : aucun)
 *   Le nom et le sigle saisis à l'installation ou dans « Apparence » (spec 016) priment sur ces deux variables.
 * - BRAND_LOGO            logo par défaut du thème sombre (ex. /logo/club-clair.svg ; défaut /icon.svg)
 * - BRAND_LOGO_LIGHT      logo par défaut du thème clair et de l'impression (défaut : BRAND_LOGO)
 *
 * Priorité du logo : logo déposé par l'admin (un seul, pour les deux thèmes et l'icône de l'appli),
 * puis BRAND_LOGO / BRAND_LOGO_LIGHT, puis le logo du projet. Les couleurs déposées par l'admin
 * surchargent celles de design/tokens.json (themeCss).
 *
 * Les logos doivent être servis par l'app elle-même (public/logo/ ou /club-logo) : la CSP interdit
 * toute origine tierce.
 */
export type Brand = {
  appName: string;
  clubName: string;
  clubShortName: string;
  logoDark: string;
  logoLight: string;
};

export type BrandIcon = { src: string; type: string };

const clean = (v: string | undefined) => (v ?? "").trim();
const localPath = (v: string) => (v.startsWith("/") && !v.startsWith("//") ? v : "");

export const DEFAULT_ICON: BrandIcon = { src: "/icon.svg", type: "image/svg+xml" };

export async function getBrand(): Promise<Brand> {
  const { logoVersion, clubName, clubShortName } = await getAppearance();
  const envDark = localPath(clean(process.env.BRAND_LOGO)) || "/icon.svg";
  const uploaded = logoVersion !== null ? `/club-logo?v=${logoVersion}` : "";
  return {
    appName: clean(process.env.APP_NAME) || "Race jeunes",
    clubName: clubName ?? clean(process.env.CLUB_NAME),
    clubShortName: clubShortName ?? clean(process.env.CLUB_SHORT_NAME),
    logoDark: uploaded || envDark,
    logoLight: uploaded || localPath(clean(process.env.BRAND_LOGO_LIGHT)) || envDark,
  };
}

/** Icône de l'application (onglet, appli installée) : le logo déposé s'il existe (spec 003, FR-301). */
export async function getBrandIcon(): Promise<BrandIcon> {
  const { logoVersion, logoType } = await getAppearance();
  return logoVersion !== null && logoType ? { src: `/club-logo?v=${logoVersion}`, type: logoType } : DEFAULT_ICON;
}

/** Surcharge CSS des couleurs du club (spec 004) ; chaîne vide sans personnalisation. */
export async function getThemeCss(): Promise<string> {
  return themeCss((await getAppearance()).colors);
}
