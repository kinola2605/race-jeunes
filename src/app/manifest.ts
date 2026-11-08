import type { MetadataRoute } from "next";
import { getBrand } from "@/brand";

export const dynamic = "force-dynamic";

export default function manifest(): MetadataRoute.Manifest {
  const { appName, clubName, clubShortName } = getBrand();
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
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
