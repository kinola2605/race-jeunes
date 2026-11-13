import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/session";
import { resolveSeason } from "@/server/services/player";
import { matchesOfPlayer, viewOf } from "@/server/services/matches";
import { visibleSeasons } from "@/server/services/seasons";
import { SeasonPicker } from "@/components/season-picker";
import { EmptyState, Flash, Icon, MatchStatusBadge, PageHead, PerfBadge, ResultBox, formatDate } from "@/components/ui";

export const metadata: Metadata = { title: "Mes matchs" };

type Search = Promise<{ saison?: string; filtre?: string; ok?: string }>;

/** E05 — FR-125, FR-127 (uniquement ses propres matchs) */
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
  const filtered = views.filter(({ m, v }) =>
    sp.filtre === "victoires" ? m.status === "VALIDATED" && v.won : sp.filtre === "defaites" ? m.status === "VALIDATED" && !v.won : sp.filtre === "attente" ? m.status === "PENDING" : true,
  );
  const validated = views.filter(({ m }) => m.status === "VALIDATED");
  const wins = validated.filter(({ v }) => v.won).length;
  const perfs = validated.filter(({ v }) => v.entry?.isPerf).length;
  const points = validated.reduce((s, { v }) => s + (v.entry?.points ?? 0), 0);
  const tab = (key: string | undefined, label: string) => (
    <Link href={`/matchs?saison=${season.slug}${key ? `&filtre=${key}` : ""}`} aria-current={sp.filtre === key ? "true" : undefined}>
      {label}
    </Link>
  );

  return (
    <>
      <PageHead
        eyebrow="Mes matchs"
        title={season.title}
        lead={`${validated.length} matchs validés · ${wins} V · ${validated.length - wins} D · ${perfs} perf${perfs > 1 ? "s" : ""} · ${points} pts de matchs`}
      />
      <Flash ok={sp.ok} />
      <div className="toolbar">
        <SeasonPicker seasons={seasons} current={season.slug} />
      </div>
      <nav className="seg mb-4" aria-label="Filtrer les matchs">
        {tab(undefined, "Tous")}
        {tab("victoires", "Victoires")}
        {tab("defaites", "Défaites")}
        {tab("attente", "En attente")}
      </nav>

      {filtered.length === 0 ? (
        <EmptyState icon="list" title="Aucun match pour l'instant">
          {season.status === "OPEN" ? (
            <Link className="btn btn-primary" href="/matchs/nouveau">
              <Icon name="plus" />
              Déclarer un match
            </Link>
          ) : null}
        </EmptyState>
      ) : (
        <ul className="list" aria-label="Liste des matchs">
          {filtered.map(({ m, v }) => (
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
                      {formatDate(m.playedOn)} · {m.kind === "WALKOVER" ? "forfait" : v.score}
                      {m.kind === "RETIREMENT" ? " (abandon)" : ""}
                      {m.tournament ? ` · ${m.tournament}` : ""} · <MatchStatusBadge status={m.status} />
                    </div>
                  </div>
                  <div className="item-end strong" style={v.entry?.isPerf ? { color: "var(--accent-2)" } : undefined}>
                    {m.status === "VALIDATED" ? `+${v.entry?.points ?? 0}` : "—"}
                  </div>
                  <span className="chev">
                    <Icon name="chev-r" />
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
      )}
    </>
  );
}
