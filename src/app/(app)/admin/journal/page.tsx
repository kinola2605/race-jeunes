import type { Metadata } from "next";
import Link from "next/link";
import { auditEntries } from "@/server/services/dashboard";
import { Icon, PageHead, formatDateTime } from "@/components/ui";

export const metadata: Metadata = { title: "Journal d'audit" };

const TYPES = ["Compte", "Saison", "Barème", "Engagement", "Match", "Import", "Sécurité", "Export", "Apparence"];

/** Libellés lisibles des détails techniques (spec 011). Une clé inconnue est affichée telle quelle. */
const DETAIL_LABELS: Record<string, string> = {
  points: "points",
  season: "saison",
  ruleSetVersion: "barème v",
  score: "score",
  tournament: "tournoi",
  created: "créés",
  updated: "mis à jour",
  skipped: "ignorés",
  reason: "motif",
  from: "avant",
  to: "après",
  ranking: "classement",
  tags: "étiquettes",
  goal: "objectif",
  matchGoal: "objectif",
  count: "nombre",
  status: "statut",
  title: "titre",
  version: "version",
};

function detailText(details: unknown): string {
  if (!details || typeof details !== "object") return "";
  return Object.entries(details as Record<string, unknown>)
    .filter(([, v]) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0))
    .map(([k, v]) => {
      const value = Array.isArray(v) ? v.join(", ") : typeof v === "object" ? JSON.stringify(v) : String(v);
      const label = DETAIL_LABELS[k] ?? k;
      return label.endsWith(" v") ? `${label}${value}` : `${label} : ${value}`;
    })
    .join(" · ");
}

const dayOf = (d: Date) => d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });
const timeOf = (d: Date) => d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });

/** E13 — FR-142 */
export default async function JournalPage({ searchParams }: { searchParams: Promise<{ type?: string; q?: string }> }) {
  const sp = await searchParams;
  const type = TYPES.includes(sp.type ?? "") ? sp.type : undefined;
  const entries = await auditEntries({ type, q: sp.q?.slice(0, 60), take: 200 });
  const href = (t?: string) => `/admin/journal?${new URLSearchParams({ ...(t ? { type: t } : {}), ...(sp.q ? { q: sp.q } : {}) }).toString()}`;
  // sur mobile : regroupement par jour, dans l'ordre déjà fourni (du plus récent au plus ancien)
  const days: { day: string; items: typeof entries }[] = [];
  for (const e of entries) {
    const day = dayOf(e.at);
    const last = days.at(-1);
    if (last && last.day === day) last.items.push(e);
    else days.push({ day, items: [e] });
  }

  return (
    <>
      <div className="head-row">
        <PageHead eyebrow="Traçabilité" title="Journal d'audit" lead="Lecture seule · non modifiable · aucune donnée personnelle ni mot de passe" />
        <a className="btn btn-secondary btn-sm" href={`/api/export/journal${type ? `?type=${encodeURIComponent(type)}` : ""}`} aria-label="Exporter (CSV)">
          <Icon name="download" />
          CSV
        </a>
      </div>
      <form className="toolbar" method="get" role="search">
        <div className="search">
          <label htmlFor="q" className="sr-only">
            Rechercher
          </label>
          <Icon name="search" />
          <input className="input" id="q" name="q" type="search" placeholder="Pseudo, saison, action…" defaultValue={sp.q} />
          <button className="icon-btn" type="submit" aria-label="Rechercher">
            <Icon name="chev-r" />
          </button>
        </div>
        {type ? <input type="hidden" name="type" value={type} /> : null}
      </form>
      <div className="filter-row mb-4" role="group" aria-label="Filtrer par type">
        <span className="filter-label" aria-hidden="true">
          Type
        </span>
        <Link className={`chip${!type ? " is-on" : ""}`} href={href()}>
          Tout
        </Link>
        {TYPES.map((t) => (
          <Link key={t} className={`chip${type === t ? " is-on" : ""}`} href={href(t)}>
            {t}
          </Link>
        ))}
      </div>
      <div className="hide-tablet-up">
        {days.map((d) => (
          <section key={d.day} aria-label={d.day}>
            <h2 className="section-title day-title">{d.day}</h2>
            <ul className="list">
              {d.items.map((e) => (
                <li key={e.id}>
                  <div className="item" style={{ alignItems: "flex-start" }}>
                    <span className="log-time">{timeOf(e.at)}</span>
                    <div className="item-main">
                      <div className="item-title">
                        {e.action} <span className="badge badge-tag">{e.type}</span>
                      </div>
                      {e.target ? <div className="item-meta strong">{e.target}</div> : null}
                      {detailText(e.details) ? <div className="item-meta">{detailText(e.details)}</div> : null}
                      <div className="item-meta">par {e.actorPseudo}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className="table-wrap hide-mobile">
        <table className="table">
          <caption className="sr-only">Journal d&apos;audit</caption>
          <thead>
            <tr>
              <th>Date</th>
              <th>Auteur</th>
              <th>Type</th>
              <th>Action</th>
              <th>Cible</th>
              <th>Détail</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id}>
                <td className="num" style={{ whiteSpace: "nowrap" }}>
                  {formatDateTime(e.at)}
                </td>
                <td>{e.actorPseudo}</td>
                <td>
                  <span className="badge badge-tag">{e.type}</span>
                </td>
                <td className="strong">{e.action}</td>
                <td className="small">{e.target}</td>
                <td className="muted small">{detailText(e.details)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {entries.length === 0 ? <p className="muted">Aucune entrée.</p> : null}
    </>
  );
}
