import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LADDER } from "@/scoring";
import { db } from "@/server/db";
import { listTags } from "@/server/services/accounts";
import { setStatusAction, updatePlayerAction } from "@/app/actions/admin";
import { ConfirmButton, SubmitButton } from "@/components/forms";
import { Flash, Icon, PageHead, PiiNotice, formatDateTime } from "@/components/ui";
import { ResetPassword } from "./reset-password";

export const metadata: Metadata = { title: "Joueur" };

/** E08a (détail) — FR-023 à FR-025 */
export default async function JoueurPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await db.user.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
      rankingChanges: { orderBy: { effectiveAt: "desc" }, take: 10 },
      enrollments: { include: { season: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!user || user.role !== "PLAYER") notFound();
  const tags = await listTags();
  const mine = new Set(user.tags.map((t) => t.tag.name));

  return (
    <>
      <PageHead
        eyebrow={
          <>
            <Link className="link" href="/admin/joueurs">
              Joueurs
            </Link>{" "}
            / {user.pseudo}
          </>
        }
        title={user.pseudo}
        lead={
          user.status === "DISABLED"
            ? "Compte désactivé : connexion impossible, historique conservé."
            : user.mustChangePassword
              ? "Mot de passe temporaire jamais changé."
              : "Compte actif."
        }
      />
      <Flash ok={sp.ok} error={sp.erreur} />
      <div className="layout-2">
        <form action={updatePlayerAction} className="cases">
          <div className="case">
            <h2 className="case-title">Profil</h2>
            <input type="hidden" name="userId" value={user.id} />
            <div className="field">
              <label htmlFor="pseudo">Pseudo</label>
              <input className="input" id="pseudo" name="pseudo" defaultValue={user.pseudo} required maxLength={20} aria-describedby="p-pii" />
              <PiiNotice id="p-pii" />
            </div>
            <div className="field">
              <label htmlFor="ranking">Classement FFT actuel</label>
              <select className="select" id="ranking" name="ranking" defaultValue={user.ranking ?? "NC"}>
                {LADDER.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <p className="hint">Chaque changement est historisé. En mode figé, il n&apos;affecte pas les saisons en cours.</p>
            </div>
            <fieldset>
              <legend>Étiquettes</legend>
              <div className="chips" style={{ flexWrap: "wrap" }}>
                {tags.map((t) => (
                  <label key={t.id} className="chip">
                    <input type="checkbox" name="tags" value={t.name} defaultChecked={mine.has(t.name)} style={{ accentColor: "var(--accent)" }} /> {t.name}
                  </label>
                ))}
              </div>
              <div className="field mt-2">
                <label htmlFor="newTag" className="small">
                  Nouvelle étiquette
                </label>
                <input className="input" id="newTag" name="newTag" maxLength={40} />
              </div>
            </fieldset>
            <SubmitButton>Enregistrer</SubmitButton>
          </div>
        </form>

        <div className="stack">
          <div className="cases">
            <div className="case">
              <h2 className="case-title">Accès</h2>
              <ResetPassword userId={user.id} pseudo={user.pseudo} />
              <form action={setStatusAction} className="mt-4">
                <input type="hidden" name="userId" value={user.id} />
                {user.status === "ACTIVE" ? (
                  <>
                    <input type="hidden" name="status" value="DISABLED" />
                    <ConfirmButton className="btn btn-danger" message={`Désactiver ${user.pseudo} ? Ses sessions seront coupées immédiatement.`}>
                      <Icon name="lock" />
                      Désactiver le compte
                    </ConfirmButton>
                  </>
                ) : (
                  <>
                    <input type="hidden" name="status" value="ACTIVE" />
                    <button className="btn btn-secondary" type="submit">
                      Réactiver le compte
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>
          <div className="cases">
            <div className="case">
              <h2 className="case-title">Historique du classement</h2>
              <ul className="list">
                {user.rankingChanges.map((c) => (
                  <li key={c.id}>
                    <div className="item" style={{ minHeight: 0 }}>
                      <div className="item-main">
                        <div className="item-title">
                          {c.from ? `${c.from} → ` : ""}
                          {c.to}
                        </div>
                      </div>
                      <span className="small subtle">{formatDateTime(c.effectiveAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="cases">
            <div className="case">
              <h2 className="case-title">Saisons</h2>
              {user.enrollments.length === 0 ? <p className="small muted mb-0">Engagé dans aucune saison.</p> : null}
              <ul className="list">
                {user.enrollments.map((e) => (
                  <li key={e.id}>
                    <Link className="item" href={`/admin/saisons/${e.season.slug}`}>
                      <div className="item-main">
                        <div className="item-title">{e.season.title}</div>
                        <div className="item-meta">départ {e.startingRanking}</div>
                      </div>
                      <span className="chev">
                        <Icon name="chev-r" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
