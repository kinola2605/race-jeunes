import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/server/db";
import { findDuplicates, matchesOfSeason, pendingMatches } from "@/server/services/matches";
import { cancelMatchAction, refuseMatchAction, validateMatchesAction, validateOneAction } from "@/app/actions/matches";
import { ConfirmButton, SubmitButton } from "@/components/forms";
import { Alert, EmptyState, Flash, Icon, MatchStatusBadge, PageHead, PiiNotice, formatDate } from "@/components/ui";

export const metadata: Metadata = { title: "Matchs" };

type Search = Promise<{ ok?: string; erreur?: string; vue?: string; refuser?: string }>;

/** E12b — FR-103, FR-105, FR-107 */
export default async function MatchsAdminPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const pending = await pendingMatches();
  const openSeasons = await db.season.findMany({ where: { status: "OPEN" }, select: { id: true } });
  const all = (await Promise.all(openSeasons.map((s) => matchesOfSeason(s.id)))).flat();
  const duplicates = findDuplicates(pending, all);
  const vue = sp.vue === "valides" || sp.vue === "clos" ? sp.vue : "attente";
  const others = vue === "valides" ? all.filter((m) => m.status === "VALIDATED").slice(0, 60) : vue === "clos" ? all.filter((m) => m.status === "REFUSED" || m.status === "CANCELLED").slice(0, 60) : [];
  const refusing = sp.refuser ? pending.find((m) => m.id === sp.refuser) : undefined;
  const label = (m: (typeof pending)[number]) => `${m.playerA.pseudo} vs ${m.playerB?.pseudo ?? `Ext. · ${m.externalLabel}`}`;

  return (
    <>
      <PageHead eyebrow="Matchs · saisons ouvertes" title="File de validation" lead={`${pending.length} match${pending.length > 1 ? "s" : ""} en attente · du plus ancien au plus récent`} />
      <Flash ok={sp.ok} error={sp.erreur} />
      <div className="row mb-4">
        <Link className="btn btn-primary" href="/admin/matchs/nouveau">
          <Icon name="plus" />
          Saisir un match
        </Link>
      </div>
      <nav className="seg mb-4" aria-label="Vue">
        <Link href="/admin/matchs" aria-current={vue === "attente" ? "true" : undefined}>
          En attente ({pending.length})
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
          <form action={validateMatchesAction}>
            <ul className="list">
              {pending.map((m) => (
                <li key={m.id}>
                  <div className="item" style={{ alignItems: "flex-start" }}>
                    <input type="checkbox" name="matchId" value={m.id} aria-label={`Sélectionner le match ${label(m)}`} style={{ width: 22, height: 22, marginTop: 4, accentColor: "var(--accent)" }} />
                    <div className="item-main">
                      <div className="item-title">{label(m)}</div>
                      <div className="item-meta">
                        {m.season.title} · {formatDate(m.playedOn)} · {m.kind === "WALKOVER" ? "forfait" : m.score}
                        {m.kind === "RETIREMENT" ? " (abandon)" : ""} · vainqueur <strong>{m.winner === "A" ? m.playerA.pseudo : (m.playerB?.pseudo ?? "adversaire extérieur")}</strong>
                      </div>
                      {m.externalLabel ? <div className="item-meta">Classement extérieur : {m.externalRanking}</div> : null}
                      {duplicates.has(m.id) ? (
                        <div className="mt-2">
                          <Alert kind="ko" title="Doublon probable">
                            Même paire et même date qu&apos;une autre saisie : validez l&apos;une et refusez l&apos;autre.
                          </Alert>
                        </div>
                      ) : null}
                      <div className="row mt-2" style={{ gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" type="submit" formAction={validateOneAction.bind(null, m.id)}>
                          <Icon name="check" />
                          Valider
                        </button>
                        <Link className="btn btn-ghost btn-sm" href={`/admin/matchs?refuser=${m.id}`}>
                          <Icon name="x" />
                          Refuser…
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="sticky-cta">
              <SubmitButton className="btn btn-secondary">
                <Icon name="check" />
                Valider la sélection
              </SubmitButton>
            </div>
          </form>
        )
      ) : (
        <ul className="list">
          {others.length === 0 ? <p className="muted">Aucun match.</p> : null}
          {others.map((m) => (
            <li key={m.id}>
              <div className="item">
                <div className="item-main">
                  <div className="item-title">
                    {label(m)} <MatchStatusBadge status={m.status} />
                  </div>
                  <div className="item-meta">
                    {formatDate(m.playedOn)} · {m.score ?? "forfait"} · {m.entries.map((e) => `${e.userId === m.playerAId ? m.playerA.pseudo : m.playerB?.pseudo} +${e.points}`).join(" · ")}
                    {m.refusalReason ? ` · motif : ${m.refusalReason}` : ""}
                  </div>
                </div>
                {m.status === "VALIDATED" ? (
                  <form action={cancelMatchAction}>
                    <input type="hidden" name="matchId" value={m.id} />
                    <input type="hidden" name="back" value="/admin/matchs?vue=valides" />
                    <ConfirmButton message={`Annuler le match ${label(m)} ? Ses points seront retirés.`}>
                      <Icon name="ban" />
                      Annuler
                    </ConfirmButton>
                  </form>
                ) : null}
              </div>
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
