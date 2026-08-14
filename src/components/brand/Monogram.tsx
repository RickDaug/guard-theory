import logo from "@/lib/brand/logo.json";

/**
 * GT — the Guard Theory mark.
 *
 * A ring with the GT driven through it: the G's bowl opens into the T's
 * crossbar, and the pair crosses the ring on both sides, cutting it into two
 * arcs. The ring is not a frame around the letters — the letters break it, which
 * is the point.
 *
 * The geometry is the supplied artwork, traced once into
 * `src/lib/brand/logo.json`. Nothing here redraws it. That file is also what the
 * favicon, the app icons, the Open Graph card and the exported SVGs are built
 * from, so the tab, the home screen and the link preview cannot drift apart from
 * what the header shows.
 *
 * The mark is filled rather than stroked, so it scales without a stroke-width to
 * keep in step, and it takes `currentColor` so it inherits the ground it is on.
 *
 * Below about 32px the ring's stroke is under a pixel and the mark reads as
 * haze. That case is not this component's — it is handled in the icon pipeline,
 * which redraws the ring heavier for the browser icons. See the note at the top
 * of `scripts/brand/raster.mjs`.
 */

const [, , VB_W, VB_H] = logo.mark.viewBox.split(" ").map(Number);
const ASPECT = VB_W / VB_H;

const MARK_ID = "gt-mark";

/**
 * The mark's geometry, once per document.
 *
 * A faithful trace of this artwork is 6.4kB of path data. The header and the
 * footer both show the mark, and `/design-system` shows it nine times, so
 * writing the paths at each site put 12.8kB of duplicate coordinates into every
 * page — and 90kB into that one. This renders them once and every `Monogram`
 * references them.
 *
 * Not `display:none`: a definition inside a `display:none` subtree does not
 * render through `<use>` in every engine. Zero-sized and clipped is the form
 * that is safe everywhere.
 *
 * Mounted in the root layout, above the header.
 */
export function MonogramDefs() {
  return (
    <svg
      aria-hidden
      focusable="false"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <g id={MARK_ID}>
          {logo.mark.paths.map((path) => (
            <path key={path.id} d={path.d} />
          ))}
        </g>
      </defs>
    </svg>
  );
}

type MonogramProps = {
  /** Rendered height in px. Width follows from the mark's own proportions. */
  size?: number;
  /**
   * Decorative marks are hidden from assistive tech. Give a title only when the
   * mark is the sole content of a link or button.
   */
  title?: string;
  className?: string;
};

export function Monogram({ size = 64, title, className }: MonogramProps) {
  return (
    <svg
      width={Math.round(size * ASPECT)}
      height={size}
      viewBox={logo.mark.viewBox}
      fill="currentColor"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {/* The referenced paths carry no fill of their own, so they inherit
          currentColor through the use element exactly as an inline copy would. */}
      <use href={`#${MARK_ID}`} />
    </svg>
  );
}

const [, , WM_W, WM_H] = logo.wordmark.viewBox.split(" ").map(Number);
const WM_ASPECT = WM_W / WM_H;

type WordmarkProps = {
  /** Rendered height in px. */
  size?: number;
  title?: string;
  className?: string;
};

/**
 * GUARD THEORY, as drawn in the artwork rather than set in Archivo.
 *
 * This is the logotype, and it is used where the logo appears *as a logo* — the
 * exported lockups, the Open Graph card. The site's own headings and the
 * wordmark beside the mark in the header are Archivo, which is the brand's
 * typeface. Drawing a logotype once and setting everything else in the typeface
 * is the normal division; using the drawn letters for interface text would mean
 * shipping ten kilobytes of path data to render two words that a font already
 * renders, on every page.
 */
export function Wordmark({ size = 32, title, className }: WordmarkProps) {
  return (
    <svg
      width={Math.round(size * WM_ASPECT)}
      height={size}
      viewBox={logo.wordmark.viewBox}
      fill="currentColor"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <path d={logo.wordmark.d} />
    </svg>
  );
}
