import type { Metadata } from "next";
import Link from "next/link";
import { publishedRuleSetsForCopy } from "@/server/services/seasons";
import { createSeasonAction } from "@/app/actions/admin";
import { SubmitButton } from "@/components/forms";
import { Flash, PageHead, PiiNotice } from "@/components/ui";

export const metadata: Metadata = { title: "Nouvelle saison" };

/** E09b — FR-040 */
export default async function NouvelleSaisonPage({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const sp = await searchParams;
  const sources = await publishedRuleSetsForCopy();
  return (
    <>
      <PageHead
        eyebrow={
          <>
            <Link className="link" href="/admin/saisons">
              Saisons
            </Link>{" "}
            / Nouvelle
          </>
        }
        title="Nouvelle saison"
      />
      <Flash error={sp.erreur} />
      <form className="layout-2" action={createSeasonAction}>
        <div>
          <div className="field">
            <label htmlFor="title">
              Titre <span className="req" aria-hidden="true">*</span>
            </label>
            <input className="input" id="title" name="title" required minLength={3} maxLength={80} placeholder="Race jeunes 2027-2028" aria-describedby="title-pii" />
            <PiiNotice id="title-pii" />
          </div>
          <div className="field">
            <label htmlFor="slug">
              Identifiant <span className="req" aria-hidden="true">*</span>
            </label>
            <input className="input mono" id="slug" name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={60} placeholder="race-jeunes-2027-28" autoCapitalize="none" spellCheck={false} aria-describedby="slug-h" />
            <p className="hint" id="slug-h">
              Unique et stable : minuscules, chiffres et tirets. Non modifiable après l&apos;ouverture.
            </p>
          </div>
          <div className="row" style={{ alignItems: "flex-start" }}>
            <div className="field grow">
              <label htmlFor="startsOn">
                Début <span className="subtle small">(facultatif)</span>
              </label>
              <input className="input" id="startsOn" name="startsOn" type="date" />
            </div>
            <div className="field grow">
              <label htmlFor="endsOn">
                Fin <span className="subtle small">(facultatif)</span>
              </label>
              <input className="input" id="endsOn" name="endsOn" type="date" />
            </div>
          </div>
          <p className="hint" style={{ marginTop: -12, marginBottom: "var(--s-5)" }}>
            Dates purement informatives : elles ne bloquent pas la saisie.
          </p>
          <fieldset>
            <legend>Classement de référence des engagés</legend>
            <label className="check">
              <input type="radio" name="rankingMode" value="FROZEN" defaultChecked /> Figé à l&apos;engagement
            </label>
            <label className="check">
              <input type="radio" name="rankingMode" value="EVOLVING" /> Évolutif (classement en vigueur à la date du match)
            </label>
          </fieldset>
          <fieldset>
            <legend>Visibilité du classement</legend>
            <label className="check">
              <input type="radio" name="visibility" value="ALL" defaultChecked /> Visible par tous les joueurs connectés
            </label>
            <label className="check">
              <input type="radio" name="visibility" value="ENROLLED" /> Visible uniquement par les engagés
            </label>
            <label className="check">
              <input type="radio" name="visibility" value="SELF" /> Masqué (chaque joueur ne voit que son rang)
            </label>
          </fieldset>
        </div>
        <div>
          <fieldset>
            <legend>Barème</legend>
            <label className="check">
              <input type="radio" name="bareme" value="copy" defaultChecked={sources.length > 0} disabled={sources.length === 0} /> Dupliquer le barème d&apos;une saison existante
            </label>
            {sources.length > 0 ? (
              <div className="field" style={{ marginLeft: 34 }}>
                <label htmlFor="copyFromRuleSetId" className="sr-only">
                  Barème source
                </label>
                <select className="select" id="copyFromRuleSetId" name="copyFromRuleSetId">
                  {sources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.season.slug} — v{r.version}
                    </option>
                  ))}
                </select>
                <p className="hint">Copie indépendante : la modifier ne touchera jamais la saison source. Elle est publiée en v1.</p>
              </div>
            ) : null}
            <label className="check">
              <input type="radio" name="bareme" value="empty" defaultChecked={sources.length === 0} /> Partir d&apos;un barème vide (brouillon à compléter)
            </label>
          </fieldset>
          <div className="actions">
            <SubmitButton>Créer en brouillon</SubmitButton>
            <Link className="btn btn-ghost" href="/admin/saisons">
              Annuler
            </Link>
          </div>
          <p className="small subtle">Une saison brouillon n&apos;est visible que des admins. Ajustez le barème et engagez les joueurs avant de l&apos;ouvrir.</p>
        </div>
      </form>
    </>
  );
}
