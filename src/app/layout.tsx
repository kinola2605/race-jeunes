import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "@/styles/tokens.css";
import "@/styles/app.css";
import { ServiceWorker } from "@/components/sw";

export const metadata: Metadata = {
  title: { default: "Race jeunes", template: "%s · Race jeunes" },
  description: "Suivi de la Race jeunes d'un club de tennis",
  manifest: "/manifest.webmanifest",
  robots: { index: false, follow: false },
  icons: { icon: "/logo/logo.svg", apple: "/logo/logo.svg" },
  appleWebApp: { capable: true, title: "Race jeunes", statusBarStyle: "black-translucent" },
};

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
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
