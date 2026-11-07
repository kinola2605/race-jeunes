"use client";
import { useMemo, useState } from "react";
import { LADDER, computeMatchPoints, isRanking, type RuleSet } from "@/scoring";
import { declareMatchAction } from "@/app/actions/matches";
import { SubmitButton } from "./forms";
import { Icon, PiiNotice } from "./ui";

export interface MatchFormSeason {
  id: string;
  title: string;
  rules: RuleSet | null;
  players: { id: string; pseudo: string; ranking: string }[];
}

/** E12a — saisie de match en bord de court (FR-100 à FR-102). */
export function MatchForm({ seasons, meId, admin, today }: { seasons: MatchFormSeason[]; meId: string | null; admin: boolean; today: string }) {
  const [seasonId, setSeasonId] = useState(seasons[0]?.id ?? "");
  const season = seasons.find((s) => s.id === seasonId) ?? seasons[0];
  const [playerAId, setPlayerAId] = useState(admin ? "" : (meId ?? ""));
  const [type, setType] = useState<"club" | "external">("club");
  const [opponentId, setOpponentId] = useState("");
  const [query, setQuery] = useState("");
  const [extRanking, setExtRanking] = useState("NC");
  const [result, setResult] = useState<"WIN" | "LOSS">("WIN");
  const [kind, setKind] = useState<"NORMAL" | "WALKOVER" | "RETIREMENT">("NORMAL");
  const [thirdSet, setThirdSet] = useState(false);

  const players = season?.players ?? [];
  const me = players.find((p) => p.id === playerAId);
  const opponents = players.filter((p) => p.id !== playerAId && p.pseudo.toLowerCase().includes(query.trim().toLowerCase()));
  const opp = players.find((p) => p.id === opponentId);
  const oppRanking = type === "club" ? opp?.ranking : extRanking;

  const estimate = useMemo(() => {
    if (!season?.rules || !me || !oppRanking || !isRanking(me.ranking) || !isRanking(oppRanking)) return null;
    return computeMatchPoints(season.rules, { playerRanking: me.ranking, opponentRanking: oppRanking, result, kind });
  }, [season, me, oppRanking, result, kind]);

  if (!season) return null;
  return (
    <form className="court" action={declareMatchAction}>
      {seasons.length > 1 ? (
        <div className="field">
          <label htmlFor="seasonId">Saison</label>
          <select className="select" id="seasonId" name="seasonId" value={seasonId} onChange={(e) => setSeasonId(e.target.value)}>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <input type="hidden" name="seasonId" value={season.id} />
      )}

      {admin ? (
        <div className="field">
          <label htmlFor="playerAId">Joueur</label>
          <select className="select" id="playerAId" name="playerAId" required value={playerAId} onChange={(e) => setPlayerAId(e.target.value)}>
            <option value="">Choisir un engagé…</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.pseudo} ({p.ranking})
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="playedOn">Date du match</label>
        <input className="input" id="playedOn" name="playedOn" type="date" defaultValue={today} max={today} required />
      </div>

      <fieldset>
        <legend>Adversaire</legend>
        <input type="hidden" name="opponentType" value={type} />
        <div className="seg mb-4" role="group" aria-label="Type d'adversaire">
          <button type="button" aria-pressed={type === "club"} onClick={() => setType("club")}>
            <Icon name="users" />
            Joueur du club
          </button>
          <button type="button" aria-pressed={type === "external"} onClick={() => setType("external")}>
            Extérieur
          </button>
        </div>
        {type === "club" ? (
          <>
            <div className="search">
              <label htmlFor="adv" className="sr-only">
                Rechercher un engagé
              </label>
              <Icon name="search" />
              <input className="input" id="adv" type="search" placeholder="Rechercher un pseudo" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
            </div>
            <div className="list mt-2" role="radiogroup" aria-label="Adversaire" style={{ maxHeight: 280, overflowY: "auto" }}>
              {opponents.length === 0 ? <p className="small subtle">Aucun engagé ne correspond.</p> : null}
              {opponents.map((p) => {
                const perf = me && isRanking(p.ranking) && isRanking(me.ranking) && LADDER.indexOf(p.ranking) > LADDER.indexOf(me.ranking);
                return (
                  <label key={p.id} className="item" style={{ minHeight: "var(--touch-court)", cursor: "pointer", borderBottom: "1px solid var(--line-soft)" }}>
                    <input type="radio" name="opponentId" value={p.id} checked={opponentId === p.id} onChange={() => setOpponentId(p.id)} style={{ width: 22, height: 22, accentColor: "var(--accent)" }} />
                    <div className="item-main">
                      <div className="item-title">{p.pseudo}</div>
                      <div className="item-meta">{p.ranking}</div>
                    </div>
                    {perf ? (
                      <span className="badge badge-perf">
                        <Icon name="perf" />
                        Perf possible
                      </span>
                    ) : null}
                  </label>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <div className="field">
              <label htmlFor="externalLabel">Libellé de l&apos;adversaire</label>
              <input className="input" id="externalLabel" name="externalLabel" placeholder="ex. Tournoi des Tilleuls, tableau 13 ans" maxLength={80} aria-describedby="ext-pii" required />
              <PiiNotice id="ext-pii" />
            </div>
            <div className="field">
              <label htmlFor="externalRanking">Classement de l&apos;adversaire</label>
              <select className="select" id="externalRanking" name="externalRanking" value={extRanking} onChange={(e) => setExtRanking(e.target.value)}>
                {LADDER.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </fieldset>

      <fieldset>
        <legend>Résultat {admin ? "du joueur" : ""}</legend>
        <div className="big-choice">
          <label>
            <input type="radio" name="result" value="WIN" checked={result === "WIN"} onChange={() => setResult("WIN")} />
            <span>
              <Icon name="up" className="ic-lg" />
              <br />
              {admin ? "Victoire" : "J'ai gagné"}
            </span>
          </label>
          <label>
            <input type="radio" name="result" value="LOSS" checked={result === "LOSS"} onChange={() => setResult("LOSS")} />
            <span>
              <Icon name="down" className="ic-lg" />
              <br />
              {admin ? "Défaite" : "J'ai perdu"}
            </span>
          </label>
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="kind">Type de match</label>
        <select className="select" id="kind" name="kind" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
          <option value="NORMAL">Match joué</option>
          <option value="RETIREMENT">Abandon en cours de match</option>
          <option value="WALKOVER">Forfait (non joué)</option>
        </select>
      </div>

      {kind !== "WALKOVER" ? (
        <fieldset>
          <legend>
            Score <span className="subtle small">(jeux par set, {admin ? "joueur" : "vous"} d&apos;abord)</span>
          </legend>
          <div className="sets">
            {[1, 2, ...(thirdSet ? [3] : [])].map((i) => (
              <div className="set-row" key={i}>
                <span className="strong">{i === 3 ? "Set 3 / STB" : `Set ${i}`}</span>
                <input className="input num" name={`s${i}a`} type="number" inputMode="numeric" min={0} max={20} required={i < 3} aria-label={`Set ${i}, jeux ${admin ? "du joueur" : "gagnés par vous"}`} defaultValue={i === 1 ? 6 : i === 2 ? 6 : undefined} style={{ textAlign: "center", fontSize: "var(--fs-xl)", fontWeight: 700 }} />
                <input className="input num" name={`s${i}b`} type="number" inputMode="numeric" min={0} max={20} required={i < 3} aria-label={`Set ${i}, jeux de l'adversaire`} defaultValue={i === 1 ? 4 : i === 2 ? 3 : undefined} style={{ textAlign: "center", fontSize: "var(--fs-xl)", fontWeight: 700 }} />
              </div>
            ))}
            {!thirdSet ? (
              <button className="btn btn-ghost" type="button" onClick={() => setThirdSet(true)}>
                <Icon name="plus" />
                Ajouter un 3e set / super tie-break
              </button>
            ) : null}
          </div>
        </fieldset>
      ) : null}

      {admin ? (
        <label className="check">
          <input type="checkbox" name="validateNow" defaultChecked /> Valider immédiatement
        </label>
      ) : null}

      <div className="preview-points mt-4" role="status" aria-live="polite">
        <div>
          <span className="stat-label">Points estimés</span>
          <span className="stat-value">{estimate ? `+${estimate.points}` : "—"}</span>
        </div>
        <div className="right small">
          {estimate ? (
            <>
              {estimate.isPerf ? <strong>Perf</strong> : estimate.rule === "walkover" ? "Forfait" : "Écart"} :{" "}
              {estimate.gap > 0 ? `+${estimate.gap}` : estimate.gap} échelon{Math.abs(estimate.gap) > 1 ? "s" : ""}
              <br />
              {me?.ranking} {result === "WIN" ? "bat" : "perd contre"} {oppRanking}
            </>
          ) : (
            "Choisissez l'adversaire"
          )}
        </div>
      </div>
      {!admin ? (
        <p className="small subtle mt-2">
          Le match sera <strong>validé par le club</strong> avant d&apos;être compté.
        </p>
      ) : null}
      <div className="sticky-cta">
        <SubmitButton className="btn btn-primary btn-block" pendingLabel="Envoi en cours…">
          {admin ? "Enregistrer le match" : "Envoyer le match"}
        </SubmitButton>
      </div>
    </form>
  );
}
