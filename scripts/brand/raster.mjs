/**
 * Build every brand asset from the single vector source, src/lib/brand/logo.json.
 *
 * Run: npm run brand:build
 *
 * That file is produced by scripts/brand/trace.mjs from the supplied artwork and
 * is the only place the geometry lives. This script writes the SVGs, the browser
 * icons, the app icons and the Open Graph card from it, so the header, the tab,
 * the home screen and the link preview cannot show three different marks.
 *
 * ---------------------------------------------------------------------------
 * The one place the geometry is deliberately not the traced geometry
 *
 * The ring's stroke is 5.3% of its diameter. At 16px that is two thirds of a
 * pixel: it renders as a grey haze around the letters rather than as a circle,
 * and the mark reads as a smudge. The browser icons therefore draw the ring as
 * a real circle at 1.4x its true weight, with the GT's clearance cut back out of
 * it — enough to survive 16px, close enough to the mark that nobody looking at a
 * tab would know. gt-16-magnified.png exists so that call can be checked by eye,
 * on the real pixel grid, rather than taken on trust.
 *
 * Everything at 48px and above uses the mark exactly as traced.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public", "brand");
const APP = path.join(ROOT, "src", "app");

const logo = JSON.parse(
  await readFile(path.join(ROOT, "src", "lib", "brand", "logo.json"), "utf8"),
);

// Mirrored from globals.css. See src/lib/brand/palette.ts for the argument.
const INK = "#1B1725";
const CHALK = "#FAF9FB";
const BONE = "#EFE9F0";
const STEEL = "#A499B3";
const STEEL_DIM = "#534B62";
const ORCHID = "#D0BCD5";
const SIGNAL = "#226CE0";

const { ring } = logo.mark;
const gtPath = logo.mark.paths.find((p) => p.id === "gt");

const num = (s) => s.split(" ").map(Number);

// --- pieces -----------------------------------------------------------------

const markBody = (fill) =>
  logo.mark.paths.map((p) => `<path d="${p.d}" fill="${fill}"/>`).join("");

/**
 * A square viewBox centred on the ring rather than on the mark's bounding box.
 * The T overhangs the ring to the right, so a box-centred tile sits the mark
 * visibly left of centre; the eye centres on the circle.
 */
function squareViewBox(pad) {
  const half = ring.rOuter * (1 + pad);
  return {
    vb: `${ring.cx - half} ${ring.cy - half} ${half * 2} ${half * 2}`,
    x: ring.cx - half,
    y: ring.cy - half,
    side: half * 2,
  };
}

/** The mark as traced, in a square tile. Transparent unless a ground is given. */
function markSquare(fill, pad, ground, px = 512) {
  const { vb, x, y, side } = squareViewBox(pad);
  const bg = ground
    ? `<rect x="${x}" y="${y}" width="${side}" height="${side}" fill="${ground}"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${px}" height="${px}">
  <title>Guard Theory</title>
  ${bg}${markBody(fill)}
</svg>`;
}

/**
 * The browser-icon geometry: the ring redrawn as a real circle at RING_WEIGHT
 * times its traced width, with the GT's clearance cut back out of it in the
 * ground colour. Needs an opaque ground, because the clearance is subtractive.
 */
const RING_WEIGHT = 1.4;
const CLEARANCE = 28; // the gap between the GT and the ring in the artwork, in source units

/**
 * Round every coordinate to a whole unit.
 *
 * icon.svg is fetched on every page load, and the mark is 633 units wide, so a
 * tenth of a unit is a six-thousandth of the drawing — at the 16 to 64 pixels a
 * browser renders a tab icon at, that is a fortieth of a pixel. Keeping the
 * decimals there costs bytes on the critical path to describe a difference no
 * screen can show. Everything above icon size keeps the full precision.
 */
const coarse = (d) => d.replace(/-?\d+(?:\.\d+)?/g, (n) => String(Math.round(Number(n))));

function iconSvg(fill, ground, px = 512) {
  const { x, y, side } = squareViewBox(0.04);
  const rMid = (ring.rOuter + ring.rInner) / 2;
  const w = (ring.rOuter - ring.rInner) * RING_WEIGHT;
  // The GT is drawn twice — once thickly in the ground colour to cut the
  // clearance, once filled — so it goes in defs and is referenced. Written out
  // twice this file is 7.8kB, and the browser fetches it on every page load.
  const r = (v) => Math.round(v);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r(x)} ${r(y)} ${r(side)} ${r(side)}" width="${px}" height="${px}">
  <title>Guard Theory</title>
  <defs><path id="gt" d="${coarse(gtPath.d)}"/></defs>
  <rect x="${r(x)}" y="${r(y)}" width="${r(side)}" height="${r(side)}" fill="${ground}"/>
  <circle cx="${r(ring.cx)}" cy="${r(ring.cy)}" r="${r(rMid)}" fill="none" stroke="${fill}" stroke-width="${r(w)}"/>
  <use href="#gt" fill="none" stroke="${ground}" stroke-width="${r(CLEARANCE * RING_WEIGHT)}" stroke-linejoin="round"/>
  <use href="#gt" fill="${fill}"/>
</svg>`;
}

/**
 * The full lockup, in the spacing of the supplied artwork — the three pieces
 * share one coordinate system, so this is a viewBox rather than a layout.
 *
 * The artwork sets the tagline in a lighter grey than the wordmark. That
 * hierarchy is reproduced with a token rather than baked into the vector, so a
 * single-colour version is a parameter and not a second drawing.
 */
function lockupSvg(fill, taglineFill = fill, ground) {
  const [x, y, w, h] = num(logo.lockup.viewBox);
  const bg = ground ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${ground}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${logo.lockup.viewBox}" width="${Math.round(w)}" height="${Math.round(h)}">
  <title>Guard Theory — jiu jitsu equipment and apparel</title>
  ${bg}${markBody(fill)}
  <path d="${logo.wordmark.d}" fill="${fill}"/>
  <path d="${logo.tagline.d}" fill="${taglineFill}"/>
</svg>`;
}

function wordmarkSvg(fill) {
  const [, , w, h] = num(logo.wordmark.viewBox);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${logo.wordmark.viewBox}" width="${Math.round(w)}" height="${Math.round(h)}">
  <title>Guard Theory</title>
  <path d="${logo.wordmark.d}" fill="${fill}"/>
</svg>`;
}

// --- SVG assets --------------------------------------------------------------

await mkdir(OUT, { recursive: true });

const SVGS = [
  ["gt-mark.svg", markSquare(CHALK, 0)],
  ["gt-mark-ink.svg", markSquare(INK, 0)],
  ["gt-lockup.svg", lockupSvg(CHALK, STEEL)],
  ["gt-lockup-ink.svg", lockupSvg(INK, "#5A5266")],
  ["gt-lockup-mono.svg", lockupSvg(CHALK)],
  ["gt-wordmark.svg", wordmarkSvg(CHALK)],
];

for (const [name, svg] of SVGS) {
  await writeFile(path.join(OUT, name), `${svg}\n`, "utf8");
  console.log(`  ${name}`);
}

// --- rasters -----------------------------------------------------------------

/**
 * Rasterise at four times the target and reduce.
 *
 * Both extremes are worse, and visibly so at 16px: rendering straight to size
 * leans on the rasteriser's own antialiasing and comes out soft, while the very
 * high density this script used to request renders an 8,000px image and
 * lanczos-reduces it 500:1, which rings and comes out softer still. Four times
 * is where the GT's diagonals stay crisp. Capped so the large sizes do not
 * render an image nobody benefits from.
 */
async function raster(build, size, bg, { rgba = false } = {}) {
  const at = Math.min(size * 4, 2048);
  let pipe = sharp(Buffer.from(build(at)), { density: 72 })
    .resize(size, size, { kernel: "lanczos3" })
    .flatten({ background: bg });
  // Flattening drops the alpha channel, which is right for a standalone PNG and
  // wrong inside an .ico: Next's icon decoder rejects a PNG entry that is not
  // RGBA, and the build fails with "The PNG is not in RGBA format".
  if (rgba) pipe = pipe.ensureAlpha();
  // These images are two colours and their antialiasing, so a palette PNG stores
  // them in a fraction of the space with nothing to lose: the manifest icon,
  // which the browser fetches on page load, drops from 6.9kB to 4.3kB and the
  // 512 from 18kB to 11kB. Not for the .ico, though — an indexed PNG is not
  // RGBA, which is the one thing Next's icon decoder insists on.
  // `effort` is a palette option in sharp and setting it turns `palette` on by
  // itself, so the .ico branch must not pass it either — doing so silently
  // produced indexed PNGs and the build failed on colour type 3.
  return pipe
    .png(
      rgba
        ? { compressionLevel: 9 }
        : { compressionLevel: 9, palette: true, quality: 100, effort: 10 },
    )
    .toBuffer();
}

/** Small sizes get the heavier ring; 48px and up get the mark as traced.
 *  Returns a builder, because `raster` decides what pixel size to render at. */
const SMALL_CUTOFF = 48;
const iconAt =
  (size, fg = CHALK, bg = INK) =>
  (px) =>
    size < SMALL_CUTOFF ? iconSvg(fg, bg, px) : markSquare(fg, 0.1, bg, px);

const TARGETS = [
  { name: "gt-16", size: 16 },
  { name: "gt-32", size: 32 },
  { name: "gt-64", size: 64 },
  { name: "gt-180", size: 180 },
  { name: "gt-192", size: 192 },
  { name: "gt-512", size: 512 },
  { name: "gt-1024", size: 1024 },
];

for (const { name, size } of TARGETS) {
  await writeFile(
    path.join(OUT, `${name}.png`),
    await raster(iconAt(size), size, INK),
  );
  console.log(`  ${name}.png  ${size}x${size}`);
}

// The mark reversed, for anything printed on the study ground or on a garment.
await writeFile(
  path.join(OUT, "gt-512-ink-on-bone.png"),
  await raster((px) => markSquare(INK, 0.1, BONE, px), 512, BONE),
);
console.log("  gt-512-ink-on-bone.png  512x512");

/**
 * The maskable icon. Android crops this to an arbitrary shape and may take as
 * little as the inner 80% circle, so the mark is inset to the safe zone rather
 * than sized to the tile.
 */
await writeFile(
  path.join(OUT, "gt-maskable-512.png"),
  await raster((px) => markSquare(CHALK, 0.62, INK, px), 512, INK),
);
console.log("  gt-maskable-512.png  512x512  (inset to the maskable safe zone)");

// The 16px render blown up so the small-size geometry can be judged by eye.
await sharp(path.join(OUT, "gt-16.png"))
  .resize(320, 320, { kernel: "nearest" })
  .png({ compressionLevel: 9 })
  .toFile(path.join(OUT, "gt-16-magnified.png"));
console.log("  gt-16-magnified.png  the 16px render at 20x, nearest-neighbour");

// The lockup as a raster, for anywhere an SVG is not accepted.
const [, , LW, LH] = num(logo.lockup.viewBox);
await sharp(Buffer.from(lockupSvg(CHALK, STEEL, INK)), { density: 600 })
  .resize(1600, Math.round((1600 * LH) / LW))
  .flatten({ background: INK })
  .png({ compressionLevel: 9 })
  .toFile(path.join(OUT, "gt-lockup-1600.png"));
console.log("  gt-lockup-1600.png");

// --- the icons Next.js picks up by file convention ---------------------------

await writeFile(path.join(APP, "icon.svg"), `${iconSvg(CHALK, INK)}\n`, "utf8");
console.log("  src/app/icon.svg");

await writeFile(path.join(APP, "apple-icon.png"), await raster((px) => markSquare(CHALK, 0.22, INK, px), 180, INK));
console.log("  src/app/apple-icon.png  180x180");

/**
 * favicon.ico, for the browsers that still ask for one. ICO is a directory of
 * images; since Vista the entries may be PNGs rather than BMPs, which is what
 * every browser that reads this file supports. Each entry is generated at the
 * geometry appropriate to its size.
 */
async function ico(sizes) {
  const images = [];
  for (const size of sizes) images.push(await raster(iconAt(size), size, INK, { rgba: true }));

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(sizes.length, 4);

  const dir = Buffer.alloc(16 * sizes.length);
  let offset = header.length + dir.length;
  sizes.forEach((size, i) => {
    const e = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, e + 0);
    dir.writeUInt8(size >= 256 ? 0 : size, e + 1);
    dir.writeUInt8(0, e + 2); // palette size
    dir.writeUInt8(0, e + 3); // reserved
    dir.writeUInt16LE(1, e + 4); // colour planes
    dir.writeUInt16LE(32, e + 6); // bits per pixel
    dir.writeUInt32LE(images[i].length, e + 8);
    dir.writeUInt32LE(offset, e + 12);
    offset += images[i].length;
  });

  return Buffer.concat([header, dir, ...images]);
}

await writeFile(path.join(APP, "favicon.ico"), await ico([16, 32, 48]));
console.log("  src/app/favicon.ico  16 + 32 + 48");

// --- Open Graph card ---------------------------------------------------------
//
// Generated here and committed as a static PNG rather than rendered at request
// time. A link preview that depends on a font fetch at build time is a link
// preview that silently breaks; this one is a file.
//
// The wordmark and the tagline are the traced vectors, not type — so the card
// carries the real letterforms rather than whichever sans-serif the build
// machine happens to have, which is what the previous version relied on.
//
// 1200x630 is the size every messaging app and social network crops from.

const OG_W = 1200;
const OG_H = 630;

function ogSvg() {
  const [mx, my, mw, mh] = num(logo.mark.viewBox);
  const [wx, wy, ww, wh] = num(logo.wordmark.viewBox);
  const [tx, ty, tw, th] = num(logo.tagline.viewBox);

  // The mark, set to a fixed height on the left of the card.
  const markH = 196;
  const markS = markH / mh;
  // The wordmark, set to a fixed width beside it.
  const wordW = 520;
  const wordS = wordW / ww;
  const taglineS = wordW / tw;

  const markX = 96;
  const markY = 118;
  const textX = markX + mw * markS + 64;

  // Centre the wordmark-and-tagline group on the mark's own centre rather than
  // guessing an offset: the two are read as one object and a few pixels out
  // shows immediately at thumbnail size.
  const gap = 26;
  const textH = wh * wordS + gap + th * taglineS;
  const textTop = markY + (mh * markS - textH) / 2;

  const tick = (x, y) =>
    `<line x1="${x}" y1="${y}" x2="${x + 22}" y2="${y}"/><line x1="${x}" y1="${y - 11}" x2="${x}" y2="${y + 11}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_W}" height="${OG_H}" viewBox="0 0 ${OG_W} ${OG_H}">
  <rect width="${OG_W}" height="${OG_H}" fill="${INK}"/>

  <!-- plate field, in the same notation as every drawing on the site -->
  <rect x="56" y="56" width="${OG_W - 112}" height="${OG_H - 112}" fill="none" stroke="${STEEL_DIM}" stroke-width="1.5"/>
  <g stroke="${STEEL_DIM}" stroke-width="1.5">
    ${tick(76, 76)}${tick(OG_W - 98, 76)}${tick(76, OG_H - 76)}${tick(OG_W - 98, OG_H - 76)}
  </g>

  <g transform="translate(${markX}, ${markY}) scale(${markS}) translate(${-mx}, ${-my})">
    ${markBody(CHALK)}
  </g>

  <g transform="translate(${textX}, ${textTop}) scale(${wordS}) translate(${-wx}, ${-wy})">
    <path d="${logo.wordmark.d}" fill="${CHALK}"/>
  </g>
  <g transform="translate(${textX}, ${textTop + wh * wordS + gap}) scale(${taglineS}) translate(${-tx}, ${-ty})">
    <path d="${logo.tagline.d}" fill="${ORCHID}"/>
  </g>

  <line x1="${markX}" y1="404" x2="${markX + 96}" y2="404" stroke="${SIGNAL}" stroke-width="5"/>

  <text x="${markX}" y="470" font-family="Georgia, 'Times New Roman', serif" font-size="34" fill="${CHALK}">
    No-gi grappling apparel, and a technical study of the guard.
  </text>

  <text x="${markX}" y="524" font-family="Consolas, 'Courier New', monospace" font-size="23" letter-spacing="1.6" fill="${STEEL}">
    POSITION BEFORE SUBMISSION. SYSTEMS BEFORE CHAOS.
  </text>
</svg>`;
}

await sharp(Buffer.from(ogSvg()), { density: 144 })
  .resize(OG_W, OG_H)
  .png({ compressionLevel: 9 })
  .toFile(path.join(APP, "opengraph-image.png"));
console.log(`  src/app/opengraph-image.png  ${OG_W}x${OG_H}`);

await writeFile(
  path.join(APP, "opengraph-image.alt.txt"),
  "The Guard Theory mark and wordmark on the brand ground, over the line: no-gi grappling apparel, and a technical study of the guard.\n",
  "utf8",
);
console.log("  src/app/opengraph-image.alt.txt");

// --- what these files are ----------------------------------------------------

await writeFile(
  path.join(OUT, "README.md"),
  [
    "# Brand assets",
    "",
    "Generated by `npm run brand:build` from `src/lib/brand/logo.json`, which is",
    "itself produced by `scripts/brand/trace.mjs` from the supplied artwork in",
    "`assets/brand-source/`. Do not edit anything in this directory by hand —",
    "change the source and re-run, or the tab, the header and the link preview",
    "will start to disagree with each other.",
    "",
    "| File | Use |",
    "| --- | --- |",
    "| `gt-mark.svg` | The mark alone, chalk on transparent. |",
    "| `gt-mark-ink.svg` | The mark alone, ink on transparent, for light grounds. |",
    "| `gt-lockup.svg` | Mark, wordmark and tagline, with the tagline at steel. |",
    "| `gt-lockup-ink.svg` | The same, reversed for a light ground. |",
    "| `gt-lockup-mono.svg` | The lockup in one colour — embroidery, woven labels, anything single-ink. |",
    "| `gt-wordmark.svg` | GUARD THEORY alone. |",
    "| `gt-16` … `gt-1024.png` | Square rasters on ink. |",
    "| `gt-512-ink-on-bone.png` | Reversed, for the study ground and for print. |",
    "| `gt-maskable-512.png` | Android maskable icon, inset to the safe zone. |",
    "| `gt-lockup-1600.png` | The lockup as a raster. |",
    "",
    "`gt-16-magnified.png` is the 16px render blown up with nearest-neighbour",
    "sampling. It exists so the favicon can be judged on its real pixel grid.",
    "Below 48px the ring is drawn 1.4x its true weight, because at its real",
    "weight it is a two-thirds-of-a-pixel line and renders as haze; see the note",
    "at the top of `scripts/brand/raster.mjs`.",
    "",
  ].join("\n"),
  "utf8",
);
console.log("  README.md");
