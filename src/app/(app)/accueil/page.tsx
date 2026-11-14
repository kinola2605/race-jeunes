import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/session";
import { defaultSeasonFor } from "@/server/services/player";
import { seasonStandings } from "@/server/services/standings";
import { matchesOfPlayer, viewOf } from "@/server/services/matches";
import { playerGoal } from "@/server/services/goals";
import { TIER_LABEL, goalMessage, goalTier } from "@/goals/goals";
import { GoalCourt } from "@/components/goal-court";
import { Avatar } from "@/components/avatar";
import { EmptyState, Icon, Ordinal, PageHead, PerfBadge, ResultBox, SetBoxes, formatDate } from "@/components/ui";

export const metadata: Metadata = { title: "Accueil" };

/** E03 — FR-124 ; mise en page : spec 010 (FR-1001 à FR-1004) */
export default async function AccueilPage() {
  const user = await requireUser();
  if (user.role === "ADMIN") redirect("/admin");
  const season = await defaultSeasonFor(user);
  const hello = (
    <span className="with-avatar">
      <Avatar pseudo={user.pseudo} avatar={user.avatar} size="md" />
      {`Bonjour ${user.pseudo}`}
    </span>
  );
  if (!season) {
    return (
      <>
        <PageHead eyebrow="Race jeunes" title={hello} />
        <EmptyState icon="calendar" title="Vous n'êtes engagé·e dans aucune saison">
          <p>Le club vous engagera dans la prochaine Race.</p>
        </EmptyState>
      </>
    );
  }
  const [standings, matches, goal] = await Promise.all([seasonStandings(season.id), matchesOfPlayer(season.id, user.id), playerGoal(season.id, user.id)]);
  const me = standings.find((s) => s.playerId === user.id);
  const above = me ? standings.filter((s) => s.rank < me.rank).at(-1) : undefined;
  const gap = me && above ? above.points - me.points : 0;
  const pending = matches.filter((m) => m.status === "PENDING");
  const last = matches.find((m) => m.status === "VALIDATED");
  const lastView = last ? viewOf(last, user.id) : null;
  const lastPoints = lastView?.entry?.points ?? 0;
  const statusLabel = season.status === "OPEN" ? "en cours" : season.status === "CLOSED" ? "clôturée" : "archivée";

  return (
    <>
      <PageHead eyebrow={`${season.title} · ${statusLabel}`} title={hello} />
      {/* Une colonne sur mobile (ordre o1 à o4), deux colonnes sur grand écran. */}
      <div className={pending.length > 0 || goal ? "home" : undefined}>
        <div className="home-main">
          {me ? (
            <section className="hero o1" aria-label="Ma position">
              <div className="row-between" style={{ alignItems: "flex-end" }}>
                <div>
                  <span className="stat-label">Rang</span>
                  <span className="stat-value stat-big">
                    <Ordinal n={me.rank} />
                    <small style={{ color: "inherit" }}> / {standings.length}</small>
                  </span>
                </div>
                <div className="right">
                  <span className="stat-label">Points</span>
                  <span className="stat-value stat-big">{me.points}</span>
                </div>
              </div>
              <p className="hero-gap">
                {above ? (
                  gap === 0 ? (
                    <>
                      À égalité de points avec le <Ordinal n={above.rank} />
                    </>
                  ) : (
                    <>
                      {gap === 1 ? "Plus qu'1 pt" : `Plus que ${gap} pts`} pour rejoindre le <Ordinal n={above.rank} />
                    </>
                  )
                ) : (
                  "En tête du classement"
                )}
              </p>
              <dl className="strip" aria-label="Mon bilan">
                <div>
                  <dt>Victoire{me.wins > 1 ? "s" : ""}</dt>
                  <dd>{me.wins}</dd>
                </div>
                <div>
                  <dt>Défaite{me.losses > 1 ? "s" : ""}</dt>
                  <dd>{me.losses}</dd>
                </div>
                <div>
                  <dt>Perf{me.perfs > 1 ? "s" : ""}</dt>
                  <dd>{me.perfs}</dd>
                </div>
                <div>
                  <dt>
                    <span className="sr-only">Classement de </span>Départ
                  </dt>
                  <dd>{me.startingRanking}</dd>
                </div>
              </dl>
            </section>
          ) : null}

          <section className="section o4" aria-labelledby="t-dernier">
            <h2 className="section-title" id="t-dernier">
              Dernier match validé
            </h2>
            {last && lastView ? (
              <Link className="case" href={`/matchs?saison=${season.slug}#m-${last.id}`} aria-label={`Dernier match contre ${lastView.opponent} : voir le détail du calcul`}>
                <div className="item" style={{ padding: 0 }}>
                  <ResultBox won={lastView.won} walkover={last.kind === "WALKOVER"} />
                  <div className="item-main">
                    <div className="item-title">
                      {lastView.opponent} <span className="subtle small">{lastView.opponentRanking}</span>
                      {lastView.entry?.isPerf ? <PerfBadge /> : null}
                    </div>
                    <div className="item-meta">
                      {formatDate(last.playedOn)}
                      {lastView.score ? (
                        <>
                          {" · "}
                          <SetBoxes score={lastView.score} />
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className="item-end">
                    <span className="stat-value" style={{ fontSize: "var(--fs-2xl)", color: "var(--accent-2)" }}>
                      +{lastPoints}
                    </span>
                    <span className="small subtle">{lastPoints > 1 ? "pts" : "pt"}</span>
                  </div>
                  <span className="chev">
                    <Icon name="chev-r" />
                  </span>
                </div>
              </Link>
            ) : (
              <EmptyState icon="list" title="Aucun match validé pour l'instant">
                <p>Déclarez votre premier match après l&apos;avoir joué.</p>
              </EmptyState>
            )}
          </section>
        </div>

        <div className="home-side">
          {pending.length > 0 ? (
            <Link className="alert alert-warn mt-6 o2" href={`/matchs?saison=${season.slug}&filtre=attente`}>
              <Icon name="clock" />
              <div className="alert-body">
                <span className="alert-title">
                  {pending.length} match{pending.length > 1 ? "s" : ""} en attente de validation
                </span>
                <div className="small">Les points seront ajoutés après validation par le club.</div>
              </div>
              <Icon name="chev-r" />
            </Link>
          ) : null}

          {goal ? (
            <section className="section o3" aria-labelledby="t-objectif">
              <h2 className="section-title" id="t-objectif">
                Mon objectif de matchs
              </h2>
              <div className="cases">
                <div className="case">
                  <div className="row-between" style={{ alignItems: "flex-end" }}>
                    <span className="stat-value">
                      {goal.played}
                      <small className="subtle"> / {goal.target} matchs</small>
                    </span>
                    <span className={`goal-tier${goal.reached ? " is-done" : ""}`}>
                      <Icon name={goal.reached ? "trophy" : "flag"} />
                      {TIER_LABEL[goalTier(goal)]}
                    </span>
                  </div>
                  <GoalCourt played={goal.played} pending={goal.pending} target={goal.target} />
                  <p className="strong mb-0 mt-2">{goalMessage(goal)}</p>
                  <p className="small subtle mb-0 mt-2">
                    Matchs validés de la saison, hors forfaits
                    {goal.pending > 0 ? ` · ${goal.pending} en attente de validation (balle en pointillés)` : ""}.
                  </p>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}
