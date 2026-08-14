/**
 * The palette, mirrored from globals.css so the design system and the contrast
 * tests read the same values. If you change a colour, change it in both places
 * — the token test will fail loudly if the two drift out of usable range.
 *
 * Five of these are given by the brand and are used exactly as given. The rest
 * are derived from them by mixing in linear-light sRGB, and the mix fractions
 * were solved against the contrast requirement rather than chosen by eye. The
 * derivation is recorded on each swatch so a future change can be made on the
 * ramp instead of beside it.
 */

export type Swatch = {
  token: string;
  hex: string;
  role: string;
  /** What this colour is allowed to be used for. */
  usage: "text" | "surface" | "hairline";
  /** Given by the brand, or the mix it was derived from. */
  origin: string;
};

export const PALETTE: Swatch[] = [
  {
    token: "ink",
    hex: "#1B1725",
    role: "Brand ground. Not a neutral black but a deep aubergine, so drawn line work sits on something with a temperature.",
    usage: "surface",
    origin: "given",
  },
  {
    token: "ink-raised",
    hex: "#282332",
    role: "A surface lifted off the ground without a border.",
    usage: "surface",
    origin: "ink → steel-dim, 13%",
  },
  {
    token: "graphite",
    hex: "#2E2939",
    role: "Form controls and inset panels. The lightest of the three dark surfaces, so it is what every text colour on ink is really tested against.",
    usage: "surface",
    origin: "ink → steel-dim, 22%",
  },
  {
    token: "steel",
    hex: "#A499B3",
    role: "Secondary text on the brand ground. Clears AA at any size on all three dark surfaces.",
    usage: "text",
    origin: "given",
  },
  {
    token: "steel-dim",
    hex: "#534B62",
    role: "Rules, borders, plate hairlines. The structural violet. Never text on ink.",
    usage: "hairline",
    origin: "given",
  },
  {
    token: "slate",
    hex: "#4B4359",
    role: "Secondary text on the study ground.",
    usage: "text",
    origin: "steel-dim → ink, 22%",
  },
  {
    token: "orchid",
    hex: "#D0BCD5",
    role: "The annotation layer on ink — notation labels, plate identifiers, callout numbers. A pencil note on a technical plate, not decoration.",
    usage: "text",
    origin: "given",
  },
  {
    token: "bone",
    hex: "#EFE9F0",
    role: "Study ground. The same violet at paper weight, for long-form reading.",
    usage: "surface",
    origin: "orchid → white, 62%",
  },
  {
    token: "bone-raised",
    hex: "#F6F2F7",
    role: "A lifted surface on the study ground.",
    usage: "surface",
    origin: "orchid → white, 78%",
  },
  {
    token: "chalk",
    hex: "#FAF9FB",
    role: "Primary text on ink, and the label on a signal fill — which is the binding constraint, and what set its value.",
    usage: "text",
    origin: "orchid → white, 89%",
  },
  {
    token: "signal",
    hex: "#226CE0",
    role: "Live state, as a fill and as a non-text indicator only. Too dark to be text on ink and too light to be text on paper, so it is never a word.",
    usage: "surface",
    origin: "given",
  },
  {
    token: "signal-lift",
    hex: "#6F94E9",
    role: "Live state where it has to carry a word on a dark surface — links, hovers, the focus ring, a form error.",
    usage: "text",
    origin: "signal → #BFD4FF, 28.5%",
  },
  {
    token: "signal-dim",
    hex: "#2161C9",
    role: "The same job on the study ground, where full-strength signal falls short of 4.5:1.",
    usage: "text",
    origin: "signal → ink, 22%",
  },
];

export const INK = "#1B1725";
export const BONE = "#EFE9F0";
export const CHALK = "#FAF9FB";
export const SIGNAL = "#226CE0";

/** Every text colour, paired with the ground it is allowed to sit on. */
export const TEXT_ON_GROUND: Array<{
  fg: string;
  fgToken: string;
  bg: string;
  bgToken: string;
}> = [
  // The brand ground, and the two surfaces raised off it. Every text colour is
  // listed against graphite as well as ink, because graphite is the lightest of
  // the three and a pairing that only clears on ink is a pairing that fails in
  // a form.
  { fgToken: "chalk", fg: CHALK, bgToken: "ink", bg: INK },
  { fgToken: "steel", fg: "#A499B3", bgToken: "ink", bg: INK },
  { fgToken: "orchid", fg: "#D0BCD5", bgToken: "ink", bg: INK },
  { fgToken: "signal-lift", fg: "#6F94E9", bgToken: "ink", bg: INK },
  { fgToken: "chalk", fg: CHALK, bgToken: "ink-raised", bg: "#282332" },
  { fgToken: "steel", fg: "#A499B3", bgToken: "ink-raised", bg: "#282332" },
  { fgToken: "orchid", fg: "#D0BCD5", bgToken: "ink-raised", bg: "#282332" },
  { fgToken: "signal-lift", fg: "#6F94E9", bgToken: "ink-raised", bg: "#282332" },
  { fgToken: "chalk", fg: CHALK, bgToken: "graphite", bg: "#2E2939" },
  { fgToken: "steel", fg: "#A499B3", bgToken: "graphite", bg: "#2E2939" },
  { fgToken: "orchid", fg: "#D0BCD5", bgToken: "graphite", bg: "#2E2939" },
  { fgToken: "signal-lift", fg: "#6F94E9", bgToken: "graphite", bg: "#2E2939" },

  // Fills.
  { fgToken: "chalk", fg: CHALK, bgToken: "signal", bg: SIGNAL },
  { fgToken: "ink", fg: INK, bgToken: "orchid", bg: "#D0BCD5" },
  { fgToken: "ink", fg: INK, bgToken: "chalk", bg: CHALK },

  // The study ground.
  { fgToken: "ink", fg: INK, bgToken: "bone", bg: BONE },
  { fgToken: "slate", fg: "#4B4359", bgToken: "bone", bg: BONE },
  { fgToken: "signal-dim", fg: "#2161C9", bgToken: "bone", bg: BONE },
  { fgToken: "ink", fg: INK, bgToken: "bone-raised", bg: "#F6F2F7" },
  { fgToken: "slate", fg: "#4B4359", bgToken: "bone-raised", bg: "#F6F2F7" },
  { fgToken: "signal-dim", fg: "#2161C9", bgToken: "bone-raised", bg: "#F6F2F7" },
];

/**
 * Indicators that carry meaning without being text: the focus ring, a control
 * border, a filled block against its ground. WCAG 2.2 SC 1.4.11 asks 3:1 of
 * each of these, and nothing in the text table covers them.
 */
export const NON_TEXT_ON_GROUND: Array<{
  fg: string;
  fgToken: string;
  bg: string;
  bgToken: string;
  role: string;
}> = [
  { fgToken: "signal-lift", fg: "#6F94E9", bgToken: "ink", bg: INK, role: "focus ring" },
  { fgToken: "signal-lift", fg: "#6F94E9", bgToken: "ink-raised", bg: "#282332", role: "focus ring" },
  { fgToken: "signal-lift", fg: "#6F94E9", bgToken: "graphite", bg: "#2E2939", role: "focus ring, and the border of a field in error" },
  { fgToken: "signal-dim", fg: "#2161C9", bgToken: "bone", bg: BONE, role: "focus ring" },
  { fgToken: "signal-dim", fg: "#2161C9", bgToken: "bone-raised", bg: "#F6F2F7", role: "focus ring" },
  { fgToken: "signal", fg: SIGNAL, bgToken: "ink", bg: INK, role: "a filled block or rule against the ground" },
  { fgToken: "steel", fg: "#A499B3", bgToken: "graphite", bg: "#2E2939", role: "the border of a form control" },
  { fgToken: "steel", fg: "#A499B3", bgToken: "ink", bg: INK, role: "the border of a form control" },
];
