import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { requireUser } from "@/server/auth/session";
import { logoutAction, setThemeAction } from "@/app/actions/auth";
import { Flash, Icon, PageHead } from "@/components/ui";
import { Avatar } from "@/components/avatar";
import { AvatarPicker } from "./avatar-picker";
import { personalDataSummary } from "@/server/services/personal-data";

export const metadata: Metadata = { title: "Mon compte" };

/** Mon compte ; présentation en lignes de réglages et sections repliables : spec 010. */
export default async function ComptePage({ searchParams }: { searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const sp = await searchParams;
  const user = await requireUser();
  const theme = (await cookies()).get("theme")?.value === "light" ? "light" : "dark";
  const data = await personalDataSummary(user.id, user.pseudo);
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
      <div className="cases cases-2" style={{ alignItems: "start" }}>
        <section className="case" aria-labelledby="t-reglages">
          <h2 className="case-title" id="t-reglages">
            Réglages
          </h2>
          <ul className="settings">
            <li>
              <div>
                <div className="setting-name" id="t-theme">
                  Thème
                </div>
                <div className="small subtle">Le clair est plus lisible en plein soleil.</div>
              </div>
              <form action={setThemeAction} className="seg" aria-labelledby="t-theme">
                <button type="submit" name="theme" value="dark" aria-pressed={theme === "dark"}>
                  Sombre
                </button>
                <button type="submit" name="theme" value="light" aria-pressed={theme === "light"}>
                  Clair
                </button>
              </form>
            </li>
            <li>
              <Link className="setting-link" href="/mot-de-passe">
                <Icon name="key" />
                Changer mon mot de passe
                <span className="chev">
                  <Icon name="chev-r" />
                </span>
              </Link>
            </li>
            {user.role === "ADMIN" ? (
              <li>
                <Link className="setting-link" href="/admin/apparence">
                  <Icon name="edit" />
                  <span>
                    Apparence du club
                    <span className="small subtle" style={{ display: "block", fontWeight: 400 }}>
                      Logo et couleurs, pour tous les utilisateurs
                    </span>
                  </span>
                  <span className="chev">
                    <Icon name="chev-r" />
                  </span>
                </Link>
              </li>
            ) : null}
          </ul>
          <p className="small muted mb-0 mt-4">Votre pseudo et votre classement sont gérés par le club.</p>
        </section>

        <section className="case" aria-labelledby="t-avatar">
          <details className="fold">
            <summary>
              <h2 className="case-title" id="t-avatar">
                Mon avatar
              </h2>
              <Icon name="chev-d" />
            </summary>
            <p className="small muted">
              Choisissez un pictogramme et une couleur. Pas de photo : l&apos;application n&apos;en enregistre jamais. Votre avatar est visible des autres
              joueurs à côté de votre pseudo.
            </p>
            <AvatarPicker key={user.avatar ?? "défaut"} pseudo={user.pseudo} avatar={user.avatar} />
          </details>
        </section>

        <section className="case" aria-labelledby="t-data">
          <h2 className="case-title" id="t-data">
            <Icon name="download" /> Mes données
          </h2>
          <p className="small muted">Voici ce que l&apos;application enregistre sur votre compte. Vous pouvez tout récupérer dans un fichier (format JSON).</p>
          <ul className="list data-list" aria-label="Données enregistrées">
            {data.map((c) => (
              <li key={c.label} className="row-between">
                <span>{c.label}</span>
                <strong className="mono">{c.count}</strong>
              </li>
            ))}
          </ul>
          <a className="btn btn-secondary mt-4" href="/api/mes-donnees" download>
            <Icon name="download" />
            Télécharger mes données
          </a>
          <p className="small muted mt-4 mb-0">
            Le fichier ne contient ni mot de passe, ni donnée d&apos;un autre joueur. Pour faire corriger ou effacer vos données (pseudo, classement,
            compte), adressez-vous au responsable de la Race du club.
          </p>
        </section>

        <section className="case" aria-labelledby="t-conf">
          <details className="fold">
            <summary>
              <h2 className="case-title" id="t-conf">
                <Icon name="shield" /> Confidentialité
              </h2>
              <Icon name="chev-d" />
            </summary>
            <p className="small muted">
              Cette application n&apos;enregistre ni nom, ni prénom, ni e-mail, ni date de naissance, ni téléphone, ni photo. Vous êtes identifié·e
              uniquement par un pseudo attribué par le club.
            </p>
            <p className="small muted mb-0">Aucun cookie de suivi, aucun outil de statistiques, aucune ressource chargée depuis un service externe.</p>
          </details>
        </section>
      </div>

      <form action={logoutAction} className="mt-8" style={{ maxWidth: 420 }}>
        <button className="btn btn-secondary btn-block" type="submit">
          <Icon name="logout" />
          Se déconnecter
        </button>
      </form>
    </>
  );
}
