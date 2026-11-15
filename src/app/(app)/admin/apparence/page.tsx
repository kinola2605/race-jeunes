import type { Metadata } from "next";
import { getBrand } from "@/brand";
import { CLUB_NAME_MAX, CLUB_SHORT_NAME_MAX, getAppearance } from "@/server/services/appearance";
import { clearLogoAction, resetColorsAction, saveClubIdentityAction, uploadLogoAction } from "@/app/actions/appearance";
import { ConfirmButton, SubmitButton } from "@/components/forms";
import { Flash, Icon, PageHead } from "@/components/ui";
import { COLOR_KEYS, THEME_BASE } from "@/appearance/colors";
import { ColorForm } from "./color-form";

export const metadata: Metadata = { title: "Apparence" };

/** Specs 003 (logo), 004 (couleurs) et 016 (nom du club) : identité du club configurée par l'admin. */
export default async function AppearancePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erreur?: string }>;
}) {
  const sp = await searchParams;
  const [appearance, brand] = await Promise.all([getAppearance(), getBrand()]);
  const hasLogo = appearance.logoVersion !== null;
  const customColors = COLOR_KEYS.some((k) => appearance.colors[k] !== null);

  return (
    <>
      <PageHead
        eyebrow="Administration"
        title="Apparence"
        lead="Nom, logo et couleurs du club, appliqués immédiatement pour tous les utilisateurs."
      />
      <Flash ok={sp.ok} error={sp.erreur} />

      <section className="section" aria-labelledby="t-club">
        <h2 className="section-title" id="t-club">
          Nom du club
        </h2>
        <form className="case" action={saveClubIdentityAction}>
          <div className="field">
            <label htmlFor="clubName">Nom du club</label>
            <input
              className="input"
              id="clubName"
              name="clubName"
              defaultValue={brand.clubName}
              maxLength={CLUB_NAME_MAX}
              required
              aria-describedby="clubName-h"
            />
            <p className="hint" id="clubName-h">
              Affiché sur la page de connexion, les fiches imprimables et l&apos;application installée.
            </p>
          </div>
          <div className="field">
            <label htmlFor="clubShortName">Sigle (facultatif)</label>
            <input
              className="input"
              id="clubShortName"
              name="clubShortName"
              defaultValue={brand.clubShortName}
              maxLength={CLUB_SHORT_NAME_MAX}
              aria-describedby="clubShortName-h"
            />
            <p className="hint" id="clubShortName-h">
              Affiché sous le nom de l&apos;application, en haut de chaque page ({CLUB_SHORT_NAME_MAX} caractères maximum).
            </p>
          </div>
          <SubmitButton>
            <Icon name="check" />
            Enregistrer le nom
          </SubmitButton>
        </form>
      </section>

      <section className="section" aria-labelledby="t-logo">
        <h2 className="section-title" id="t-logo">
          Logo
        </h2>
        <div className="cases cases-2">
          <div className="case">
            <p className="small muted">
              {hasLogo ? "Logo du club déposé." : "Logo par défaut."} Il est utilisé dans les deux thèmes, sur
              la connexion, la fiche imprimable et comme icône de l&apos;application.
            </p>
            <div className="row" style={{ flexWrap: "nowrap" }}>
              {(["dark", "light"] as const).map((t) => (
                <div
                  key={t}
                  style={{
                    background: THEME_BASE[t].bg,
                    border: `1px solid ${THEME_BASE[t].lineSoft}`,
                    borderRadius: "var(--r-card)",
                    padding: "var(--s-4)",
                    display: "grid",
                    placeItems: "center",
                    flex: 1,
                  }}
                >
                  <img
                    src={brand.logoDark}
                    alt={`Logo actuel sur fond ${t === "dark" ? "sombre" : "clair"}`}
                    width={96}
                    height={96}
                    style={{ objectFit: "contain" }}
                  />
                </div>
              ))}
            </div>
            {hasLogo ? (
              <form action={clearLogoAction} className="mt-4">
                <ConfirmButton message="Revenir au logo par défaut ? Le logo déposé sera supprimé.">
                  <Icon name="refresh" />
                  Revenir au logo par défaut
                </ConfirmButton>
              </form>
            ) : null}
          </div>
          <form className="case" action={uploadLogoAction}>
            <div className="field">
              <label htmlFor="logo">{hasLogo ? "Remplacer le logo" : "Déposer le logo du club"}</label>
              <p className="hint" id="logo-h">
                PNG, JPEG, WebP ou SVG · 512 Ko au plus · de préférence carré et lisible sur fond sombre comme
                sur fond clair.
              </p>
              <input
                className="input"
                id="logo"
                name="logo"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml,.svg"
                required
                aria-describedby="logo-h"
              />
            </div>
            <SubmitButton pendingLabel="Envoi…">
              <Icon name="check" />
              Enregistrer le logo
            </SubmitButton>
          </form>
        </div>
      </section>

      <section className="section" aria-labelledby="t-couleurs">
        <h2 className="section-title" id="t-couleurs">
          Couleurs
        </h2>
        <p className="small muted">
          Une couleur laissée vide reprend sa valeur par défaut. Une couleur qui rend l&apos;application
          difficile à lire est refusée (contraste WCAG 2.1).
        </p>
        <ColorForm current={appearance.colors} />
        {customColors ? (
          <form action={resetColorsAction} className="mt-4">
            <ConfirmButton message="Revenir aux couleurs par défaut pour les deux thèmes ?">
              <Icon name="refresh" />
              Revenir aux couleurs par défaut
            </ConfirmButton>
          </form>
        ) : null}
      </section>
    </>
  );
}
