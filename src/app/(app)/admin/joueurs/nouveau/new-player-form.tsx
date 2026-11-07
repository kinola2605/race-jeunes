"use client";
import Link from "next/link";
import { useActionState } from "react";
import { LADDER } from "@/scoring";
import { createPlayerAction } from "@/app/actions/admin";
import { SubmitButton } from "@/components/forms";
import { Handover } from "@/components/handover";
import { Alert, PiiNotice } from "@/components/ui";

export function NewPlayerForm({ tags, seasons }: { tags: string[]; seasons: { id: string; title: string; status: string }[] }) {
  const [state, action] = useActionState(createPlayerAction, undefined);
  if (state?.handover) {
    return (
      <div className="main-narrow" style={{ margin: "0 auto" }}>
        <Handover {...state.handover} doneHref="/admin/joueurs" againHref="/admin/joueurs/nouveau" />
      </div>
    );
  }
  return (
    <div className="layout-main-side">
      <form action={action} noValidate>
        {state?.error ? <div className="mb-4"><Alert kind="ko" title={state.error} /></div> : null}
        <div className="field">
          <label htmlFor="pseudo">
            Pseudo <span className="req" aria-hidden="true">*</span>
          </label>
          <input className="input" id="pseudo" name="pseudo" required minLength={3} maxLength={20} autoCapitalize="none" spellCheck={false} aria-describedby="pseudo-pii pseudo-hint" />
          <PiiNotice id="pseudo-pii" />
          <p className="hint" id="pseudo-hint">
            3 à 20 caractères (lettres, chiffres, _ . - &amp;), unique. Le joueur ne pourra pas le modifier.
          </p>
        </div>
        <div className="field">
          <label htmlFor="ranking">
            Classement FFT <span className="req" aria-hidden="true">*</span>
          </label>
          <select className="select" id="ranking" name="ranking" defaultValue="30/5">
            {LADDER.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        <fieldset>
          <legend>
            Étiquettes <span className="subtle small">(facultatif)</span>
          </legend>
          <div className="chips" style={{ flexWrap: "wrap" }}>
            {tags.map((t) => (
              <label key={t} className="chip">
                <input type="checkbox" name="tags" value={t} style={{ accentColor: "var(--accent)" }} /> {t}
              </label>
            ))}
          </div>
          <div className="field mt-2">
            <label htmlFor="newTag" className="small">
              Nouvelle étiquette
            </label>
            <input className="input" id="newTag" name="newTag" maxLength={40} placeholder="ex. Groupe C" aria-describedby="tag-pii" />
            <PiiNotice id="tag-pii" />
          </div>
          <p className="hint">Regroupements libres. Pas d&apos;âge, pas de sexe, aucune donnée personnelle.</p>
        </fieldset>
        {seasons.length > 0 ? (
          <div className="field">
            <label htmlFor="enrollSeasonId">Engager dans une saison</label>
            <select className="select" id="enrollSeasonId" name="enrollSeasonId" defaultValue={seasons.find((s) => s.status === "OPEN")?.id ?? ""}>
              <option value="">Ne pas engager pour l&apos;instant</option>
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <Alert kind="info" icon="key" title="Mot de passe temporaire">
          Il sera généré automatiquement et affiché <strong>une seule fois</strong> à l&apos;écran suivant. Le joueur devra le changer à sa première connexion.
        </Alert>
        <div className="actions">
          <SubmitButton>Créer le compte</SubmitButton>
          <Link className="btn btn-ghost" href="/admin/joueurs">
            Annuler
          </Link>
        </div>
      </form>
      <aside className="cases">
        <div className="case">
          <h2 className="case-title">Ce que l&apos;application ne demande jamais</h2>
          <ul className="small muted" style={{ paddingLeft: "1.2em", margin: 0 }}>
            <li>nom, prénom</li>
            <li>e-mail, téléphone</li>
            <li>date de naissance, âge, sexe</li>
            <li>photo</li>
          </ul>
          <p className="small subtle mt-4 mb-0">La correspondance pseudo ↔ personne réelle est tenue par le club, hors de l&apos;application.</p>
        </div>
      </aside>
    </div>
  );
}
