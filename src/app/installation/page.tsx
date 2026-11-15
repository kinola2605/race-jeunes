import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBrand } from "@/brand";
import { Alert, PageHead } from "@/components/ui";
import { installCodeStatus, MIN_INSTALL_CODE } from "@/server/services/install-code";
import { needsInstallation } from "@/server/services/installation";
import { InstallForm } from "./install-form";

export const metadata: Metadata = { title: "Installation" };
export const dynamic = "force-dynamic";

/** Spec 016 — FR-1604 à FR-1606 : premier démarrage, tant qu'aucun admin n'existe. */
export default async function InstallationPage() {
  if (!(await needsInstallation())) notFound();
  const [brand, status] = [await getBrand(), installCodeStatus()];
  return (
    <div className="app app-public">
      <main id="main" className="main main-narrow">
        <div className="center" style={{ margin: "var(--s-6) 0 var(--s-6)" }}>
          <img className="logo-on-dark" src={brand.logoDark} alt="" width={96} height={96} style={{ margin: "0 auto", objectFit: "contain" }} />
          <img className="logo-on-light" src={brand.logoLight} alt="" width={96} height={96} style={{ margin: "0 auto", objectFit: "contain" }} />
        </div>
        <PageHead
          eyebrow="Premier démarrage"
          title={`Installer ${brand.appName}`}
          lead="Indiquez le nom de votre club et créez votre compte administrateur. Cette page disparaît une fois l'installation terminée."
        />
        {status === "ok" ? (
          <InstallForm />
        ) : (
          <Alert kind="warn" title={status === "absent" ? "Code d'installation manquant" : "Code d'installation trop court"}>
            <p>
              Pour protéger cette étape, l&apos;application attend le <strong>code d&apos;installation</strong> choisi lors du
              déploiement ({MIN_INSTALL_CODE} caractères minimum).
            </p>
            <p>
              Dans Vercel : <strong>Settings → Environment Variables</strong>, ajoutez <code>INSTALL_CODE</code> avec un code de
              votre choix, puis <strong>Deployments → ⋯ → Redeploy</strong>. Rechargez ensuite cette page.
            </p>
          </Alert>
        )}
      </main>
    </div>
  );
}
