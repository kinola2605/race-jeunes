"use client";
import { useMemo, useState } from "react";
import {
  COLOR_KEYS,
  COLOR_LABELS,
  DEFAULT_COLORS,
  THEME_BASE,
  checkColor,
  normalizeHex,
  onColor,
  type ColorKey,
  type ColorSet,
} from "@/appearance/colors";
import { saveColorsAction } from "@/app/actions/appearance";
import { SubmitButton } from "@/components/forms";
import { Icon } from "@/components/ui";

const HINTS: Record<ColorKey, string> = {
  accentDark: "Bandeau, onglet actif, filets, boutons pleins, « ma ligne » au classement.",
  actionDark: "Bouton principal, sur-titres, perfs.",
  accentLight: "Bandeau, onglet actif, filets, boutons pleins.",
  actionLight: "Bouton principal, sur-titres, perfs.",
};

const ratio = (r: number) => r.toFixed(2).replace(".", ",");

/** Spec 004 — saisie des 4 couleurs avec contrôle de lisibilité et aperçu en direct (FR-311, FR-313). */
export function ColorForm({ current }: { current: ColorSet }) {
  const [values, setValues] = useState<Record<ColorKey, string>>(
    Object.fromEntries(COLOR_KEYS.map((k) => [k, current[k] ?? ""])) as Record<ColorKey, string>,
  );
  const parsed = useMemo(
    () =>
      Object.fromEntries(COLOR_KEYS.map((k) => [k, normalizeHex(values[k])])) as Record<
        ColorKey,
        string | null | undefined
      >,
    [values],
  );
  const eff = (k: ColorKey) => parsed[k] ?? DEFAULT_COLORS[k];
  const checks = COLOR_KEYS.map((k) => (parsed[k] === undefined ? null : checkColor(k, eff(k))));
  const allOk = checks.every((c) => c !== null && c.ok);
  const set = (k: ColorKey, v: string) => setValues((s) => ({ ...s, [k]: v }));

  return (
    <form action={saveColorsAction}>
      <div className="cases cases-2">
        {COLOR_KEYS.map((k, i) => {
          const c = checks[i] ?? null;
          const id = `c-${k}`;
          const invalid = parsed[k] === undefined || (c !== null && !c.ok);
          return (
            <div key={k} className={`field${invalid ? " field-invalid" : ""}`} style={{ marginBottom: 0 }}>
              <label htmlFor={id}>{COLOR_LABELS[k]}</label>
              <p className="hint" id={`${id}-h`}>
                {HINTS[k]}
              </p>
              <div className="row" style={{ flexWrap: "nowrap" }}>
                <input
                  type="color"
                  aria-label={`${COLOR_LABELS[k]} : sélecteur`}
                  value={eff(k).toLowerCase()}
                  onChange={(e) => set(k, e.target.value.toUpperCase())}
                  style={{
                    width: 52,
                    height: 44,
                    padding: 0,
                    border: "1px solid var(--field-border)",
                    borderRadius: "var(--r-sm)",
                    background: "none",
                    flex: "none",
                  }}
                />
                <input
                  className="input mono"
                  id={id}
                  name={k}
                  value={values[k]}
                  placeholder={`${DEFAULT_COLORS[k]} (par défaut)`}
                  maxLength={7}
                  autoComplete="off"
                  spellCheck={false}
                  aria-describedby={`${id}-h ${id}-r`}
                  aria-invalid={invalid || undefined}
                  onChange={(e) => set(k, e.target.value)}
                />
                <button
                  className="btn btn-ghost btn-sm"
                  type="button"
                  onClick={() => set(k, "")}
                  disabled={values[k] === ""}
                  aria-label={`${COLOR_LABELS[k]} : revenir à la valeur par défaut`}
                >
                  <Icon name="refresh" />
                  Défaut
                </button>
              </div>
              <p className="hint" id={`${id}-r`} aria-live="polite">
                {parsed[k] === undefined ? (
                  <>
                    <Icon name="alert" /> Format #RRGGBB attendu.
                  </>
                ) : c!.ok ? (
                  <>
                    <Icon name="check" /> Lisible : {ratio(c!.surfaceRatio)}:1 sur le fond (min.{" "}
                    {ratio(c!.surfaceMin)}:1), texte {c!.textOn === "#FFFFFF" ? "blanc" : "bleu marine"} à{" "}
                    {ratio(c!.textRatio)}:1.
                  </>
                ) : (
                  <>
                    <Icon name="alert" /> {c!.message}
                  </>
                )}
              </p>
            </div>
          );
        })}
      </div>

      <h3 className="section-title mt-8">Aperçu</h3>
      <div className="cases cases-2">
        <Preview theme="dark" accent={eff("accentDark")} action={eff("actionDark")} />
        <Preview
          theme="light"
          accent={eff("accentLight")}
          action={eff("actionLight")}
          highlight={eff("accentDark")}
        />
      </div>

      <div className="actions">
        <SubmitButton disabled={!allOk} pendingLabel="Enregistrement…">
          <Icon name="check" />
          Enregistrer les couleurs
        </SubmitButton>
      </div>
    </form>
  );
}

/** Mini-écran rendu dans le thème indiqué, avec les couleurs en cours de saisie. */
function Preview({
  theme,
  accent,
  action,
  highlight,
}: {
  theme: "dark" | "light";
  accent: string;
  action: string;
  highlight?: string;
}) {
  const hl = highlight ?? accent;
  const base = THEME_BASE[theme];
  const vars = {
    "--bg": base.bg,
    "--text": base.text,
    "--line-soft": base.lineSoft,
    "--accent": accent,
    "--on-accent": onColor(accent),
    "--line": accent,
    "--accent-2": action,
    "--on-accent-2": onColor(action),
    "--highlight": hl,
    "--on-highlight": onColor(hl),
  } as React.CSSProperties;
  return (
    <div
      data-theme={theme}
      style={{
        ...vars,
        background: "var(--bg)",
        color: "var(--text)",
        borderRadius: "var(--r-card)",
        padding: "var(--s-5)",
        border: "1px solid var(--line-soft)",
      }}
      aria-label={`Aperçu du thème ${theme === "dark" ? "sombre" : "clair"}`}
      role="group"
    >
      <span className="eyebrow" style={{ color: "var(--accent-2)", fontWeight: 600 }}>
        Thème {theme === "dark" ? "sombre" : "clair"}
      </span>
      <div
        style={{
          borderBottom: "1px solid var(--line)",
          paddingBottom: "var(--s-2)",
          marginBottom: "var(--s-3)",
          fontWeight: 700,
        }}
      >
        Classement
      </div>
      <div
        style={{
          background: "var(--highlight)",
          color: "var(--on-highlight)",
          padding: "var(--s-2) var(--s-3)",
          borderRadius: "var(--r-sm)",
          marginBottom: "var(--s-3)",
        }}
      >
        1. Moi · <strong>120 pts</strong>
      </div>
      <div className="row">
        <span className="btn btn-primary btn-sm" aria-hidden="true">
          Action principale
        </span>
        <span
          className="badge"
          style={{ background: "var(--accent)", color: "var(--on-accent)", borderColor: "var(--accent)" }}
        >
          Accent
        </span>
      </div>
    </div>
  );
}
