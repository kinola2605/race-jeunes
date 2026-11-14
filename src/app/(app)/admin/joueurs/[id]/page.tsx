import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LADDER } from "@/scoring";
import { db } from "@/server/db";
import { listTags } from "@/server/services/accounts";
import { setStatusAction, updatePlayerAction } from "@/app/actions/admin";
import { setMatchGoalAction } from "@/app/actions/goals";
import { goalsOfPlayer } from "@/server/services/goals";
import { mentalOfPlayer } from "@/server/services/mental";
import { MentalProfileCard, type MentalSeason } from "@/components/mental-profile";
import { GOAL_MAX } from "@/goals/goals";
import { ConfirmButton, SubmitButton } from "@/components/forms";
import { Flash, Icon, PageHead, PiiNotice, SeasonStatusBadge, formatDateTime } from "@/components/ui";
import { ResetPassword } from "./reset-password";
import { Avatar } from "@/components/avatar";

export const metadata: Metadata = { title: "Joueur" };

/** Spec 014 : la fiche est découpée en quatre onglets, portés par l'URL (?onglet=). */
const TABS = [
  { key: "profil", label: "Profil" },
  { key: "saisons", label: "Saisons" },
  { key: "mental", label: "Mental" },
  { key: "compte", label: "Compte" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

/** E08a (détail) — FR-023 à FR-025, FR-1400 à FR-1406 */
export default async function JoueurPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erreur?: string; saison?: string; onglet?: string }> }) {
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
  // spec 012 : saisons non brouillon, de la plus récente à la plus ancienne
  const played = user.enrollments.filter((e) => e.season.status !== "DRAFT").sort((a, b) => b.season.createdAt.getTime() - a.season.createdAt.getTime());
  const tab: TabKey = TABS.find((t) => t.key === sp.onglet)?.key ?? "profil";
  const base = `/admin/joueurs/${user.id}`;
  // FR-1405 : chaque onglet ne charge que ses données
  const [tags, goals, mental] = await Promise.all([
    tab === "profil" ? listTags() : [],
    tab === "saisons" ? goalsOfPlayer(user.id, user.enrollments) : null,
    tab === "mental" ? mentalOfPlayer(user.id, played.map((e) => e.seasonId)) : null,
  ]);
  const mentalSeasons: MentalSeason[] = mental ? played.map((e) => ({ slug: e.season.slug, title: e.season.title, ...mental.get(e.seasonId)! })) : [];
  const mentalCurrent = mentalSeasons.find((s) => s.slug === sp.saison) ?? mentalSeasons[0];
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
        title={
          <span className="with-avatar">
            <Avatar pseudo={user.pseudo} avatar={user.avatar} size="md" />
            {user.pseudo}
          </span>
        }
        lead={
          user.status === "DISABLED"
            ? "Compte désactivé : connexion impossible, historique conservé."
            : user.mustChangePassword
              ? "Mot de passe temporaire jamais changé."
              : "Compte actif."
        }
      />
      <Flash ok={sp.ok} error={sp.erreur} />
      <nav className="seg seg-eq mb-4" aria-label="Sections de la fiche">
        {TABS.map((t) => (
          <Link key={t.key} href={t.key === "profil" ? base : `${base}?onglet=${t.key}`} aria-current={tab === t.key ? "true" : undefined}>
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "profil" ? (
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
              <h2 className="case-title">Historique du classement</h2>
              {user.rankingChanges.length === 0 ? <p className="small muted mb-0">Aucun changement enregistré.</p> : null}
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
          </div>
        </div>
      ) : null}
      {tab === "saisons" ? (
        <div className="stack">
          <div className="cases">
            <div className="case">
              <h2 className="case-title">Saisons</h2>
              {user.enrollments.length === 0 ? <p className="small muted mb-0">Engagé dans aucune saison.</p> : null}
              <ul className="list">
                {user.enrollments.map((e) => {
                  const goal = goals?.get(e.seasonId);
                  const writable = e.season.status === "DRAFT" || e.season.status === "OPEN";
                  return (
                    <li key={e.id} className="item" style={{ display: "block" }}>
                      <div className="row-between">
                        <div className="item-main">
                          <Link className="item-title link" href={`/admin/saisons/${e.season.slug}`}>
                            {e.season.title}
                          </Link>
                          <div className="item-meta">départ {e.startingRanking}</div>
                        </div>
                        <SeasonStatusBadge status={e.season.status} />
                      </div>
                      {goal ? (
                        <>
                          <p className="small mb-0 mt-2">
                            <strong>
                              {goal.played} / {goal.target} matchs
                            </strong>
                            {goal.reached ? " · objectif atteint" : ` · encore ${goal.remaining}`}
                            {goal.pending > 0 ? ` · ${goal.pending} en attente` : ""}
                          </p>
                          <div className="meter mt-2" aria-hidden="true">
                            <span style={{ width: `${goal.percent}%` }} />
                          </div>
                        </>
                      ) : !writable ? (
                        <p className="small subtle mb-0 mt-2">Pas d&apos;objectif de matchs.</p>
                      ) : null}
                      {writable ? (
                        <form action={setMatchGoalAction} className="row mt-2" style={{ gap: 8, alignItems: "flex-end" }}>
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="seasonId" value={e.seasonId} />
                          <div className="field" style={{ margin: 0 }}>
                            <label htmlFor={`goal-${e.seasonId}`} className="small">
                              Objectif de matchs
                            </label>
                            <input
                              className="input mono"
                              id={`goal-${e.seasonId}`}
                              name="matchGoal"
                              type="number"
                              inputMode="numeric"
                              min={1}
                              max={GOAL_MAX}
                              step={1}
                              defaultValue={e.matchGoal ?? ""}
                              placeholder="—"
                              style={{ width: "6em", textAlign: "right" }}
                            />
                          </div>
                          <button className="btn btn-secondary btn-sm" type="submit" style={{ minHeight: 44 }}>
                            Enregistrer
                          </button>
                        </form>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
              <p className="hint mb-0">Objectif : matchs validés de la saison, hors forfaits (1 à 200, vide = aucun). Aucun effet sur les points.</p>
            </div>
          </div>
        </div>
      ) : null}
      {tab === "mental" ? (
        <div className="stack">
          {mentalCurrent ? (
            <div className="cases">
              <section className="case" id="mental" aria-labelledby="t-mental">
                <h2 className="case-title" id="t-mental">
                  Profil mental
                </h2>
                <MentalProfileCard seasons={mentalSeasons} current={mentalCurrent} hrefFor={(slug) => `${base}?onglet=mental&saison=${slug}`} />
              </section>
            </div>
          ) : (
            <div className="cases">
              <div className="case">
                <h2 className="case-title">Profil mental</h2>
                <p className="small muted mb-0">Aucune saison ouverte ou terminée pour ce joueur : le profil mental se calcule à partir de ses matchs validés.</p>
              </div>
            </div>
          )}
        </div>
      ) : null}
      {tab === "compte" ? (
        <div className="layout-2">
          <div className="stack">
          <div className="cases">
            <div className="case">
              <h2 className="case-title">Accès</h2>
              <ResetPassword userId={user.id} pseudo={user.pseudo} />
              <a className="btn btn-secondary mt-4" href={`/api/mes-donnees?joueur=${encodeURIComponent(user.id)}`} download>
                <Icon name="download" />
                Télécharger ses données (RGPD)
              </a>
            </div>
          </div>
          </div>
          <div className="stack">
          <div className="cases">
            <div className={`case${user.status === "ACTIVE" ? " case-danger" : ""}`}>
              <h2 className="case-title">{user.status === "ACTIVE" ? "Désactivation" : "Compte désactivé"}</h2>
              <p className="small muted">
                {user.status === "ACTIVE"
                  ? "Le joueur ne pourra plus se connecter et ses sessions seront coupées. Son historique est conservé."
                  : "Le joueur ne peut plus se connecter. Son historique est conservé."}
              </p>
              <form action={setStatusAction} >
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
          </div>
        </div>
      ) : null}
    </>
  );
}
