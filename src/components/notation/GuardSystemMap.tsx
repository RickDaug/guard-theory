"use client";

import { useId, useState } from "react";
import { Plate } from "./Plate";

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

/**
 * The adjacency, derived from EDGES rather than restated in prose.
 *
 * The edges ARE the argument of this figure — a plate titled "the guard, as a
 * system" whose relationships exist only in an aria-hidden drawing tells a
 * screen-reader user five isolated definitions and no system at all. Deriving
 * the text from the same array the lines are drawn from also means the key and
 * the drawing cannot drift apart.
 */
function connectionsFor(code: string): string[] {
  return EDGES.flatMap(([from, to]) => {
    if (from === code) return [byCode.get(to)?.name ?? []].flat();
    if (to === code) return [byCode.get(from)?.name ?? []].flat();
    return [];
  }).sort((a, b) => a.localeCompare(b));
}

/** "Butterfly guard, De la Riva and Half guard" */
function listSentence(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

const W = 660;
const FIELD_H = 422;

export function GuardSystemMap() {
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const captionId = useId();

  const active = activeCode ? byCode.get(activeCode) : undefined;

  return (
    <figure className="m-0">
      <Plate
        width={W}
        fieldHeight={FIELD_H}
        title="GUARD THEORY — THE GUARD, AS A SYSTEM"
        reference="FIG. 01 / REV A"
      >
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
                stroke={live ? "var(--color-signal-lift)" : "var(--color-steel-dim)"}
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
                stroke={live ? "var(--color-signal-lift)" : "var(--color-steel)"}
                strokeWidth={live ? 3 : 1.5}
                className="transition-[stroke,stroke-width] duration-[140ms] ease-[var(--ease-control)]"
              />
              <text
                x={family.x}
                y={family.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="notation text-[21px] sm:text-[15px] lg:text-[12px]"
                fill={live ? "var(--color-signal-lift)" : "var(--color-steel)"}
              >
                {family.code}
              </text>
            </g>
          );
        })}

      </Plate>

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
                  className={`notation inline-flex min-h-[24px] items-center gap-x-1.5 text-xs transition-colors duration-[140ms] ease-[var(--ease-control)] ${
                    live ? "text-signal-lift" : "text-steel hover:text-chalk"
                  }`}
                >
                  <span aria-hidden="true">{family.code}</span>
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
              {/* This is a paragraph, not a flex container, so the explicit
                  space is load-bearing. Do not remove it. */}
              <span className="text-chalk">{active.name}.</span>{" "}
              {active.definition}{" "}
              <span className="text-chalk">
                Connects to {listSentence(connectionsFor(active.code))}.
              </span>
            </>
          ) : (
            <>
              Five families, one structure. Hover or tab through the key to read
              what each one is and which others it connects to.
            </>
          )}
        </p>
      </figcaption>
    </figure>
  );
}
