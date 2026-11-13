import type { CSSProperties } from "react";

/**
 * Spec 005 — variante « L'échange » : la balle traverse un court en terre battue vu de dessus.
 * Les lignes servent de paliers : service (25 %), filet (50 %), service adverse (75 %), fond de court (100 %).
 * Une balle en pointillés indique la position une fois les matchs en attente validés.
 */
const X0 = 14;
const L = 292;
// court aplati (bande) pour rester compact sur téléphone : ~65 px de haut à 375 px de large
const TOP = 8;
const H = 40;
const Y = TOP + H / 2;
const R = 8;
const MARKS: [number, string][] = [
  [0, "Départ"],
  [0.25, "Service"],
  [0.5, "Filet"],
  [0.75, "Service"],
  [1, "Point !"],
];

function Ball({ cx, r }: { cx: number; r: number }) {
  return (
    <>
      <circle className="gc-ball" cx={cx} cy={Y} r={r} />
      <path className="gc-seam" d={`M${cx - r * 0.75} ${Y - r * 0.6} q${r * 0.75} ${r * 0.6} 0 ${r * 1.2}`} />
      <path className="gc-seam" d={`M${cx + r * 0.75} ${Y - r * 0.6} q${-r * 0.75} ${r * 0.6} 0 ${r * 1.2}`} />
    </>
  );
}

export function GoalCourt({ played, pending, target }: { played: number; pending: number; target: number }) {
  const p = Math.min(played / target, 1);
  const q = Math.min((played + pending) / target, 1);
  const bx = X0 + L * p;
  const gx = X0 + L * q;
  const bounces = Math.max(1, Math.round(p * 4));
  const seg = (bx - X0) / bounces;
  const traj = `M${X0} ${Y}` + Array.from({ length: bounces }, () => ` q${seg / 2} -16 ${seg} 0`).join("");

  return (
    <svg
      className="goal-court"
      viewBox="0 0 320 68"
      role="progressbar"
      aria-label="Progression vers l'objectif de matchs"
      aria-valuemin={0}
      aria-valuemax={target}
      aria-valuenow={Math.min(played, target)}
      aria-valuetext={`${played} matchs sur ${target}`}
    >
      <rect className="gc-court" x={X0} y={TOP} width={L} height={H} rx={2} />
      <rect className="gc-line" x={X0} y={TOP} width={L} height={H} />
      <line className="gc-line" x1={X0} y1={TOP + 5} x2={X0 + L} y2={TOP + 5} />
      <line className="gc-line" x1={X0} y1={TOP + H - 5} x2={X0 + L} y2={TOP + H - 5} />
      <line className="gc-line" x1={X0 + L * 0.25} y1={TOP + 5} x2={X0 + L * 0.25} y2={TOP + H - 5} />
      <line className="gc-line" x1={X0 + L * 0.75} y1={TOP + 5} x2={X0 + L * 0.75} y2={TOP + H - 5} />
      <line className="gc-line" x1={X0 + L * 0.25} y1={Y} x2={X0 + L * 0.75} y2={Y} />
      <line className="gc-net" x1={X0 + L / 2} y1={TOP - 4} x2={X0 + L / 2} y2={TOP + H + 4} />
      <circle className="gc-post" cx={X0 + L / 2} cy={TOP - 4} r={2} />
      <circle className="gc-post" cx={X0 + L / 2} cy={TOP + H + 4} r={2} />
      {played > 0 ? <path className="gc-traj" d={traj} /> : null}
      {pending > 0 && q > p ? <circle className="gc-ghost" cx={gx} cy={Y} r={R - 0.5} /> : null}
      <g className="gc-roll" style={{ "--gc-from": `${X0 - bx}px` } as CSSProperties}>
        <Ball cx={bx} r={R} />
      </g>
      {played > target ? (
        <text className="gc-bonus" x={bx - R - 3} y={TOP + 6} textAnchor="end">
          +{played - target}
        </text>
      ) : null}
      {MARKS.map(([at, label]) => (
        <text
          key={at}
          className={`gc-mark${p >= at ? " is-on" : ""}`}
          x={X0 + L * at + (at === 0 ? -4 : at === 1 ? 4 : 0)}
          y={66}
          textAnchor={at === 0 ? "start" : at === 1 ? "end" : "middle"}
        >
          {label}
        </text>
      ))}
    </svg>
  );
}
