import Link from "next/link";
import { INDICATORS, percentOf, type MentalProfile } from "@/mental/profile";

export interface MentalSeason {
  slug: string;
  title: string;
  player: MentalProfile;
  group: MentalProfile;
}

const pct = (n: number | null) => (n === null ? "—" : `${n} %`);

/**
 * Spec 012 — profil mental d'un joueur. `seasons` : de la plus récente à la plus ancienne ; `current` : saison
 * détaillée. Chaque valeur est écrite en toutes lettres (FR-1209) : la jauge n'est qu'un rappel visuel.
 */
export function MentalProfileCard({ seasons, current, hrefFor }: { seasons: MentalSeason[]; current: MentalSeason; hrefFor: (slug: string) => string }) {
  const { player, group } = current;
  const history = [...seasons].reverse();
  const plural = player.matches > 1 ? "s" : "";
  return (
    <>
      {seasons.length > 1 ? (
        <nav className="chips mb-4" aria-label="Saison du profil mental">
          {seasons.map((s) => (
            <Link key={s.slug} className="chip" href={hrefFor(s.slug)} aria-current={s.slug === current.slug ? "true" : undefined} scroll={false}>
              {s.title}
            </Link>
          ))}
        </nav>
      ) : null}
      <p className="small muted">
        {player.matches === 0
          ? "Aucun match validé dans cette saison (hors forfaits)."
          : `Calculé sur ${player.matches} match${plural} validé${plural} de la saison, hors forfaits.`}
      </p>
      <ul className="mental" aria-label={`Indicateurs, ${current.title}`}>
        {INDICATORS.map((ind) => {
          const mine = player[ind.key];
          const mineP = percentOf(mine);
          const groupP = percentOf(group[ind.key]);
          return (
            <li key={ind.key}>
              <div className="mental-head">
                <span className="strong">{ind.label}</span>
                <span className="mental-value">{pct(mineP)}</span>
              </div>
              <div className="gauge" aria-hidden="true">
                <span style={{ width: `${mineP ?? 0}%` }} />
                {groupP !== null ? <i style={{ left: `${groupP}%` }} /> : null}
              </div>
              <div className="mental-head small">
                <span>
                  {mine.total === 0 ? (
                    <span className="subtle">Situation non rencontrée</span>
                  ) : (
                    `${mine.count} ${ind.countLabel(mine.count)} sur ${mine.total} ${ind.totalLabel(mine.total)}`
                  )}
                  {ind.lowerIsBetter ? <span className="subtle"> · moins, c’est mieux</span> : null}
                </span>
                <span className="subtle mental-group">Groupe {pct(groupP)}</span>
              </div>
            </li>
          );
        })}
      </ul>
      {history.length > 1 ? (
        <>
          <h3 className="case-title mt-6">D&apos;une saison à l&apos;autre</h3>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Indicateur</th>
                  {history.map((s) => (
                    <th key={s.slug} scope="col" className="num">
                      {s.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INDICATORS.map((ind) => (
                  <tr key={ind.key}>
                    <th scope="row" className="mental-th">
                      {ind.label}
                    </th>
                    {history.map((s) => {
                      const r = s.player[ind.key];
                      return (
                        <td key={s.slug} className="num" style={{ whiteSpace: "nowrap" }}>
                          {r.total === 0 ? (
                            <span className="subtle">—</span>
                          ) : (
                            <>
                              <strong>{pct(percentOf(r))}</strong>{" "}
                              <span className="subtle">
                                {r.count}/{r.total}
                              </span>
                            </>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
      <p className="hint mt-4 mb-0">
        Groupe : tous les engagés de la saison (trait sur la jauge). Avec peu de situations, un pourcentage varie vite : lisez-le avec le nombre
        indiqué. Sets décisifs et retours ne comptent pas les abandons.
      </p>
    </>
  );
}
