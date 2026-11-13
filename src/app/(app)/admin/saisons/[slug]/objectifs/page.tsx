import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSeason } from "@/server/services/seasons";
import { goalBoard } from "@/server/services/goals";
import { saveGoalsAction } from "@/app/actions/goals";
import { GOAL_MAX } from "@/goals/goals";
import { SubmitButton } from "@/components/forms";
import { Flash, Icon, PageHead, PiiNotice } from "@/components/ui";

export const metadata: Metadata = { title: "Objectifs" };

/** Spec 005 — FR-500 à FR-507 */
export default async function ObjectifsPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const season = await getSeason(slug);
  if (!season) notFound();
  const rows = await goalBoard(season.id);
  const writable = season.status === "DRAFT" || season.status === "OPEN";

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
        title="Objectifs de matchs"
        lead="Nombre de matchs validés à jouer dans la saison, par tranche. Un repère pour les joueurs : aucun effet sur les points ni sur le classement."
      />
      <Flash ok={sp.ok} error={sp.erreur} />
      {!writable ? <p className="muted">Saison en lecture seule : les objectifs ne sont plus modifiables.</p> : null}

      <form action={saveGoalsAction}>
        <input type="hidden" name="seasonId" value={season.id} />
        <div className="cases">
          <div className="case">
            <div className="table-wrap">
              <table className="table">
                <caption className="sr-only">Objectif de matchs par tranche</caption>
                <thead>
                  <tr>
                    <th scope="col">Tranche</th>
                    <th scope="col" className="num">
                      Objectif
                    </th>
                    <th scope="col" className="num">
                      <abbr title="Engagés ayant atteint l'objectif / engagés concernés par cette ligne">Atteint</abbr>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const id = `g-${r.tagId ?? "default"}`;
                    return (
                      <tr key={id}>
                        <th scope="row" className="row-label" style={r.tagId ? undefined : { fontWeight: 600 }}>
                          <label htmlFor={id}>
                            {r.tagId ? <Icon name="tag" /> : null} {r.label}
                          </label>
                        </th>
                        <td className="num">
                          {writable ? (
                            <input
                              className="input mono"
                              id={id}
                              name={`goal:${r.tagId ?? "default"}`}
                              type="number"
                              inputMode="numeric"
                              min={1}
                              max={GOAL_MAX}
                              step={1}
                              defaultValue={r.target ?? ""}
                              placeholder="—"
                              style={{ width: "4.5em", textAlign: "right", minHeight: 40 }}
                            />
                          ) : (
                            <span id={id}>{r.target ?? "—"}</span>
                          )}
                        </td>
                        <td className="num" style={{ whiteSpace: "nowrap" }}>
                          {r.concerned ? (
                            <>
                              {r.reached} / {r.concerned}
                              <span className="sr-only"> engagés</span>
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {rows.length === 1 ? (
              <p className="small muted">
                Aucune étiquette pour l&apos;instant : ajoutez-en aux joueurs depuis{" "}
                <Link className="link" href="/admin/joueurs">
                  Joueurs
                </Link>{" "}
                pour fixer un objectif par tranche.
              </p>
            ) : null}
            <ul className="small subtle" style={{ paddingLeft: "1.2em" }}>
              <li>Case vide : pas d&apos;objectif. Un joueur avec plusieurs étiquettes prend l&apos;objectif le plus élevé ; sans étiquette concernée, l&apos;objectif par défaut.</li>
              <li>« Atteint » : engagés ayant atteint l&apos;objectif / engagés concernés par la ligne.</li>
              <li>Comptent les matchs validés de la saison, hors forfaits. Les matchs en attente ne comptent pas encore.</li>
            </ul>
            <PiiNotice id="g-pii" />
            <p className="hint">Les tranches sont des étiquettes : l&apos;application ne connaît ni l&apos;âge ni la date de naissance des joueurs.</p>
            {writable ? (
              <div className="actions">
                <SubmitButton>
                  <Icon name="check" />
                  Enregistrer les objectifs
                </SubmitButton>
              </div>
            ) : null}
          </div>
        </div>
      </form>
    </>
  );
}
