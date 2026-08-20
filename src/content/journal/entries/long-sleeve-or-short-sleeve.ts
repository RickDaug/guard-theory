import type { PublishedArticle } from "../types.ts";

/**
 * The hard part of this piece was not the answer, it was refusing three of them.
 *
 * Sleeve length is the most-asked rash guard question and almost every existing
 * treatment of it answers with a health claim, a thermal claim or a performance
 * claim. All three are unavailable here: the standing prohibitions rule out
 * medical and hygiene claims outright, and the compression and sports-clothing
 * literature — read for this article rather than cited from memory — does not
 * support the thermal one either.
 *
 * What is left is genuinely useful: the rulesets do not decide it, the research
 * does not decide it, and the reasons that remain are ones a reader can check
 * against their own room. The house line on compression, set in
 * how-a-bjj-rash-guard-should-fit, is preserved exactly.
 */
export const longSleeveOrShortSleeve: PublishedArticle = {
  status: "published",
  publishedAt: "2026-08-19",
  authorId: "steven-p",
  slug: "long-sleeve-or-short-sleeve",
  category: "equipment-and-apparel",
  title: "Long sleeve or short sleeve",
  standfirst:
    "Neither ruleset decides it and the research does not either. What is left is a smaller question than the internet makes it, and it has an answer.",
  sections: [
    {
      id: "the-question-under-the-question",
      heading: "The question under the question",
      paragraphs: [
        "Ask which sleeve length is better and you will get a confident answer in about four seconds. Ask why, and the answers separate into three kinds: a rule you must follow, a thermal effect you will feel, and a protective benefit you will get. This piece takes all three seriously enough to go and check them, and two of the three do not survive.",
        "That is not a disappointing result. It narrows the question to the part you can actually evaluate, which is your own training, your own room and what you personally want your forearms to be doing.",
      ],
    },
    {
      id: "the-rules-do-not-decide-it",
      heading: "The rules do not decide it",
      paragraphs: [
        "The IBJJF rule book sets out no-gi attire at clause 8.1.16. On shirts it requires \"a shirt of elastic material (skin tight) long enough to cover the torso all the way to the waistband of the shorts, colored black, white, or black and white, and with at least 10% of the rank color(belt) to which the athlete belongs\", and permits shirts that are entirely the rank colour instead.",
        "There is no sleeve requirement in that clause, or anywhere else in the document that applies to no-gi. The word appears often in the rule book and every occurrence is a gi clause — sleeve length at 8.1.7, sleeve width and slack in the measurement list, sleeve grips in the prohibitions. We went through the extracted text of the whole PDF to be sure of that, because it is an absence and absences are easy to assert carelessly. The longer version of this reading is in our piece on the no-gi uniform rules.",
        "The other ruleset most no-gi competitors will meet is the ADCC's. Its published rules and regulations page sets out match structure, scoring, penalties and a list of prohibited techniques. It contains no uniform requirement at all — no attire section, no mention of a rash guard. Clothing appears twice: once to say \"Gi (Kimono), Wrestling shoes are optional\", and once in the prohibition on \"No use holding of the T-Shirt or shorts\", which is a grip rule. The page carries no version number and no revision date, which is worth knowing before you rely on any summary of it.",
        "So: two rulesets, neither of which regulates sleeve length. If a shop, a coach or a product page tells you one length is required for competition, ask which clause. There is not one.",
      ],
    },
    {
      id: "the-heat-argument",
      heading: "The heat argument, and what the research actually says",
      paragraphs: [
        "The intuitive claim is that a long sleeve is hotter. It is plausible and it may well be true of your experience. It is not something the literature currently establishes, and it is worth being precise about what has and has not been measured, because this is where most writing on the subject quietly invents a number.",
        "The largest recent synthesis of the compression-garment research is a systematic scoping review by Weakley and colleagues in Sports Medicine in 2021, covering 183 studies. Thermoregulation was the subject of nineteen of them — around ten per cent of the field. Their summary of that subset is that compression garments increase skin temperature at the point of coverage, and that these changes do not influence core body temperature, sweat rate or body mass loss. In hot environmental conditions, between 32 and 40 degrees, they describe the evidence as conflicting.",
        "The other relevant body of work is on sports clothing generally. A 2022 narrative review in Sports Medicine - Open by Di Domenico, Hoffmann and Collins looked at fabric and fit in exercise in the heat and found the picture unsettled in the same way. On materials it reports that \"few studies have identified significant differences in thermo-physiological...measures between natural and synthetic fabrics\". On fit — the question closest to this one — it states plainly that \"very few studies have compared the impact of tight-fitted and loose-fitted clothing on thermoregulation...during exercise in the heat\". Its overall verdict on the field is that \"Disparities across methodologies, and insufficient applications of thermal-physiological and perceptual strain, have led to mixed findings\".",
        "The one property that review found more consistent than fabric type was air permeability — how readily a fabric exchanges air. That points somewhere useful and slightly awkward for the question in the title: the variable with the better evidence behind it is a property of the fabric, not the length of the sleeve. A tightly knitted long sleeve and a loosely knitted long sleeve are not the same garment, and comparing a long sleeve to a short sleeve almost never holds fabric constant.",
        "None of this research put a rash guard on a grappler. That is the same position we took on compression and recovery in how a BJJ rash guard should fit, and nothing found for this article changes it. We are not going to tell you a long sleeve will make you hotter by some amount, because nobody has measured that.",
      ],
    },
    {
      id: "skin-contact",
      heading: "Skin contact, stated without a claim",
      paragraphs: [
        "The other common argument for long sleeves is about what happens where your forearm meets the mat and the other person. We are not going to make that argument, and it is worth saying why rather than just leaving it out.",
        "Claims in this area are medical claims. Whether a garment reduces skin abrasion, or affects the transmission of anything between training partners, is a question for infection and injury research, and it is not a question a manufacturer should answer about its own product on the strength of it being obvious. Our editorial policy rules out medical and hygiene claims, and this is exactly the case it exists for.",
        "What can be said without a claim is the mechanical difference, which is simply that one garment puts fabric between your forearm and the mat and the other does not. What that is worth to you depends on your skin, your room and your training, and you are better placed to judge it than we are.",
      ],
    },
    {
      id: "grip-and-friction",
      heading: "What actually changes on the forearm",
      paragraphs: [
        "There is a real difference between the two garments and it is not thermal. In no-gi there is no cloth to grip, so control is built on the body: wrists, elbows, the crook of the arm, the head, hips. A long sleeve changes what one of those surfaces presents. Your forearm offers fabric rather than skin, and fabric on fabric behaves differently from skin on skin.",
        "We are deliberately not going to quantify that, in either direction. We are not aware of a study measuring grip friction on a covered versus uncovered forearm in grappling, and if one exists we have not read it. Anyone telling you a long sleeve makes you harder to grip, or easier, is describing their own experience — which is legitimate as experience and is not a finding.",
        "What is worth knowing is that this is the variable most likely to matter to you, and it is testable in a way the thermal argument is not. It shows up in a single round, against a partner who grips your wrists, and you do not need a study to notice it.",
      ],
    },
    {
      id: "a-decision-rule",
      heading: "A decision rule, and where it breaks",
      paragraphs: [
        "If you want a rule rather than a survey: buy the short sleeve first if your room is warm and your sessions are long, and buy the long sleeve first if you want your forearms covered for reasons you already know. Then own both, because the second one is not a duplicate.",
        "That rule breaks in three places, and they are worth naming. It breaks if your room enforces a uniform, in which case the room decides and nothing here applies. It breaks if you are buying for a specific competition, in which case read that event's own rules rather than a general one — requirements differ by division and by event, and rule books are revised. And it breaks on fit: a rash guard that does not stay put is a worse garment at either length, which is a question of cut and construction rather than sleeves, and we have written about it separately.",
      ],
    },
    {
      id: "what-we-chose",
      heading: "What we chose, and what that commits us to",
      paragraphs: [
        "Guard Theory makes both lengths, which is a disclosure rather than a recommendation: we have an interest in you concluding that the question is genuine. It is also why this piece leans as hard as it does on the primary documents. The most useful thing we can do with the question is publish the reasoning and let you disagree with it.",
        "What we will not do is settle it with a claim we cannot support. Both lengths are legal under both rulesets we have read. The thermal literature is thin and mixed and does not cover grappling. The protective argument is a medical one and is not ours to make. The one difference we are confident about is what your forearm presents to a grip, and you can test that yourself this week.",
        "The specification for both garments is published in full on each product page — fabric, weight, seam construction, print method — because that is what you are actually choosing between once the sleeve question stops being a rule and starts being a preference.",
      ],
    },
  ],
  sources: [
    {
      title:
        "IBJJF Rule Book, clause 8.1.16 No-Gi attire requirements, which states no sleeve-length requirement; gi sleeve clauses at 8.1.7 and in the 8.1.11 measurement list. PDF filename 2024JUN_IBJJF_Rules_EN.pdf; page footer reads VERSION 6.1 2024",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-08-19",
    },
    {
      title:
        "ADCC Rules and Regulations: contains no uniform or attire requirement; clothing appears only as \"Gi (Kimono), Wrestling shoes are optional\" and in the grip prohibition on holding the T-shirt or shorts. Published without a version number or revision date",
      publisher: "Abu Dhabi Combat Club",
      url: "https://adcombat.com/adcc-rules-regulations/",
      accessed: "2026-08-19",
    },
    {
      title:
        "Weakley J, Broatch J, O'Riordan S, Morrison M, Maniar N, Halson SL. Putting the Squeeze on Compression Garments: Current Evidence and Recommendations for Future Research: A Systematic Scoping Review. Sports Medicine 2021;52(5):1141-1160. doi:10.1007/s40279-021-01604-9. 183 studies, of which 19 thermoregulatory",
      publisher: "Sports Medicine, via PubMed Central",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9023423/",
      accessed: "2026-08-19",
    },
    {
      title:
        "Di Domenico I, Hoffmann SM, Collins PK. The Role of Sports Clothing in Thermoregulation, Comfort, and Performance During Exercise in the Heat: A Narrative Review. Sports Medicine - Open 2022;8(1):58. doi:10.1186/s40798-022-00449-4",
      publisher: "Sports Medicine - Open, via PubMed Central",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9051004/",
      accessed: "2026-08-19",
    },
    {
      title:
        "Jovanovic T, Penava Z, Vrljicak Z. Impact of the Elastane Percentage on the Elastic Properties of Knitted Fabrics under Cyclic Loading. Materials 2022;15(19):6512. doi:10.3390/ma15196512. Measures elastic recovery under repeated loading, not thermal comfort",
      publisher: "MDPI, via PubMed Central",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9570736/",
      accessed: "2026-08-19",
    },
  ],
  relatedSlugs: [
    "how-a-bjj-rash-guard-should-fit",
    "ibjjf-no-gi-uniform-rules-read-carefully",
    "how-no-gi-rulesets-reshaped-technique-selection",
  ],
  contestedNotes: [
    "That neither the IBJJF rule book nor the ADCC published rules regulate sleeve length is an absence in both documents rather than a positive statement in either. Both were read for this article on the accessed dates given.",
    "The ADCC rules page is published without a version number or revision date, so it cannot be cited as of a particular edition — only as of the date it was read.",
    "The thermal research cited here concerns compression garments and sports clothing in general. None of it tested a rash guard in grappling, and this article makes no thermal, performance, recovery, hygiene or injury-prevention claim about either sleeve length.",
  ],
};
