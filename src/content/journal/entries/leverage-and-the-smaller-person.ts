import type { PublishedArticle } from "../types.ts";

/**
 * A philosophy piece that treats the sport's founding promise as a claim and
 * reads it against documents. What is sourced: one organisation's published
 * wording of the promise (Gracie Barra's About Us page, quoted as that
 * organisation's statement and nobody else's); the IBJJF's no-gi weight list
 * and the open class terms on the event page that links it; the IBJJF rule
 * book's clauses on the scale; the ADCC weight class page and rules page; the
 * New Jersey State Athletic Control Board's 2002 description of the early
 * no-weight-class format, used exactly as the early-UFC article uses it; and
 * one peer-reviewed systematic review of Brazilian jiu-jitsu athletes. Every
 * figure is given as printed in the document on the accessed date.
 *
 * What is ours, and labelled as ours: the plain lever mechanics in the second
 * section, the arithmetic on the gaps between weight limits, the reading that
 * a weight class is a rule book's admission that size matters, and the closing
 * argument that the promise is a claim about how much skill can offset, at an
 * exchange rate nobody has measured.
 *
 * The piece names no match result, ranks nobody, attributes no saying to any
 * individual and gives no training, medical or safety advice. It is consistent
 * with the early-UFC article (same regulator, same quotation, no outcomes) and
 * with the working definition of structure in the base, posture and structure
 * piece.
 *
 * Draft: no author has read this piece, so it carries no byline and no date.
 */
export const leverageAndTheSmallerPerson: PublishedArticle = {
  status: "published",
  publishedAt: "2026-11-11",
  authorId: "guard-theory-editorial",
  slug: "leverage-and-the-smaller-person",
  category: "training-culture",
  title: "Leverage, and the promise made to the smaller person",
  metaTitle: "Leverage and the smaller person",
  standfirst:
    "Jiu-jitsu is sold on the idea that technique lets a smaller person beat a larger one. Read against the sport's own rule books, the promise turns out to be true in a narrower form than the one usually stated.",
  metaDescription:
    "Jiu-jitsu promises that leverage beats size. The sport's own weight classes, its open divisions and the research say something narrower, and more honest.",
  sections: [
    {
      id: "the-promise-in-print",
      heading: "The promise, in print",
      paragraphs: [
        "The promise goes like this: jiu-jitsu is the art in which the smaller person can win, because leverage and technique count for more than size and strength. A newcomer tends to meet it before meeting a technique.",
        "It is easy to find in print. Gracie Barra, an organisation of jiu-jitsu schools, keeps what it calls a Legacy Wall on its About Us page, and its entry for Helio Gracie reads: \"A master of technique who refined Jiu-Jitsu for smaller practitioners, proving that leverage and skill can overcome strength and size.\" That is the organisation's sentence about its own lineage, and we quote it as the organisation's statement and nothing more. It is a fair sample of how the promise is worded: proving, overcome, strength and size.",
        "This piece treats that sentence as a claim and asks what the sport's own documents do with it. It names no match and no result, for the reason our article on the early UFC tournaments gives: outcomes from the period the promise leans on circulate in versions that cannot be checked against a primary record.",
      ],
    },
    {
      id: "what-a-lever-does",
      heading: "What a lever does, and what it does not",
      paragraphs: [
        "What follows in this section is plain mechanics and it is ours, not a finding from any study of grappling.",
        "A lever is a rigid thing turning about a pivot. A force applied far from the pivot balances a larger force applied close to it, and the price is distance: the long end has to travel further than the short end moves. Nothing is created. The lever converts a small force over a long path into a large force over a short one.",
        "Grappling is full of this. A grip at the wrist turns an arm about the shoulder more easily than a grip at the elbow does. Our piece on base, posture and structure describes structure as bone carrying force so that muscle does not have to, which is the same economy seen from the other side.",
        "The mechanics also set a limit that the slogan leaves out. A lever multiplies the force you bring to it, so more force in still means more force out. And levers are not issued only to the smaller person. The larger opponent has limbs too, usually longer and heavier ones, and can learn exactly the same technique. Leverage explains how a force can be made to go further. It does not say whose force wins.",
      ],
    },
    {
      id: "what-the-rule-books-do-about-size",
      heading: "What the rule books do about size",
      paragraphs: [
        "If technique reliably cancelled size, a competition would have no reason to weigh anybody. The two rule makers this site reads most often, the IBJJF and ADCC, weigh everybody who enters a weight division.",
        "The IBJJF's no-gi weight list, linked from its 2026 World No-Gi Championship page, divides adult and masters men into nine divisions. The first eight carry a maximum weight, taken in uniform: rooster at 122.6 pounds, light feather at 136.0, feather at 149.0, light at 162.6, middle at 175.6, medium heavy at 188.6, heavy at 202.0 and super heavy at 215.0. The ninth, ultra heavy, is printed with no maximum weight. Adult and masters women have eight divisions, from rooster at 103.0 pounds to heavy at 169.0, and a super heavy division with no maximum.",
        "The arithmetic is ours: each men's limit sits between 13 and 13.6 pounds above the one before it. On this list the federation does not match two adult men across more than about thirteen pounds until the last division.",
        "It enforces the lines, too. The event page says the official weigh-in happens immediately before the first fight, that only one attempt is allowed, and that athletes are disqualified if they weigh in heavier than their division's limit. The rule book says the same thing from the other side: clause 8.3.1 allows each athlete onto the official scale once.",
        "ADCC draws fewer lines and still draws them. Its weight class page gives the World Championship and Trials five men's classes, under 65.9, 76.9, 87.9 and 98.9 kilograms and over 99, and three women's classes, under 55.0, under 65.0 and over 65.0. For its other tournaments the same page prints eight adult men's classes, from under 60 kilograms to over 100.",
      ],
    },
    {
      id: "the-door-left-open",
      heading: "The door both rule books leave open",
      paragraphs: [
        "Both documents also keep a division with no weight line at all, and this is where the promise survives inside the rules.",
        "The IBJJF weight list has a final row, open class, marked free for adults. ADCC's table ends its men's column with a line that reads Absolute (Open) Class. The IBJJF rule book uses both words: clause 4.4.1 refers to the ultra heavyweight and absolute divisions, and clause 5.9 to the open class.",
        "Look at how the door is hung, though. At the 2026 No-Gi Worlds, the event page says athletes who placed first, second or third in their weight division are eligible to register for the open class, with adult black belts as the stated exception, all of whom may enter. For most belts, then, a competitor must first place among people their own size. For juvenile blue and purple belts even the open class is split in two, a light bracket from rooster to light and a heavy bracket from middle to ultra heavy.",
        "ADCC's rules page, for its part, anticipates what an open bracket produces. Its scoring clause for the mount provides that where there is a size difference between the fighters in an absolute match and the top fighter cannot get both knees to the mat, the referees decide whether there is enough control to score. A rule set does not write that sentence unless it expects very different bodies to meet.",
        "So the sport has not legislated the promise away. It has made it an optional extra: a separate bracket, entered by choice, alongside the weighed divisions and not in place of them.",
      ],
    },
    {
      id: "the-format-with-no-classes",
      heading: "The format that had no classes",
      paragraphs: [
        "The promise is often argued from early mixed martial arts, and the only description of that format we rely on is a regulator's. In its 2002 proposal for mixed martial arts rules, the New Jersey State Athletic Control Board wrote that it had been hesitant to sanction events, and gave as examples that the sport \"generally did not divide contestants into weight classes, had contestants participate in several matches on the same evening and did not provide time limits on either round or bout length\".",
        "The first rule the board then proposed, N.J.A.C. 13:46-24A.1, divides mixed martial artists into nine weight classes, from flyweight under 125.9 pounds to super heavyweight over 265.",
        "Our article on those tournaments argues that they were a demonstration and not a proof: a small bracket, self-selected entrants, conditions that the Unified Rules no longer permit. The same caution applies here. A format without weight classes showed that a smaller competitor could win. It could not show how often, or against how much extra weight, and the regulated sport that followed did not keep the format long enough for anybody to find out.",
      ],
    },
    {
      id: "what-has-been-measured",
      heading: "What has been measured",
      paragraphs: [
        "The direct test of the promise would measure skill and body mass together and report how much of one offsets how much of the other. In the searching done for this piece we did not find a peer-reviewed study that does that for grappling. That is a statement about our search, not about everything ever published.",
        "What we could read is adjacent. Andreato, Diaz Lara, Andrade and Branco published a systematic review of the physical and physiological profiles of Brazilian jiu-jitsu athletes in Sports Medicine - Open in 2017, covering 58 studies and 1,496 subjects and centred, by its own account, on athletes in the gi. Its conclusions include this sentence: \"Maximal dynamic, isometric and endurance strength can be associated with sporting success in Brazilian jiu-jitsu athletes.\" The supporting finding it reports is that bench press one-repetition maximum was greater in advanced or elite athletes than in non-advanced or non-elite ones.",
        "That is a comparison between groups at different competitive levels, not between opponents of different sizes, and an association is not a mechanism. But it points one way. Among people who compete, the more successful groups were not the weaker ones.",
        "The review also says what is missing. It asks for studies across different weight categories, in its words \"feather to heavy, as well as absolute\". The division in which the promise is actually put to the test is one the authors list among the things still to be studied.",
      ],
    },
    {
      id: "the-honest-shape-of-the-claim",
      heading: "The honest shape of the claim",
      paragraphs: [
        "Put the documents side by side and the promise changes shape. This last part is our argument.",
        "Weight classes exist because size matters. No federation explains its weight list in those words, but a list of limits thirteen pounds apart, enforced by disqualification at the scale, is not something a sport builds around a variable it believes technique has cancelled. The strong form of the promise, that size does not matter, is contradicted by the table a competitor registers against.",
        "The form that survives is comparative. Skill is worth something measured in weight: a trained person can give away some amount of mass to a less trained one and still prevail, and the amount grows with the gap in skill. Nothing in the rule books contradicts that. The open class is that claim offered as an invitation.",
        "What nobody has published is the exchange rate. How many kilograms a year of training is worth, whether the rate holds at the heavy end, whether it differs with and without the gi: in the material read for this piece, there is no number for any of it. Anyone who quotes one is guessing.",
        "The promise is still worth making in its narrower form. It says that the smaller person's disadvantage is real and that training reduces it. Both halves are needed, and a version that keeps only the second half is asking a lever to do something a lever does not do.",
      ],
    },
  ],
  sources: [
    {
      title:
        "About Us, including the Legacy Wall entry on Helio Gracie quoted here as the organisation's own statement",
      publisher: "Gracie Barra",
      url: "https://graciebarra.com/about-us/",
      accessed: "2026-11-11",
    },
    {
      title:
        "World IBJJF Jiu-Jitsu No-Gi Championship 2026 event page: open class eligibility, weigh-in terms, and the linked Jiu-Jitsu No Gi Weight List (pounds)",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/events/world-ibjjf-jiu-jitsu-no-gi-championship-2026",
      accessed: "2026-11-11",
    },
    {
      title:
        "Rule Book, version 6.1 (June 2024), linked from the federation's Books and Videos page: clauses 8.3.1, 4.4.1 and 5.9",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-11-11",
    },
    {
      title:
        "Official ADCC Weight Classes: World Championship and Qualifiers table, and the table for all other ADCC tournaments",
      publisher: "ADCC Submission Fighting World Federation",
      url: "https://adcombat.com/adcc-rules-regulations/official-adcc-weight-classes/",
      accessed: "2026-11-11",
    },
    {
      title:
        "ADCC Rules and Regulations, including the mount scoring clause that provides for a size difference in an absolute match",
      publisher: "ADCC Submission Fighting World Federation",
      url: "https://adcombat.com/adcc-rules-regulations/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Mixed Martial Arts Unified Rules of Conduct: proposed new rules N.J.A.C. 13:46-24A and 24B, proposal number PRN 2002-314, including the summary and the weight classes at 24A.1",
      publisher: "New Jersey State Athletic Control Board, Division of Law and Public Safety",
      url: "https://www.nj.gov/oag/sacb/docs/martial.html",
      accessed: "2026-11-11",
    },
    {
      title:
        "Leonardo Vidal Andreato, Francisco Javier Diaz Lara, Alexandro Andrade and Braulio Henrique Magnani Branco, \"Physical and Physiological Profiles of Brazilian Jiu-Jitsu Athletes: a Systematic Review\", Sports Medicine - Open 3 (2017), doi 10.1186/s40798-016-0069-5",
      publisher: "Sports Medicine - Open, via PubMed Central",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5306420/",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "what-the-early-ufc-tournaments-demonstrated",
    "base-posture-and-structure",
    "why-sport-jiu-jitsu-does-not-transfer-directly-to-mma",
  ],
  contestedNotes: [
    "The promise is quoted from one organisation's page as that organisation's statement. The sentence is about Helio Gracie and is Gracie Barra's wording; nothing here is attributed to him or to any other individual, and the historical claim inside the sentence, that anything was proved, is not endorsed by this article.",
    "The lever explanation is plain mechanics supplied by this site. No study of grappling is cited for it, and it is not offered as a measured account of any technique.",
    "That weight classes exist because size matters is this site's reading of the documents. Neither the IBJJF nor ADCC states a reason for its weight divisions in the pages read for this piece.",
    "No peer-reviewed study measuring how much skill offsets how much body mass in grappling was found in the searching done for this piece. That describes one search on one day. The systematic review cited compares groups of athletes by competitive level, mostly in the gi, and does not study matches between opponents of different sizes.",
    "The weight figures are those printed on the accessed date: the IBJJF's no-gi list in pounds as linked from one 2026 event page, and ADCC's tables, which that page publishes as images. Open class eligibility is given for that one IBJJF event; the weight list itself tells readers to check each tournament's rules.",
    "The early no-weight-class format is described only through the New Jersey State Athletic Control Board's 2002 characterisation of the sport as it then stood, as in this site's article on the early UFC tournaments. No bout, competitor or result is named.",
  ],
};
