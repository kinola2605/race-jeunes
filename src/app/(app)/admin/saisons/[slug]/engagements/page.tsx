import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LADDER } from "@/scoring";
import { getSeason } from "@/server/services/seasons";
import { enrollmentBoard } from "@/server/services/enrollments";
import { db } from "@/server/db";
import { enrollAction, startingRankingAction, unenrollAction } from "@/app/actions/admin";
import { ConfirmButton, SubmitButton } from "@/components/forms";
import { Flash, Icon, PageHead } from "@/components/ui";

export const metadata: Metadata = { title: "Engagements" };

/** E11 — FR-080 à FR-082 */
export default async function EngagementsPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ ok?: string; erreur?: string; tag?: string }> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const season = await getSeason(slug);
  if (!season) notFound();
  const board = await enrollmentBoard(season.id);
  const played = new Set(
    (await db.match.findMany({ where: { seasonId: season.id }, select: { playerAId: true, playerBId: true } })).flatMap((m) => [m.playerAId, m.playerBId ?? ""]),
  );
  const writable = season.status === "DRAFT" || season.status === "OPEN";
  const enrolled = board.filter((b) => b.enrollment);
  const free = board.filter((b) => !b.enrollment);
  const tags = [...new Set(free.flatMap((b) => b.tags))].sort();
  const preselect = (b: (typeof board)[number]) => (sp.tag ? b.tags.includes(sp.tag) : false);

  return (
    <>
      <PageHead
        eyebrow={
          <>
            <Link className="link" href="/admin/saisons">
              Saisons
            </Link>{" "}
            /{" "}
            <Link className="link" href={`/admin/saisons/${season.slug}`}>
              {season.slug}
            </Link>
          </>
        }
        title="Engagements"
        lead={`${enrolled.length} engagés · classement de référence ${season.rankingMode === "FROZEN" ? "figé à l'engagement" : "évolutif"} (paramètre de saison)`}
      />
      <Flash ok={sp.ok} error={sp.erreur} />
      {!writable ? <p className="muted">Saison en lecture seule : les engagements ne sont plus modifiables.</p> : null}

      {writable && free.length > 0 ? (
        <section className="section" style={{ marginTop: 0 }} aria-labelledby="t-free">
          <h2 className="section-title" id="t-free">
            À engager ({free.length})
          </h2>
          <div className="filter-row mb-4" role="group" aria-label="Sélection rapide par étiquette">
            <span className="filter-label" aria-hidden="true">
              Cocher
            </span>
            <Link className={`chip${!sp.tag ? " is-on" : ""}`} href={`/admin/saisons/${season.slug}/engagements`}>
              Aucun
            </Link>
            {tags.map((t) => (
              <Link key={t} className={`chip${sp.tag === t ? " is-on" : ""}`} href={`/admin/saisons/${season.slug}/engagements?tag=${encodeURIComponent(t)}`}>
                {t}
              </Link>
            ))}
          </div>
          <form action={enrollAction} className="select-form">
            <input type="hidden" name="seasonId" value={season.id} />
            <ul className="list" aria-label="Joueurs non engagés">
              {free.map((b) => (
                <li key={b.id}>
                  <label className="item" style={{ cursor: "pointer" }}>
                    <input type="checkbox" name="userId" value={b.id} defaultChecked={preselect(b)} style={{ width: 24, height: 24, margin: 4, accentColor: "var(--accent)" }} />
                    <div className="item-main">
                      <div className="item-title">{b.pseudo}</div>
                      <div className="item-meta">
                        {b.ranking} · {b.tags.join(", ") || "sans étiquette"}
                      </div>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
            {/* Spec 011 : la barre n'apparaît que si au moins un joueur est coché, avec le nombre coché. */}
            <div className="select-bar">
              <span>
                <span className="select-count" aria-hidden="true" /> sélectionné(s)
              </span>
              <SubmitButton>
                <Icon name="plus" />
                Engager la sélection
              </SubmitButton>
            </div>
          </form>
        </section>
      ) : null}

      <section className="section" aria-labelledby="t-enr">
        <h2 className="section-title" id="t-enr">
          Engagés ({enrolled.length})
        </h2>
        <ul className="list">
          {enrolled.map((b) => (
            <li key={b.id}>
              <div className="enr-row">
                <div className="item-main">
                  <div className="item-title">{b.pseudo}</div>
                  <div className="item-meta">
                    {b.enrollment!.startingRanking === b.ranking ? `départ ${b.ranking}` : `départ ${b.enrollment!.startingRanking} · actuel ${b.ranking}`}
                    {b.tags.length ? ` · ${b.tags.join(", ")}` : ""}
                  </div>
                </div>
                {writable ? (
                  <div className="enr-controls">
                    <form action={startingRankingAction} className="enr-controls">
                      <input type="hidden" name="seasonId" value={season.id} />
                      <input type="hidden" name="userId" value={b.id} />
                      <label className="sr-only" htmlFor={`r-${b.id}`}>
                        Classement de départ de {b.pseudo}
                      </label>
                      <select className="select" id={`r-${b.id}`} name="ranking" defaultValue={b.enrollment!.startingRanking}>
                        {LADDER.map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                      <button className="btn btn-ghost btn-sm" type="submit">
                        Modifier
                      </button>
                    </form>
                    {!played.has(b.id) ? (
                      <form action={unenrollAction}>
                        <input type="hidden" name="seasonId" value={season.id} />
                        <input type="hidden" name="userId" value={b.id} />
                        <ConfirmButton message={`Retirer ${b.pseudo} de la saison ?`}>
                          <Icon name="x" />
                          Retirer
                        </ConfirmButton>
                      </form>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        <p className="small subtle">Un engagé ayant des matchs ne peut pas être retiré. Les comptes désactivés n&apos;apparaissent pas dans la liste à engager.</p>
      </section>
    </>
  );
}
