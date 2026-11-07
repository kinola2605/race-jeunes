import Link from "next/link";
import { EmptyState } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="app">
      <main id="main" className="main main-narrow">
        <EmptyState icon="alert" title="Page introuvable">
          <p>Le lien est peut-être ancien.</p>
          <Link className="btn btn-secondary" href="/">
            Retour à l&apos;accueil
          </Link>
        </EmptyState>
      </main>
    </div>
  );
}
