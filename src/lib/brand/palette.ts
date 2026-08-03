/**
 * The palette, mirrored from globals.css so the design system and the contrast
 * tests read the same values. If you change a colour, change it in both places
 * — the token test will fail loudly if the two drift out of usable range.
 */

export type Swatch = {
  token: string;
  hex: string;
  role: string;
  /** What this colour is allowed to be used for. */
  usage: "text" | "surface" | "hairline";
};

export const PALETTE: Swatch[] = [
  {
    token: "ink",
    hex: "#0A0F14",
    role: "Brand ground. Black pulled toward competition-mat blue so drawn line work sits on something with a temperature.",
    usage: "surface",
  },
  {
    token: "ink-raised",
    hex: "#101820",
    role: "A surface lifted off the ground without a border.",
    usage: "surface",
  },
  {
    token: "graphite",
    hex: "#151C24",
    role: "Form controls and inset panels.",
    usage: "surface",
  },
  {
    token: "steel",
    hex: "#8A95A1",
    role: "Secondary text. Clears AA at any size on ink.",
    usage: "text",
  },
  {
    token: "steel-dim",
    hex: "#3A444F",
    role: "Rules, borders, plate hairlines. Never text.",
    usage: "hairline",
  },
  {
    token: "slate",
    hex: "#5A5F63",
    role: "Secondary text on the study ground. Clears AA on bone.",
    usage: "text",
  },
  {
    token: "bone",
    hex: "#E6E3DA",
    role: "Study ground. Uncoated technical paper for long-form reading.",
    usage: "surface",
  },
  {
    token: "bone-raised",
    hex: "#EDEAE2",
    role: "A lifted surface on the study ground.",
    usage: "surface",
  },
  {
    token: "chalk",
    hex: "#F4F3EF",
    role: "Primary text on ink.",
    usage: "text",
  },
  {
    token: "signal",
    hex: "#E3C74B",
    role: "Live state only — focus, active notation, the one action a page wants. The colour of annotation ink on a technical plate.",
    usage: "text",
  },
  {
    token: "signal-dim",
    hex: "#6B5C1B",
    role: "Signal at rest on the study ground, where full citrine would be too loud on paper.",
    usage: "hairline",
  },
];

export const INK = "#0A0F14";
export const BONE = "#E6E3DA";

/** Every text colour, paired with the ground it is allowed to sit on. */
export const TEXT_ON_GROUND: Array<{
  fg: string;
  fgToken: string;
  bg: string;
  bgToken: string;
}> = [
  { fgToken: "chalk", fg: "#F4F3EF", bgToken: "ink", bg: INK },
  { fgToken: "steel", fg: "#8A95A1", bgToken: "ink", bg: INK },
  { fgToken: "signal", fg: "#E3C74B", bgToken: "ink", bg: INK },
  { fgToken: "ink", fg: INK, bgToken: "bone", bg: BONE },
  { fgToken: "ink", fg: INK, bgToken: "signal", bg: "#E3C74B" },
  { fgToken: "signal-dim", fg: "#6B5C1B", bgToken: "bone", bg: BONE },
  { fgToken: "slate", fg: "#5A5F63", bgToken: "bone", bg: BONE },
];
