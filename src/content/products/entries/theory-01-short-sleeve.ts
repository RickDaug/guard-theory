import type { Product } from "../types.ts";

export const theory01ShortSleeve: Product = {
  slug: "theory-01-short-sleeve",
  name: "Theory 01",
  kind: "Short sleeve rash guard",
  status: "coming-soon",
  summary:
    "The short sleeve cut of the First Edition. Same construction as the long sleeve, drawn as a production flat.",
  description:
    "The short sleeve is the same garment with the sleeve terminated above the elbow. It exists because sleeve length is a genuine preference rather than a tier — neither version is the better one, and the waitlist asks which you would want so the first run can be split sensibly. Construction is shared with the long sleeve, so anything stated on that page applies here.",
  constructionPoints: [
    {
      code: "01",
      label: "Crew neck",
      note: "Bound rather than folded, so the seam allowance sits flat against the neck instead of stacking.",
    },
    {
      code: "02",
      label: "Raglan sleeve seam",
      note: "The seam runs from the underarm to the neckline rather than sitting on the shoulder point, which keeps a join out of the area that takes the most contact.",
    },
    {
      code: "03",
      label: "Sleeve end",
      note: "Terminated above the elbow with a single finished edge, matching the long sleeve's treatment.",
    },
    {
      code: "04",
      label: "Side seam",
      note: "A continuous seam from underarm to hem. Flatlock construction is shown on the drawing as a doubled line.",
    },
    {
      code: "05",
      label: "Hem",
      note: "Straight hem, drawn level front and back.",
    },
  ],
  specifications: [
    { label: "Fabric composition", value: "82% recycled polyester, 18% elastane" },
    { label: "Fabric weight", value: "240 gsm" },
    { label: "Seam construction", value: "Flatlock, four-thread" },
    { label: "Print method", value: "Full sublimation, dyed into the fibre" },
    { label: "Neck", value: "Crew, bound" },
    { label: "Sleeve", value: "Short" },
    { label: "Fit", value: "Athletic compression" },
    { label: "Care", value: "Cold wash, hang dry, no fabric softener" },
  ],
  sizeLabels: ["XS", "S", "M", "L", "XL", "XXL"],
};
