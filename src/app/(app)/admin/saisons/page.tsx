import type { Metadata } from "next";
import Link from "next/link";
import { listSeasons } from "@/server/services/seasons";
import { EmptyState, Icon, PageHead, SeasonStatusBadge } from "@/components/ui";

export const metadata: Metadata = { title: "Saisons" };

/** E09a — FR-041, FR-045 */
export default async function SaisonsAdminPage() {
  const seasons = await listSeasons();
  return (
    <>
      <PageHead eyebrow="Configuration" title="Saisons" lead="Chaque saison a son propre barème. Une saison n'est pas liée à l'année civile." />
      <div className="row mb-4">
        <Link className="btn btn-primary" href="/admin/saisons/nouvelle">
          <Icon name="plus" />
          Nouvelle saison
        </Link>
      </div>
      {seasons.length === 0 ? (
        <EmptyState icon="calendar" title="Aucune saison">
          <p>Créez la première saison de la Race.</p>
        </EmptyState>
      ) : (
        <div className="cases cases-2">
          {seasons.map((s) => {
            const published = s.ruleSets.find((r) => r.status === "PUBLISHED");
            const draft = s.ruleSets.find((r) => r.status === "DRAFT");
            return (
              <article className="case" key={s.id}>
                <div className="row-between">
                  <h2 className="case-title mb-0">
                    <Link href={`/admin/saisons/${s.slug}`} style={{ textDecoration: "none" }}>
                      {s.title}
                    </Link>
                  </h2>
                  <SeasonStatusBadge status={s.status} />
                </div>
                <p className="small subtle mono">{s.slug}</p>
                <p className="small muted">
                  {s._count.enrollments} engagé{s._count.enrollments > 1 ? "s" : ""} · {s.validated} matchs validés · {s.pending} en attente · barème{" "}
                  {published ? `v${published.version}` : "non publié"}
                  {draft ? ` (brouillon v${draft.version})` : ""}
                </p>
                <div className="row mt-4">
                  <Link className="btn btn-secondary btn-sm" href={`/admin/saisons/${s.slug}`}>
                    Gérer
                  </Link>
                  <Link className="btn btn-ghost btn-sm" href={`/admin/saisons/${s.slug}/bareme`}>
                    <Icon name="sliders" />
                    Barème
                  </Link>
                  <Link className="btn btn-ghost btn-sm" href={`/admin/saisons/${s.slug}/engagements`}>
                    <Icon name="users" />
                    Engagements
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
