"use client";
import Link from "next/link";
import { useState } from "react";
import { CopyButton, PrintButton } from "./forms";
import { Alert } from "./ui";
import { useBrand } from "./brand";

/** E08c — remise unique du mot de passe temporaire (FR-021). Rien n'est conservé après avoir quitté l'écran. */
export function Handover({ pseudo, password, context, doneHref, againHref }: { pseudo: string; password: string; context: "creation" | "reset"; doneHref: string; againHref?: string }) {
  const [ack, setAck] = useState(false);
  return (
    <>
      <div className="no-print">
        <div className="mb-4">
          <Alert kind="ok" title={context === "creation" ? `Compte créé : ${pseudo}` : `Mot de passe réinitialisé : ${pseudo}`}>
            {context === "reset" ? "Ses sessions ont été coupées. Il devra choisir un nouveau mot de passe à la connexion." : "Le joueur devra choisir son mot de passe à la première connexion."}
          </Alert>
        </div>
        <div className="handover">
          <span className="stat-label">Pseudo</span>
          <p className="stat-value" style={{ fontSize: "var(--fs-2xl)" }}>
            {pseudo}
          </p>
          <span className="stat-label mt-4">Mot de passe temporaire</span>
          <p className="secret mt-2" data-testid="temp-password">
            {password}
          </p>
          <div className="row mt-4" style={{ justifyContent: "center" }}>
            <CopyButton text={password} />
            <PrintButton />
          </div>
        </div>
        <div className="mt-6">
          <Alert kind="warn" title="Affiché une seule fois">
            Ce mot de passe n&apos;est pas conservé en clair : il ne pourra plus être affiché. En cas de perte, utilisez « Réinitialiser ».
          </Alert>
        </div>
        <label className="check mt-4">
          <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} /> J&apos;ai remis ou imprimé le mot de passe
        </label>
        <div className="actions">
          {ack ? (
            <Link className="btn btn-primary" href={doneHref}>
              Terminer
            </Link>
          ) : (
            <button className="btn btn-primary" type="button" disabled aria-disabled="true">
              Terminer
            </button>
          )}
          {againHref ? (
            <a className="btn btn-ghost" href={againHref}>
              Créer un autre joueur
            </a>
          ) : null}
        </div>
      </div>
      <PrintSheet rows={[{ pseudo, password }]} />
    </>
  );
}

/** Fiche imprimable (une page par joueur). Sans nom réel, à détruire après la première connexion. */
export function PrintSheet({ rows }: { rows: { pseudo: string; password: string }[] }) {
  const brand = useBrand();
  return (
    <section className="print-sheet" aria-hidden="true">
      {rows.map((r) => (
        <div key={r.pseudo} style={{ border: "2px solid #000", padding: 24, maxWidth: 520, margin: "0 auto 24px", breakInside: "avoid", fontFamily: "var(--font-sans)", color: "#000" }}>
          <img src={brand.logoLight} alt="" width={64} height={64} />
          <h2 style={{ fontSize: 20, margin: "12px 0 4px" }}>{brand.appName} — vos identifiants</h2>
          {brand.clubName ? <p style={{ margin: "0 0 16px" }}>{brand.clubName}</p> : <div style={{ height: 12 }} />}
          <p style={{ margin: 0 }}>
            Pseudo : <strong style={{ fontSize: 20 }}>{r.pseudo}</strong>
          </p>
          <p style={{ margin: "8px 0 16px" }}>
            Mot de passe temporaire : <strong style={{ fontFamily: "var(--font-mono)", fontSize: 20, letterSpacing: ".1em" }}>{r.password}</strong>
          </p>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14 }}>
            <li>Ouvrez l&apos;application {brand.appName} (adresse communiquée par le club).</li>
            <li>Connectez-vous avec ce pseudo et ce mot de passe.</li>
            <li>Choisissez immédiatement votre mot de passe personnel.</li>
          </ol>
          <p style={{ fontSize: 12, margin: "16px 0 0" }}>Ne notez jamais votre nom réel dans l&apos;application. Fiche à détruire après la première connexion.</p>
        </div>
      ))}
    </section>
  );
}
