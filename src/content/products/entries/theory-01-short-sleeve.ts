import type { Product } from "../types.ts";

export const theory01ShortSleeve: Product = {
  slug: "theory-01-short-sleeve",
  name: "Theory 01",
  kind: "Short sleeve rash guard",
  status: "coming-soon",
  summary:
    "The short sleeve cut of the First Edition, drawn as a flat.",
  metaDescription:
    "Theory 01 short sleeve no-gi rash guard from the First Edition, drawn as a flat alongside its long sleeve counterpart. Join the list for first access.",
  description:
    "The short sleeve version of Theory 01. It exists because sleeve length is a genuine preference rather than a tier — neither version is the better one.",
  // Callouts removed 2026-09-29: bound neck, raglan seam, cuff, flatlock side
  // seam and hem were asserted as this garment’s construction, and none was
  // supplied (docs/owner-decisions.md §3). They return with specSource: "owner".
  constructionPoints: [],
  specSource: null,
  specifications: [
    // Sleeve is what the product is (long or short). Nothing else here has
    // been supplied: the figures once shown were invented, and were removed on
    // 2026-09-29 (docs/owner-decisions.md §3). A value may only be filled in
    // with specSource: "owner" — enforced in tests/unit/content.test.ts.
    { label: "Fabric composition", value: null },
    { label: "Fabric weight", value: null },
    { label: "Seam construction", value: null },
    { label: "Print method", value: null },
    { label: "Country of manufacture", value: null },
    { label: "Neck", value: null },
    { label: "Sleeve", value: "Short" },
    { label: "Fit", value: null },
    { label: "Care", value: null },
  ],
  // No size range has been supplied. Sizes that can be bought come from the
  // owner’s variants in the portal (src/lib/catalogue), not from here.
  sizeLabels: [],
};
