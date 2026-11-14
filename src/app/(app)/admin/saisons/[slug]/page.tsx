import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { getSeason, ruleSetsOf } from "@/server/services/seasons";
import { seasonTitleAction, seasonTransitionAction } from "@/app/actions/admin";
import { ConfirmButton, SubmitButton } from "@/components/forms";
import { Alert, Flash, Icon, PageHead, PiiNotice, SeasonStatusBadge } from "@/components/ui";

export const metadata: Metadata = { title: "Saison" };

const VIS = { ALL: "tous les joueurs connectés", ENROLLED: "engagés seulement", SELF: "chacun ne voit que son rang" };

/** E09a (détail), E09c — FR-041 à FR-044 */
export default async function SaisonPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ ok?: string; erreur?: string; cloture?: string }> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const season = await getSeason(slug);
  if (!season) notFound();
  const [{ published, draft }, enrolled, counts] = await Promise.all([
    ruleSetsOf(season.id),
    db.enrollment.count({ where: { seasonId: season.id } }),
    db.match.groupBy({ by: ["status"], where: { seasonId: season.id }, _count: true }),
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const pending = count("PENDING");

  return (
    <>
      <PageHead
        eyebrow={
          <>
            <Link className="link" href="/admin/saisons">
              Saisons
            </Link>{" "}
            / <span className="mono">{season.slug}</span>
          </>
        }
        title={season.title}
        lead={
          <>
            Classement de référence {season.rankingMode === "FROZEN" ? "figé à l'engagement" : "évolutif"} · visibilité : {VIS[season.visibility]}
          </>
        }
      />
      <Flash ok={sp.ok} error={sp.erreur} />
      <div className="row mb-4">
        <SeasonStatusBadge status={season.status} />
      </div>

      {/* Spec 011 : chiffres en bande, accès en lignes, exports regroupés. */}
      <dl className="strip strip-card" aria-label="Chiffres de la saison">
        <div>
          <dt>Engagés</dt>
          <dd>{enrolled}</dd>
        </div>
        <div>
          <dt>Validés</dt>
          <dd>{count("VALIDATED")}</dd>
        </div>
        <div>
          <dt>En attente</dt>
          <dd style={pending > 0 ? { color: "var(--warning)" } : undefined}>{pending}</dd>
        </div>
        <div>
          <dt>Refusés, annulés</dt>
          <dd>{count("REFUSED") + count("CANCELLED")}</dd>
        </div>
      </dl>

      <div className="layout-2">
        <section className="cases" aria-labelledby="t-gerer">
          <div className="case">
            <h2 className="case-title" id="t-gerer">
              Gérer
            </h2>
            <ul className="settings">
              <li>
                <Link className="setting-link" href={`/admin/saisons/${season.slug}/bareme`}>
                  <Icon name="sliders" />
                  <span>
                    Barème
                    <span className="small subtle" style={{ display: "block", fontWeight: 400 }}>
                      {published ? `v${published.version} publié` : "non publié"}
                      {draft ? ` · brouillon v${draft.version}` : ""}
                    </span>
                  </span>
                  <span className="chev">
                    <Icon name="chev-r" />
                  </span>
                </Link>
              </li>
              <li>
                <Link className="setting-link" href={`/admin/saisons/${season.slug}/engagements`}>
                  <Icon name="users" />
                  <span>
                    Engagements
                    <span className="small subtle" style={{ display: "block", fontWeight: 400 }}>
                      {enrolled} engagé{enrolled > 1 ? "s" : ""}
                    </span>
                  </span>
                  <span className="chev">
                    <Icon name="chev-r" />
                  </span>
                </Link>
              </li>
              <li>
                <Link className="setting-link" href={`/classement?saison=${season.slug}`}>
                  <Icon name="trophy" />
                  Classement
                  <span className="chev">
                    <Icon name="chev-r" />
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </section>
        <section className="cases" aria-labelledby="t-export">
          <div className="case">
            <h2 className="case-title" id="t-export">
              Exporter (CSV)
            </h2>
            <div className="btn-pair" style={{ marginBottom: 0 }}>
              <a className="btn btn-secondary" href={`/api/export/classement?saison=${season.slug}`}>
                <Icon name="download" />
                Classement
              </a>
              <a className="btn btn-secondary" href={`/api/export/matchs?saison=${season.slug}`}>
                <Icon name="download" />
                Matchs
              </a>
            </div>
          </div>
        </section>
      </div>

      <div className="layout-2 mt-8">
        <section className="cases" aria-labelledby="t-cycle">
          <div className="case">
            <h2 className="case-title" id="t-cycle">
              Cycle de vie
            </h2>
            {season.status === "DRAFT" ? (
              <form action={seasonTransitionAction}>
                <input type="hidden" name="seasonId" value={season.id} />
                <input type="hidden" name="to" value="OPEN" />
                <p className="small muted">Ouvrir la saison permet la saisie des matchs. Le barème doit être publié.</p>
                <SubmitButton disabled={!published}>
                  <Icon name="play" />
                  Ouvrir la saison
                </SubmitButton>
              </form>
            ) : null}
            {season.status === "OPEN" ? (
              <>
                <p className="small muted">La clôture fige le classement final et passe la saison en lecture seule.</p>
                <Link className="btn btn-danger" href={`/admin/saisons/${season.slug}?cloture=1`}>
                  <Icon name="lock" />
                  Clôturer…
                </Link>
              </>
            ) : null}
            {season.status === "CLOSED" ? (
              <div className="row">
                <form action={seasonTransitionAction}>
                  <input type="hidden" name="seasonId" value={season.id} />
                  <input type="hidden" name="to" value="ARCHIVED" />
                  <ConfirmButton className="btn btn-secondary" message="Archiver cette saison ? Elle restera consultable en lecture seule.">
                    <Icon name="archive" />
                    Archiver
                  </ConfirmButton>
                </form>
                <form action={seasonTransitionAction}>
                  <input type="hidden" name="seasonId" value={season.id} />
                  <input type="hidden" name="to" value="REOPEN" />
                  <ConfirmButton className="btn btn-ghost" message="Rouvrir exceptionnellement cette saison ? L'action sera tracée dans le journal.">
                    Rouvrir (exceptionnel)
                  </ConfirmButton>
                </form>
              </div>
            ) : null}
            {season.status === "ARCHIVED" ? <p className="small muted mb-0">Saison archivée, conservée pour l&apos;historique (lecture seule).</p> : null}
          </div>
        </section>
        <section className="cases" aria-labelledby="t-titre">
          <form className="case" action={seasonTitleAction}>
            <h2 className="case-title" id="t-titre">
              Titre
            </h2>
            <input type="hidden" name="seasonId" value={season.id} />
            <div className="field">
              <label htmlFor="title">Titre affiché</label>
              <input className="input" id="title" name="title" defaultValue={season.title} maxLength={80} aria-describedby="t-pii" />
              <PiiNotice id="t-pii" />
            </div>
            <p className="hint">
              Identifiant : <span className="mono">{season.slug}</span> {season.status === "DRAFT" ? "" : "(non modifiable après l'ouverture)"}
            </p>
            <SubmitButton className="btn btn-secondary">Enregistrer</SubmitButton>
          </form>
        </section>
      </div>

      {sp.cloture && season.status === "OPEN" ? (
        <div className="scrim">
          <form className="dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-t" action={seasonTransitionAction}>
            <h2 id="dlg-t">Clôturer « {season.title} » ?</h2>
            <ul className="small" style={{ paddingLeft: "1.2em", margin: "0 0 var(--s-4)" }}>
              <li>
                La saison passe en <strong>lecture seule</strong> : plus de saisie ni de validation.
              </li>
              <li>
                Son barème {published ? `(v${published.version})` : ""} est <strong>verrouillé</strong>.
              </li>
              <li>
                Le classement actuel devient le <strong>classement final</strong>.
              </li>
            </ul>
            {pending > 0 ? (
              <Alert kind="warn" title={`${pending} match${pending > 1 ? "s" : ""} encore en attente`}>
                Ils passeront en « Annulé ».{" "}
                <Link className="link" href="/admin/matchs">
                  Les traiter d&apos;abord
                </Link>
              </Alert>
            ) : null}
            <input type="hidden" name="seasonId" value={season.id} />
            <input type="hidden" name="to" value="CLOSED" />
            <div className="field mt-4">
              <label htmlFor="confirmSlug">
                Pour confirmer, saisissez l&apos;identifiant <span className="mono strong">{season.slug}</span>
              </label>
              <input className="input mono" id="confirmSlug" name="confirmSlug" autoComplete="off" autoCapitalize="none" spellCheck={false} required />
            </div>
            <div className="actions" style={{ justifyContent: "flex-end" }}>
              <Link className="btn btn-ghost" href={`/admin/saisons/${season.slug}`}>
                Annuler
              </Link>
              <SubmitButton className="btn btn-danger">
                <Icon name="lock" />
                Clôturer définitivement
              </SubmitButton>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
