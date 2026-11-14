import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/session";
import { enrolledSeasonsOf } from "@/server/services/enrollments";
import { seasonStandings } from "@/server/services/standings";
import { EmptyState, Ordinal, PageHead, SeasonStatusBadge } from "@/components/ui";

export const metadata: Metadata = { title: "Mes saisons" };

/** E06 — FR-126 ; spec 010, FR-1013 */
export default async function MesSaisonsPage() {
  const user = await requireUser();
  if (user.role === "ADMIN") redirect("/admin/saisons");
  const enrollments = (await enrolledSeasonsOf(user.id)).filter((e) => e.season.status !== "DRAFT");
  const cards = await Promise.all(
    enrollments.map(async (e) => {
      const standings = await seasonStandings(e.seasonId);
      return { e, me: standings.find((s) => s.playerId === user.id), total: standings.length };
    }),
  );
  return (
    <>
      <PageHead eyebrow="Historique" title="Mes saisons" lead="Toutes vos saisons. Celles qui sont clôturées ou archivées restent consultables." />
      {cards.length === 0 ? (
        <EmptyState icon="calendar" title="Aucune saison pour l'instant" />
      ) : (
        <div className="cases cases-2">
          {cards.map(({ e, me, total }) => (
            <article className="case" key={e.id}>
              <div className="row-between nowrap" style={{ alignItems: "flex-start" }}>
                <h2 className="case-title mb-0">{e.season.title}</h2>
                <SeasonStatusBadge status={e.season.status} />
              </div>
              <p className="small subtle">Classement de départ {e.startingRanking}</p>
              {me ? (
                <>
                  <div className="stats mt-4">
                    <div>
                      <span className="stat-label">{e.season.status === "OPEN" ? "Rang" : "Rang final"}</span>
                      <span className="stat-value">
                        <Ordinal n={me.rank} />
                        <small> / {total}</small>
                      </span>
                    </div>
                    <div>
                      <span className="stat-label">Points</span>
                      <span className="stat-value">{me.points}</span>
                    </div>
                  </div>
                  <p className="small muted mt-4">
                    {me.wins} V · {me.losses} D · {me.perfs} perf{me.perfs > 1 ? "s" : ""}
                  </p>
                </>
              ) : null}
              <div className="row">
                <Link className="btn btn-secondary btn-sm" href={`/classement?saison=${e.season.slug}`}>
                  Classement
                </Link>
                <Link className="btn btn-ghost btn-sm" href={`/matchs?saison=${e.season.slug}`}>
                  Mes matchs
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
