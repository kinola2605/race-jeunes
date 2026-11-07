import type { Metadata } from "next";
import Link from "next/link";
import { accountCounts, listAccounts, listTags, type AccountFilter } from "@/server/services/accounts";
import { Icon, PageHead } from "@/components/ui";

export const metadata: Metadata = { title: "Joueurs" };

type Search = Promise<{ q?: string; filtre?: string; tag?: string }>;

/** E08a — FR-022 */
export default async function JoueursPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const filter = (["active", "disabled", "temporary", "all"].includes(sp.filtre ?? "") ? sp.filtre : "active") as AccountFilter;
  const [players, counts, tags] = await Promise.all([listAccounts({ q: sp.q, filter, tag: sp.tag }), accountCounts(), listTags()]);
  const href = (p: Record<string, string | undefined>) => {
    const u = new URLSearchParams();
    const merged = { q: sp.q, filtre: filter, tag: sp.tag, ...p };
    for (const [k, v] of Object.entries(merged)) if (v) u.set(k, v);
    return `/admin/joueurs?${u.toString()}`;
  };
  const chip = (active: boolean) => (active ? "chip is-on" : "chip");

  return (
    <>
      <PageHead
        eyebrow="Comptes"
        title="Joueurs"
        lead={`${counts.total} comptes · ${counts.active} actifs · ${counts.disabled} désactivés. Seul l'admin peut créer un compte.`}
      />
      <div className="row mb-4">
        <Link className="btn btn-primary" href="/admin/joueurs/nouveau">
          <Icon name="plus" />
          Nouveau joueur
        </Link>
        <Link className="btn btn-secondary" href="/admin/joueurs/import">
          <Icon name="upload" />
          Importer un CSV
        </Link>
      </div>
      <form className="toolbar" method="get" role="search">
        <div className="search">
          <label htmlFor="q" className="sr-only">
            Rechercher un pseudo
          </label>
          <Icon name="search" />
          <input className="input" id="q" name="q" type="search" placeholder="Rechercher un pseudo" defaultValue={sp.q} />
        </div>
        <input type="hidden" name="filtre" value={filter} />
        {sp.tag ? <input type="hidden" name="tag" value={sp.tag} /> : null}
        <button className="btn btn-secondary" type="submit">
          Rechercher
        </button>
      </form>
      <div className="chips mb-4" role="group" aria-label="Filtrer">
        <Link className={chip(filter === "active")} href={href({ filtre: "active" })} aria-current={filter === "active" ? "true" : undefined}>
          Actifs ({counts.active})
        </Link>
        <Link className={chip(filter === "temporary")} href={href({ filtre: "temporary" })} aria-current={filter === "temporary" ? "true" : undefined}>
          <Icon name="key" />
          Mdp temporaire ({counts.temporary})
        </Link>
        <Link className={chip(filter === "disabled")} href={href({ filtre: "disabled" })} aria-current={filter === "disabled" ? "true" : undefined}>
          <Icon name="lock" />
          Désactivés ({counts.disabled})
        </Link>
        <Link className={chip(filter === "all")} href={href({ filtre: "all" })} aria-current={filter === "all" ? "true" : undefined}>
          Tous
        </Link>
        {tags.map((t) => (
          <Link key={t.id} className={chip(sp.tag === t.name)} href={href({ tag: sp.tag === t.name ? undefined : t.name })} aria-current={sp.tag === t.name ? "true" : undefined}>
            <Icon name="tag" />
            {t.name}
          </Link>
        ))}
      </div>

      {players.length === 0 ? <p className="muted">Aucun compte ne correspond.</p> : null}
      <ul className="list hide-tablet-up">
        {players.map((p) => (
          <li key={p.id}>
            <Link className="item" href={`/admin/joueurs/${p.id}`}>
              <div className="item-main">
                <div className="item-title">
                  {p.pseudo}
                  {p.status === "DISABLED" ? (
                    <span className="badge badge-off">
                      <Icon name="lock" />
                      Désactivé
                    </span>
                  ) : p.mustChangePassword ? (
                    <span className="badge badge-wait">
                      <Icon name="key" />
                      Mdp temporaire
                    </span>
                  ) : null}
                </div>
                <div className="item-meta">
                  {p.ranking} · {p.tags.map((t) => t.tag.name).join(", ") || "—"} · {p._count.enrollments} saison(s)
                </div>
              </div>
              <span className="chev">
                <Icon name="chev-r" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="table-wrap hide-mobile">
        <table className="table">
          <caption className="sr-only">Liste des joueurs</caption>
          <thead>
            <tr>
              <th>Pseudo</th>
              <th>Classement</th>
              <th>Étiquettes</th>
              <th>Statut</th>
              <th className="num">Saisons</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id} className={p.status === "DISABLED" ? "is-off" : undefined}>
                <td className="strong">{p.pseudo}</td>
                <td>{p.ranking}</td>
                <td>
                  {p.tags.length ? p.tags.map((t) => <span key={t.tagId} className="badge badge-tag" style={{ marginRight: 4 }}>{t.tag.name}</span>) : <span className="subtle">—</span>}
                </td>
                <td>
                  {p.status === "DISABLED" ? (
                    <span className="badge badge-off">
                      <Icon name="lock" />
                      Désactivé
                    </span>
                  ) : p.mustChangePassword ? (
                    <span className="badge badge-wait">
                      <Icon name="key" />
                      Mdp temporaire
                    </span>
                  ) : (
                    <span className="badge badge-ok">
                      <Icon name="check" />
                      Actif
                    </span>
                  )}
                </td>
                <td className="num">{p._count.enrollments}</td>
                <td>
                  <Link className="btn btn-ghost btn-sm" href={`/admin/joueurs/${p.id}`}>
                    <Icon name="edit" />
                    Gérer<span className="sr-only"> {p.pseudo}</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small subtle mt-4">Un compte n&apos;est jamais supprimé : il est désactivé (sessions coupées immédiatement, classements passés conservés).</p>
    </>
  );
}
