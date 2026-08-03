"use client";

import { useId, useState } from "react";

/**
 * Fig. 01 — the guard as a system.
 *
 * This is the site's signature element and the brand's argument in one drawing:
 * the guard is not a list of positions but a connected structure you move
 * through. Every other plate on the site inherits this vocabulary — a ring for
 * a position, a line for a transition, a numbered callout keyed to a legend,
 * and a title block naming what the plate is.
 *
 * The plate chrome (frame, field grid, registration marks, title block) is not
 * decoration. It is what makes the drawing read as a document rather than a
 * chart, which is the whole premise of the brand.
 *
 * The numbers are callout references, not a sequence. Nothing here implies that
 * 01 comes before 05; they exist so the key beneath can point at the drawing.
 *
 * Accessibility: the drawing is decorative and hidden from assistive tech. The
 * key below is the real content and the real control — buttons, in the tab
 * order, each describing one family. Pointer users get the same behaviour by
 * hovering the drawing itself.
 *
 * Definitions are deliberately definitional rather than instructional. This is
 * a diagram of how the families relate, not coaching, and it makes no claim
 * about which is better or what beats what.
 */

type Family = {
  code: string;
  name: string;
  x: number;
  y: number;
  definition: string;
};

const FAMILIES: Family[] = [
  {
    code: "01",
    name: "Closed guard",
    x: 132,
    y: 92,
    definition:
      "Legs locked behind the opponent's back. The lock itself is the connection, so control persists without grips.",
  },
  {
    code: "02",
    name: "Open guard",
    x: 330,
    y: 212,
    definition:
      "Legs unlocked. Control is rebuilt continuously from grips, frames and angle rather than held by a single lock.",
  },
  {
    code: "03",
    name: "Half guard",
    x: 132,
    y: 332,
    definition:
      "One of the opponent's legs trapped between your own. A guard and a recovery position at the same time.",
  },
  {
    code: "04",
    name: "Butterfly guard",
    x: 530,
    y: 104,
    definition:
      "Seated, both shins hooked inside the opponent's thighs. The hooks carry weight rather than merely holding position.",
  },
  {
    code: "05",
    name: "De la Riva",
    x: 530,
    y: 320,
    definition:
      "An open guard defined by an outside hook behind the opponent's lead leg, with the far leg framing.",
  },
];

/** Which families are structurally adjacent — you can arrive at one from the other. */
const EDGES: ReadonlyArray<readonly [string, string]> = [
  ["01", "02"],
  ["03", "02"],
  ["02", "04"],
  ["02", "05"],
  ["01", "03"],
];

const byCode = new Map(FAMILIES.map((f) => [f.code, f]));

const W = 660;
const H = 460;
/** Height of the title block strip along the bottom of the frame. */
const BLOCK = 38;
const FIELD_H = H - BLOCK;

/** Registration mark — the corner crosses on a drawn plate. */
function Registration({ x, y }: { x: number; y: number }) {
  return (
    <g stroke="var(--color-steel-dim)" strokeWidth={1}>
      <line x1={x - 5} y1={y} x2={x + 5} y2={y} />
      <line x1={x} y1={y - 5} x2={x} y2={y + 5} />
    </g>
  );
}

export function GuardSystemMap() {
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const captionId = useId();
  const gridId = useId();

  const active = activeCode ? byCode.get(activeCode) : undefined;

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden="true">
        <defs>
          <pattern
            id={gridId}
            width={30}
            height={30}
            patternUnits="userSpaceOnUse"
          >
            <circle cx={0.75} cy={0.75} r={0.75} fill="var(--color-steel-dim)" />
          </pattern>
        </defs>

        {/* Field: the drawing area, dotted like graph paper */}
        <rect
          x={0.5}
          y={0.5}
          width={W - 1}
          height={FIELD_H}
          fill={`url(#${gridId})`}
          stroke="var(--color-steel-dim)"
          strokeWidth={1}
        />

        <Registration x={16} y={16} />
        <Registration x={W - 16} y={16} />
        <Registration x={16} y={FIELD_H - 16} />
        <Registration x={W - 16} y={FIELD_H - 16} />

        {/* Transitions. Drawn before the rings so the rings sit on top. */}
        <g strokeWidth={2}>
          {EDGES.map(([from, to]) => {
            const a = byCode.get(from);
            const b = byCode.get(to);
            if (!a || !b) return null;
            const live = activeCode === from || activeCode === to;
            return (
              <line
                key={`${from}-${to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={live ? "var(--color-signal)" : "var(--color-steel-dim)"}
                className="transition-[stroke] duration-[140ms] ease-[var(--ease-control)]"
              />
            );
          })}
        </g>

        {/* Positions. A ring, echoing the monogram's G. */}
        {FAMILIES.map((family) => {
          const live = activeCode === family.code;
          return (
            <g
              key={family.code}
              onMouseEnter={() => setActiveCode(family.code)}
              onMouseLeave={() => setActiveCode(null)}
              className="cursor-default"
            >
              {/* Generous invisible hit area — the ring alone is a small target. */}
              <circle cx={family.x} cy={family.y} r={40} fill="transparent" />
              <circle
                cx={family.x}
                cy={family.y}
                r={26}
                fill="var(--color-ink)"
                stroke={live ? "var(--color-signal)" : "var(--color-steel)"}
                strokeWidth={live ? 3 : 1.5}
                className="transition-[stroke,stroke-width] duration-[140ms] ease-[var(--ease-control)]"
              />
              <text
                x={family.x}
                y={family.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="notation"
                fontSize={12}
                fill={live ? "var(--color-signal)" : "var(--color-steel)"}
              >
                {family.code}
              </text>
            </g>
          );
        })}

        {/* Title block — what the plate is, stated on the plate itself. */}
        <g>
          <rect
            x={0.5}
            y={FIELD_H + 0.5}
            width={W - 1}
            height={BLOCK - 1}
            fill="none"
            stroke="var(--color-steel-dim)"
            strokeWidth={1}
          />
          <line
            x1={W - 132}
            y1={FIELD_H}
            x2={W - 132}
            y2={H - 0.5}
            stroke="var(--color-steel-dim)"
            strokeWidth={1}
          />
          <text
            x={16}
            y={FIELD_H + BLOCK / 2}
            dominantBaseline="central"
            className="notation"
            fontSize={10}
            fill="var(--color-steel)"
          >
            GUARD THEORY — THE GUARD, AS A SYSTEM
          </text>
          <text
            x={W - 116}
            y={FIELD_H + BLOCK / 2}
            dominantBaseline="central"
            className="notation"
            fontSize={10}
            fill="var(--color-steel-dim)"
          >
            FIG. 01 / REV A
          </text>
        </g>
      </svg>

      <figcaption className="mt-8">
        {/* The key. Real content, real controls, in the tab order. */}
        <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-3 p-0">
          {FAMILIES.map((family) => {
            const live = activeCode === family.code;
            return (
              <li key={family.code}>
                <button
                  type="button"
                  aria-describedby={captionId}
                  aria-pressed={live}
                  onMouseEnter={() => setActiveCode(family.code)}
                  onMouseLeave={() => setActiveCode(null)}
                  onFocus={() => setActiveCode(family.code)}
                  onBlur={() => setActiveCode(null)}
                  onClick={() => setActiveCode(live ? null : family.code)}
                  className={`notation text-xs transition-colors duration-[140ms] ease-[var(--ease-control)] ${
                    live ? "text-signal" : "text-steel hover:text-chalk"
                  }`}
                >
                  <span aria-hidden="true">{family.code}</span>{" "}
                  <span className="tracking-normal">{family.name}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Reserved slot: the definition swaps in without moving anything below. */}
        <p
          id={captionId}
          aria-live="polite"
          className="mt-6 min-h-[5rem] max-w-[44rem] text-base text-steel"
        >
          {active ? (
            <>
              <span className="text-chalk">{active.name}.</span>{" "}
              {active.definition}
            </>
          ) : (
            <>
              Five families, one structure. Hover or tab through the key to read
              how each relates to the others.
            </>
          )}
        </p>
      </figcaption>
    </figure>
  );
}
