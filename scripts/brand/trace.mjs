/**
 * Turn the supplied logo artwork into the vector source the whole site is built
 * from: `src/lib/brand/logo.json`.
 *
 * Run:
 *
 *     npm install potrace --no-save && node scripts/brand/trace.mjs
 *
 * potrace is NOT a dependency of this project. It is needed once, whenever the
 * supplied artwork changes, and it drags in a large image stack that nothing
 * else here wants. The script's OUTPUT is committed, so a normal install and a
 * normal build never need it. If it is missing this script says so and stops.
 *
 * ---------------------------------------------------------------------------
 * Why the artwork is traced rather than embedded
 *
 * The supplied logo is a 1254px raster. Shipping it as a raster means a soft
 * favicon, a soft header at 2x, no `currentColor`, and no way to letter the
 * mark separately from the wordmark. Tracing it once gives a mark that is sharp
 * at every size, recolours with the ground, and can be split into the pieces the
 * layouts actually need.
 *
 * ---------------------------------------------------------------------------
 * Why the bitmap is upscaled and then blurred before the threshold
 *
 * The source is a compressed raster: every edge carries noise, and the ring
 * carries a faint gradient. Thresholding it directly turns that noise into a
 * ragged boundary, and the tracer reads the raggedness as thousands of real
 * corners — 31,000 characters of path data for a mark with three parts. Upscale
 * with lanczos (which promotes the antialiasing to sub-pixel edge information),
 * blur just enough to erase the noise, then threshold: 9,000 characters, and a
 * measured fidelity of 0.65% of inked area against the source, which is the
 * one-pixel edge sliver you cannot avoid when comparing two rasterisations.
 *
 * Those numbers were established by sweeping both parameters and scoring each
 * result against the source rather than by looking at file sizes.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

let Potrace;
try {
  ({ Potrace } = await import("potrace"));
} catch {
  console.error(
    "potrace is not installed. It is only needed to re-trace the artwork:\n" +
      "  npm install potrace --no-save && node scripts/brand/trace.mjs\n" +
      "Its output, src/lib/brand/logo.json, is committed — you do not need this\n" +
      "script to build or run the site.",
  );
  process.exit(1);
}

const ROOT = process.cwd();
const SRC = path.join(ROOT, "assets", "brand-source", "guard-theory-logo-source.png");
const OUT = path.join(ROOT, "src", "lib", "brand", "logo.json");
const TMP = path.join(ROOT, "node_modules", ".cache", "gt-trace");

/**
 * The three bands of the supplied artwork, found by scanning it for rows that
 * carry any ink. Crops are given a little slack so no stroke touches an edge.
 *
 * `scale` is chosen per band: the tagline is 23px tall in the source and needs
 * far more upsampling than the 567px mark to trace cleanly.
 */
const BANDS = [
  { name: "mark", left: 311, top: 206, width: 653, height: 587, scale: 4, turdSize: 60 },
  { name: "wordmark", left: 78, top: 821, width: 1104, height: 93, scale: 6, turdSize: 90 },
  { name: "tagline", left: 78, top: 933, width: 1099, height: 43, scale: 12, turdSize: 200 },
];

const BLUR = 1.5; // in source pixels; see the header note
const TOLERANCE = 2; // potrace curve-fitting tolerance, at the upscaled resolution

await mkdir(TMP, { recursive: true });

/** potrace emits only M, L and C, all absolute. Map every coordinate pair back
 *  into source-image space and round — 1 decimal on a 632-unit mark is one part
 *  in 6,320, which is finer than any raster this ever becomes. */
function toSourceSpace(d, band) {
  const s = band.scale;
  let i = 0;
  const out = d.replace(/-?\d+(?:\.\d+)?/g, (n) => {
    const v = Number(n);
    const mapped = i++ % 2 === 0 ? band.left + v / s : band.top + v / s;
    return String(Number(mapped.toFixed(1)));
  });
  // potrace leaves subpaths implicitly closed; make that explicit so the data
  // is correct under any renderer and any fill-rule.
  return out
    .split(/(?=M )/)
    .filter((p) => p.trim())
    .map((p) => `${p.trim()} Z`)
    .join(" ");
}

const traced = {};

for (const band of BANDS) {
  const bitmap = path.join(TMP, `${band.name}.png`);
  await sharp(SRC)
    .extract({ left: band.left, top: band.top, width: band.width, height: band.height })
    .greyscale()
    .resize(band.width * band.scale, band.height * band.scale, { kernel: "lanczos3" })
    .blur(BLUR * band.scale * 0.5)
    .png()
    .toFile(bitmap);

  const p = new Potrace({
    threshold: 128,
    blackOnWhite: false, // the artwork is white on black
    turdSize: band.turdSize * band.scale,
    alphaMax: 1.0,
    optCurve: true,
    optTolerance: TOLERANCE * band.scale,
    turnPolicy: "minority",
  });
  await new Promise((res, rej) =>
    p.loadImage(bitmap, (err) => (err ? rej(err) : res())),
  );

  const raw = p.getSVG().match(/ d="([^"]+)"/)?.[1];
  if (!raw) throw new Error(`${band.name}: potrace produced no path`);
  traced[band.name] = toSourceSpace(raw, band);
  console.log(`  ${band.name}: ${traced[band.name].length} chars`);
}

/** Tight bounding box of a path's control points. Cubic control points can sit
 *  slightly outside the drawn curve, so this is a hair generous — which is what
 *  a viewBox wants anyway. */
function bbox(d) {
  const n = d.match(/-?\d+(?:\.\d+)?/g).map(Number);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i < n.length; i += 2) {
    x0 = Math.min(x0, n[i]); x1 = Math.max(x1, n[i]);
    y0 = Math.min(y0, n[i + 1]); y1 = Math.max(y1, n[i + 1]);
  }
  return [x0, y0, x1, y1].map((v) => Number(v.toFixed(1)));
}

/**
 * The mark traces as exactly three contours: the ring's upper arc, the GT, and
 * the ring's lower arc — the GT crosses the ring with a cut on either side, so
 * the ring is not one closed shape. Splitting them is what lets the small-size
 * icon drop the ring, which at 16px is a sub-pixel line and reads as haze.
 *
 * They are identified by geometry rather than by index, so a re-trace that
 * happens to order them differently still produces a correct file.
 */
const markParts = traced.mark
  .split(/(?=M )/)
  .filter((p) => p.trim())
  .map((d) => ({ d: d.trim(), box: bbox(d) }));

if (markParts.length !== 3) {
  throw new Error(
    `expected the mark to trace as 3 contours (ring arc, GT, ring arc), got ${markParts.length}`,
  );
}

// The GT is the widest of the three: it overhangs the ring on both sides.
const width = (p) => p.box[2] - p.box[0];
const gt = markParts.reduce((a, b) => (width(b) > width(a) ? b : a));
const arcs = markParts.filter((p) => p !== gt).sort((a, b) => a.box[1] - b.box[1]);

/**
 * The ring is a true circle, and the icon needs to know where its centre is:
 * the mark's bounding box is dragged right by the T's overhang, so grid-centring
 * that box sits the mark visibly off centre in a square tile. The eye centres on
 * the ring, not on the box.
 *
 * Fitted by least squares over the arcs' on-curve points rather than taken from
 * a bounding box — cubic control points sit outside the curve they describe, and
 * a box built from them is a couple of units generous in every direction.
 */

/** On-curve points only: the M/L coordinates, and every third pair of a C. */
function onCurvePoints(d) {
  const tokens = d.match(/[MLCZ]|-?\d+(?:\.\d+)?/g) ?? [];
  const pts = [];
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i++];
    if (t === "M" || t === "L") pts.push([Number(tokens[i++]), Number(tokens[i++])]);
    else if (t === "C") {
      i += 4; // skip the two control points
      pts.push([Number(tokens[i++]), Number(tokens[i++])]);
    }
  }
  return pts;
}

/** Kåsa's algebraic circle fit — a linear least squares, no iteration. */
function fitCircle(pts) {
  const n = pts.length;
  let Sx = 0, Sy = 0, Sxx = 0, Syy = 0, Sxy = 0, Sxz = 0, Syz = 0, Sz = 0;
  for (const [x, y] of pts) {
    const z = x * x + y * y;
    Sx += x; Sy += y; Sxx += x * x; Syy += y * y; Sxy += x * y;
    Sxz += x * z; Syz += y * z; Sz += z;
  }
  const a1 = 2 * (Sxx - (Sx * Sx) / n);
  const b1 = 2 * (Sxy - (Sx * Sy) / n);
  const c1 = Sxz - (Sx * Sz) / n;
  const a2 = 2 * (Sxy - (Sx * Sy) / n);
  const b2 = 2 * (Syy - (Sy * Sy) / n);
  const c2 = Syz - (Sy * Sz) / n;
  const det = a1 * b2 - a2 * b1;
  const cx = (c1 * b2 - c2 * b1) / det;
  const cy = (a1 * c2 - a2 * c1) / det;
  const r = pts.reduce((s, [x, y]) => s + Math.hypot(x - cx, y - cy), 0) / n;
  return { cx, cy, r };
}

const arcPoints = arcs.flatMap((a) => onCurvePoints(a.d));

// A first fit over everything locates the centre well enough to sort points by
// radius; the flat cut faces where the GT crosses the ring are the only points
// that are not on either circle, and they fall between the two edges.
const rough = fitCircle(arcPoints);
const radii = arcPoints.map(([x, y]) => Math.hypot(x - rough.cx, y - rough.cy));
const split = (Math.min(...radii) + Math.max(...radii)) / 2;
const outerPts = arcPoints.filter((_, i) => radii[i] > split);
const innerPts = arcPoints.filter((_, i) => radii[i] <= split);

/**
 * Where the GT crosses the ring the arc ends in a flat cut face running from
 * the inner edge to the outer one. Those points lie on neither circle, and the
 * radius split above hands half of them to each. Refit twice, dropping whatever
 * sits more than two pixels off, and they fall out.
 */
function robustFit(pts) {
  let fit = fitCircle(pts);
  for (let pass = 0; pass < 2; pass++) {
    const kept = pts.filter(([x, y]) => Math.abs(Math.hypot(x - fit.cx, y - fit.cy) - fit.r) < 2);
    if (kept.length < 8) break;
    fit = fitCircle(kept);
    fit.n = kept.length;
  }
  return fit;
}

const outer = robustFit(outerPts);
const inner = robustFit(innerPts);

const round = (v) => Number(v.toFixed(2));
const ring = {
  cx: round((outer.cx + inner.cx) / 2),
  cy: round((outer.cy + inner.cy) / 2),
  rOuter: round(outer.r),
  rInner: round(inner.r),
  /** Residual spread of the fit, in source pixels. Recorded because it is the
   *  number that says whether the trace is round; anything under a pixel is
   *  finer than every raster this mark becomes. */
  residual: round(
    (() => {
      const on = outerPts.filter(
        ([x, y]) => Math.abs(Math.hypot(x - outer.cx, y - outer.cy) - outer.r) < 2,
      );
      return Math.sqrt(
        on.reduce((s, [x, y]) => s + (Math.hypot(x - outer.cx, y - outer.cy) - outer.r) ** 2, 0) /
          on.length,
      );
    })(),
  ),
};

const markBox = bbox(traced.mark);
const wordmarkBox = bbox(traced.wordmark);
const taglineBox = bbox(traced.tagline);
const lockupBox = [
  Math.min(markBox[0], wordmarkBox[0], taglineBox[0]),
  markBox[1],
  Math.max(markBox[2], wordmarkBox[2], taglineBox[2]),
  taglineBox[3],
];

const vb = ([x0, y0, x1, y1]) =>
  `${x0} ${y0} ${Number((x1 - x0).toFixed(1))} ${Number((y1 - y0).toFixed(1))}`;

const logo = {
  $generated: "scripts/brand/trace.mjs — do not edit by hand",
  source: "assets/brand-source/guard-theory-logo-source.png",
  note:
    "Every piece is expressed in the source artwork's own pixel grid, so the " +
    "mark, the wordmark, the tagline and the full lockup are all the same " +
    "coordinate system seen through different viewBoxes. Nothing needs a " +
    "transform to be composed, and nothing can drift out of register.",
  parameters: { blur: BLUR, tolerance: TOLERANCE, threshold: 128 },

  mark: {
    role: "The GT inside its ring. The whole mark, for anything 32px and up.",
    viewBox: vb(markBox),
    ring,
    paths: [
      { id: "ring-upper", role: "The ring's upper arc", d: arcs[0].d },
      { id: "gt", role: "The GT ligature", d: gt.d },
      { id: "ring-lower", role: "The ring's lower arc", d: arcs[1].d },
    ],
  },

  glyph: {
    role:
      "The GT alone. The ring's stroke is 3.9% of its diameter, which is a " +
      "sub-pixel line below about 32px and renders as a grey haze around the " +
      "letters rather than as a circle. Under that size the mark is the GT.",
    viewBox: vb(gt.box),
    d: gt.d,
  },

  wordmark: { role: "GUARD THEORY", viewBox: vb(wordmarkBox), d: traced.wordmark },

  tagline: {
    role: "The rule, JIU JITSU EQUIPMENT & APPAREL, and the rule",
    viewBox: vb(taglineBox),
    d: traced.tagline,
  },

  lockup: {
    role: "Mark over wordmark over tagline, in the spacing of the supplied art.",
    viewBox: vb(lockupBox),
  },
};

await writeFile(OUT, `${JSON.stringify(logo, null, 2)}\n`, "utf8");
console.log(`\n  ${path.relative(ROOT, OUT)}`);
console.log(`  mark    ${logo.mark.viewBox}`);
console.log(`  glyph   ${logo.glyph.viewBox}`);
console.log(`  ring    cx ${ring.cx} cy ${ring.cy} r ${ring.rInner}..${ring.rOuter}  fit residual ${ring.residual}px`);
console.log(`  lockup  ${logo.lockup.viewBox}`);
