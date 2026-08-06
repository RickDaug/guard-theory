/**
 * Promotional artwork for the pre-launch waitlist.
 *
 * Run: npm run brand:promo   (expects a production server on port 3100)
 *
 * WHY IT RENDERS THROUGH THE RUNNING SITE
 *
 * The identity lives in two things a normal SVG export cannot reach: the
 * monogram geometry in src/lib/brand/monogram.json, and the variable-font width
 * axes in globals.css — the wordmark is Archivo at wdth 125, headings at 66,
 * notation at 87.5. Rasterising an SVG through sharp would need those fonts
 * installed system-wide and would still lose the axis settings.
 *
 * So this navigates a real browser to the real site, where next/font has already
 * loaded the real faces and the real stylesheet, then replaces the document body
 * with the artwork. Every colour is a live brand token and every letterform is
 * the shipped one. If the brand changes, this output changes with it.
 *
 * Nothing is written into public/ and no route is added — the artwork is never
 * served by the site, only photographed from it.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "brand-exports");
const BASE = "http://127.0.0.1:3100";

const geometry = JSON.parse(
  await readFile(path.join(ROOT, "src", "lib", "brand", "monogram.json"), "utf8"),
);

/**
 * The mark, from the single source of truth. `-10.5 -10 83 83` is the same
 * padded box the app icon uses: the drawn mark sits tight in its 64-unit grid,
 * which suits inline use where surrounding layout provides the spacing, but
 * artwork needs the breathing room baked in.
 */
function monogram(size, stroke) {
  const paths = geometry.paths.map((p) => `<path d="${p.d}"/>`).join("");
  return `<svg viewBox="-10.5 -10 83 83" width="${size}" height="${size}"
    fill="none" stroke="${stroke}" stroke-width="${geometry.strokeWidth}"
    stroke-linecap="butt" role="img" aria-label="Guard Theory">${paths}</svg>`;
}

/**
 * Corner registration ticks.
 *
 * Borrowed from the notation plates rather than invented for this: they are how
 * every diagram on the site frames itself, and they are the reason this reads as
 * a specification plate rather than as a generic countdown graphic.
 */
function ticks(inset, length, colour) {
  const corner = (x, y, hx, hy) => `
    <div style="position:absolute;${y}:${inset}px;${x}:${inset}px;
      width:${length}px;height:1px;background:${colour}"></div>
    <div style="position:absolute;${y}:${inset}px;${x}:${inset}px;
      width:1px;height:${length}px;background:${colour}"></div>`;
  return [
    corner("left", "top"),
    corner("right", "top"),
    corner("left", "bottom"),
    corner("right", "bottom"),
  ].join("");
}

/**
 * @param {object} spec
 * @param {number} spec.w  logical width
 * @param {number} spec.h  logical height
 * @param {number} spec.mark  monogram size
 * @param {number} spec.pad
 */
function artwork({ w, h, mark, pad, wordmarkSize, headlineSize, gap, offsetY }) {
  const INK = "var(--color-ink)";
  const CHALK = "var(--color-chalk)";
  const STEEL = "var(--color-steel)";
  const SIGNAL = "var(--color-signal)";
  const RULE = "var(--color-steel-dim)";

  return `
  <div id="art" style="
      position:relative;width:${w}px;height:${h}px;background:${INK};
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      overflow:hidden">

    <!-- Frame, one hairline inside the trim, and the registration ticks. -->
    <div style="position:absolute;inset:${pad}px;border:1px solid ${RULE}"></div>
    ${ticks(Math.round(pad * 0.42), Math.round(pad * 0.75), STEEL)}

    <!-- offsetY is a MEASURED correction, not a judgement.
         I first nudged this by eye, having read the composition as sitting low,
         and moved it 12px the wrong way. Measuring the rendered PNG - lit rows
         in the central band, excluding the rules - put the flexbox centre 9px
         out at 3x, about 1.5 logical px. The eye was wrong by an order of
         magnitude and in the wrong direction, so the number below comes from
         the file rather than from looking at it. -->
    <div style="display:flex;flex-direction:column;align-items:center;
        gap:${gap}px;padding:0 ${Math.round(pad * 1.15)}px;text-align:center;
        transform:translateY(${offsetY}px)">

      ${monogram(mark, "var(--color-chalk)")}

      <div class="wordmark" style="color:${CHALK};font-size:${wordmarkSize}px;
          line-height:1">Guard&nbsp;Theory</div>

      <!-- Rule + eyebrow, the site's own pairing for a subtitle. -->
      <div style="display:flex;align-items:center;gap:${gap * 0.9}px;width:100%">
        <div style="flex:1;height:1px;background:${RULE}"></div>
        <div class="notation" style="color:${STEEL};font-size:${Math.round(wordmarkSize * 0.62)}px;
            white-space:nowrap">BJJ APPAREL</div>
        <div style="flex:1;height:1px;background:${RULE}"></div>
      </div>

      <div class="display-condensed" style="color:${CHALK};font-size:${headlineSize}px;
          line-height:0.92;margin-top:${Math.round(gap * 0.4)}px">Coming&nbsp;soon</div>

      <div class="display-plain" style="color:${SIGNAL};
          font-size:${Math.round(headlineSize * 0.5)}px;line-height:1;
          letter-spacing:0.01em">guardtheory.net</div>

      <div class="notation" style="color:${CHALK};
          font-size:${Math.round(wordmarkSize * 0.6)}px;
          border:1px solid ${STEEL};padding:${Math.round(gap * 0.62)}px ${gap * 1.1}px;
          margin-top:${Math.round(gap * 0.3)}px;white-space:nowrap">
        JOIN THE WAIT LIST</div>
    </div>
  </div>`;
}

const SPECS = [
  {
    // Square master. Alibaba and every other marketplace crops to a square.
    name: "alibaba-logo",
    w: 620,
    h: 620,
    mark: 122,
    pad: 24,
    // The brand name reads larger than the promise. This is filed as a logo,
    // and COMING SOON at more than twice the wordmark made the announcement
    // the subject and the brand the caption.
    wordmarkSize: 34,
    headlineSize: 54,
    gap: 19,
    offsetY: -1.5,
    scale: 3,
  },
  {
    // 2.5 x 3.5in at 300dpi — a trading-card footprint, so the insert sits
    // behind the slab in the mylar instead of being folded to fit.
    name: "alibaba-logo-insert-card",
    w: 250,
    h: 350,
    mark: 66,
    pad: 13,
    wordmarkSize: 17,
    headlineSize: 31,
    gap: 12,
    offsetY: 0,
    scale: 3,
  },
];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();

for (const spec of SPECS) {
  const page = await browser.newPage({
    viewport: { width: spec.w + 80, height: spec.h + 80 },
    deviceScaleFactor: spec.scale,
  });

  // The real site, for the real fonts and the real tokens. The font variables
  // are declared on <html>, so replacing only the body keeps them in scope.
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate((html) => {
    document.body.className = "";
    document.body.style.margin = "0";
    document.body.style.background = "transparent";
    document.body.innerHTML = html;
  }, artwork(spec));

  // next/font has already resolved by networkidle, but a swap landing mid-shot
  // would silently export the fallback face.
  await page.evaluate(() => document.fonts.ready);

  const target = page.locator("#art");
  const file = path.join(OUT, `${spec.name}.png`);
  await target.screenshot({ path: file });

  console.log(
    `${spec.name}.png — ${spec.w * spec.scale} x ${spec.h * spec.scale}`,
  );
  await page.close();
}

await browser.close();

await writeFile(
  path.join(OUT, "README.md"),
  `# Brand exports

Generated by \`npm run brand:promo\`. Do not edit these PNGs by hand — change
\`scripts/brand/promo.mjs\` or \`src/lib/brand/monogram.json\` and regenerate, so
the artwork cannot drift from the identity it is drawn from.

| File | Pixels | Use |
| --- | --- | --- |
| \`alibaba-logo.png\` | 1860 x 1860 | Marketplace store logo. Square, because every marketplace crops to one. |
| \`alibaba-logo-insert-card.png\` | 750 x 1050 | 2.5 x 3.5in at 300dpi — a trading-card footprint, so it sits behind a slab in a mylar without folding. |

Both are rendered through the running site, so every colour is a live brand
token and every letterform is the shipped variable-font axis: the wordmark at
Archivo wdth 125, the headline at wdth 66, the notation at Martian Mono wdth
87.5.
`,
  "utf8",
);

console.log(`\nwritten to ${path.relative(ROOT, OUT)}/`);
