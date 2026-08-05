import { Archivo, Newsreader, Martian_Mono } from "next/font/google";

/**
 * Three roles, no more.
 *
 * Archivo is the brand voice. It is chosen for its width axis (62–125), not for
 * its default cut: the identity lives in the contrast between an ultra-expanded
 * wordmark and condensed headings drawn from the same family. Structural tension
 * from one source — the type equivalent of the brand thesis.
 *
 * Newsreader carries long-form reading in the Journal and Technique Library. Its
 * optical-size axis means display sizes and 17px body text are genuinely
 * different drawings rather than one outline scaled.
 *
 * Martian Mono appears ONLY inside Guard Theory Notation plates and specification
 * tables, where monospacing encodes real meaning (aligned columns, fixed-width
 * notation glyphs). It is never used for section labels or eyebrows.
 *
 * All three are served from this origin via next/font — no runtime request to a
 * font CDN, so `font-src 'self'` holds.
 */

/**
 * PRELOADING: what is measured, and what turned out not to be true.
 *
 * All three faces are preloaded. Preloaded bytes, from the build:
 *
 *   Newsreader     131,848
 *   Archivo         90,096
 *   Martian Mono    38,392
 *
 * Four separate CLS numbers were blamed on these declarations — 0.0665 on the
 * home page, 0.166 on long-form, 0.1771 on figure pages, 0.182 on the product
 * page — and this file was rewritten four times chasing them. Each rewrite moved
 * the number a little. None removed it.
 *
 * None of it was a font problem. The shift came from `Breadcrumbs`, whose trail
 * wrapped to a second line once Martian Mono replaced the narrower fallback,
 * pushing the whole product page down 24px. A wrap point depends on glyph width,
 * so calibrating fallback metrics cannot fix one — which is why four attempts
 * here did not. The trail no longer wraps and the page measures 0.0000, verified
 * by reverting that one component and watching 0.2047 come back.
 *
 * So the fallbacks below are kept because they are correct and cost nothing,
 * NOT because any shift was ever traced to them. Do not credit them with a fix.
 *
 * The preloads are kept for what they do to the Lighthouse score, which is this
 * project's gate and the number any third party will run:
 *
 *   all three preloaded          91 / 91 / 91 / 89 / 91 / 89
 *   Martian Mono not preloaded   91 / 83 / 92 / 91 / 91 / 90
 *
 * Dropping the mono preload buys two points on the article page and costs eight
 * on the product page. Keeping it is the measured optimum, not a principle.
 *
 * Before changing any of this, run BOTH `npm run cls` and `npm run lighthouse`
 * and quote both. Everything this file got wrong, it got wrong by trusting one
 * instrument — and then by blaming the thing it had been editing.
 */
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  preload: true,
  // Headings render at wdth 66, so a default-width fallback is the wrong shape
  // to calibrate against. next/font can only measure what it is told to use,
  // and naming "Arial Narrow" in the CSS stack instead does nothing: next/font's
  // own generated fallback terminates the chain before it is reached.
  fallback: ["Arial Narrow", "Helvetica Neue Condensed", "Arial", "sans-serif"],
  variable: "--font-archivo",
});

/**
 * The largest single file on the critical path, and the reason the article page
 * measures 89 rather than 91: long-form pages are almost entirely body copy, so
 * this is their LCP font and deferring it only moves the cost to a second paint.
 */
export const newsreader = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  preload: true,
  variable: "--font-newsreader",
});

/**
 * The smallest of the three preloads and the cheapest to keep. Rendered at
 * wdth 87.5, so its fallback names condensed-metric faces for the same reason
 * Archivo's does.
 */
export const martianMono = Martian_Mono({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  preload: true,
  fallback: ["Consolas", "Menlo", "DejaVu Sans Mono", "monospace"],
  variable: "--font-martian",
});

export const fontVariables = [
  archivo.variable,
  newsreader.variable,
  martianMono.variable,
].join(" ");
