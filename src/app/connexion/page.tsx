import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { Icon } from "@/components/ui";
import { LoginForm } from "./login-form";
import { getBrand } from "@/brand";
import { needsInstallation } from "@/server/services/installation";

export const metadata: Metadata = { title: "Connexion" };
export const dynamic = "force-dynamic";

/**
 * E01 — page publique, centrée dans la fenêtre (spec 017). Aucun lien d'inscription (FR-002).
 * Sans admin, renvoi vers l'installation (spec 016).
 */
export default async function ConnexionPage() {
  const user = await getSessionUser();
  if (user) redirect(user.mustChangePassword ? "/mot-de-passe" : user.role === "ADMIN" ? "/admin" : "/accueil");
  if (await needsInstallation()) redirect("/installation");
  const brand = await getBrand();
  return (
    <main id="main" className="auth">
      <div className="auth-inner">
        <div className="auth-card">
          <div className="auth-head">
            <img className="logo-on-dark" src={brand.logoDark} alt="" width={96} height={96} />
            <img className="logo-on-light" src={brand.logoLight} alt="" width={96} height={96} />
            {brand.clubName ? <span className="eyebrow">{brand.clubName}</span> : null}
            <h1 className="page-title">{brand.appName}</h1>
            <p className="lead small">Connectez-vous avec le pseudo remis par votre club.</p>
          </div>
          <LoginForm />
          <div className="auth-help">
            <details>
              <summary>
                Mot de passe oublié ?
                <Icon name="chev-d" />
              </summary>
              <p>Demandez une réinitialisation à l&apos;administrateur du club : il vous remettra un mot de passe temporaire.</p>
            </details>
            <details>
              <summary>
                Pas encore de compte ?
                <Icon name="chev-d" />
              </summary>
              <p>Les comptes sont créés uniquement par le club. Adressez-vous à votre enseignant·e.</p>
            </details>
          </div>
        </div>
        <p className="auth-note">
          <Icon name="shield" />
          <span>Aucune donnée personnelle collectée, aucun cookie de suivi.</span>
        </p>
      </div>
    </main>
  );
}
