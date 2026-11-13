import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "@/styles/tokens.css";
import "@/styles/app.css";
import { ServiceWorker } from "@/components/sw";
import { BrandProvider } from "@/components/brand";
import { getBrand, getBrandIcon, getThemeCss } from "@/brand";

export async function generateMetadata(): Promise<Metadata> {
  const [{ appName, clubName, clubShortName }, icon] = await Promise.all([getBrand(), getBrandIcon()]);
  const full = clubShortName ? `${appName} ${clubShortName}` : appName;
  return {
    title: { default: clubShortName ? `${appName} · ${clubShortName}` : appName, template: `%s · ${full}` },
    description: clubName ? `Suivi de la ${appName} — ${clubName}` : `Suivi de la ${appName}`,
    manifest: "/manifest.webmanifest",
    robots: { index: false, follow: false },
    icons: { icon: { url: icon.src, type: icon.type }, apple: icon.src },
    appleWebApp: { capable: true, title: full, statusBarStyle: "black-translucent" },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1F2B42",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = (await cookies()).get("theme")?.value === "light" ? "light" : "dark";
  const [brand, themeCss] = await Promise.all([getBrand(), getThemeCss()]);
  return (
    <html lang="fr" data-theme={theme}>
      <head>
        {/* Couleurs du club (spec 004) : valeurs #RRGGBB revalidées, aucun contenu libre. */}
        {themeCss ? <style id="club-colors" dangerouslySetInnerHTML={{ __html: themeCss }} /> : null}
      </head>
      <body>
        <a className="skip" href="#main">
          Aller au contenu
        </a>
        <BrandProvider value={brand}>{children}</BrandProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
