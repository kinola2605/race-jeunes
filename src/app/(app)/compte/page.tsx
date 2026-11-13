import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { requireUser } from "@/server/auth/session";
import { logoutAction, setThemeAction } from "@/app/actions/auth";
import { Flash, Icon, PageHead } from "@/components/ui";
import { Avatar } from "@/components/avatar";
import { AvatarPicker } from "./avatar-picker";

export const metadata: Metadata = { title: "Mon compte" };

export default async function ComptePage({ searchParams }: { searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const sp = await searchParams;
  const user = await requireUser();
  const theme = (await cookies()).get("theme")?.value === "light" ? "light" : "dark";
  return (
    <>
      <PageHead
        eyebrow="Mon compte"
        title={
          <span className="with-avatar">
            <Avatar pseudo={user.pseudo} avatar={user.avatar} size="lg" />
            {user.pseudo}
          </span>
        }
        lead={user.ranking ? `Classement ${user.ranking} · rôle ${user.role === "ADMIN" ? "admin" : "joueur"}` : "Administrateur"} />
      <Flash ok={sp.ok} error={sp.erreur} />
      <div className="cases cases-2">
        <section className="case" aria-labelledby="t-avatar">
          <h2 className="case-title" id="t-avatar">
            Mon avatar
          </h2>
          <p className="small muted">
            Choisissez un pictogramme et une couleur. Pas de photo : l&apos;application n&apos;en enregistre jamais. Votre avatar est visible des autres joueurs
            à côté de votre pseudo.
          </p>
          <AvatarPicker key={user.avatar ?? "défaut"} pseudo={user.pseudo} avatar={user.avatar} />
        </section>
        <section className="case" aria-labelledby="t-theme">
          <h2 className="case-title" id="t-theme">Affichage</h2>
          <p className="small muted">Le thème clair est plus lisible en plein soleil.</p>
          <form action={setThemeAction} className="seg" aria-label="Thème">
            <button type="submit" name="theme" value="dark" aria-pressed={theme === "dark"}>
              Sombre
            </button>
            <button type="submit" name="theme" value="light" aria-pressed={theme === "light"}>
              Clair
            </button>
          </form>
        </section>
        <section className="case" aria-labelledby="t-secu">
          <h2 className="case-title" id="t-secu">Sécurité</h2>
          <p className="small muted">Votre pseudo et votre classement sont gérés par le club.</p>
          <div className="row">
            <Link className="btn btn-secondary" href="/mot-de-passe">
              <Icon name="key" />
              Changer mon mot de passe
            </Link>
            <form action={logoutAction}>
              <button className="btn btn-ghost" type="submit">
                <Icon name="logout" />
                Se déconnecter
              </button>
            </form>
          </div>
        </section>
        {user.role === "ADMIN" ? (
          <section className="case" aria-labelledby="t-app">
            <h2 className="case-title" id="t-app">
              Apparence du club
            </h2>
            <p className="small muted">Logo et couleurs de l&apos;application, pour tous les utilisateurs.</p>
            <Link className="btn btn-secondary" href="/admin/apparence">
              <Icon name="edit" />
              Personnaliser le logo et les couleurs
            </Link>
          </section>
        ) : null}
        <section className="case" aria-labelledby="t-conf">
          <h2 className="case-title" id="t-conf">
            <Icon name="shield" /> Confidentialité
          </h2>
          <p className="small muted">
            Cette application n&apos;enregistre ni nom, ni prénom, ni e-mail, ni date de naissance, ni téléphone, ni photo. Vous êtes identifié·e uniquement
            par un pseudo attribué par le club.
          </p>
          <p className="small muted mb-0">Aucun cookie de suivi, aucun outil de statistiques, aucune ressource chargée depuis un service externe.</p>
        </section>
      </div>
    </>
  );
}
