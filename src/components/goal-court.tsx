import type { CSSProperties } from "react";

/**
 * Spec 005 — variante « L'échange » : la balle traverse un court en terre battue vu de dessus.
 * Les lignes servent de paliers : service (25 %), filet (50 %), service adverse (75 %), fond de court (100 %).
 * Une balle en pointillés indique la position une fois les matchs en attente validés.
 */
const X0 = 14;
const L = 292;
const Y = 52;
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
  const traj = `M${X0} ${Y}` + Array.from({ length: bounces }, () => ` q${seg / 2} -30 ${seg} 0`).join("");

  return (
    <svg
      className="goal-court"
      viewBox="0 0 320 112"
      role="progressbar"
      aria-label="Progression vers l'objectif de matchs"
      aria-valuemin={0}
      aria-valuemax={target}
      aria-valuenow={Math.min(played, target)}
      aria-valuetext={`${played} matchs sur ${target}`}
    >
      <rect className="gc-court" x={X0} y={14} width={L} height={76} rx={3} />
      <rect className="gc-line" x={X0} y={14} width={L} height={76} />
      <line className="gc-line" x1={X0} y1={23} x2={X0 + L} y2={23} />
      <line className="gc-line" x1={X0} y1={81} x2={X0 + L} y2={81} />
      <line className="gc-line" x1={X0 + L * 0.25} y1={23} x2={X0 + L * 0.25} y2={81} />
      <line className="gc-line" x1={X0 + L * 0.75} y1={23} x2={X0 + L * 0.75} y2={81} />
      <line className="gc-line" x1={X0 + L * 0.25} y1={Y} x2={X0 + L * 0.75} y2={Y} />
      <line className="gc-net" x1={X0 + L / 2} y1={8} x2={X0 + L / 2} y2={96} />
      <circle className="gc-post" cx={X0 + L / 2} cy={8} r={2.5} />
      <circle className="gc-post" cx={X0 + L / 2} cy={96} r={2.5} />
      {played > 0 ? <path className="gc-traj" d={traj} /> : null}
      {pending > 0 && q > p ? <circle className="gc-ghost" cx={gx} cy={Y} r={10} /> : null}
      <g className="gc-roll" style={{ "--gc-from": `${X0 - bx}px` } as CSSProperties}>
        <Ball cx={bx} r={11} />
      </g>
      {played > target ? (
        <text className="gc-bonus" x={bx - 14} y={34} textAnchor="end">
          +{played - target}
        </text>
      ) : null}
      {MARKS.map(([at, label]) => (
        <text
          key={at}
          className={`gc-mark${p >= at ? " is-on" : ""}`}
          x={X0 + L * at + (at === 0 ? -4 : at === 1 ? 4 : 0)}
          y={110}
          textAnchor={at === 0 ? "start" : at === 1 ? "end" : "middle"}
        >
          {label}
        </text>
      ))}
    </svg>
  );
}
