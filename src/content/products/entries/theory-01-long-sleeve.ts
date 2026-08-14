import type { Product } from "../types.ts";

export const theory01LongSleeve: Product = {
  slug: "theory-01-long-sleeve",
  name: "Theory 01",
  kind: "Long sleeve rash guard",
  status: "coming-soon",
  summary:
    "The First Edition long sleeve, drawn as a technical flat because no garment has been photographed yet and a rendering pretending otherwise would be a lie.",
  description:
    "Theory 01 is the first garment Guard Theory is making. It is a long sleeve no-gi rash guard designed inside the constraints of competition rulesets rather than around them, which is why it is drawn plainly and described in construction terms rather than adjectives. What you see below is the production flat. When the garment has been made and photographed, photography will be added — it will not replace this drawing, because the drawing is what states how the thing is built.",
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
      label: "Cuff",
      note: "Drawn without a separate banded cuff. The sleeve terminates in a single finished edge.",
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
    { label: "Sleeve", value: "Long" },
    { label: "Fit", value: "Athletic compression" },
    { label: "Care", value: "Cold wash, hang dry, no fabric softener" },
  ],
  sizeLabels: ["XS", "S", "M", "L", "XL", "XXL"],
};
