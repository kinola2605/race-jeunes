import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/server/auth/session";
import { isEnrolled, resolveSeason } from "@/server/services/player";
import { playerBreakdown, seasonStandings } from "@/server/services/standings";
import { visibleSeasons, listSeasons } from "@/server/services/seasons";
import { latestPublished } from "@/server/services/scoring";
import { db } from "@/server/db";
import { seriesOf, isRanking } from "@/scoring";
import { SeasonPicker } from "@/components/season-picker";
import { EmptyState, Icon, PageHead, formatDateTime } from "@/components/ui";

export const metadata: Metadata = { title: "Classement" };

type Search = Promise<{ saison?: string; tag?: string; serie?: string; detail?: string }>;

/** E04 — FR-120 à FR-123 */
export default async function ClassementPage({ searchParams }: { searchParams: Search }) {
  const user = await requireUser();
  const sp = await searchParams;
  const season = await resolveSeason(user, sp.saison);
  const seasons = user.role === "ADMIN" ? await listSeasons() : await visibleSeasons();
  if (!season) {
    return (
      <>
        <PageHead eyebrow="Classement de la Race" title="Classement" />
        <EmptyState icon="trophy" title="Aucune saison à afficher" />
      </>
    );
  }
  const all = await seasonStandings(season.id);
  const admin = user.role === "ADMIN";
  const enrolled = admin || (await isEnrolled(season.id, user.id));
  let rows = all;
  let notice: string | null = null;
  if (!admin && season.visibility === "SELF") {
    rows = all.filter((r) => r.playerId === user.id);
    notice = "Pour cette saison, chaque joueur ne voit que son propre rang.";
  } else if (!admin && season.visibility === "ENROLLED" && !enrolled) {
    rows = [];
    notice = "Le classement de cette saison est réservé aux engagés.";
  }
  const tags = [...new Set(all.flatMap((r) => r.tags))].sort((a, b) => a.localeCompare(b, "fr"));
  if (sp.tag) rows = rows.filter((r) => r.tags.includes(sp.tag!));
  if (sp.serie) rows = rows.filter((r) => isRanking(r.startingRanking) && seriesOf(r.startingRanking) === sp.serie);

  const lastEntry = await db.pointsEntry.findFirst({ where: { match: { seasonId: season.id } }, orderBy: { createdAt: "desc" }, select: { createdAt: true } });
  const published = await latestPublished(db, season.id);
  const detailId = admin ? sp.detail ?? null : enrolled ? user.id : null;
  const detailRow = detailId ? all.find((r) => r.playerId === detailId) : undefined;
  const detail = detailRow ? await playerBreakdown(season.id, detailRow.playerId) : [];
  const q = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams({ saison: season.slug, ...(sp.tag ? { tag: sp.tag } : {}), ...(sp.serie ? { serie: sp.serie } : {}) });
    for (const [k, v] of Object.entries(extra)) {
      if (v === undefined) p.delete(k);
      else p.set(k, v);
    }
    return `/classement?${p.toString()}`;
  };

  return (
    <>
      <PageHead
        eyebrow="Classement de la Race"
        title={season.title}
        lead={`${all.length} engagés${lastEntry ? ` · mis à jour le ${formatDateTime(lastEntry.createdAt)}` : ""} · seuls les matchs validés comptent`}
      />
      <div className="toolbar">
        <SeasonPicker seasons={seasons} current={season.slug} />
      </div>
      <div className="chips mb-4" role="group" aria-label="Filtrer par étiquette ou série">
        <Link className="chip" href={q({ tag: undefined, serie: undefined })} aria-current={!sp.tag && !sp.serie ? "true" : undefined} style={!sp.tag && !sp.serie ? { border: "2px solid var(--text)", fontWeight: 600 } : undefined}>
          Tous
        </Link>
        {tags.map((t) => (
          <Link key={t} className="chip" href={q({ tag: t })} aria-current={sp.tag === t ? "true" : undefined} style={sp.tag === t ? { border: "2px solid var(--text)", fontWeight: 600 } : undefined}>
            <Icon name="tag" />
            {t}
          </Link>
        ))}
        {(
          [
            ["15+", "15/x et mieux"],
            ["30", "30/x"],
            ["40-NC", "40 et NC"],
          ] as const
        ).map(([k, label]) => (
          <Link key={k} className="chip" href={q({ serie: k })} aria-current={sp.serie === k ? "true" : undefined} style={sp.serie === k ? { border: "2px solid var(--text)", fontWeight: 600 } : undefined}>
            {label}
          </Link>
        ))}
      </div>

      {notice ? <p className="small muted">{notice}</p> : null}

      {rows.length === 0 ? (
        <EmptyState icon="trophy" title={all.length === 0 ? "Aucun engagé dans cette saison" : "Aucun joueur ne correspond"} />
      ) : (
        <>
          <ol className="rank hide-tablet-up" aria-label="Classement">
            {rows.map((r) => {
              const me = r.playerId === user.id;
              return (
                <li key={r.playerId} className={`rank-row${me ? " is-me" : ""}`} aria-current={me ? "true" : undefined}>
                  <span className="rank-pos">{r.rank}</span>
                  <div className="item-main">
                    <div className="item-title">
                      {admin ? (
                        <Link className="link" href={q({ detail: r.playerId }) + "#detail"} aria-label={`Détail — ${r.pseudo}`}>
                          {r.pseudo}
                        </Link>
                      ) : (
                        r.pseudo
                      )}
                      {me ? <span className="badge badge-me">Vous</span> : null}
                    </div>
                    <div className="item-meta">
                      {r.startingRanking} · {r.wins} V · {r.losses} D · {r.perfs} perf{r.perfs > 1 ? "s" : ""}
                      {r.tags.length ? ` · ${r.tags.join(", ")}` : ""}
                    </div>
                  </div>
                  <span className="rank-pts">
                    {r.points}
                    <small>pts</small>
                  </span>
                </li>
              );
            })}
          </ol>
          <div className="table-wrap hide-mobile">
            <table className="table">
              <caption className="sr-only">Classement {season.title}</caption>
              <thead>
                <tr>
                  <th className="num">Rang</th>
                  <th>Pseudo</th>
                  <th>Classement</th>
                  <th>Étiquettes</th>
                  <th className="num">Matchs</th>
                  <th className="num">V</th>
                  <th className="num">D</th>
                  <th className="num">Perfs</th>
                  <th className="num">Bonus</th>
                  <th className="num">Points</th>
                  {admin ? <th><span className="sr-only">Détail</span></th> : null}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const me = r.playerId === user.id;
                  return (
                    <tr key={r.playerId} className={me ? "is-selected" : undefined} aria-current={me ? "true" : undefined}>
                      <td className="num strong">{r.rank}</td>
                      <td className="strong">
                        {r.pseudo} {me ? <span className="badge badge-me">Vous</span> : null}
                      </td>
                      <td>{r.startingRanking}</td>
                      <td>{r.tags.map((t) => <span key={t} className="badge badge-tag" style={{ marginRight: 4 }}>{t}</span>)}</td>
                      <td className="num">{r.matches}</td>
                      <td className="num">{r.wins}</td>
                      <td className="num">{r.losses}</td>
                      <td className="num">{r.perfs}</td>
                      <td className="num">{r.bonus}</td>
                      <td className="num strong">{r.points}</td>
                      {admin ? (
                        <td>
                          <Link className="link" href={q({ detail: r.playerId }) + "#detail"} aria-label={`Détail — ${r.pseudo}`}>
                            Détail
                          </Link>
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {detailRow ? (
        <section className="section" id="detail" aria-labelledby="t-detail">
          <h2 className="section-title" id="t-detail">
            Détail du calcul — {detailRow.pseudo}
          </h2>
          <div className="cases cases-2">
            <div className="case">
              <div className="calc">
                {detail.map((d) => (
                  <div className="calc-row" key={d.label}>
                    <span>
                      {d.label} (×{d.count})
                    </span>
                    <span className="num">{d.points}</span>
                  </div>
                ))}
                {detailRow.assiduityBonus > 0 ? (
                  <div className="calc-row">
                    <span>Bonus d&apos;assiduité ({detailRow.matches} matchs validés)</span>
                    <span className="num">{detailRow.assiduityBonus}</span>
                  </div>
                ) : null}
                {detailRow.tournaments.map((t) => (
                  <div className="calc-row" key={t.name}>
                    <span>
                      Bonus tournoi — {t.name} ({t.wins} victoires)
                    </span>
                    <span className="num">{t.points}</span>
                  </div>
                ))}
                <div className="calc-row calc-total">
                  <span>Total</span>
                  <span className="num">{detailRow.points} pts</span>
                </div>
              </div>
            </div>
            <div className="case">
              <p className="small muted">
                Barème en vigueur : <strong>{season.title} · version {published?.version ?? "—"}</strong>. Classement de référence{" "}
                {season.rankingMode === "FROZEN" ? "figé à l'engagement" : "évolutif (classement à la date du match)"}.
              </p>
              <p className="small muted mb-0">Le détail match par match est visible dans « Mes matchs ».</p>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
