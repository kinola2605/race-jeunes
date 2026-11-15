import { EmptyState } from "@/components/ui";

export const metadata = { title: "Hors connexion" };

/** FR-160 — page servie par le service worker sans réseau. Aucune donnée. */
export default function HorsLigne() {
  return (
    <div className="app app-public">
      <main id="main" className="main main-narrow">
        <EmptyState icon="offline" title="Hors connexion">
          <p>La Race nécessite le réseau pour afficher le classement et enregistrer les matchs. Réessayez dès que la connexion revient.</p>
          {/* rechargement complet volontaire : le routeur client ne fonctionne pas hors ligne */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="btn btn-secondary" href="/">
            Réessayer
          </a>
        </EmptyState>
      </main>
    </div>
  );
}
