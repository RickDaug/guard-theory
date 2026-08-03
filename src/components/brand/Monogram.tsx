import geometry from "@/lib/brand/monogram.json";

type MonogramProps = {
  /** Rendered size in px. The mark is drawn on a 64×64 grid and scales from it. */
  size?: number;
  /**
   * Decorative marks are hidden from assistive tech. Give a title only when the
   * mark is the sole content of a link or button.
   */
  title?: string;
  className?: string;
};

/**
 * GT — the Guard Theory monogram.
 *
 * One stroke does the work of both letters: the horizontal bar begins inside
 * the G's counter, exits through its aperture, and on the far side becomes the
 * crossbar of the T. It is simultaneously the spur that makes the ring a G and
 * the head that makes the descender a T. Remove it and both letters collapse.
 *
 * That is the brand thesis drawn rather than illustrated — an open ring held in
 * place by a single straight brace. It is not a picture of two people
 * grappling, and it is not a triangle.
 *
 * Three primitives only, so the mark survives 16px, a woven neck label and
 * single-colour embroidery without a separate simplified drawing. Butt caps
 * keep every terminal square and machine-cuttable.
 *
 * Geometry lives in monogram.json so this component, the exported SVG asset and
 * the rasteriser all draw the same mark.
 */
export function Monogram({ size = 64, title, className }: MonogramProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={geometry.viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={geometry.strokeWidth}
      strokeLinecap="butt"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {geometry.paths.map((path) => (
        <path key={path.id} d={path.d} />
      ))}
    </svg>
  );
}
