import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/session";
import { resolveSeason } from "@/server/services/player";
import { matchesOfPlayer, viewOf } from "@/server/services/matches";
import { visibleSeasons } from "@/server/services/seasons";
import { SeasonPicker } from "@/components/season-picker";
import { EmptyState, Flash, Icon, MatchStatusBadge, PageHead, PerfBadge, ResultBox, SetBoxes, formatDate } from "@/components/ui";

export const metadata: Metadata = { title: "Mes matchs" };

type Search = Promise<{ saison?: string; filtre?: string; ok?: string }>;

const monthOf = (d: Date) => d.toLocaleDateString("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });

/** E05 — FR-125, FR-127 (uniquement ses propres matchs) ; présentation : spec 010, FR-1008 */
export default async function MesMatchsPage({ searchParams }: { searchParams: Search }) {
  const user = await requireUser();
  if (user.role === "ADMIN") redirect("/admin/matchs");
  const sp = await searchParams;
  const season = await resolveSeason(user, sp.saison);
  if (!season) {
    return (
      <>
        <PageHead eyebrow="Mes matchs" title="Mes matchs" />
        <EmptyState icon="list" title="Aucune saison" />
      </>
    );
  }
  const seasons = await visibleSeasons();
  const all = await matchesOfPlayer(season.id, user.id);
  const views = all.map((m) => ({ m, v: viewOf(m, user.id) }));
  const validated = views.filter(({ m }) => m.status === "VALIDATED");
  const won = validated.filter(({ v }) => v.won);
  const lost = validated.filter(({ v }) => !v.won);
  const waiting = views.filter(({ m }) => m.status === "PENDING");
  const filtered = sp.filtre === "victoires" ? won : sp.filtre === "defaites" ? lost : sp.filtre === "attente" ? waiting : views;
  const perfs = validated.filter(({ v }) => v.entry?.isPerf).length;
  const points = validated.reduce((s, { v }) => s + (v.entry?.points ?? 0), 0);
  const tab = (key: string | undefined, label: string, count: number) => (
    <Link href={`/matchs?saison=${season.slug}${key ? `&filtre=${key}` : ""}`} aria-current={sp.filtre === key ? "true" : undefined}>
      {label} <small>{count}</small>
    </Link>
  );
  // regroupement par mois, dans l'ordre déjà fourni (du plus récent au plus ancien)
  const groups: { month: string; items: typeof filtered }[] = [];
  for (const row of filtered) {
    const month = monthOf(row.m.playedOn);
    const lastGroup = groups.at(-1);
    if (lastGroup && lastGroup.month === month) lastGroup.items.push(row);
    else groups.push({ month, items: [row] });
  }

  return (
    <>
      <PageHead eyebrow={season.title} title="Mes matchs" />
      <Flash ok={sp.ok} />
      <dl className="strip strip-card" aria-label="Bilan de la saison">
        <div>
          <dt>Validé{validated.length > 1 ? "s" : ""}</dt>
          <dd>{validated.length}</dd>
        </div>
        <div>
          <dt>Victoire{won.length > 1 ? "s" : ""}</dt>
          <dd>{won.length}</dd>
        </div>
        <div>
          <dt>Défaite{lost.length > 1 ? "s" : ""}</dt>
          <dd>{lost.length}</dd>
        </div>
        <div>
          <dt>Perf{perfs > 1 ? "s" : ""}</dt>
          <dd>{perfs}</dd>
        </div>
        <div>
          <dt>Point{points > 1 ? "s" : ""}</dt>
          <dd>{points}</dd>
        </div>
      </dl>
      <div className="toolbar">
        <SeasonPicker seasons={seasons} current={season.slug} />
      </div>
      <nav className="seg seg-eq mb-4" aria-label="Filtrer les matchs">
        {tab(undefined, "Tous", views.length)}
        {tab("victoires", "Victoires", won.length)}
        {tab("defaites", "Défaites", lost.length)}
        {tab("attente", "Attente", waiting.length)}
      </nav>

      {filtered.length === 0 ? (
        <EmptyState icon="list" title={views.length === 0 ? "Aucun match pour l'instant" : "Aucun match dans cette vue"}>
          {season.status === "OPEN" && views.length === 0 ? (
            <Link className="btn btn-primary" href="/matchs/nouveau">
              <Icon name="plus" />
              Déclarer un match
            </Link>
          ) : null}
        </EmptyState>
      ) : (
        groups.map((g) => (
          <section key={g.month} className="mt-6" aria-label={g.month}>
            <h2 className="section-title" style={{ marginBottom: "var(--s-1)" }}>
              {g.month}
            </h2>
            <ul className="list" aria-label={`Matchs de ${g.month}`}>
              {g.items.map(({ m, v }) => (
                <li key={m.id} id={`m-${m.id}`}>
                  <details className="disclose">
                    <summary className="item">
                      {m.status === "CANCELLED" ? <span className="res res-wo">—</span> : <ResultBox won={v.won} walkover={m.kind === "WALKOVER"} />}
                      <div className="item-main">
                        <div className="item-title" style={m.status === "CANCELLED" ? { textDecoration: "line-through" } : undefined}>
                          {v.opponent} {v.opponentRanking ? <span className="subtle small">{v.opponentRanking}</span> : null}
                          {v.entry?.isPerf ? <PerfBadge /> : null}
                        </div>
                        <div className="item-meta">
                          {formatDate(m.playedOn)} · {m.kind === "WALKOVER" || !v.score ? "forfait" : <SetBoxes score={v.score} />}
                          {m.kind === "RETIREMENT" ? " (abandon)" : ""}
                          {m.tournament ? ` · ${m.tournament}` : ""}
                        </div>
                      </div>
                      {/* le statut « Validé » est l'état normal : seuls les autres sont signalés */}
                      {m.status === "VALIDATED" ? (
                        <div className="item-end strong" style={v.entry?.isPerf ? { color: "var(--accent-2)" } : undefined}>
                          +{v.entry?.points ?? 0}
                        </div>
                      ) : (
                        <MatchStatusBadge status={m.status} />
                      )}
                      <span className="chev">
                        <Icon name="chev-d" />
                      </span>
                    </summary>
                    <div className="disclose-body">
                      <div className="cases">
                        <div className="case">
                          {m.status === "VALIDATED" && v.entry ? (
                            <>
                              <h3 className="case-title">Comment ces {v.entry.points} points sont calculés</h3>
                              <div className="calc">
                                {(v.entry.breakdown as { label: string; value: string }[]).map((l) => (
                                  <div className="calc-row" key={l.label}>
                                    <span>{l.label}</span>
                                    <span>{l.value}</span>
                                  </div>
                                ))}
                                <div className="calc-row">
                                  <span>Barème appliqué</span>
                                  <span>
                                    {m.season.title} · v{v.entry.ruleSet.version}
                                  </span>
                                </div>
                                <div className="calc-row calc-total">
                                  <span>Points gagnés</span>
                                  <span className="num">+{v.entry.points} pts</span>
                                </div>
                              </div>
                            </>
                          ) : m.status === "REFUSED" ? (
                            <p className="mb-0">
                              <strong>Motif du refus :</strong> {m.refusalReason}
                            </p>
                          ) : m.status === "PENDING" ? (
                            <p className="mb-0 muted">En attente de validation par le club. Les points seront calculés avec le barème en vigueur au moment de la validation.</p>
                          ) : (
                            <p className="mb-0 muted">Match annulé : aucun point.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}
