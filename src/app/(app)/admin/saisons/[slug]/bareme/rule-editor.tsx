"use client";
import { useActionState, useMemo, useState } from "react";
import { GAP_KEYS, LADDER, computeMatchPoints, formatGap, rungOf, validateRuleSet, type MatchKind, type Ranking, type RuleSet } from "@/scoring";
import { discardDraftAction, impactAction, publishAction, recalcAction, saveDraftAction } from "@/app/actions/admin";
import { ConfirmButton, SubmitButton } from "@/components/forms";
import { Alert, Icon } from "@/components/ui";

type Tab = "table" | "params" | "sim" | "impact";
const MATRIX = LADDER.slice(0, rungOf("15") + 1);

interface Props {
  seasonId: string;
  writable: boolean;
  initial: RuleSet;
  published: { version: number; rules: RuleSet } | null;
  draft: { version: number; rules: RuleSet } | null;
  staleEntries: number;
  history: { version: number; status: string; publishedAt: string | null }[];
}

/** Sérialisation à clés triées (le stockage JSONB ne conserve pas l'ordre des clés). */
function stable(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  const obj = value as Record<string, unknown>;
  return `{${Object.keys(obj).sort().map((k) => `${JSON.stringify(k)}:${stable(obj[k])}`).join(",")}}`;
}

function int(v: string): number {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
}

export function RuleEditor({ seasonId, writable, initial, published, draft, staleEntries, history }: Props) {
  const [tab, setTab] = useState<Tab>("table");
  const [rules, setRules] = useState<RuleSet>(initial);
  const [matrixMode, setMatrixMode] = useState<"win" | "loss">("win");
  const [showMatrix, setShowMatrix] = useState(Object.keys(initial.overrides.win).length + Object.keys(initial.overrides.loss).length > 0);
  const [saveState, saveAction] = useActionState(saveDraftAction, undefined);
  const [impactState, runImpact] = useActionState(impactAction, undefined);
  const json = JSON.stringify(rules);
  const dirty = stable(rules) !== stable(draft?.rules ?? published?.rules ?? null);
  const validation = useMemo(() => validateRuleSet(rules), [rules]);
  const ro = !writable;

  const setGap = (table: "win" | "loss", key: number, value: string) =>
    setRules((r) => ({ ...r, [table]: { byGap: { ...r[table].byGap, [String(key)]: int(value) } } }));
  const setOverride = (table: "win" | "loss", player: Ranking, opponent: Ranking, value: string) =>
    setRules((r) => {
      const next = { ...r.overrides[table] };
      const k = `${player}|${opponent}`;
      if (value.trim() === "") delete next[k];
      else next[k] = int(value);
      return { ...r, overrides: { ...r.overrides, [table]: next } };
    });

  // simulateur
  const [simPlayer, setSimPlayer] = useState<Ranking>("30/2");
  const [simOpp, setSimOpp] = useState<Ranking>("30/1");
  const [simResult, setSimResult] = useState<"WIN" | "LOSS">("WIN");
  const [simKind, setSimKind] = useState<MatchKind>("NORMAL");
  const sim = validation.ok ? computeMatchPoints(rules, { playerRanking: simPlayer, opponentRanking: simOpp, result: simResult, kind: simKind }) : null;
  const simPub = published ? computeMatchPoints(published.rules, { playerRanking: simPlayer, opponentRanking: simOpp, result: simResult, kind: simKind }) : null;

  const tabs: [Tab, string][] = [
    ["table", "Table"],
    ["params", "Paramètres"],
    ["sim", "Simulateur"],
    ["impact", "Impact et publication"],
  ];

  return (
    <>
      <div className="toolbar">
        <div className="seg" role="tablist" aria-label="Sections de l'éditeur">
          {tabs.map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} aria-controls={`p-${k}`} onClick={() => setTab(k)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {!validation.ok ? (
        <div className="mb-4">
          <Alert kind="ko" title="Validation : erreurs bloquantes">
            <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
              {validation.errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </Alert>
        </div>
      ) : validation.warnings.length ? (
        <div className="mb-4">
          <Alert kind="warn" title="Avertissements (non bloquants)">
            <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
              {validation.warnings.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </Alert>
        </div>
      ) : null}

      {tab === "table" ? (
        <section id="p-table" role="tabpanel" aria-label="Table de points">
          <div className="table-wrap">
            <table className="table">
              <caption className="sr-only">Points par écart d&apos;échelons</caption>
              <thead>
                <tr>
                  <th>Écart (adversaire − joueur)</th>
                  {GAP_KEYS.map((k) => (
                    <th key={k} className="num">
                      {formatGap(k)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(["win", "loss"] as const).map((t) => (
                  <tr key={t}>
                    <th scope="row">{t === "win" ? "Victoire" : "Défaite"}</th>
                    {GAP_KEYS.map((k) => (
                      <td key={k} className="num" style={{ padding: 4 }}>
                        <input
                          className="input num"
                          style={{ minHeight: 40, width: 64, textAlign: "center", padding: 0, color: t === "win" && k > 0 ? "var(--accent-2)" : undefined, fontWeight: t === "win" && k > 0 ? 600 : undefined }}
                          inputMode="numeric"
                          value={rules[t].byGap[`${k}` as `${typeof k}`]}
                          onChange={(e) => setGap(t, k, e.target.value)}
                          readOnly={ro}
                          aria-label={`${t === "win" ? "Victoire" : "Défaite"}, écart ${formatGap(k)} : points`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small subtle mt-2">Écart positif : adversaire mieux classé. Une victoire avec un écart positif est une <strong>perf</strong> (en corail).</p>

          <label className="check mt-4">
            <input type="checkbox" checked={showMatrix} onChange={(e) => setShowMatrix(e.target.checked)} /> Afficher la table complète (surcharges par couple de classements)
          </label>
          {showMatrix ? (
            <>
              <div className="row-between mb-4 mt-2">
                <div className="seg" aria-label="Résultat">
                  <button type="button" aria-pressed={matrixMode === "win"} onClick={() => setMatrixMode("win")}>
                    Victoire
                  </button>
                  <button type="button" aria-pressed={matrixMode === "loss"} onClick={() => setMatrixMode("loss")}>
                    Défaite
                  </button>
                </div>
                <span className="small subtle">Case vide = valeur de l&apos;écart (grisée). Saisir une valeur crée une surcharge.</span>
              </div>
              <div className="table-wrap" style={{ maxHeight: 460, border: "1px solid var(--line-soft)" }}>
                <table className="matrix">
                  <thead>
                    <tr>
                      <th scope="col">
                        Joueur ↓<br />
                        Adversaire →
                      </th>
                      {MATRIX.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MATRIX.map((r) => (
                      <tr key={r}>
                        <th scope="row">{r}</th>
                        {MATRIX.map((c) => {
                          const k = `${r}|${c}`;
                          const ov = rules.overrides[matrixMode][k];
                          const base = computeMatchPoints({ ...rules, overrides: { win: {}, loss: {} }, capPerMatch: null }, {
                            playerRanking: r,
                            opponentRanking: c,
                            result: matrixMode === "win" ? "WIN" : "LOSS",
                            kind: "NORMAL",
                          });
                          const cls = [r === c ? "diag" : "", ov !== undefined ? "changed" : "", matrixMode === "win" && base.gap > 0 ? "perf" : ""].filter(Boolean).join(" ");
                          return (
                            <td key={c} className={cls || undefined}>
                              <input
                                inputMode="numeric"
                                value={ov ?? ""}
                                placeholder={String(base.points)}
                                onChange={(e) => setOverride(matrixMode, r, c, e.target.value)}
                                readOnly={ro}
                                aria-label={`${matrixMode === "win" ? "Victoire" : "Défaite"} ${r} contre ${c} : points (vide = ${base.points})`}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="legend">
                <span>
                  <i className="sw" style={{ background: "var(--surface-raised)", boxShadow: "inset 0 0 0 1px var(--text-subtle)" }} />
                  Classement égal
                </span>
                <span>
                  <i className="sw" style={{ background: "var(--highlight)" }} />
                  <u className="strong">Surcharge</u>
                </span>
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      {tab === "params" ? (
        <section id="p-params" role="tabpanel" aria-label="Paramètres">
          <div className="cases cases-2">
            <div className="case">
              <h2 className="case-title">Plafond</h2>
              <div className="field">
                <label htmlFor="cap">Plafond de points par match (vide = aucun)</label>
                <input
                  className="input"
                  id="cap"
                  inputMode="numeric"
                  value={rules.capPerMatch ?? ""}
                  readOnly={ro}
                  onChange={(e) => setRules((r) => ({ ...r, capPerMatch: e.target.value.trim() === "" ? null : int(e.target.value) }))}
                />
              </div>
            </div>
            <div className="case">
              <h2 className="case-title">Cas particuliers</h2>
              <div className="field">
                <label htmlFor="nc">Adversaire non classé (NC) traité comme</label>
                <select className="select" id="nc" value={rules.unrankedAs} disabled={ro} onChange={(e) => setRules((r) => ({ ...r, unrankedAs: e.target.value as "40" | "NC" }))}>
                  <option value="40">40</option>
                  <option value="NC">NC (échelon propre, sous 40)</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="wo">Victoire par forfait (points)</label>
                <input className="input" id="wo" inputMode="numeric" value={rules.walkoverWin} readOnly={ro} onChange={(e) => setRules((r) => ({ ...r, walkoverWin: int(e.target.value) }))} />
                <p className="hint">Jamais une perf. Une défaite par forfait vaut 0. Un abandon compte comme un match normal.</p>
              </div>
            </div>
            <div className="case">
              <h2 className="case-title">Bonus d&apos;assiduité</h2>
              <label className="check">
                <input
                  type="checkbox"
                  checked={rules.assiduity !== null}
                  disabled={ro}
                  onChange={(e) => setRules((r) => ({ ...r, assiduity: e.target.checked ? { every: 5, points: 5 } : null }))}
                />{" "}
                Activer
              </label>
              {rules.assiduity ? (
                <div className="row" style={{ alignItems: "flex-start" }}>
                  <div className="field grow">
                    <label htmlFor="as-p">Points</label>
                    <input className="input" id="as-p" inputMode="numeric" value={rules.assiduity.points} readOnly={ro} onChange={(e) => setRules((r) => ({ ...r, assiduity: { every: r.assiduity?.every ?? 5, points: int(e.target.value) } }))} />
                  </div>
                  <div className="field grow">
                    <label htmlFor="as-e">Tous les … matchs validés</label>
                    <input className="input" id="as-e" inputMode="numeric" value={rules.assiduity.every} readOnly={ro} onChange={(e) => setRules((r) => ({ ...r, assiduity: { points: r.assiduity?.points ?? 5, every: int(e.target.value) } }))} />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {tab === "sim" ? (
        <section id="p-sim" role="tabpanel" aria-label="Simulateur">
          <div className="layout-2">
            <div>
              <div className="field">
                <label htmlFor="s1">Classement du joueur</label>
                <select className="select" id="s1" value={simPlayer} onChange={(e) => setSimPlayer(e.target.value as Ranking)}>
                  {LADDER.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="s2">Classement de l&apos;adversaire</label>
                <select className="select" id="s2" value={simOpp} onChange={(e) => setSimOpp(e.target.value as Ranking)}>
                  {LADDER.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <fieldset>
                <legend>Résultat</legend>
                <div className="big-choice">
                  <label>
                    <input type="radio" name="sr" checked={simResult === "WIN"} onChange={() => setSimResult("WIN")} />
                    <span>Victoire</span>
                  </label>
                  <label>
                    <input type="radio" name="sr" checked={simResult === "LOSS"} onChange={() => setSimResult("LOSS")} />
                    <span>Défaite</span>
                  </label>
                </div>
              </fieldset>
              <div className="field">
                <label htmlFor="sk">Type</label>
                <select className="select" id="sk" value={simKind} onChange={(e) => setSimKind(e.target.value as MatchKind)}>
                  <option value="NORMAL">Match joué</option>
                  <option value="RETIREMENT">Abandon</option>
                  <option value="WALKOVER">Forfait</option>
                </select>
              </div>
            </div>
            <div>
              <div className="preview-points" role="status" aria-live="polite">
                <div>
                  <span className="stat-label">Points (barème en cours d&apos;édition)</span>
                  <span className="stat-value">{sim ? sim.points : "—"}</span>
                </div>
                <div className="right small">
                  {simPub ? (
                    <>
                      v{published?.version} publiée : {simPub.points} pts
                      <br />
                      {sim ? <strong>{sim.points - simPub.points >= 0 ? "+" : ""}{sim.points - simPub.points}</strong> : null}
                    </>
                  ) : (
                    "Aucune version publiée"
                  )}
                </div>
              </div>
              {sim ? (
                <div className="calc mt-4">
                  {sim.breakdown.map((l) => (
                    <div className="calc-row" key={l.label}>
                      <span>{l.label}</span>
                      <span>{l.value}</span>
                    </div>
                  ))}
                  <div className="calc-row calc-total">
                    <span>Total</span>
                    <span className="num">{sim.points} pts</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {tab === "impact" ? (
        <section id="p-impact" role="tabpanel" aria-label="Impact et publication">
          <form action={runImpact} className="mb-4">
            <input type="hidden" name="seasonId" value={seasonId} />
            <input type="hidden" name="rules" value={json} />
            <SubmitButton className="btn btn-secondary" pendingLabel="Calcul…" disabled={!validation.ok}>
              <Icon name="calc" />
              Calculer l&apos;impact sur les matchs validés
            </SubmitButton>
          </form>
          {impactState?.error ? <Alert kind="ko" title={impactState.error} /> : null}
          {impactState?.impact ? (
            <>
              <div className="cases stats" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                <div className="case">
                  <span className="stat-label">Matchs dont les points changent</span>
                  <span className="stat-value">
                    {impactState.impact.changedMatches}
                    <small> / {impactState.impact.matchCount}</small>
                  </span>
                </div>
                <div className="case">
                  <span className="stat-label">Joueurs impactés</span>
                  <span className="stat-value">{impactState.impact.playersImpacted}</span>
                </div>
                <div className="case">
                  <span className="stat-label">Changements de rang</span>
                  <span className="stat-value">{impactState.impact.rankChanges}</span>
                </div>
              </div>
              {impactState.impact.rows.length > 0 ? (
                <div className="table-wrap mt-4">
                  <table className="table">
                    <caption className="sr-only">Changements si ce barème est appliqué</caption>
                    <thead>
                      <tr>
                        <th>Pseudo</th>
                        <th className="num">Points avant</th>
                        <th className="num">Points après</th>
                        <th className="num">Rang avant</th>
                        <th className="num">Rang après</th>
                      </tr>
                    </thead>
                    <tbody>
                      {impactState.impact.rows.map((r) => (
                        <tr key={r.pseudo}>
                          <td className="strong">{r.pseudo}</td>
                          <td className="num">{r.pointsBefore}</td>
                          <td className="num">{r.pointsAfter}</td>
                          <td className="num">{r.rankBefore}</td>
                          <td className="num">
                            {r.rankAfter !== r.rankBefore ? (
                              <span className={`trend ${r.rankAfter < r.rankBefore ? "trend-up" : "trend-down"}`}>
                                <Icon name={r.rankAfter < r.rankBefore ? "up" : "down"} />
                                <span className="sr-only">{r.rankAfter < r.rankBefore ? "monte à" : "descend à"}</span>
                                {r.rankAfter}
                              </span>
                            ) : (
                              r.rankAfter
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="muted small mt-4">Aucun changement de points ni de rang.</p>
              )}
            </>
          ) : null}
          <div className="mt-6">
            <Alert kind="info" title="Aucun recalcul silencieux">
              Publier une version ne modifie pas les matchs passés, sauf si vous choisissez « publier et recalculer ». Chaque opération est enregistrée dans le journal d&apos;audit.
            </Alert>
          </div>
          {writable ? (
            <div className="actions">
              <form action={publishAction}>
                <input type="hidden" name="seasonId" value={seasonId} />
                <input type="hidden" name="recalculate" value="yes" />
                <ConfirmButton className="btn btn-primary" message="Publier le brouillon et recalculer tous les matchs validés ?">
                  <Icon name="refresh" />
                  Publier et recalculer
                </ConfirmButton>
              </form>
              <form action={publishAction}>
                <input type="hidden" name="seasonId" value={seasonId} />
                <input type="hidden" name="recalculate" value="no" />
                <ConfirmButton className="btn btn-secondary" message="Publier le brouillon pour les prochains matchs validés seulement ?">
                  Publier pour les nouveaux matchs seulement
                </ConfirmButton>
              </form>
              {staleEntries > 0 ? (
                <form action={recalcAction}>
                  <input type="hidden" name="seasonId" value={seasonId} />
                  <ConfirmButton className="btn btn-secondary" message={`Recalculer avec la version publiée (v${published?.version}) ?`}>
                    Recalculer avec v{published?.version} ({staleEntries} lignes sur une version antérieure)
                  </ConfirmButton>
                </form>
              ) : null}
            </div>
          ) : null}
          {writable && (!draft || dirty) ? <p className="small subtle">Les boutons de publication portent sur le <strong>brouillon enregistré</strong>{dirty ? " : enregistrez vos modifications d'abord." : "."}</p> : null}
          <h3 className="case-title mt-8">Historique des versions</h3>
          <ul className="list">
            {history.map((h) => (
              <li key={h.version}>
                <div className="item" style={{ minHeight: 0 }}>
                  <div className="item-main">
                    <div className="item-title">v{h.version}</div>
                  </div>
                  <span className="small subtle">{h.status === "DRAFT" ? "brouillon" : `publiée${h.publishedAt ? " le " + new Date(h.publishedAt).toLocaleDateString("fr-FR") : ""}`}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {writable ? (
        <div className="sticky-cta">
          <div className="row-between">
            <span className="small">{saveState?.error ? <span style={{ color: "var(--error)" }}>{saveState.error}</span> : dirty ? "Modifications non enregistrées" : draft || saveState?.ok ? "Brouillon à jour" : "Aucune modification"}</span>
            <div className="row">
              {draft ? (
                <form action={discardDraftAction}>
                  <input type="hidden" name="seasonId" value={seasonId} />
                  <ConfirmButton className="btn btn-ghost" message="Abandonner le brouillon ?">
                    Abandonner le brouillon
                  </ConfirmButton>
                </form>
              ) : null}
              <form action={saveAction}>
                <input type="hidden" name="seasonId" value={seasonId} />
                <input type="hidden" name="rules" value={json} />
                <SubmitButton disabled={!validation.ok || !dirty}>Enregistrer le brouillon</SubmitButton>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
