import type { MatchStatus, SeasonStatus } from "@prisma/client";
import type { ReactNode } from "react";
import { ICONS, type IconName } from "./icons";

/** Icône décorative (le sens est toujours porté par un texte à côté). Contenu SVG statique et interne. */
export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      className={`ic${className ? " " + className : ""}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: ICONS[name] }}
    />
  );
}

export function PageHead({ eyebrow, title, lead }: { eyebrow?: ReactNode; title: ReactNode; lead?: ReactNode }) {
  return (
    <div className="page-head">
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h1 className="page-title">{title}</h1>
      {lead ? <p className="lead small">{lead}</p> : null}
    </div>
  );
}

/** FR-163 */
export function PiiNotice({ id }: { id?: string }) {
  return (
    <p className="notice-pii" id={id}>
      <Icon name="shield" />
      <span>
        <strong>Ne saisissez aucune donnée personnelle</strong> (nom réel, etc.).
      </span>
    </p>
  );
}

export function Alert({ kind, title, children, icon }: { kind: "info" | "ok" | "warn" | "ko"; title: string; children?: ReactNode; icon?: IconName }) {
  const defaults: Record<string, IconName> = { info: "info", ok: "check", warn: "alert", ko: "alert" };
  return (
    <div className={`alert alert-${kind}`} role={kind === "ko" || kind === "warn" ? "alert" : "status"}>
      <Icon name={icon ?? defaults[kind]!} />
      <div className="alert-body">
        <span className="alert-title">{title}</span>
        {children ? <div className="small">{children}</div> : null}
      </div>
    </div>
  );
}

/** Message issu d'une redirection (?ok= / ?erreur=). */
export function Flash({ ok, error }: { ok?: string; error?: string }) {
  if (error) return <div className="mb-4"><Alert kind="ko" title={error} /></div>;
  if (ok) return <div className="mb-4"><Alert kind="ok" title={ok} /></div>;
  return null;
}

const MATCH_STATUS: Record<MatchStatus, { cls: string; icon: IconName; label: string }> = {
  PENDING: { cls: "badge-wait", icon: "clock", label: "En attente" },
  VALIDATED: { cls: "badge-ok", icon: "check", label: "Validé" },
  REFUSED: { cls: "badge-ko", icon: "x", label: "Refusé" },
  CANCELLED: { cls: "badge-off strike", icon: "ban", label: "Annulé" },
};

export function MatchStatusBadge({ status }: { status: MatchStatus }) {
  const s = MATCH_STATUS[status];
  return (
    <span className={`badge ${s.cls}`}>
      <Icon name={s.icon} />
      {s.label}
    </span>
  );
}

const SEASON_STATUS: Record<SeasonStatus, { cls: string; icon: IconName; label: string }> = {
  DRAFT: { cls: "badge-tag", icon: "edit", label: "Brouillon" },
  OPEN: { cls: "badge-info", icon: "play", label: "Ouverte" },
  CLOSED: { cls: "badge-off", icon: "lock", label: "Clôturée" },
  ARCHIVED: { cls: "badge-off", icon: "archive", label: "Archivée" },
};

export function SeasonStatusBadge({ status }: { status: SeasonStatus }) {
  const s = SEASON_STATUS[status];
  return (
    <span className={`badge ${s.cls}`}>
      <Icon name={s.icon} />
      {s.label}
    </span>
  );
}

export function PerfBadge() {
  return (
    <span className="badge badge-perf">
      <Icon name="perf" />
      Perf
    </span>
  );
}

/** Victoire / défaite : lettre + texte pour lecteur d'écran, jamais la couleur seule. */
export function ResultBox({ won, walkover }: { won: boolean; walkover?: boolean }) {
  if (walkover) {
    return (
      <span className="res res-wo" title={won ? "Victoire par forfait" : "Défaite par forfait"}>
        WO<span className="sr-only">{won ? " victoire par forfait" : " défaite par forfait"}</span>
      </span>
    );
  }
  return (
    <span className={`res ${won ? "res-win" : "res-loss"}`}>
      <span aria-hidden="true">{won ? "V" : "D"}</span>
      <span className="sr-only">{won ? "Victoire" : "Défaite"}</span>
    </span>
  );
}

export function EmptyState({ icon, title, children }: { icon: IconName; title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <Icon name={icon} className="ic-xl" />
      <h3>{title}</h3>
      {children}
    </div>
  );
}

/** Spec 010, FR-1011 — ordinal composé en exposant : 1er, 9e. */
export function Ordinal({ n }: { n: number }) {
  return (
    <>
      {n}
      <sup className="ord">{n === 1 ? "er" : "e"}</sup>
    </>
  );
}

/** « 1 pt », « 2 pts ». */
export function pts(n: number): string {
  return `${n} pt${Math.abs(n) > 1 ? "s" : ""}`;
}

/** Sets d'un score normalisé (« 6/4 3/6 10-8 ») : [jeux du premier côté, jeux du second]. */
function parseSets(score: string): [string, string][] {
  return score
    .split(" ")
    .filter(Boolean)
    .map((p) => {
      const [x = "", y = ""] = p.split(p.includes("/") ? "/" : "-");
      return [x, y];
    });
}

/** Score en cases, du point de vue du lecteur (spec 010). */
export function SetBoxes({ score }: { score: string }) {
  return (
    <span className="setbox" role="img" aria-label={`Score ${score}`}>
      {parseSets(score).map(([x, y], i) => (
        <span key={i} aria-hidden="true">
          {x}-{y}
        </span>
      ))}
    </span>
  );
}

/** Tableau de score à deux lignes : le vainqueur est coché et en gras (spec 010). `score` est vu du côté A. */
export function ScoreBoard({ a, b, winner, score, walkover }: { a: ReactNode; b: ReactNode; winner: "A" | "B"; score: string | null; walkover?: boolean }) {
  const sets = score ? parseSets(score) : [];
  const line = (side: "A" | "B", name: ReactNode) => {
    const won = winner === side;
    return (
      <>
        {won ? <Icon name="check" /> : <span />}
        <span className={`score-name ${won ? "score-win" : "score-lose"}`}>
          {name}
          {won ? <span className="sr-only"> (vainqueur)</span> : null}
        </span>
        {walkover ? (
          <span className="small subtle">{won ? "forfait" : ""}</span>
        ) : (
          <span className="setbox">
            {sets.map((s, i) => (
              <span key={i}>{side === "A" ? s[0] : s[1]}</span>
            ))}
          </span>
        )}
      </>
    );
  };
  return (
    <div className="score">
      {line("A", a)}
      {line("B", b)}
    </div>
  );
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

export function formatDateTime(d: Date): string {
  return d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
}
