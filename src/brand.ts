/**
 * Marque blanche : l'identité du club est entièrement configurable par variables d'environnement,
 * lues à l'exécution (aucun rebuild nécessaire). Sans configuration, l'app reste neutre.
 *
 * - APP_NAME              nom de l'application (défaut « Race jeunes »)
 * - CLUB_NAME             nom complet du club, affiché sur la connexion et les fiches (défaut : aucun)
 * - CLUB_SHORT_NAME       sigle affiché sous le nom de l'app dans l'en-tête (défaut : aucun)
 * - BRAND_LOGO            logo pour le thème sombre, servi par l'app (ex. /logo/club-clair.svg ; défaut /icon.svg)
 * - BRAND_LOGO_LIGHT      logo pour le thème clair et l'impression (défaut : BRAND_LOGO)
 *
 * Les logos doivent être servis par l'app elle-même (déposés dans public/logo/) : la CSP interdit
 * toute origine tierce.
 */
export type Brand = {
  appName: string;
  clubName: string;
  clubShortName: string;
  logoDark: string;
  logoLight: string;
};

const clean = (v: string | undefined) => (v ?? "").trim();
const localPath = (v: string) => (v.startsWith("/") && !v.startsWith("//") ? v : "");

export function getBrand(): Brand {
  const logoDark = localPath(clean(process.env.BRAND_LOGO)) || "/icon.svg";
  return {
    appName: clean(process.env.APP_NAME) || "Race jeunes",
    clubName: clean(process.env.CLUB_NAME),
    clubShortName: clean(process.env.CLUB_SHORT_NAME),
    logoDark,
    logoLight: localPath(clean(process.env.BRAND_LOGO_LIGHT)) || logoDark,
  };
}
