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
import { Alert, EmptyState, Icon, PageHead, PerfBadge, ResultBox, formatDate } from "@/components/ui";

export const metadata: Metadata = { title: "Accueil" };

/** E03 — FR-124 */
export default async function AccueilPage() {
  const user = await requireUser();
  if (user.role === "ADMIN") redirect("/admin");
  const season = await defaultSeasonFor(user);
  if (!season) {
    return (
      <>
        <PageHead eyebrow="Race jeunes" title={
            <span className="with-avatar">
              <Avatar pseudo={user.pseudo} avatar={user.avatar} size="md" />
              {`Bonjour ${user.pseudo}`}
            </span>
          } />
        <EmptyState icon="calendar" title="Vous n'êtes engagé·e dans aucune saison">
          <p>Le club vous engagera dans la prochaine Race.</p>
        </EmptyState>
      </>
    );
  }
  const [standings, matches, goal] = await Promise.all([seasonStandings(season.id), matchesOfPlayer(season.id, user.id), playerGoal(season.id, user.id)]);
  const me = standings.find((s) => s.playerId === user.id);
  const above = me ? standings.filter((s) => s.rank < me.rank).at(-1) : undefined;
  const pending = matches.filter((m) => m.status === "PENDING");
  const last = matches.find((m) => m.status === "VALIDATED");
  const lastView = last ? viewOf(last, user.id) : null;
  const statusLabel = season.status === "OPEN" ? "en cours" : season.status === "CLOSED" ? "clôturée" : "archivée";

  return (
    <>
      <PageHead eyebrow={`${season.title} · ${statusLabel}`} title={
            <span className="with-avatar">
              <Avatar pseudo={user.pseudo} avatar={user.avatar} size="md" />
              {`Bonjour ${user.pseudo}`}
            </span>
          } />
      {me ? (
        <section className="hero" aria-label="Ma position">
          <div className="row-between" style={{ alignItems: "flex-end" }}>
            <div>
              <span className="stat-label">Rang</span>
              <span className="stat-value stat-big">
                {me.rank}
                <small style={{ color: "inherit" }}>{me.rank === 1 ? "er" : "e"}</small>
              </span>
              <span className="small">sur {standings.length} engagés</span>
            </div>
            <div className="right">
              <span className="stat-label">Points</span>
              <span className="stat-value" style={{ fontSize: 44 }}>
                {me.points}
              </span>
              <span className="small">{above ? `−${above.points - me.points} pts du ${above.rank}e` : "En tête"}</span>
            </div>
          </div>
        </section>
      ) : null}

      {me ? (
        <section className="section" aria-labelledby="t-bilan">
          <h2 className="section-title" id="t-bilan">
            Mon bilan
          </h2>
          <div className="cases cases-4 stats">
            <div className="case">
              <span className="stat-label">Victoires</span>
              <span className="stat-value" style={{ color: "var(--success)" }}>{me.wins}</span>
            </div>
            <div className="case">
              <span className="stat-label">Défaites</span>
              <span className="stat-value" style={{ color: "var(--error)" }}>{me.losses}</span>
            </div>
            <div className="case">
              <span className="stat-label">Perfs</span>
              <span className="stat-value stat-perf">{me.perfs}</span>
            </div>
            <div className="case">
              <span className="stat-label">Classement de départ</span>
              <span className="stat-value">{me.startingRanking}</span>
            </div>
          </div>
        </section>
      ) : null}

      {goal ? (
        <section className="section" aria-labelledby="t-objectif">
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

      {pending.length > 0 ? (
        <div className="mt-6">
          <Alert kind="warn" icon="clock" title={`${pending.length} match${pending.length > 1 ? "s" : ""} en attente de validation`}>
            Les points seront ajoutés après validation par le club.
          </Alert>
        </div>
      ) : null}

      <section className="section" aria-labelledby="t-dernier">
        <h2 className="section-title" id="t-dernier">
          Dernier match validé
        </h2>
        {last && lastView ? (
          <div className="cases">
            <div className="case">
              <div className="item" style={{ padding: 0 }}>
                <ResultBox won={lastView.won} walkover={last.kind === "WALKOVER"} />
                <div className="item-main">
                  <div className="item-title">
                    {lastView.opponent} <span className="subtle small">{lastView.opponentRanking}</span>
                    {lastView.entry?.isPerf ? <PerfBadge /> : null}
                  </div>
                  <div className="item-meta">
                    {formatDate(last.playedOn)}
                    {lastView.score ? ` · ${lastView.score}` : ""}
                  </div>
                </div>
                <div className="item-end">
                  <span className="stat-value" style={{ fontSize: "var(--fs-2xl)", color: "var(--accent-2)" }}>
                    +{lastView.entry?.points ?? 0}
                  </span>
                  <span className="small subtle">pts</span>
                </div>
              </div>
              <div className="actions" style={{ marginTop: "var(--s-4)" }}>
                <Link className="btn btn-secondary" href={`/matchs?saison=${season.slug}#m-${last.id}`}>
                  Voir le détail du calcul
                </Link>
                <Link className="btn btn-ghost" href={`/classement?saison=${season.slug}`}>
                  Classement <Icon name="chev-r" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState icon="list" title="Aucun match validé pour l'instant">
            <p>Déclarez votre premier match après l&apos;avoir joué.</p>
          </EmptyState>
        )}
      </section>

      {season.status === "OPEN" && me ? (
        <Link className="btn btn-primary btn-block mt-8" href="/matchs/nouveau">
          <Icon name="plus" /> Déclarer un match
        </Link>
      ) : null}
    </>
  );
}
