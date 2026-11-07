import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { Icon } from "@/components/ui";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Connexion" };
export const dynamic = "force-dynamic";

/** E01 — seule page publique. Aucun lien d'inscription (FR-002). */
export default async function ConnexionPage() {
  const user = await getSessionUser();
  if (user) redirect(user.mustChangePassword ? "/mot-de-passe" : user.role === "ADMIN" ? "/admin" : "/accueil");
  return (
    <div className="app">
      <main id="main" className="main main-narrow">
        <div className="center" style={{ margin: "var(--s-6) 0 var(--s-8)" }}>
          <img className="logo-on-dark" src="/logo/logo.svg" alt="" width={120} height={120} style={{ margin: "0 auto" }} />
          <img className="logo-on-light" src="/logo/logo.svg" alt="" width={120} height={120} style={{ margin: "0 auto" }} />
          <span className="eyebrow mt-4">Mon club de tennis</span>
          <h1 className="page-title">Race jeunes</h1>
        </div>
        <LoginForm />
        <div className="stack mt-8 small muted" style={{ ["--gap" as string]: "var(--s-3)" }}>
          <p className="row" style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
            <Icon name="info" />
            <span>
              <strong className="strong" style={{ color: "var(--text)" }}>Pas encore de compte ?</strong> Les comptes sont créés uniquement par le club.
              Adressez-vous à votre enseignant·e.
            </span>
          </p>
          <p className="row" style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
            <Icon name="key" />
            <span>
              <strong className="strong" style={{ color: "var(--text)" }}>Mot de passe oublié ?</strong> Demandez une réinitialisation à
              l&apos;administrateur du club.
            </span>
          </p>
        </div>
      </main>
      <footer className="foot">Aucune donnée personnelle collectée · aucun cookie de suivi</footer>
    </div>
  );
}
