import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/server/auth/session";
import { defaultSeasonFor } from "@/server/services/player";
import { adminDashboard } from "@/server/services/dashboard";
import { validateMatchesAction } from "@/app/actions/matches";
import { Alert, EmptyState, Icon, PageHead, ScoreBoard, formatDate } from "@/components/ui";

export const metadata: Metadata = { title: "Suivi" };

/** E07 — FR-140, FR-141 */
export default async function SuiviPage() {
  const admin = await requireAdmin();
  const season = await defaultSeasonFor(admin);
  const d = await adminDashboard(season?.id ?? null);
  const oldest = d.pending[0];
  const ageDays = oldest ? Math.floor((Date.now() - oldest.createdAt.getTime()) / 86400000) : 0;
  const daysSince = (date: Date) => Math.floor((Date.now() - date.getTime()) / 86400000);
  const anomalies = d.duplicates.size + d.externalNc.length;

  return (
    <>
      <PageHead eyebrow={`Tableau de bord${season ? ` · ${season.title}` : ""}`} title="Suivi" />
      {/* Spec 010 : un indicateur principal (celui qui appelle une action), trois secondaires. */}
      <div className={`kpi-main${d.pending.length > 0 ? " is-hot" : ""}`}>
        <div>
          <span className="stat-label">Matchs à valider</span>
          <span className="stat-value" style={d.pending.length > 0 ? { color: "var(--warning)" } : { color: "var(--text-subtle)" }}>
            {d.pending.length}
          </span>
          <span className="small subtle">{oldest ? `le plus ancien attend depuis ${ageDays} j` : "rien en attente"}</span>
        </div>
        {d.pending.length > 0 ? (
          <Link className="btn btn-primary" href="/admin/matchs">
            Traiter la file
          </Link>
        ) : null}
      </div>
      <div className="kpi3">
        <a className="case" href="#anomalies">
          <span className="stat-label">Anomalies</span>
          <span className="stat-value" style={{ color: anomalies > 0 ? "var(--error)" : "var(--text-subtle)" }}>{anomalies}</span>
          <span className="small subtle">{anomalies > 0 ? "à vérifier" : "aucune"}</span>
        </a>
        <a className="case" href="#mdp">
          <span className="stat-label">Mdp temporaires</span>
          <span className="stat-value">{d.temporary.length}</span>
          <span className="small subtle">jamais changés</span>
        </a>
        <a className="case" href="#sans-match">
          <span className="stat-label">Sans match</span>
          <span className="stat-value">{d.withoutMatch.length}</span>
          <span className="small subtle">sur {d.enrolledCount}</span>
        </a>
      </div>

      <div className="layout-2">
        <section className="section" aria-labelledby="t-valider">
          <div className="row-between mb-4">
            <h2 className="section-title mb-0" id="t-valider">
              À valider
            </h2>
            <Link className="link small" href="/admin/matchs">
              Tout voir ({d.pending.length})
            </Link>
          </div>
          {d.pending.length === 0 ? (
            <EmptyState icon="check" title="Rien à valider" />
          ) : (
            <ul className="mcards">
              {d.pending.slice(0, 4).map((m) => (
                <li key={m.id} className="mcard">
                  <ScoreBoard
                    a={
                      <>
                        {m.playerA.pseudo} <span className="subtle small">{m.rankingA}</span>
                      </>
                    }
                    b={
                      <>
                        {m.playerB?.pseudo ?? `Ext. · ${m.externalLabel}`} <span className="subtle small">{m.rankingB ?? m.externalRanking}</span>
                      </>
                    }
                    winner={m.winner === "A" ? "A" : "B"}
                    score={m.score}
                    walkover={m.kind === "WALKOVER"}
                  />
                  <div className="row-between">
                    <span className="item-meta">
                      {formatDate(m.playedOn)} · depuis {daysSince(m.createdAt)} j
                    </span>
                    <form action={validateMatchesAction}>
                      <input type="hidden" name="matchId" value={m.id} />
                      <button className="btn btn-ok btn-sm" type="submit" aria-label={`Valider le match ${m.playerA.pseudo} contre ${m.playerB?.pseudo ?? m.externalLabel}`}>
                        <Icon name="check" />
                        Valider
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="section" id="anomalies" aria-labelledby="t-ano">
          <h2 className="section-title" id="t-ano">
            Anomalies
          </h2>
          <div className="stack" style={{ ["--gap" as string]: "var(--s-3)" }}>
            {d.duplicates.size === 0 && d.externalNc.length === 0 ? <p className="muted small">Aucune anomalie détectée.</p> : null}
            {d.pending
              .filter((m) => d.duplicates.has(m.id))
              .map((m) => (
                <Alert key={m.id} kind="ko" title="Doublon probable">
                  {m.playerA.pseudo} vs {m.playerB?.pseudo}, {formatDate(m.playedOn)} : plusieurs saisies pour la même paire et la même date.{" "}
                  <Link className="link" href="/admin/matchs">
                    Traiter
                  </Link>
                </Alert>
              ))}
            {d.externalNc.map((m) => (
              <Alert key={m.id} kind="warn" title="Adversaire extérieur non classé">
                « {m.externalLabel} » (saisi par {m.playerA.pseudo}) : classement NC, à vérifier.
              </Alert>
            ))}
          </div>
        </section>

        <section className="section" id="mdp" aria-labelledby="t-mdp">
          <h2 className="section-title" id="t-mdp">
            Mots de passe temporaires jamais changés
          </h2>
          {d.temporary.length === 0 ? (
            <p className="muted small">Tous les joueurs ont choisi leur mot de passe.</p>
          ) : (
            <ul className="list">
              {d.temporary.map((u) => (
                <li key={u.id}>
                  <div className="item">
                    <span className="badge badge-wait">
                      <Icon name="key" />
                      Temporaire
                    </span>
                    <div className="item-main">
                      <div className="item-title">{u.pseudo}</div>
                      <div className="item-meta">remis il y a {daysSince(u.updatedAt)} j</div>
                    </div>
                    <Link className="btn btn-ghost btn-sm" href={`/admin/joueurs/${u.id}`}>
                      <Icon name="refresh" />
                      Gérer
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="section" id="sans-match" aria-labelledby="t-sm">
          <h2 className="section-title" id="t-sm">
            Engagés sans match validé
          </h2>
          {d.withoutMatch.length === 0 ? (
            <p className="muted small">Tous les engagés ont au moins un match validé.</p>
          ) : (
            <div className="chips" style={{ flexWrap: "wrap" }}>
              {d.withoutMatch.map((w) => (
                <span className="chip" key={w.pseudo}>
                  {w.pseudo} · {w.startingRanking}
                </span>
              ))}
            </div>
          )}
        </section>
      </div>

      {season ? (
        <div className="actions">
          <a className="btn btn-secondary" href={`/api/export/classement?saison=${season.slug}`}>
            <Icon name="download" />
            Exporter le classement (CSV)
          </a>
          <a className="btn btn-secondary" href={`/api/export/matchs?saison=${season.slug}`}>
            <Icon name="download" />
            Exporter les matchs (CSV)
          </a>
        </div>
      ) : null}
    </>
  );
}
