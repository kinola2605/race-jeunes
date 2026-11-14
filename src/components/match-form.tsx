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
  /** noms de tournoi déjà utilisés dans la saison (FR-600) */
  tournaments: string[];
  players: { id: string; pseudo: string; ranking: string }[];
}

const KINDS = [
  ["NORMAL", "Match joué"],
  ["RETIREMENT", "Abandon"],
  ["WALKOVER", "Forfait"],
] as const;

/**
 * Jeux d'un set : saisie au clavier ou aux boutons − / + (spec 010, FR-1009).
 * Aucune valeur par défaut : un score n'est jamais envoyé sans avoir été saisi.
 */
function ScoreStepper({ name, label, required }: { name: string; label: string; required: boolean }) {
  const [value, setValue] = useState("");
  const bump = (delta: number) =>
    setValue((cur) => (cur === "" ? (delta > 0 ? "6" : "0") : String(Math.min(20, Math.max(0, Number(cur) + delta)))));
  return (
    <div className="stepper">
      <button type="button" aria-label={`${label} : un jeu de moins`} onClick={() => bump(-1)}>
        −
      </button>
      <input name={name} type="number" inputMode="numeric" min={0} max={20} required={required} aria-label={label} placeholder="–" value={value} onChange={(e) => setValue(e.target.value)} />
      <button type="button" aria-label={`${label} : un jeu de plus`} onClick={() => bump(1)}>
        +
      </button>
    </div>
  );
}

/** E12a — saisie de match en bord de court (FR-100 à FR-102) ; déroulé en trois étapes : spec 010. */
export function MatchForm({ seasons, meId, admin, today }: { seasons: MatchFormSeason[]; meId: string | null; admin: boolean; today: string }) {
  const [seasonId, setSeasonId] = useState(seasons[0]?.id ?? "");
  const season = seasons.find((s) => s.id === seasonId) ?? seasons[0];
  const [playerAId, setPlayerAId] = useState(admin ? "" : (meId ?? ""));
  const [type, setType] = useState<"club" | "external">("club");
  const [opponentId, setOpponentId] = useState("");
  const [pickerOpen, setPickerOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [extRanking, setExtRanking] = useState("NC");
  const [result, setResult] = useState<"WIN" | "LOSS">("WIN");
  const [kind, setKind] = useState<"NORMAL" | "WALKOVER" | "RETIREMENT">("NORMAL");
  const [thirdSet, setThirdSet] = useState(false);
  const [inTournament, setInTournament] = useState(false);

  const players = season?.players ?? [];
  const me = players.find((p) => p.id === playerAId);
  const opponents = players.filter((p) => p.id !== playerAId && p.pseudo.toLowerCase().includes(query.trim().toLowerCase()));
  const opp = players.find((p) => p.id === opponentId && p.id !== playerAId);
  const oppRanking = type === "club" ? opp?.ranking : extRanking;
  const isPerfAgainst = (ranking: string) => Boolean(me && isRanking(ranking) && isRanking(me.ranking) && LADDER.indexOf(ranking) > LADDER.indexOf(me.ranking));
  // la liste reste dans la page (le choix est envoyé par son bouton radio) ; elle est seulement repliée
  const collapsed = type === "club" && Boolean(opp) && !pickerOpen;

  const estimate = useMemo(() => {
    if (!season?.rules || !me || !oppRanking || !isRanking(me.ranking) || !isRanking(oppRanking)) return null;
    return computeMatchPoints(season.rules, { playerRanking: me.ranking, opponentRanking: oppRanking, result, kind });
  }, [season, me, oppRanking, result, kind]);

  if (!season) return null;
  const sideA = admin ? "Joueur" : "Vous";
  const sideB = type === "club" && opp ? opp.pseudo : "Adversaire";
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

      <fieldset>
        <legend className="step-legend">
          <span className="step-num" aria-hidden="true">
            1
          </span>
          Adversaire et date
        </legend>
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
            {collapsed && opp ? (
              <div className="picked">
                <div className="item-main">
                  <div className="item-title">
                    {opp.pseudo}
                    {isPerfAgainst(opp.ranking) ? (
                      <span className="badge badge-perf">
                        <Icon name="perf" />
                        Perf possible
                      </span>
                    ) : null}
                  </div>
                  <div className="item-meta">{opp.ranking} · joueur du club</div>
                </div>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => setPickerOpen(true)}>
                  <Icon name="edit" />
                  Modifier
                </button>
              </div>
            ) : null}
            <div className="search" hidden={collapsed}>
              <label htmlFor="adv" className="sr-only">
                Rechercher un engagé
              </label>
              <Icon name="search" />
              <input className="input" id="adv" type="search" placeholder="Rechercher un pseudo" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
            </div>
            <div className="list mt-2" role="radiogroup" aria-label="Adversaire" hidden={collapsed}>
              {opponents.length === 0 ? <p className="small subtle">Aucun engagé ne correspond.</p> : null}
              {opponents.map((p) => (
                <label key={p.id} className="item" style={{ minHeight: "var(--touch-court)", cursor: "pointer", borderBottom: "1px solid var(--line-soft)" }}>
                  <input
                    type="radio"
                    name="opponentId"
                    value={p.id}
                    checked={opponentId === p.id}
                    onChange={() => {
                      setOpponentId(p.id);
                      setPickerOpen(false);
                    }}
                    style={{ width: 22, height: 22, accentColor: "var(--accent)" }}
                  />
                  <div className="item-main">
                    <div className="item-title">{p.pseudo}</div>
                    <div className="item-meta">{p.ranking}</div>
                  </div>
                  {isPerfAgainst(p.ranking) ? (
                    <span className="badge badge-perf">
                      <Icon name="perf" />
                      Perf possible
                    </span>
                  ) : null}
                </label>
              ))}
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
        <div className="field mt-4 mb-0">
          <label htmlFor="playedOn">Date du match</label>
          <input className="input" id="playedOn" name="playedOn" type="date" defaultValue={today} max={today} required />
        </div>
      </fieldset>

      <fieldset>
        <legend className="step-legend">
          <span className="step-num" aria-hidden="true">
            2
          </span>
          Résultat {admin ? "du joueur" : ""}
        </legend>
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

        <div className="radio-seg mt-4" role="radiogroup" aria-label="Type de match">
          {KINDS.map(([value, label]) => (
            <label key={value}>
              <input className="sr-only" type="radio" name="kind" value={value} checked={kind === value} onChange={() => setKind(value)} />
              {label}
            </label>
          ))}
        </div>
        <p className="hint mt-2">
          {kind === "NORMAL" ? "Le match est allé à son terme." : kind === "RETIREMENT" ? "Abandon en cours de match : indiquez le score au moment de l'arrêt." : "Forfait : le match n'a pas été joué, aucun score à saisir."}
        </p>

        <div className="field mt-4 mb-0">
          <label className="check">
            <input type="checkbox" name="inTournament" checked={inTournament} onChange={(e) => setInTournament(e.target.checked)} /> Match joué en tournoi
          </label>
          {inTournament ? (
            <>
              <label htmlFor="tournament" className="mt-2">
                Nom du tournoi
              </label>
              <input
                className="input"
                id="tournament"
                name="tournament"
                list="tournaments"
                placeholder="ex. TMC de Pâques 2027"
                minLength={2}
                maxLength={80}
                required
                autoComplete="off"
                aria-describedby="tournament-hint tournament-pii"
              />
              <datalist id="tournaments">
                {season.tournaments.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
              <p className="hint" id="tournament-hint">
                {season.rules?.tournament
                  ? `Bonus : à partir de ${season.rules.tournament.fromWins} victoires dans le même tournoi, +${season.rules.tournament.points} pts par victoire.`
                  : "Reprenez le nom déjà utilisé par les autres joueurs du tournoi."}
              </p>
              <PiiNotice id="tournament-pii" />
            </>
          ) : null}
        </div>
      </fieldset>

      {kind !== "WALKOVER" ? (
        <fieldset>
          <legend className="step-legend">
            <span className="step-num" aria-hidden="true">
              3
            </span>
            Score <span className="subtle small">(jeux par set)</span>
          </legend>
          <div className="sets">
            <div className="set-row" aria-hidden="true">
              <span />
              <span className="set-head">{sideA}</span>
              <span className="set-head">{sideB}</span>
            </div>
            {[1, 2, ...(thirdSet ? [3] : [])].map((i) => (
              <div className="set-row" key={i}>
                <span className="strong">{i === 3 ? "Set 3 / STB" : `Set ${i}`}</span>
                <ScoreStepper name={`s${i}a`} required={i < 3} label={`Set ${i}, jeux ${admin ? "du joueur" : "gagnés par vous"}`} />
                <ScoreStepper name={`s${i}b`} required={i < 3} label={`Set ${i}, jeux de l'adversaire`} />
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
      ) : (
        <p className="small subtle">
          Le match sera <strong>validé par le club</strong> avant d&apos;être compté.
        </p>
      )}

      {/* l'estimation reste visible à côté du bouton pendant toute la saisie */}
      <div className="sticky-cta">
        <div className="send-bar">
          <div className="send-est" role="status" aria-live="polite">
            <span className="stat-label">Points estimés</span>
            <span className="stat-value">{estimate ? `+${estimate.points}` : "—"}</span>
            <span className="small subtle">
              {estimate ? (
                <>
                  {estimate.isPerf ? <strong>Perf</strong> : estimate.rule === "walkover" ? "Forfait" : "Écart"} : {estimate.gap > 0 ? `+${estimate.gap}` : estimate.gap} échelon
                  {Math.abs(estimate.gap) > 1 ? "s" : ""} · {me?.ranking} {result === "WIN" ? "bat" : "perd contre"} {oppRanking}
                </>
              ) : (
                "Choisissez l'adversaire"
              )}
            </span>
          </div>
          <SubmitButton className="btn btn-primary" pendingLabel="Envoi…">
            {admin ? "Enregistrer le match" : "Envoyer le match"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
