import type { Metadata } from "next";
import Link from "next/link";
import { listSeasons } from "@/server/services/seasons";
import { EmptyState, Icon, PageHead, SeasonStatusBadge } from "@/components/ui";

export const metadata: Metadata = { title: "Saisons" };

const GROUPS = [
  { title: "En cours", statuses: ["OPEN"] },
  { title: "Brouillons", statuses: ["DRAFT"] },
  { title: "Terminées", statuses: ["CLOSED", "ARCHIVED"] },
] as const;

/** E09a — FR-041, FR-045 ; regroupement par état et cartes compactes : spec 011 */
export default async function SaisonsAdminPage() {
  const seasons = await listSeasons();
  const groups = GROUPS.map((g) => ({ ...g, items: seasons.filter((s) => (g.statuses as readonly string[]).includes(s.status)) })).filter((g) => g.items.length > 0);
  return (
    <>
      <div className="head-row">
        <PageHead eyebrow="Configuration" title="Saisons" lead="Chaque saison a son propre barème. Une saison n'est pas liée à l'année civile." />
        <Link className="btn btn-primary btn-sm" href="/admin/saisons/nouvelle" aria-label="Nouvelle saison">
          <Icon name="plus" />
          Nouvelle
        </Link>
      </div>
      {seasons.length === 0 ? (
        <EmptyState icon="calendar" title="Aucune saison">
          <p>Créez la première saison de la Race.</p>
        </EmptyState>
      ) : (
        groups.map((g) => (
          <section key={g.title} aria-label={g.title}>
            <h2 className="section-title group-title">
              {g.title} ({g.items.length})
            </h2>
            <div className="cases cases-2">
              {g.items.map((s) => {
                const published = s.ruleSets.find((r) => r.status === "PUBLISHED");
                const draft = s.ruleSets.find((r) => r.status === "DRAFT");
                return (
                  <article className="case" key={s.id}>
                    <div className="row-between nowrap" style={{ alignItems: "flex-start" }}>
                      <h3 className="case-title mb-0">
                        <Link href={`/admin/saisons/${s.slug}`} style={{ textDecoration: "none" }}>
                          {s.title}
                        </Link>
                      </h3>
                      <SeasonStatusBadge status={s.status} />
                    </div>
                    <p className="small subtle mono mb-0">{s.slug}</p>
                    <dl className="strip">
                      <div>
                        <dt>Engagé{s._count.enrollments > 1 ? "s" : ""}</dt>
                        <dd>{s._count.enrollments}</dd>
                      </div>
                      <div>
                        <dt>Validé{s.validated > 1 ? "s" : ""}</dt>
                        <dd>{s.validated}</dd>
                      </div>
                      <div>
                        <dt>En attente</dt>
                        <dd style={s.pending > 0 ? { color: "var(--warning)" } : undefined}>{s.pending}</dd>
                      </div>
                      <div>
                        <dt>Barème</dt>
                        <dd>{published ? `v${published.version}` : "—"}</dd>
                      </div>
                    </dl>
                    {!published || draft ? (
                      <p className="small muted">
                        {!published ? "Barème non publié" : ""}
                        {!published && draft ? " · " : ""}
                        {draft ? `brouillon de barème v${draft.version}` : ""}
                      </p>
                    ) : null}
                    <div className="btn-trio">
                      <Link className="btn" href={`/admin/saisons/${s.slug}`}>
                        Gérer
                      </Link>
                      <Link className="btn" href={`/admin/saisons/${s.slug}/bareme`}>
                        Barème
                      </Link>
                      <Link className="btn" href={`/admin/saisons/${s.slug}/engagements`}>
                        Engagés
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))
      )}
    </>
  );
}
