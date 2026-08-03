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
        {/* Sized in user units, stepped up at narrow viewports. The plate scales
            with its container, so a fixed size that reads on desktop collapses
            to roughly 6px on a phone. */}
        <text
          x={16}
          y={fieldHeight + PLATE_BLOCK_HEIGHT / 2}
          dominantBaseline="central"
          className="notation text-[15px] sm:text-[12px] lg:text-[10px]"
          fill="var(--color-steel)"
        >
          {title}
        </text>
        <text
          x={width - 16}
          y={fieldHeight + PLATE_BLOCK_HEIGHT / 2}
          textAnchor="end"
          dominantBaseline="central"
          className="notation text-[15px] sm:text-[12px] lg:text-[10px]"
          fill="var(--color-steel)"
        >
          {reference}
        </text>
      </g>
    </svg>
  );
}
