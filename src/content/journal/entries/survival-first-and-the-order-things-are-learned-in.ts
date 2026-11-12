import type { DraftArticle } from "../types.ts";

/**
 * A foundational training-culture piece that treats "survive first" as a claim
 * about sequence and goes looking for where the sequence is written down.
 *
 * What is sourced: the five-part order of Ribeiro and Howell's book, from a
 * library catalogue record and not from the book's text; the belt attached to
 * each part, from the seller's page for the video course that follows the
 * book; the absence of any technical content in the IBJJF's graduation
 * document, read from the PDF; the order of the British Judo Association's
 * kyu syllabus, read from the PDF; the ecological objection to prescription,
 * from two open-access papers; and one competition study of positional
 * dominance.
 *
 * What is this site's own argument: the whole case for defence first in the
 * fifth section, which is built from two Technique Library entries because no
 * source read for the piece gives the reasoning in its author's words, and the
 * distinction between topic order and teaching method in the sixth. Both are
 * labelled in the body and recorded in contestedNotes.
 *
 * The piece ends without an answer because no study compares teaching orders.
 * It makes no medical, injury or safety claim, and the safety wording that
 * appears in the judo syllabus is deliberately not reproduced.
 *
 * Draft: no one has read and signed off this piece, so it carries no byline
 * and no date.
 */
export const survivalFirstAndTheOrderThingsAreLearnedIn: DraftArticle = {
  status: "draft",
  slug: "survival-first-and-the-order-things-are-learned-in",
  category: "training-culture",
  title: "Survival first, and the order things are learned in",
  metaTitle: "Survival first and the order of learning",
  standfirst:
    "Beginners are told to learn to survive before they learn to attack. That is a claim about sequence, so we went looking for where the sequence is written down, who argues against it, and whether anyone has tested it.",
  metaDescription:
    "Beginners are told to survive before they attack. Where that order is written down, the case for it, the case against, and what nobody has measured.",
  sections: [
    {
      id: "an-instruction-that-is-also-a-claim",
      heading: "An instruction that is also a claim",
      paragraphs: [
        "The instruction is familiar enough to be used as sales copy. BJJ Fanatics, selling Saulo Ribeiro's video course Jiu Jitsu University, lists \"Survive first, win later\" among the things a buyer will learn and calls it the survival-first approach. A person who walked in wanting to learn an armbar is told, in effect, that the armbar is scheduled for later.",
        "Said in a gym, it sounds like advice about patience. Read plainly, it is a claim about sequence: that defensive skill is a prerequisite for offensive skill and not just one more thing to learn, and that a beginner taught in that order ends up better off than one taught in another. A claim of that kind can be checked, at least in principle.",
        "So this piece asks four questions of it. Where is the order actually written down, and with what authority? What is the argument for it? What is the argument against? And has anybody measured whether it works? The last answer is the shortest.",
      ],
    },
    {
      id: "where-the-order-is-written-down",
      heading: "Where the order is written down",
      paragraphs: [
        "The clearest written version is a book. Jiu-Jitsu University, by Saulo Ribeiro with Kevin Howell, was published by Victory Belt in 2008. The San Francisco Public Library's catalogue record lists its contents as five parts, in this order: Survival, Escapes, The Guard, Guard Passing, Submissions. The same record carries the cover's description of the book as \"mapping out more than 200 techniques that carry you from white to black belt\".",
        "The belt attached to each part is easiest to verify from the video course that follows the book. The BJJ Fanatics product page breaks that series down as \"White Belt: Survival\", \"Blue Belt: Escapes\", \"Purple Belt: Guard\", \"Brown Belt: Guard Passing\" and \"Black Belt: Submissions\". Read as a table of contents, that places the part called Submissions last, under the black belt, with four other subjects in front of it.",
        "Two things about this source should stay in view. It is one author's design for presenting his own material, and a catalogue record and a sales page can confirm how a book is organised without confirming that any room trains that way. We have also not quoted the book's own reasoning, because what was read for this article was the catalogue record and the seller's page, not the text.",
      ],
    },
    {
      id: "what-the-federation-leaves-out",
      heading: "What the federation leaves out",
      paragraphs: [
        "The belts in that scheme are the IBJJF's, so it is reasonable to ask whether the federation says what belongs to each one. It does not. The General System of Graduation, in the June 2026 version, covers the belt ranks, minimum ages, minimum periods at each belt, the degree system, the requirements for a black belt certificate, which professors may sign a graduation, and provisional graduations. We searched its text for the vocabulary of a curriculum, including curriculum, syllabus, technique, defence, escape, submission, guard, mount and sweep, and found none of them used to describe what an athlete should know.",
        "What it offers instead is Article 3.2.2: \"The time taken to graduate the athlete from White Belt to Black Belt is at the professor's discretion.\" The federation then recognises the graduation only if its minimum times have been met. As the piece on dropout figures noted, those minimums bound how quickly a rank can be recognised. They say nothing about what was taught while the time passed, or in what order.",
        "So the order has no federation document behind it. Where a white belt is told to survive first, that is the room's decision, or the room's inheritance from whoever taught its coach.",
      ],
    },
    {
      id: "a-neighbouring-sport-that-publishes-an-order",
      heading: "A neighbouring sport that does publish an order",
      paragraphs: [
        "For contrast, one national governing body in a neighbouring sport prints the whole sequence. The British Judo Association's Kyu Grade Promotion Syllabus, in the edition revised in January 2025, sets out six kyu grades and the technical content for each promotion.",
        "The first promotion, from novice to 6th kyu, lists three breakfalls, three throws and three hold-downs, and then an escape from each of those three hold-downs. No armlock and no strangle appears in it. Joint locks arrive at the fourth promotion, from 4th to 3rd kyu, with a single armlock, juji-gatame, under a line reading \"Kansetsu-waza is introduced for this grade.\" Strangles arrive at the fifth, from 3rd to 2nd kyu, with the matching sentence: \"Shime-waza is introduced for this grade.\"",
        "This is not survival first in the book's sense. A judo novice throws and pins from the first grade, so attack and defence are taught side by side, each hold-down paired with its escape. What is deferred is the submission, which is the same thing the book's order defers. And the syllabus is firm about sequence, calling it \"vitally important that they all follow the progressive study of techniques detailed in this syllabus\".",
        "It is also candid that the sequence is a decision. Its introduction says of the 2025 revision that \"the order for some grades has been changed\". An order that can be rearranged between editions is a considered judgement, and it is not a finding. It is also judo's judgement, about a sport with its own rules, in a document that admits candidates to the kyu syllabus from 14 years of age. Nothing in it transfers to a no-gi room by default.",
      ],
    },
    {
      id: "the-argument-for-defence-first",
      heading: "The argument for defence first",
      paragraphs: [
        "No source read for this article sets out the reasoning in its author's own words, so what follows is this site's reconstruction of the case, built from two entries in the Technique Library. It is an argument, and it is labelled as one.",
        "The entry on positional hierarchy ranks positions by whose hips are free. Underneath side control or mount the hips are pinned and the arms are the only force left, and a submission attempted from there spends them on a person who can move away. If a newcomer's early rounds are spent largely underneath, which is our assumption and not a measurement, then attacking technique is knowledge they will seldom be placed to use, and escaping is what turns a pinned round into one where anything else can be practised.",
        "The entry on frames supplies the economic half. A frame holds distance with aligned bone and costs little to keep; a push with the arms runs out. Someone who can hold space cheaply has attention left for the rest of the lesson. On this reading survival is less a topic than a precondition, because it lowers the price of attempting everything that comes after it.",
        "The one grappling study with a bearing on this both supports it and complicates it. Spanias, Kirk and Ovretveit analysed 26 no-gi submission-only matches involving 52 male competitors at regional and international level. Time spent in positional dominance differed between winners and losers and correlated with upper-body submissions at r = 0.50. But athletes who won by lower-body submission, in most cases a heel hook, in the authors' words \"exerted no positional control prior to their victory\". That is competition footage of active competitors and it says nothing about teaching order. What it shows is that the ladder underneath the order has a measured exception.",
      ],
    },
    {
      id: "the-argument-against-a-fixed-order",
      heading: "The argument against a fixed order",
      paragraphs: [
        "The objection comes from ecological dynamics, the body of coaching theory behind the constraints-led approach, and it is aimed at prescription in general, not at jiu-jitsu. Woods and colleagues, in a 2020 commentary, describe practitioners moving away from ensuring that performers comply with the technical templates laid down in coaching manuals, and toward designing the environment in which skill emerges.",
        "Chow, Button, Lee, Morris and Shuttleworth, writing in Frontiers in Sports and Active Living in 2023, are blunter about the habit. One of them describes traditional teaching as aiming at \"a predetermined criterion movement form\", and the paper closes by asking readers to shift their mindset \"away from concepts like prescription and standardization\". A belt-by-belt list of what is learned when is prescription and standardisation in about as plain a form as a sport offers.",
        "Two limits apply. Neither paper mentions grappling, and neither tests anything; both are position papers. And the objection lands more squarely on how a skill is taught than on which subject comes first. A coach persuaded by it could still start beginners from bottom positions, using games in place of demonstrated sequences. The Technique Library's own progression for the positional hierarchy includes rounds that start in bottom side control with no submissions allowed, which is survival first delivered by a constraint. Topic order and teaching method are separate questions, and the slogan runs them together.",
        "The same paper concedes the cost of its own position. One author writes that a practitioner working this way may be \"unable to show cause and effect of their coaching\" in a form that clubs and federations value, and the conclusion says plainly \"we do not have all the answers\". The critics of the fixed order have no outcome study to point to either.",
      ],
    },
    {
      id: "what-nobody-has-measured",
      heading: "What nobody has measured",
      paragraphs: [
        "We found no study that taught two groups of grappling beginners in different orders and compared them on anything: skill, competition results, enjoyment, or whether they were still training a year later. The piece on positional sparring reached the same blank for its own subject, and the piece on dropout figures found that nobody has reliably counted who starts.",
        "A test is not hard to describe. It would need beginners allocated to a defence-first sequence and to some alternative, an outcome agreed before the start, and a follow-up long enough to matter, with the people who quit counted and not dropped from the table. Nothing like it appears to exist.",
        "What exists is this. One book arranges the art with survival first and submissions last. The federation whose belts label that arrangement prescribes no content at all. A judo governing body publishes a strict order that defers armlocks and strangles but not attack. There is a coherent mechanical argument for learning to be underneath first, a theoretical objection to fixed sequences of any kind, and no measurement on either side.",
        "That leaves the order as a tradition with good reasons attached, which is a respectable thing to be and a different thing from a result. The useful question for a beginner is not whether survival first is correct. It is which order this room teaches in, and whether anybody there chose it. This article makes no injury or safety claim for any order, and how a particular person should start is a decision for a coach who can see them.",
      ],
    },
  ],
  sources: [
    {
      title:
        "Jiu-jitsu University, by Saulo Ribeiro with Kevin Howell (Victory Belt, 2008): catalogue record, including the contents note and the cover description",
      publisher: "San Francisco Public Library",
      url: "https://sfpl.bibliocommons.com/v2/record/S93C2533289",
      accessed: "2026-11-11",
    },
    {
      title:
        "Jiu Jitsu University by Saulo Ribeiro: product page for the video course, including its belt-by-belt series breakdown",
      publisher: "BJJ Fanatics",
      url: "https://bjjfanatics.com/products/jiu-jitsu-university-by-saulo-ribeiro",
      accessed: "2026-11-11",
    },
    {
      title:
        "IBJJF General System of Graduation, June 2026 (PDF linked from the federation's graduation page): Article 3.2.2 and the document as a whole",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/graduation-system",
      accessed: "2026-11-11",
    },
    {
      title:
        "Kyu Grade Promotion Syllabus, revised edition January 2025: introduction and technical content, novice to 1st kyu",
      publisher: "British Judo Association",
      url: "https://britishjudo.org.uk/wp-content/uploads/2025/02/Kyu-Syllabus-January-2025.pdf",
      accessed: "2026-11-11",
    },
    {
      title:
        "Jia Yi Chow, Chris Button, Miriam Chang Yi Lee, Craig Morris and Richard Shuttleworth, \"Advice from 'pracademics' of how to apply ecological dynamics theory to practice design\", Frontiers in Sports and Active Living (2023), DOI 10.3389/fspor.2023.1192332",
      publisher: "PubMed Central",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10244496/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Carl T. Woods, Ian McKeown, Martyn Rothwell, Duarte Araujo, Sam Robertson and Keith Davids, \"Sport Practitioners as Sport Ecology Designers: How Ecological Dynamics Has Progressively Changed Perceptions of Skill Acquisition in the Sporting Habitat\", Frontiers in Psychology 11, 654 (2020), DOI 10.3389/fpsyg.2020.00654",
      publisher: "PubMed Central",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7194200/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Charalampos Spanias, Christopher Kirk and Karsten Ovretveit, \"Position before submission? Techniques and tactics in competitive no-gi Brazilian jiu-jitsu\", Revista de Artes Marciales Asiaticas 17(2), 130-139 (2022)",
      publisher: "Sheffield Hallam University Research Archive (SHURA)",
      url: "https://shura.shu.ac.uk/31193/",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "drilling-rehearsing-and-positional-sparring",
    "the-dropout-number-nobody-can-source",
  ],
  contestedNotes: [
    "We found no study comparing the order in which grappling is taught on any outcome. Nothing in this article is evidence that a defence-first sequence works better or worse than an alternative, and the article does not say that it does.",
    "The structure of Jiu-Jitsu University is taken from a library catalogue record, and the belt attached to each part from the seller's page for the video course that follows the book. The text of the book was not read for this article, so its own reasoning is neither quoted nor paraphrased, and the belt labels are reported as the seller's description of the video series.",
    "The section setting out the argument for defence first is this site's reconstruction, built from the Technique Library entries on positional hierarchy and on frames. It rests on an assumption that a newcomer's early rounds are spent largely underneath, which is stated as an assumption and has not been measured.",
    "The British Judo Association syllabus is a judo document for candidates aged 14 and over. It is cited as an example of a governing body publishing a sequence, not as a model for jiu-jitsu, and its 2025 introduction records that the order for some grades was changed in that revision.",
    "The two ecological dynamics papers are position papers about coaching in general. Neither mentions grappling and neither reports an outcome study. The reading that their objection bears on teaching method more than on topic order is this site's interpretation, not a claim made by their authors.",
    "Spanias, Kirk and Ovretveit analysed 26 no-gi submission-only matches involving 52 male competitors. Their findings describe competition between regional and international athletes and cannot be read as evidence about beginners or about teaching order.",
  ],
};
