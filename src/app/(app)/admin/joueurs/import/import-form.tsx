"use client";
import { useActionState, useState } from "react";
import { importCsvAction } from "@/app/actions/admin";
import { PrintButton, SubmitButton } from "@/components/forms";
import { PrintSheet } from "@/components/handover";
import { Alert, Icon } from "@/components/ui";

export function ImportForm({ seasons }: { seasons: { id: string; title: string }[] }) {
  const [state, action] = useActionState(importCsvAction, undefined);
  const [downloaded, setDownloaded] = useState(false);
  const report = state?.report;

  const download = () => {
    if (!report) return;
    const lines = ["pseudo;mot_de_passe_temporaire", ...report.created.map((c) => `${c.pseudo};${c.password}`)];
    const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mots-de-passe-temporaires.csv";
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  return (
    <div className="layout-2">
      <section aria-labelledby="t-e1" className="no-print">
        <h2 className="section-title" id="t-e1">
          1. Fichier
        </h2>
        <form action={action}>
          {state?.error ? <div className="mb-4"><Alert kind="ko" title={state.error} /></div> : null}
          <div className="handover" style={{ borderStyle: "dashed" }}>
            <Icon name="upload" className="ic-xl" />
            <label className="label mt-2" htmlFor="file" style={{ display: "block" }}>
              Fichier CSV (pseudo;classement)
            </label>
            <input className="mt-2" id="file" name="file" type="file" accept=".csv,text/csv" required />
          </div>
          <div className="field mt-6">
            <span className="label">Format attendu (2 colonnes uniquement)</span>
            <pre className="mono small" style={{ margin: 0, padding: "var(--s-3)", background: "var(--surface-sunken)", border: "1px solid var(--line-soft)", borderRadius: "var(--r-sm)", overflow: "auto" }}>
              {"pseudo;classement\nVolée92;30/4\nJeuBlanc;NC"}
            </pre>
            <p className="hint">Toute autre colonne est refusée (aucune donnée personnelle).</p>
          </div>
          <fieldset>
            <legend>Si le pseudo existe déjà</legend>
            <label className="check">
              <input type="radio" name="onExisting" value="ignore" defaultChecked /> Ignorer la ligne
            </label>
            <label className="check">
              <input type="radio" name="onExisting" value="update" /> Mettre à jour le classement (historisé)
            </label>
          </fieldset>
          {seasons.length > 0 ? (
            <div className="field">
              <label htmlFor="enrollSeasonId">Engager les nouveaux comptes dans</label>
              <select className="select" id="enrollSeasonId" name="enrollSeasonId" defaultValue="">
                <option value="">Aucune saison</option>
                {seasons.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <SubmitButton pendingLabel="Import en cours…">Importer</SubmitButton>
        </form>
      </section>

      <section aria-labelledby="t-e2">
        <h2 className="section-title no-print" id="t-e2">
          2. Compte rendu
        </h2>
        {!report ? (
          <p className="muted small no-print">Le compte rendu s&apos;affichera ici après l&apos;import.</p>
        ) : (
          <div className="no-print">
            <div className="cases stats" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
              <div className="case">
                <span className="stat-label">Créés</span>
                <span className="stat-value" style={{ color: "var(--success)" }}>{report.created.length}</span>
              </div>
              <div className="case">
                <span className="stat-label">Mis à jour</span>
                <span className="stat-value">{report.updated.length}</span>
              </div>
              <div className="case">
                <span className="stat-label">Ignorés</span>
                <span className="stat-value">{report.ignored.length}</span>
              </div>
              <div className="case">
                <span className="stat-label">Erreurs</span>
                <span className="stat-value" style={{ color: "var(--error)" }}>{report.errors.length}</span>
              </div>
            </div>
            {report.ignored.length + report.errors.length + report.updated.length > 0 ? (
              <div className="table-wrap mt-4">
                <table className="table">
                  <caption className="sr-only">Lignes non créées</caption>
                  <thead>
                    <tr>
                      <th className="num">Ligne</th>
                      <th>Pseudo</th>
                      <th>Résultat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.updated.map((r) => (
                      <tr key={"u" + r.line}>
                        <td className="num">{r.line}</td>
                        <td>{r.pseudo}</td>
                        <td>
                          <span className="badge badge-info">Mis à jour</span> {r.from} → {r.to}
                        </td>
                      </tr>
                    ))}
                    {report.ignored.map((r) => (
                      <tr key={"i" + r.line}>
                        <td className="num">{r.line}</td>
                        <td>{r.pseudo}</td>
                        <td>
                          <span className="badge badge-off">
                            <Icon name="ban" />
                            Ignoré
                          </span>{" "}
                          {r.reason}
                        </td>
                      </tr>
                    ))}
                    {report.errors.map((r) => (
                      <tr key={"e" + r.line}>
                        <td className="num">{r.line}</td>
                        <td>{r.pseudo}</td>
                        <td>
                          <span className="badge badge-ko">
                            <Icon name="x" />
                            Erreur
                          </span>{" "}
                          {r.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            {report.created.length > 0 ? (
              <>
                <div className="mt-6">
                  <Alert kind="warn" title="Mots de passe temporaires : disponibles une seule fois">
                    {report.created.length} mot{report.created.length > 1 ? "s" : ""} de passe. Ils ne seront plus jamais affichés après avoir quitté cette page.
                  </Alert>
                </div>
                <div className="actions">
                  <button className="btn btn-primary" type="button" onClick={download} disabled={downloaded} aria-disabled={downloaded}>
                    <Icon name={downloaded ? "check" : "download"} />
                    {downloaded ? "Fiche déjà téléchargée" : "Télécharger la fiche (CSV)"}
                  </button>
                  <PrintButton label="Imprimer les fiches" />
                </div>
              </>
            ) : null}
          </div>
        )}
        {report ? <PrintSheet rows={report.created} /> : null}
      </section>
    </div>
  );
}
