import type { ReactNode } from "react";

/**
 * The plate: the frame every Guard Theory Notation drawing sits in.
 *
 * Field, registration marks and title block are the constant. Only the drawing
 * inside changes. Sharing this shell is what makes a technique diagram, a
 * garment flat and the guard system map read as pages from one document rather
 * than as unrelated graphics.
 *
 * The drawing area is `width × fieldHeight` in the plate's own coordinates;
 * children are drawn in that space with (0,0) at the field's top-left.
 */

export const PLATE_BLOCK_HEIGHT = 38;

type PlateProps = {
  /** Plate coordinate width. Children are positioned within it. */
  width: number;
  /** Height of the drawing field, excluding the title block. */
  fieldHeight: number;
  /** Left side of the title block — what the drawing is. */
  title: string;
  /** Right side of the title block — the reference. */
  reference: string;
  /** Drawn in field coordinates. */
  children: ReactNode;
  className?: string;
};

function Registration({ x, y }: { x: number; y: number }) {
  return (
    <g stroke="var(--color-steel-dim)" strokeWidth={1}>
      <line x1={x - 5} y1={y} x2={x + 5} y2={y} />
      <line x1={x} y1={y - 5} x2={x} y2={y + 5} />
    </g>
  );
}

/** "GUARD THEORY — THEORY 01, LONG SLEEVE" → "GUARD THEORY" */
function narrowTitle(title: string): string {
  return title.split("—")[0]?.trim() || title;
}

/** "FIG. 02 / REV A" → "FIG. 02" */
function narrowReference(reference: string): string {
  return reference.split("/")[0]?.trim() || reference;
}

export function Plate({
  width,
  fieldHeight,
  title,
  reference,
  children,
  className = "",
}: PlateProps) {
  const height = fieldHeight + PLATE_BLOCK_HEIGHT;
  const gridId = `plate-grid-${width}-${fieldHeight}`;
  const shortTitle = narrowTitle(title);
  const shortReference = narrowReference(reference);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full ${className}`}
      aria-hidden="true"
    >
      <defs>
        <pattern id={gridId} width={30} height={30} patternUnits="userSpaceOnUse">
          <circle cx={0.75} cy={0.75} r={0.75} fill="var(--color-steel-dim)" />
        </pattern>
      </defs>

      <rect
        x={0.5}
        y={0.5}
        width={width - 1}
        height={fieldHeight}
        fill={`url(#${gridId})`}
        stroke="var(--color-steel-dim)"
        strokeWidth={1}
      />

      <Registration x={16} y={16} />
      <Registration x={width - 16} y={16} />
      <Registration x={16} y={fieldHeight - 16} />
      <Registration x={width - 16} y={fieldHeight - 16} />

      {children}

      <g>
        <rect
          x={0.5}
          y={fieldHeight + 0.5}
          width={width - 1}
          height={PLATE_BLOCK_HEIGHT - 1}
          fill="none"
          stroke="var(--color-steel-dim)"
          strokeWidth={1}
        />
        <line
          x1={width - 150}
          y1={fieldHeight}
          x2={width - 150}
          y2={height - 0.5}
          stroke="var(--color-steel-dim)"
          strokeWidth={1}
        />
        {/* Sized in SVG USER UNITS, not CSS pixels. The plate scales with its
            container: from a 660-unit viewBox at ~340px on a phone, one unit is
            about 0.52 CSS px, so a 10-unit label that reads on desktop becomes
            ~5 CSS px there.

            Scaling the type up alone does not work — the title block's cells
            are a fixed width, and the full strings overflow and collide well
            before they become legible. Narrow screens therefore get less text
            at a readable size rather than the same text unreadably small. */}
        <text
          x={16}
          y={fieldHeight + PLATE_BLOCK_HEIGHT / 2}
          dominantBaseline="central"
          className="notation text-[24px] sm:hidden"
          fill="var(--color-steel)"
        >
          {shortTitle}
        </text>
        <text
          x={16}
          y={fieldHeight + PLATE_BLOCK_HEIGHT / 2}
          dominantBaseline="central"
          className="notation hidden text-[13px] sm:block lg:text-[10px]"
          fill="var(--color-steel)"
        >
          {title}
        </text>

        <text
          x={width - 16}
          y={fieldHeight + PLATE_BLOCK_HEIGHT / 2}
          textAnchor="end"
          dominantBaseline="central"
          className="notation text-[24px] sm:hidden"
          fill="var(--color-steel)"
        >
          {shortReference}
        </text>
        <text
          x={width - 16}
          y={fieldHeight + PLATE_BLOCK_HEIGHT / 2}
          textAnchor="end"
          dominantBaseline="central"
          className="notation hidden text-[13px] sm:block lg:text-[10px]"
          fill="var(--color-steel)"
        >
          {reference}
        </text>
      </g>
    </svg>
  );
}
