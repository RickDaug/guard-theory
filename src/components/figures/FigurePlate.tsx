import { Plate } from "@/components/notation/Plate";

/**
 * A figure plate.
 *
 * The first attempt at this was a drawn bust. It failed: without a likeness
 * there is nothing to individualise a face, so ten figures rendered as ten
 * near-identical blank ovals — which reads as a missing image rather than a
 * portrait.
 *
 * What actually distinguishes these people is who they learned from and who
 * they taught. So the plate draws the lineage instead, in exactly the notation
 * the guard system map uses: a ring for a person, a line for transmission. It
 * is the same argument the brand makes about the guard, applied to the art
 * itself — the interesting thing is the structure, not the individual.
 *
 * Nothing here is invented. A strand only appears when it is documented in the
 * figure's sources, and where a lineage is contested the entry says so.
 */

export type LineageStrand = {
  /** Who transmitted to them. Documented only. */
  from: string[];
  /** Who they transmitted to. Documented only, and not exhaustive. */
  to: string[];
};

const W = 660;
const FIELD_H = 400;

const CENTRE_X = 330;
const CENTRE_Y = 200;

/** Vertical stack positions for up to three nodes in a column. */
function columnPositions(count: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [CENTRE_Y];
  if (count === 2) return [CENTRE_Y - 76, CENTRE_Y + 76];
  return [CENTRE_Y - 108, CENTRE_Y, CENTRE_Y + 108];
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function FigurePlate({
  name,
  lifespan,
  lineage,
  reference,
}: {
  name: string;
  lifespan?: string;
  lineage: LineageStrand;
  reference: string;
}) {
  const fromY = columnPositions(lineage.from.length);
  const toY = columnPositions(lineage.to.length);
  const FROM_X = 110;
  const TO_X = 550;

  return (
    <figure className="m-0">
      <Plate
        width={W}
        fieldHeight={FIELD_H}
        title={`GUARD THEORY — ${name.toUpperCase()}${lifespan ? `, ${lifespan}` : ""}`}
        reference={reference}
      >
        {/* Transmission lines, drawn under the rings as on every other plate. */}
        <g stroke="var(--color-steel-dim)" strokeWidth={2}>
          {fromY.map((y, i) => (
            <line
              key={`from-${i}`}
              x1={FROM_X + 34}
              y1={y}
              x2={CENTRE_X - 54}
              y2={CENTRE_Y}
            />
          ))}
          {toY.map((y, i) => (
            <line
              key={`to-${i}`}
              x1={CENTRE_X + 54}
              y1={CENTRE_Y}
              x2={TO_X - 34}
              y2={y}
            />
          ))}
        </g>

        {/* Predecessors */}
        {lineage.from.map((person, i) => (
          <g key={`f-${person}`}>
            <circle
              cx={FROM_X}
              cy={fromY[i]}
              r={30}
              fill="var(--color-ink)"
              stroke="var(--color-steel)"
              strokeWidth={1.5}
            />
            <text
              x={FROM_X}
              y={fromY[i]}
              textAnchor="middle"
              dominantBaseline="central"
              className="notation text-[19px] sm:text-[14px] lg:text-[12px]"
              fill="var(--color-steel)"
            >
              {initials(person)}
            </text>
          </g>
        ))}

        {/* The subject, in the accent — the one live node on the plate. */}
        <circle
          cx={CENTRE_X}
          cy={CENTRE_Y}
          r={54}
          fill="var(--color-ink)"
          stroke="var(--color-signal)"
          strokeWidth={3}
        />
        <text
          x={CENTRE_X}
          y={CENTRE_Y}
          textAnchor="middle"
          dominantBaseline="central"
          className="wordmark text-[40px] sm:text-[30px] lg:text-[26px]"
          fill="var(--color-signal)"
        >
          {initials(name)}
        </text>

        {/* Successors */}
        {lineage.to.map((person, i) => (
          <g key={`t-${person}`}>
            <circle
              cx={TO_X}
              cy={toY[i]}
              r={30}
              fill="var(--color-ink)"
              stroke="var(--color-steel)"
              strokeWidth={1.5}
            />
            <text
              x={TO_X}
              y={toY[i]}
              textAnchor="middle"
              dominantBaseline="central"
              className="notation text-[19px] sm:text-[14px] lg:text-[12px]"
              fill="var(--color-steel)"
            >
              {initials(person)}
            </text>
          </g>
        ))}
      </Plate>

      {/* The key. The drawing is aria-hidden, so this carries the content. */}
      <figcaption className="mt-8 flex flex-col gap-4">
        {lineage.from.length > 0 ? (
          <p className="text-base text-steel">
            <span className="notation text-2xs text-signal">Learned from</span>{" "}
            <span className="text-chalk">{lineage.from.join(" · ")}</span>
          </p>
        ) : null}
        {lineage.to.length > 0 ? (
          <p className="text-base text-steel">
            <span className="notation text-2xs text-signal">Transmitted to</span>{" "}
            <span className="text-chalk">{lineage.to.join(" · ")}</span>
          </p>
        ) : null}
      </figcaption>
    </figure>
  );
}
