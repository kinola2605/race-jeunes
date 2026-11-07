import Link from "next/link";
import { EmptyState } from "@/components/ui";

export const metadata = { title: "Accès refusé" };

export default function AccesRefuse() {
  return (
    <div className="app">
      <main id="main" className="main main-narrow">
        <EmptyState icon="ban" title="Accès refusé">
          <p>Cette page est réservée aux administrateurs.</p>
          <Link className="btn btn-secondary" href="/">
            Retour à l&apos;accueil
          </Link>
        </EmptyState>
      </main>
    </div>
  );
}
