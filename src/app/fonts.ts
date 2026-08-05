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
 * Only Archivo is preloaded.
 *
 * The largest contentful paint on every page is a display heading set in
 * Archivo, so its file is genuinely on the critical path. Preloading all three
 * families makes them compete for the same early bandwidth and pushes the one
 * that matters later — measurably so. Newsreader and Martian Mono load without
 * a preload hint and swap in a beat afterwards, which is invisible for body
 * copy and notation labels.
 */
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  preload: true,
  variable: "--font-archivo",
  // Headings render at wdth 66. Without this, next/font calibrates its
  // metric-adjusted fallback against Archivo at wdth 100, the fallback sets
  // far wider, and the h1 reflows from six lines to four when the real font
  // arrives - a measured 0.0665 shift that Lighthouse reports as 0.000
  // because its LCP simulation stops before the swap.
  fallback: ["Arial Narrow", "Helvetica Neue Condensed", "Arial", "sans-serif"],
});

/**
 * Newsreader is preloaded despite the note above: long-form pages are almost
 * entirely body copy, and letting it swap in late moved cumulative layout shift
 * to 0.166 there. Preloading it costs the home page nothing measurable and
 * fixes the shift where it actually happens.
 */
export const newsreader = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  preload: true,
  variable: "--font-newsreader",
});

/**
 * Preloaded because it sets the breadcrumb on every page, directly above the
 * main content. Swapping it in late changed that line box and pushed the whole
 * page down - 0.166 cumulative layout shift on long-form pages, entirely from
 * one small label.
 */
export const martianMono = Martian_Mono({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  preload: true,
  variable: "--font-martian",
});

export const fontVariables = [
  archivo.variable,
  newsreader.variable,
  martianMono.variable,
].join(" ");
