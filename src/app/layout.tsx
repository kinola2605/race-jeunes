import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "@/styles/tokens.css";
import "@/styles/app.css";
import { ServiceWorker } from "@/components/sw";
import { BrandProvider } from "@/components/brand";
import { getBrand } from "@/brand";

export async function generateMetadata(): Promise<Metadata> {
  const { appName, clubName, clubShortName } = getBrand();
  const full = clubShortName ? `${appName} ${clubShortName}` : appName;
  return {
    title: { default: clubShortName ? `${appName} · ${clubShortName}` : appName, template: `%s · ${full}` },
    description: clubName ? `Suivi de la ${appName} — ${clubName}` : `Suivi de la ${appName}`,
    manifest: "/manifest.webmanifest",
    robots: { index: false, follow: false },
    icons: { icon: "/icon.svg", apple: "/icon.svg" },
    appleWebApp: { capable: true, title: full, statusBarStyle: "black-translucent" },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#14293E",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = (await cookies()).get("theme")?.value === "light" ? "light" : "dark";
  return (
    <html lang="fr" data-theme={theme}>
      <body>
        <a className="skip" href="#main">
          Aller au contenu
        </a>
        <BrandProvider value={getBrand()}>{children}</BrandProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
