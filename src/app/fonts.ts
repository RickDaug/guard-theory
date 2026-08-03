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

export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

export const newsreader = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-newsreader",
});

export const martianMono = Martian_Mono({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-martian",
});

export const fontVariables = [
  archivo.variable,
  newsreader.variable,
  martianMono.variable,
].join(" ");
