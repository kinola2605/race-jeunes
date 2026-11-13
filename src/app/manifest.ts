import type { MetadataRoute } from "next";
import { getBrand, getBrandIcon } from "@/brand";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [{ appName, clubName, clubShortName }, icon] = await Promise.all([getBrand(), getBrandIcon()]);
  return {
    name: clubName ? `${appName} · ${clubName}` : appName,
    short_name: clubShortName ? `${appName} ${clubShortName}` : appName,
    description: clubName ? `Suivi de la ${appName} — ${clubName}` : `Suivi de la ${appName}`,
    lang: "fr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#14293E",
    theme_color: "#14293E",
    // Logo déposé par l'admin s'il existe (spec 003, FR-301), sinon le logo du projet.
    icons: [
      { src: icon.src, sizes: "any", type: icon.type, purpose: "any" },
      { src: icon.src, sizes: "any", type: icon.type, purpose: "maskable" },
    ],
  };
}
