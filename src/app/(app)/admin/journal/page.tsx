import type { Metadata } from "next";
import Link from "next/link";
import { auditEntries } from "@/server/services/dashboard";
import { Icon, PageHead, formatDateTime } from "@/components/ui";

export const metadata: Metadata = { title: "Journal d'audit" };

const TYPES = ["Compte", "Saison", "Barème", "Engagement", "Match", "Import", "Sécurité", "Export"];

function detailText(details: unknown): string {
  if (!details || typeof details !== "object") return "";
  return Object.entries(details as Record<string, unknown>)
    .map(([k, v]) => `${k} : ${Array.isArray(v) ? v.join(", ") : typeof v === "object" ? JSON.stringify(v) : String(v)}`)
    .join(" · ");
}

/** E13 — FR-142 */
export default async function JournalPage({ searchParams }: { searchParams: Promise<{ type?: string; q?: string }> }) {
  const sp = await searchParams;
  const type = TYPES.includes(sp.type ?? "") ? sp.type : undefined;
  const entries = await auditEntries({ type, q: sp.q?.slice(0, 60), take: 200 });
  const href = (t?: string) => `/admin/journal?${new URLSearchParams({ ...(t ? { type: t } : {}), ...(sp.q ? { q: sp.q } : {}) }).toString()}`;

  return (
    <>
      <PageHead eyebrow="Traçabilité" title="Journal d'audit" lead="Lecture seule · non modifiable · aucune donnée personnelle ni mot de passe" />
      <form className="toolbar" method="get" role="search">
        <div className="search">
          <label htmlFor="q" className="sr-only">
            Rechercher
          </label>
          <Icon name="search" />
          <input className="input" id="q" name="q" type="search" placeholder="Pseudo, saison, action…" defaultValue={sp.q} />
        </div>
        {type ? <input type="hidden" name="type" value={type} /> : null}
        <button className="btn btn-secondary" type="submit">
          Rechercher
        </button>
        <a className="btn btn-secondary" href={`/api/export/journal${type ? `?type=${encodeURIComponent(type)}` : ""}`}>
          <Icon name="download" />
          Exporter (CSV)
        </a>
      </form>
      <div className="chips mb-4" role="group" aria-label="Filtrer par type">
        <Link className={`chip${!type ? " is-on" : ""}`} href={href()}>
          Tout
        </Link>
        {TYPES.map((t) => (
          <Link key={t} className={`chip${type === t ? " is-on" : ""}`} href={href(t)}>
            {t}
          </Link>
        ))}
      </div>
      <ul className="list hide-tablet-up">
        {entries.map((e) => (
          <li key={e.id}>
            <div className="item" style={{ alignItems: "flex-start" }}>
              <div className="item-main">
                <div className="item-title">
                  {e.action} <span className="badge badge-tag">{e.type}</span>
                </div>
                <div className="item-meta">
                  {e.target ? <span className="mono">{e.target}</span> : null} {detailText(e.details)}
                </div>
                <div className="item-meta">
                  {formatDateTime(e.at)} · {e.actorPseudo}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
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
                <td className="mono small">{e.target}</td>
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
