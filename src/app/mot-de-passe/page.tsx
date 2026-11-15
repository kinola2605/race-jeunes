import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/server/auth/session";
import { logoutAction } from "@/app/actions/auth";
import { PageHead } from "@/components/ui";
import { ChangePasswordForm } from "./change-form";

export const metadata: Metadata = { title: "Mot de passe" };
export const dynamic = "force-dynamic";

/** E02 — changement obligatoire (mot de passe temporaire) ou volontaire. */
export default async function MotDePassePage() {
  const user = await requireUser({ allowTemporary: true });
  const forced = user.mustChangePassword;
  return (
    <div className="app app-public">
      <main id="main" className="main main-narrow">
        <PageHead
          eyebrow={forced ? `Première connexion · ${user.pseudo}` : `Mon compte · ${user.pseudo}`}
          title={forced ? "Choisissez votre mot de passe" : "Changer mon mot de passe"}
          lead={
            forced
              ? "Le mot de passe remis par le club est temporaire. Vous devez le remplacer pour continuer."
              : "Vos autres sessions seront déconnectées."
          }
        />
        <ChangePasswordForm pseudo={user.pseudo} forced={forced} />
        <div className="actions-stack">
          {forced ? (
            <form action={logoutAction}>
              <button className="btn btn-ghost btn-block" type="submit">
                Se déconnecter
              </button>
            </form>
          ) : (
            <Link className="btn btn-ghost btn-block" href="/compte">
              Retour
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
