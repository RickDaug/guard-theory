import type { PublishedArticle } from "../types.ts";

/**
 * Argued from the primary PDF and almost nothing else.
 *
 * Every clause quoted here was read out of the rule book downloaded from
 * ibjjf.com/books-videos on the accessed date below, not from a summary. That
 * matters more than usual for this subject: the third-party summaries of the
 * no-gi uniform rules disagree with each other, and several of them state a
 * sleeve-length requirement that does not exist in the document.
 *
 * Two things in here are absences rather than statements — no sleeve rule, and
 * no certification scheme. Absences are the easiest thing to get wrong, so both
 * were checked by searching the whole extracted text rather than by reading the
 * uniform section alone.
 */
export const ibjjfNoGiUniformRulesReadCarefully: PublishedArticle = {
  status: "published",
  publishedAt: "2026-08-19",
  authorId: "steven-p",
  slug: "ibjjf-no-gi-uniform-rules-read-carefully",
  category: "competition-analysis",
  title: "The IBJJF no-gi uniform rules, read carefully",
  standfirst:
    "What the rule book actually requires of a no-gi competitor, which parts the product pages get wrong, and the requirement it never makes at all.",
  sections: [
    {
      id: "where-the-rules-live",
      heading: "Where the rules live, and which version you are reading",
      paragraphs: [
        "The IBJJF publishes its rule book as a PDF at ibjjf.com/books-videos. Everything below is quoted from that file. It is worth being specific about which file, because the site and the document do not quite agree: the download page labels it v6.0, the PDF is named 2024JUN_IBJJF_Rules_EN.pdf, and the footer printed on every page of the document itself reads VERSION 6.1 2024. We cite the footer, because the footer is on the thing you are actually reading.",
        "That is a small discrepancy and it does not change a single requirement. It is worth noticing anyway, because it is the first sign of the problem this piece is about. A rule book is a versioned document that supersedes itself, and almost everything written about it downstream — product descriptions, gym advice, blog summaries — is undated. When a summary and the PDF disagree, the PDF wins, and the only way to know they disagree is to open it.",
        "The no-gi requirements sit in section 8, under Uniform. The clause that does the work is 8.1.16. Two further clauses in 8.3 apply to no-gi as well and are routinely missed, because they are filed under general requirements rather than under the no-gi heading.",
      ],
    },
    {
      id: "the-rash-guard-clause",
      heading: "The rash guard clause, quoted",
      paragraphs: [
        "Clause 8.1.16 opens: \"For Jiu-Jitsu No-Gi, athletes should abide by the following attire requirements\". Under the sub-heading \"Shirts and Rash Guards\", in full:",
        "\"Both genders must wear a shirt of elastic material (skin tight) long enough to cover the torso all the way to the waistband of the shorts, colored black, white, or black and white, and with at least 10% of the rank color(belt) to which the athlete belongs. Shirts 100% the color of the athlete's rank (belt) are also permitted.\"",
        "A note follows it: \"For black belts a small red area will be tolerated, but must not decharacterize the athlete's rank color.\"",
        "Read that clause for what it actually constrains and the list is short. The material must be elastic and skin tight. The length must reach the waistband of the shorts. The colour must be black, white, or black and white, with at least ten per cent rank colour — or the whole shirt may be the rank colour instead. That is the requirement in its entirety.",
      ],
    },
    {
      id: "the-requirement-that-is-not-there",
      heading: "The requirement that is not there",
      paragraphs: [
        "Nothing in 8.1.16 says anything about sleeves. Not their length, not their presence.",
        "This is worth stating carefully, because it is an absence and absences are easy to assert and hard to check. The word \"sleeve\" does appear in the rule book, repeatedly — at 8.1.7, which requires that a gi top's sleeves come to no more than 2 cm from the athlete's wrist; in the measurement list at 8.1.11, which checks sleeve length, sleeve width and the slack in a gi sleeve; and in the grip prohibitions, which describe grabbing the opening of an opponent's sleeve. Every one of those is a gi clause. The no-gi attire clause does not mention sleeves at all.",
        "So a long sleeve rash guard and a short sleeve rash guard are, as far as this document is concerned, the same garment. Both satisfy 8.1.16 if they are elastic, skin tight, long enough in the torso and correct in colour. If you have been told that one of them is required, or that one of them is banned, that instruction did not come from here.",
        "What the clause does exclude, by requiring a shirt that covers the torso to the waistband, is competing bare-chested. It says nothing explicit about sleeveless tops, which is a genuine gap rather than a hidden rule — the clause requires a shirt with a stated torso length and stated colours, and stops.",
      ],
    },
    {
      id: "the-ten-per-cent",
      heading: "The ten per cent, and what the rule does not define",
      paragraphs: [
        "\"At least 10% of the rank color(belt) to which the athlete belongs\" is the most-quoted and least-read part of the clause. The adult ranks it refers to are white, blue, purple, brown and black; the IBJJF's graduation-system page describes the progression as running \"from White to Red\".",
        "Here is what the sentence does not say. It does not say ten per cent of what. Not of the front, not of the total surface area, not of the visible area when worn. It does not say how the proportion is measured, or by whom, or with what tolerance. It gives a number and leaves every term in it undefined.",
        "That is not a criticism of the federation so much as an observation about how the requirement gets transmitted. Downstream, the undefined number hardens into confident specifics — a percentage of the front panel, a stripe of a particular width, a sleeve-band convention — none of which appear in the document. If you are checking a garment against the rule, you are checking it against a proportion the rule declines to define, and the person applying it is an inspector at an event.",
        "The clause also offers an escape from the arithmetic entirely, in its second sentence: a shirt that is one hundred per cent the rank colour is permitted. For a white belt or a black belt that is a straightforward garment. It is the option least often mentioned in summaries of the rule, and it is the only one where the ten per cent cannot be got wrong.",
      ],
    },
    {
      id: "shorts-and-spats",
      heading: "Shorts and spats are separate clauses, and they are not symmetrical",
      paragraphs: [
        "For men, 8.1.16 requires \"Board shorts colored black, white, black and white, and/or the color of the rank (belt) to which the athlete belongs, without pockets or with the pockets stitched completely shut, without buttons, exposed drawstrings, zippers or any form of plastic or metal that could present a risk to the opponent, long enough to cover at least halfway down the thigh (no more than 15 cm from the knee), and no longer than the knee.\" It then permits \"compression shorts made of elastic material (skin tight) worn beneath the shorts\", in the same colours.",
        "For women, the clause reads differently: \"Shorts, compression pants (skin-tight spats) and/or compression shorts colored black, white, black and white, and/or the color of the rank (belt) to which the athlete belongs\", with the same prohibitions on pockets, buttons, zippers and hard fittings, and the same length requirement — halfway down the thigh, no more than 15 cm from the knee, no longer than the knee.",
        "The asymmetry is in the document, not in this summary. The women's clause names spats as a permitted garment in their own right. The men's clause permits compression shorts beneath board shorts and does not name full-length spats at all. Whatever the intent, a competitor reading the clause that applies to them will find two different lists.",
        "The length requirement is the one that catches people, because it is specific in both directions. Shorts must reach at least halfway down the thigh and come no more than 15 cm from the knee, and must not be longer than the knee. That is a window, not a minimum.",
      ],
    },
    {
      id: "the-clauses-filed-elsewhere",
      heading: "The clauses filed elsewhere that still apply",
      paragraphs: [
        "Clause 8.3.10 states: \"It is mandatory that athletes wear undergarments for all competitions, regardless if it is a Gi or No-Gi event. The undergarment should be 'brief-type' only.\" It is filed under further requirements rather than under no-gi attire, and it names no-gi explicitly. It is close to absent from the summaries.",
        "Clause 8.3.7 forbids \"any foot gear, headgear, hair pins, jewelry, cups (genital protectors), or any other protector fashioned of hard material that may cause harm to an opponent or the athlete him/herself\", and adds that eye protectors are forbidden \"even if they are made for sports practices\". Clause 8.3.9 forbids joint protectors — knee and elbow braces are the examples given — that \"increase body volume to the point of making it harder for an opponent to grip the Gi\".",
        "Clause 8.3.8 sets out the requirements for a head cover in the female divisions: fixed, made with elastic fabric or elastic at the borders, no plastic or hard materials, no strings, clear of any inscription or logo, and black, white, black and white, or the rank colour. A single-piece cover of the wet-suit type, covering neck, ears and hair, is permitted on the same colour terms.",
      ],
    },
    {
      id: "what-ibjjf-legal-is-worth",
      heading: "What \"IBJJF legal\" on a product page is worth",
      paragraphs: [
        "The rule book contains no provision for approving, certifying or listing a garment, a brand or a manufacturer. We looked for one. The only approval it describes is of an athlete's uniform, at the event: clause 8.1.11 states that \"Prior to weighing in, the inspector will verify that the specifications of the uniform meet regulations\", and the same section allows that \"Every athlete is entitled to 3 (three) uniform inspections for approval\". The subject of that sentence is the athlete, not the product.",
        "So a phrase like \"IBJJF legal\" on a product page is a manufacturer's reading of a clause. It is not a certification, because there is nothing to be certified by. It may well be an accurate reading — most of the requirements are simple enough — but it carries exactly as much authority as the person who wrote it, and it cannot be checked without doing what this piece did: opening the PDF.",
        "It is also, necessarily, a claim about a garment and not about you. The rank-colour requirement depends on your belt. A shirt that satisfies the clause for one competitor does not satisfy it for another, and no product page knows which one you are.",
      ],
    },
    {
      id: "reading-a-rule-book-as-a-constraint",
      heading: "Reading a rule book as a design constraint",
      paragraphs: [
        "There is a reason the no-gi category looks the way it does, and it is largely this clause. Black, white, black and white, or the rank colour, is not a shared aesthetic preference among a dozen brands. It is a colour requirement with four options in it, and the category converged on it because competitors buy garments they can compete in.",
        "That is a constraint worth designing inside rather than around, and it is the constraint Guard Theory started from. It also means the interesting decisions are elsewhere: in construction, in how a garment behaves when it is being gripped and dragged, in whether the specification is published at all. The rule book has already decided the colours.",
        "One practical closing note. Requirements differ by division and by event, they are versioned, and this article describes one document as it stood on the date below. Before an event, download the current PDF and read clause 8.1.16 yourself. It is four paragraphs long. Everything written about it, including this, is longer.",
      ],
    },
  ],
  sources: [
    {
      title:
        "IBJJF Rule Book, section 8 Uniform: clause 8.1.16 No-Gi attire requirements, clause 8.1.11 uniform inspection, clauses 8.3.7 to 8.3.10 further requirements, clause 8.1.7 gi sleeve length. PDF filename 2024JUN_IBJJF_Rules_EN.pdf; page footer reads VERSION 6.1 2024",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-08-19",
    },
    {
      title:
        "Books and Videos download page, which labels the current rule book v6.0 where the document footer reads v6.1",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-08-19",
    },
    {
      title:
        "Graduation System, describing the belt progression from White to Red and publishing the detail as separate downloadable documents",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/graduation-system",
      accessed: "2026-08-19",
    },
    {
      title:
        "New Rules Updates, the federation's own record that the rule book is revised and superseded",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/news/new-rules-updates",
      accessed: "2026-08-19",
    },
  ],
  relatedSlugs: [
    "how-no-gi-rulesets-reshaped-technique-selection",
    "how-a-bjj-rash-guard-should-fit",
  ],
  contestedNotes: [
    "The IBJJF download page labels the current rule book v6.0 while the footer printed on the document reads VERSION 6.1 2024. This article quotes the footer. The discrepancy does not affect any requirement quoted here.",
    "That the rule book states no sleeve-length requirement for no-gi is an absence rather than a statement, and absences can be created by a bad search. It was checked by extracting the full text of the PDF and reading every occurrence of the word \"sleeve\" in the document, all of which are gi clauses.",
    "The ten per cent rank-colour requirement is quoted exactly as written. The rule does not define what the proportion is measured against, and this article does not supply a definition the document does not contain.",
  ],
};
