import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/server/db";
import { findDuplicates, matchesOfSeason, pendingMatches } from "@/server/services/matches";
import { cancelMatchAction, refuseMatchAction, validateMatchesAction, validateOneAction } from "@/app/actions/matches";
import { ConfirmButton, SubmitButton } from "@/components/forms";
import { EmptyState, Flash, Icon, MatchStatusBadge, PageHead, PiiNotice, ScoreBoard, formatDate } from "@/components/ui";

export const metadata: Metadata = { title: "Matchs" };

type Search = Promise<{ ok?: string; erreur?: string; vue?: string; refuser?: string }>;

/** E12b — FR-103, FR-105, FR-107 ; présentation en cartes : spec 010 */
export default async function MatchsAdminPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const pending = await pendingMatches();
  const openSeasons = await db.season.findMany({ where: { status: "OPEN" }, select: { id: true } });
  const all = (await Promise.all(openSeasons.map((s) => matchesOfSeason(s.id)))).flat();
  const duplicates = findDuplicates(pending, all);
  const vue = sp.vue === "valides" || sp.vue === "clos" ? sp.vue : "attente";
  const others = vue === "valides" ? all.filter((m) => m.status === "VALIDATED").slice(0, 60) : vue === "clos" ? all.filter((m) => m.status === "REFUSED" || m.status === "CANCELLED").slice(0, 60) : [];
  const refusing = sp.refuser ? pending.find((m) => m.id === sp.refuser) : undefined;
  const daysSince = (date: Date) => Math.floor((Date.now() - date.getTime()) / 86400000);
  const label = (m: (typeof pending)[number]) => `${m.playerA.pseudo} vs ${m.playerB?.pseudo ?? `Ext. · ${m.externalLabel}`}`;

  return (
    <>
      {/* L'écran sert d'abord à valider : la saisie devient une action secondaire. */}
      <div className="row-between nowrap" style={{ alignItems: "flex-start" }}>
        <PageHead eyebrow="Matchs · saisons ouvertes" title="File de validation" lead={`${pending.length} match${pending.length > 1 ? "s" : ""} en attente · du plus ancien au plus récent`} />
        <Link className="btn btn-secondary btn-sm" href="/admin/matchs/nouveau" aria-label="Saisir un match">
          <Icon name="plus" />
          Saisir
        </Link>
      </div>
      <Flash ok={sp.ok} error={sp.erreur} />
      <nav className="seg seg-eq mb-4" aria-label="Vue">
        <Link href="/admin/matchs" aria-current={vue === "attente" ? "true" : undefined}>
          En attente <small>{pending.length}</small>
        </Link>
        <Link href="/admin/matchs?vue=valides" aria-current={vue === "valides" ? "true" : undefined}>
          Validés
        </Link>
        <Link href="/admin/matchs?vue=clos" aria-current={vue === "clos" ? "true" : undefined}>
          Refusés / annulés
        </Link>
      </nav>

      {vue === "attente" ? (
        pending.length === 0 ? (
          <EmptyState icon="check" title="Rien à valider">
            <p>Tous les matchs déclarés ont été traités.</p>
          </EmptyState>
        ) : (
          <form action={validateMatchesAction} className="select-form">
            <ul className="mcards mcards-2">
              {pending.map((m) => (
                <li key={m.id} className="mcard">
                  <div className="mcard-head">
                    <input type="checkbox" name="matchId" value={m.id} aria-label={`Sélectionner le match ${label(m)}`} />
                    <span className="item-meta grow">
                      <span className="sr-only">{label(m)} · </span>
                      {formatDate(m.playedOn)} · depuis {daysSince(m.createdAt)} j · {m.season.title}
                      {m.kind === "RETIREMENT" ? " · abandon" : ""}
                      {m.tournament ? (
                        <>
                          {" "}
                          · tournoi <strong>{m.tournament}</strong>
                        </>
                      ) : null}
                    </span>
                    {duplicates.has(m.id) ? (
                      <span className="badge badge-ko">
                        <Icon name="alert" />
                        Doublon probable
                      </span>
                    ) : null}
                  </div>
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
                  {duplicates.has(m.id) ? <p className="small muted mb-0">Même paire et même date qu&apos;une autre saisie : validez l&apos;une et refusez l&apos;autre.</p> : null}
                  <div className="mcard-actions">
                    <button className="btn btn-ok grow" type="submit" formAction={validateOneAction.bind(null, m.id)}>
                      <Icon name="check" />
                      Valider
                    </button>
                    <Link className="btn btn-ghost" href={`/admin/matchs?refuser=${m.id}`}>
                      <Icon name="x" />
                      Refuser…
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
            {/* affichée seulement quand au moins un match est coché (CSS :has) */}
            <div className="select-bar">
              <span>
                <span className="select-count" aria-hidden="true" /> sélectionné(s)
              </span>
              <SubmitButton className="btn btn-ok">
                <Icon name="check" />
                Valider la sélection
              </SubmitButton>
            </div>
          </form>
        )
      ) : (
        <ul className="mcards mcards-2">
          {others.length === 0 ? <p className="muted">Aucun match.</p> : null}
          {others.map((m) => (
            <li key={m.id} className="mcard">
              <div className="mcard-head">
                <span className="item-meta grow">
                  <span className="sr-only">{label(m)} · </span>
                  {formatDate(m.playedOn)}
                  {m.tournament ? ` · ${m.tournament}` : ""}
                </span>
                {m.status === "VALIDATED" ? null : <MatchStatusBadge status={m.status} />}
              </div>
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
                walkover={m.kind === "WALKOVER" || !m.score}
              />
              {m.refusalReason ? <p className="small muted mb-0">Motif : {m.refusalReason}</p> : null}
              {m.status === "VALIDATED" ? (
                <div className="row-between">
                  <span className="small strong">{m.entries.map((e) => `${e.userId === m.playerAId ? m.playerA.pseudo : m.playerB?.pseudo} +${e.points}`).join(" · ")}</span>
                  <form action={cancelMatchAction}>
                    <input type="hidden" name="matchId" value={m.id} />
                    <input type="hidden" name="back" value="/admin/matchs?vue=valides" />
                    <ConfirmButton message={`Annuler le match ${label(m)} ? Ses points seront retirés.`}>
                      <Icon name="ban" />
                      Annuler
                    </ConfirmButton>
                  </form>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {refusing ? (
        <div className="scrim">
          <form className="dialog" role="dialog" aria-modal="true" aria-labelledby="ref-t" action={refuseMatchAction}>
            <h2 id="ref-t">Refuser le match {label(refusing)}</h2>
            <input type="hidden" name="matchId" value={refusing.id} />
            <div className="field">
              <label htmlFor="reason">Motif (visible par le joueur)</label>
              <input className="input" id="reason" name="reason" list="motifs" required minLength={3} maxLength={200} defaultValue="Score incomplet ou invalide" aria-describedby="r-pii" />
              <datalist id="motifs">
                <option value="Score incomplet ou invalide" />
                <option value="Match non joué ou non confirmé" />
                <option value="Doublon" />
              </datalist>
              <PiiNotice id="r-pii" />
            </div>
            <div className="actions" style={{ justifyContent: "flex-end" }}>
              <Link className="btn btn-ghost" href="/admin/matchs">
                Annuler
              </Link>
              <SubmitButton className="btn btn-danger">
                <Icon name="x" />
                Refuser
              </SubmitButton>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
