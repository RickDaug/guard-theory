"use client";

import { useId, useState } from "react";
import { Plate } from "@/components/notation/Plate";
import type { ConstructionPoint } from "@/content/products/types";

/**
 * The technical flat.
 *
 * Guard Theory's product imagery is drawn rather than photographed. That is a
 * design decision, not a placeholder: no garment has been made or shot yet, so
 * a render dressed up as a product photograph would be a claim we cannot
 * support. A production flat is what a factory is actually given, it is honest
 * about being a drawing, and it states construction instead of implying quality.
 *
 * When real photography exists it will sit alongside this, not replace it —
 * the flat is the part that says how the garment is built.
 *
 * Same vocabulary as every other plate on the site: a numbered callout, a
 * leader line, and a key underneath. The drawing is hidden from assistive tech
 * and the key carries the content.
 */

const W = 660;
const FIELD_H = 460;

/**
 * Outline of the front view, symmetric about x = 330.
 *
 * Curved rather than straight-edged throughout: a rash guard is a compression
 * garment, so the side seams taper through the waist and the sleeve undersides
 * curve into the armhole. Drawn with straight lines it reads as a boxy tee,
 * which is the wrong garment.
 */
const OUTLINE = [
  "M 378 98",
  "L 398 104",
  "C 440 150, 490 230, 518 292",
  "L 494 306",
  "C 470 250, 430 212, 404 176",
  "C 400 240, 392 300, 396 392",
  "L 264 392",
  "C 268 300, 260 240, 256 176",
  "C 230 212, 190 250, 166 306",
  "L 142 292",
  "C 170 230, 220 150, 262 104",
  "L 282 98",
  "C 292 112, 308 120, 330 120",
  "C 352 120, 368 112, 378 98",
  "Z",
].join(" ");

/** Where each callout's ring sits, and where its leader line starts. */
const CALLOUT_GEOMETRY: Record<
  string,
  { ring: [number, number]; from: [number, number] }
> = {
  "01": { ring: [330, 46], from: [330, 120] },
  "02": { ring: [596, 100], from: [392, 140] },
  "03": { ring: [596, 250], from: [504, 297] },
  "04": { ring: [596, 380], from: [394, 330] },
  "05": { ring: [64, 380], from: [272, 391] },
};

/** Pulls the leader back so it stops at the ring's edge rather than its centre. */
function leaderEnd(
  from: [number, number],
  ring: [number, number],
  radius: number,
): [number, number] {
  const dx = ring[0] - from[0];
  const dy = ring[1] - from[1];
  const length = Math.hypot(dx, dy) || 1;
  return [ring[0] - (dx / length) * radius, ring[1] - (dy / length) * radius];
}

export function GarmentFlat({
  points,
  title,
  reference,
}: {
  points: ConstructionPoint[];
  title: string;
  reference: string;
}) {
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const captionId = useId();

  const active = points.find((p) => p.code === activeCode);
  const RING_R = 15;

  return (
    <figure className="m-0">
      <Plate width={W} fieldHeight={FIELD_H} title={title} reference={reference}>
        {/* Garment outline */}
        <path
          d={OUTLINE}
          fill="var(--color-ink-raised)"
          stroke="var(--color-steel)"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Neck binding */}
        <path
          d="M 288 104 C 298 116, 312 127, 330 127 C 348 127, 362 116, 372 104"
          fill="none"
          stroke="var(--color-steel)"
          strokeWidth={1.5}
        />

        {/* Raglan seams, doubled to indicate flatlock */}
        <g fill="none" stroke="var(--color-steel-dim)" strokeWidth={1.25}>
          <path d="M 378 100 C 392 125, 400 150, 404 176" />
          <path d="M 373 102 C 387 127, 395 152, 399 178" />
          <path d="M 282 100 C 268 125, 260 150, 256 176" />
          <path d="M 287 102 C 273 127, 265 152, 261 178" />
          {/* Side seams */}
          <path d="M 399 178 C 395 242, 387 302, 391 390" />
          <path d="M 261 178 C 265 242, 273 302, 269 390" />
          {/* Cuffs */}
          <path d="M 511 276 L 487 290" />
          <path d="M 149 276 L 173 290" />
          {/* Hem */}
          <path d="M 268 378 L 392 378" />
        </g>

        {/* Callouts */}
        {points.map((point) => {
          const geometry = CALLOUT_GEOMETRY[point.code];
          if (!geometry) return null;

          const live = activeCode === point.code;
          const stroke = live ? "var(--color-signal)" : "var(--color-steel)";
          const end = leaderEnd(geometry.from, geometry.ring, RING_R);

          return (
            <g
              key={point.code}
              onMouseEnter={() => setActiveCode(point.code)}
              onMouseLeave={() => setActiveCode(null)}
              className="cursor-default"
            >
              <circle
                cx={geometry.ring[0]}
                cy={geometry.ring[1]}
                r={30}
                fill="transparent"
              />
              <line
                x1={geometry.from[0]}
                y1={geometry.from[1]}
                x2={end[0]}
                y2={end[1]}
                stroke={live ? "var(--color-signal)" : "var(--color-steel-dim)"}
                strokeWidth={1.25}
                className="transition-[stroke] duration-[140ms] ease-[var(--ease-control)]"
              />
              <circle
                cx={geometry.from[0]}
                cy={geometry.from[1]}
                r={2.5}
                fill={live ? "var(--color-signal)" : "var(--color-steel-dim)"}
                className="transition-[fill] duration-[140ms] ease-[var(--ease-control)]"
              />
              <circle
                cx={geometry.ring[0]}
                cy={geometry.ring[1]}
                r={RING_R}
                fill="var(--color-ink)"
                stroke={stroke}
                strokeWidth={live ? 2.5 : 1.25}
                className="transition-[stroke,stroke-width] duration-[140ms] ease-[var(--ease-control)]"
              />
              <text
                x={geometry.ring[0]}
                y={geometry.ring[1]}
                textAnchor="middle"
                dominantBaseline="central"
                className="notation text-[11px]"
                fill={stroke}
              >
                {point.code}
              </text>
            </g>
          );
        })}
      </Plate>

      <figcaption className="mt-8">
        <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-3 p-0">
          {points.map((point) => {
            const live = activeCode === point.code;
            return (
              <li key={point.code}>
                <button
                  type="button"
                  aria-describedby={captionId}
                  aria-pressed={live}
                  onMouseEnter={() => setActiveCode(point.code)}
                  onMouseLeave={() => setActiveCode(null)}
                  onFocus={() => setActiveCode(point.code)}
                  onBlur={() => setActiveCode(null)}
                  onClick={() => setActiveCode(live ? null : point.code)}
                  className={`notation inline-flex min-h-[24px] items-center text-xs transition-colors duration-[140ms] ease-[var(--ease-control)] ${
                    live ? "text-signal" : "text-steel hover:text-chalk"
                  }`}
                >
                  <span aria-hidden="true">{point.code}</span>{" "}
                  <span className="tracking-normal">{point.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <p
          id={captionId}
          aria-live="polite"
          className="mt-6 min-h-[4.5rem] max-w-[42rem] text-base text-steel"
        >
          {active ? (
            <>
              <span className="text-chalk">{active.label}.</span> {active.note}
            </>
          ) : (
            <>
              Front view, production flat. Hover or tab through the key to read
              each construction point.
            </>
          )}
        </p>
      </figcaption>
    </figure>
  );
}
