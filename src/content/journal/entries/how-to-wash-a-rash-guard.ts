import type { DraftArticle } from "../types.ts";

/**
 * Equipment writing that refuses the rules-list format. Every published rule
 * about washing stretch knitwear turned out to be either a claim nobody has
 * measured on this fabric, or a claim about a different fabric. The article
 * says which is which, and names the variables that have actually been tested.
 */
export const howToWashARashGuard: DraftArticle = {
  status: "draft",
  slug: "how-to-wash-a-rash-guard",
  category: "equipment-and-apparel",
  title: "How to wash a rash guard",
  standfirst:
    "Most laundry advice for stretch knitwear is confident, unsourced and about a different fabric. Here is what has actually been measured, what the care label is really telling you, and what we could not find evidence for.",
  sections: [
    {
      id: "two-materials-one-garment",
      heading: "Two materials, one garment",
      paragraphs: [
        "A rash guard is not made of one thing, and it does not fail as one thing. The bulk of the yarn is a synthetic filament, usually polyester, doing the job of holding a shape and taking abrasion. Threaded through it is a much smaller percentage of elastane, the fibre also sold as spandex and under the Lycra trademark, doing the job of returning the fabric to its original dimensions after it has been stretched.",
        "Those two components fail in different ways and on different timescales. The polyester loses surface, pills and eventually thins where it is abraded. The elastane loses return. When people say a top has gone baggy at the elbows, or that it no longer sits flat across the shoulders, they are describing a loss of return, which is a property of the small fibre rather than the large one.",
        "That distinction decides what is worth caring about in a wash cycle. It also explains why so much laundry advice is unfalsifiable: it treats the garment as one material and then attributes any change in it to whichever variable the writer wanted to talk about.",
      ],
    },
    {
      id: "what-has-actually-been-measured",
      heading: "What has actually been measured",
      paragraphs: [
        "Two pieces of published work do most of the useful work here, and neither of them tested a rash guard.",
        "Jovanovic and colleagues, writing in Materials in 2022, knitted plated weft fabrics from polyamide with elastane percentages ranging from zero to forty-three per cent, then cyclically loaded them and calculated unrecovered elongation, elastic elongation and a hysteresis index. Their result was that the elastane percentage significantly affects the size of the elastic region of the fabric, the range within which unrecovered deformation completely disappears, and has no effect on the hysteresis index. Their conclusion was that the elastane percentage has to be optimised for each fabric design rather than simply increased.",
        "Sular and Oner, in Fibres and Textiles in Eastern Europe in 2019, took the question directly to the washing machine. They laundered twelve elastane knitted fabrics according to ISO 6330, in a home-type front-loading machine at forty degrees with a non-phosphate detergent, and measured cyclic deformation after zero, five, fifteen and twenty-five wash cycles at four different recovery times. They report that the effect of repeated washing on residual extension is gradual rather than sudden, that five and fifteen cycles were the significant thresholds in their fabrics, and that fabric construction, specifically the ground yarn and the gimped elastane yarn, changed how much residual extension a fabric was left with. They also cite earlier work by Lau and colleagues reporting resilience values decreasing by ten to twenty per cent after sixteen washing cycles.",
        "Read those two together and the finding that matters is not about temperature or detergent at all. It is that washing a stretch knit changes its recovery whatever you do, that the change accumulates gradually, and that the fabric's own construction determines how fast. A forty-degree wash with a mild detergent, which is close to the gentlest realistic domestic cycle, was enough to produce measurable change.",
        "One honest limitation. The Jovanovic fabrics were polyamide and elastane; the Sular and Oner fabrics were viscose with polyamide and elastane gimped yarns. Neither is the polyester-dominant knit that most rash guards are made from, and neither study was designed to describe one. They tell you which property to watch. They do not tell you what your top does.",
      ],
    },
    {
      id: "the-dryer-and-the-washing-line",
      heading: "The dryer, the washing line, and the one aging study",
      paragraphs: [
        "The usual instruction is to skip the tumble dryer and hang the garment up. We could not find a study that measured tumble drying against line drying for this fabric class, so that instruction is not something this article can support with evidence.",
        "What has been measured is the other end of the same choice. A 2024 study in Fibers and Polymers subjected warp-knitted swimwear fabric to artificial weathering for 120 and 240 hours and measured breaking force, elongation at break, air permeability, fabric elasticity and stiffness, and dimensional characteristics, alongside electron microscopy and infrared spectroscopy. Ultraviolet exposure was the dominant factor: breaking force, elongation at break, elasticity, stiffness and air permeability were all strongly affected, micro-damage was visible under the microscope, and no chemical destruction showed in the infrared spectra. The authors also tested seawater treatment and found its effect usually minimal or not distinctive.",
        "That is a study of sun exposure over hundreds of hours on swimwear, not of an afternoon on a balcony. It does not license a rule. What it does establish is that ultraviolet light is a real and measured degradation pathway for this family of fabrics, which puts a question mark over the most common piece of advice in the category, and means that hanging a stretch garment in direct sun to dry it is not obviously the conservative option it is usually presented as.",
      ],
    },
    {
      id: "odour-is-a-fibre-question-first",
      heading: "Odour is a fibre question before it is a washing question",
      paragraphs: [
        "The complaint that survives the wash is usually smell, and the research on it points at the fibre rather than the cycle.",
        "Callewaert and colleagues, in Applied and Environmental Microbiology in 2014, collected T-shirts from twenty-six people after an intensive indoor cycling session, incubated them for twenty-eight hours, and had a trained odour panel assess them. The panel found significant differences between polyester and cotton on the hedonic value, the intensity and five qualitative odour characteristics: the polyester shirts smelled significantly less pleasant and more intense than the cotton ones. The paper attributes the difference to differential microbial growth on the two fibre types, reporting micrococci in almost all the synthetic shirts and on almost none of the cotton ones, with staphylococci abundant on both.",
        "This article makes no hygiene, health or infection claim on the back of that, and the study makes none either; it is a study of odour development and of which organisms grow where. The practical reading is narrow and worth having anyway. If a synthetic top smells after training and a cotton one did not, that is a documented property of the material rather than evidence you washed it wrong, and no washing routine changes what the fabric is.",
      ],
    },
    {
      id: "what-we-could-not-source",
      heading: "What we could not source",
      paragraphs: [
        "Four claims that appear in nearly every published guide to washing stretch sportswear were cut from this article, and it is worth naming them rather than quietly leaving them out.",
        "A specific maximum wash temperature. There is a great deal of confident writing about thirty degrees against forty, and we could not open a study that tested wash temperature against elastic recovery in this fabric class. The one laundering study we could read used forty degrees throughout and did not vary it.",
        "Detergent chemistry. The claim that alkaline or enzymatic detergents attack elastane specifically is repeated everywhere. The laundering study used a non-phosphate detergent and did not compare formulations, so we have nothing to report.",
        "Chlorine. Chlorinated water is frequently blamed for elastane failure. The nearest study we could reach tested ultraviolet light and seawater rather than chlorine, and a 1987 paper on swimwear degradation that covers light, seawater and chlorine could not be opened for this pass. The claim may well be right. We cannot show it.",
        "Fabric softener. No source found in either direction.",
        "None of those four is a claim we can make, and none of them is refuted by the absence of evidence either. The point of listing them is that the writing you will find elsewhere states all four as fact, and that should tell you something about how it was produced.",
      ],
    },
    {
      id: "reading-the-care-label",
      heading: "Reading the care label as a specification",
      paragraphs: [
        "The most useful document you already own is the label, provided you read it as what it is rather than as advice.",
        "The care symbol system is administered by GINETEX, whose five symbols are protected trademarks and which describes itself as the origin of the ISO 3758 international standard on care labelling using symbols. The fourth edition of that standard, ISO 3758:2023, was published in December 2023 and replaced the 2012 edition.",
        "Two things GINETEX says about the symbols change how you should read them. The symbols indicate the maximum permitted treatment, not the recommended one, which means gentler handling than the label shows is always allowed and the number in the wash tub is a ceiling rather than a target. And care labelling is not a guarantee of quality: the label tells you what the manufacturer says the garment will tolerate, and the standard governs how that is expressed, not whether it is true.",
        "There are also published test methods behind the properties a manufacturer would need in order to know. ASTM D2594 covers stretch properties of knitted fabrics having low power and measures both fabric stretch and fabric growth, the residual extension left after the load comes off. AATCC maintains test methods for dimensional change and colourfastness in laundering. Almost nobody publishes results from any of them, including us, and that absence is why the checks you can run yourself carry more weight than they should have to.",
      ],
    },
    {
      id: "what-this-adds-up-to",
      heading: "What this adds up to",
      paragraphs: [
        "The measured variable is the number of wash cycles, not the ones people argue about. Recovery declines gradually with repeated laundering in the one study that tested it, at a mild temperature with a mild detergent, and construction changes the rate. Ultraviolet exposure is a documented degradation pathway for related fabrics. Odour is substantially a property of the fibre. Everything else in this article is a gap in the record rather than a rule.",
        "We are not going to tell you that any washing routine sanitises anything, prevents anything, or extends the life of a garment by a number of months, because we have no evidence for any of those sentences and neither does anybody selling you a detergent. We are also not going to publish a lifespan figure for our own garment, because it does not exist yet.",
        "If you want one thing to take from this, take the reframing rather than a rule. Each wash spends a little of a finite property, and the property being spent is return rather than strength. That is worth knowing when you decide how many training tops you want in rotation, and it is the only part of this that the evidence actually supports.",
      ],
    },
  ],
  sources: [
    {
      title:
        "Impact of the Elastane Percentage on the Elastic Properties of Knitted Fabrics under Cyclic Loading, Materials 15(19):6512 (2022)",
      publisher: "MDPI, via PubMed Central",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9570736/",
      accessed: "2026-08-03",
    },
    {
      title:
        "Vildan Sular and Eren Oner, Impact of Repeated Home Laundering on the Cyclic Deformation Performance of Elastane Knitted Sportswear Fabrics, Fibres and Textiles in Eastern Europe (2019), doi 10.5604/01.3001.0012.7513",
      publisher: "Fibres and Textiles in Eastern Europe (publisher file)",
      url: "https://publisherspanel.com/api/files/view/663399.pdf",
      accessed: "2026-08-03",
    },
    {
      title: "Impact of Artificial Weathering on Swimwear Fabric, Fibers and Polymers (2024)",
      publisher: "Springer",
      url: "https://link.springer.com/article/10.1007/s12221-024-00579-4",
      accessed: "2026-08-03",
    },
    {
      title:
        "Microbial odor profile of polyester and cotton clothes after a fitness session, Applied and Environmental Microbiology 80(21), 6611-6619 (2014)",
      publisher: "American Society for Microbiology, via PubMed Central",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4249026/",
      accessed: "2026-08-03",
    },
    {
      title:
        "Care labelling: basic principles, the five care symbols, and ISO 3758:2023",
      publisher: "GINETEX, International Association for Textile Care Labelling",
      url: "https://www.ginetex.net/care-labelling/",
      accessed: "2026-08-03",
    },
    {
      title:
        "ASTM D2594/D2594M-21, Standard Test Method for Stretch Properties of Knitted Fabrics Having Low Power",
      publisher: "ASTM International",
      url: "https://www.astm.org/d2594_d2594m-21.html",
      accessed: "2026-08-03",
    },
    {
      title: "AATCC test methods and standards development",
      publisher: "AATCC",
      url: "https://www.aatcc.org/testing",
      accessed: "2026-08-03",
    },
  ],
  relatedSlugs: ["how-a-bjj-rash-guard-should-fit"],
  contestedNotes: [
    "Neither elastane study cited here tested a polyester-dominant knit. Jovanovic and colleagues used polyamide with elastane; Sular and Oner used viscose ground yarns with polyamide and elastane gimped yarns. Rash guards are typically polyester-dominant, so both results are applied here as indications of which property to watch rather than as descriptions of any rash guard.",
    "The artificial-weathering study was conducted on warp-knitted swimwear fabric over 120 and 240 hours of accelerated exposure. It establishes ultraviolet light as a degradation pathway for that fabric family. It does not quantify what ordinary line drying does, and this article draws no drying rule from it.",
    "No source was found for a specific maximum wash temperature, for detergent chemistry, for chlorine, or for fabric softener in relation to elastane recovery. Those claims are stated as unsourced and omitted rather than softened. A 1987 paper on the degradation of swimwear fabrics by light, seawater and chlorine exists and could not be opened during this pass; it should be revisited before any chlorine claim is added.",
    "The odour study is reported as an odour-panel and microbiology finding only. This article makes no hygiene, infection or health claim, and none should be inferred from it.",
  ],
};
