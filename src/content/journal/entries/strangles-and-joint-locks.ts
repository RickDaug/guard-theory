import type { PublishedArticle } from "../types.ts";

/**
 * A glossary piece on the two families of submission. What is sourced is every
 * statement about how a document names or groups them: the Kodokan's English
 * list of judo technique names and its Katame-no-Kata textbook, the IBJJF rule
 * book, four Grapplearts articles by Stephan Kesting, and three entries in the
 * BJJ Mental Models database. Each was read from the raw page or from PDF text
 * on the accessed date, and counts, clause letters and row names are given as
 * printed.
 *
 * The IBJJF's table of prohibited holds did not keep its columns in text
 * extraction. The piece uses its row names as vocabulary and says nothing
 * about which division any row applies to.
 *
 * What is ours, and labelled as ours: the closing section's reading that the
 * family a hold belongs to tells a beginner what its defence is about. That
 * section is built on the Technique Library's entries on the armbar, the
 * kimura, the triangle, the head-and-arm strangles, the rear naked strangle
 * and the leg entanglement, and it is written to agree with them.
 *
 * The piece gives no medical, safety or injury-prevention advice and describes
 * no injury. It points to the Library's safety notes and does not restate
 * them.
 *
 * Draft: no author has read this piece, so it carries no byline and no date.
 */
export const stranglesAndJointLocks: PublishedArticle = {
  status: "published",
  publishedAt: "2026-11-11",
  authorId: "guard-theory-editorial",
  slug: "strangles-and-joint-locks",
  category: "technique-notes",
  title: "Strangles and joint locks: the two families of submission",
  metaTitle: "Strangles and joint locks: two families",
  standfirst:
    "Judo files its submissions in two families, the IBJJF rule book has one word for both, and instructors sort them by mechanism. A glossary, with its sources.",
  sections: [
    {
      id: "two-families-many-names",
      heading: "Two families, many names",
      paragraphs: [
        "A first year on the mat comes with a long list of submission names: armbar, kimura, triangle, guillotine, rear naked choke, heel hook, and whatever the coach calls the rest. The list is easier to hold once it is sorted, and the simplest sorting has two bins. A strangle attacks the neck. A joint lock attacks a limb at a joint.",
        "We read how four kinds of document draw that line: the Kodokan's English list of judo technique names and its textbook for Katame-no-Kata, the IBJJF rule book, articles Stephan Kesting has published at Grapplearts, and entries in the BJJ Mental Models database. They do not share a vocabulary.",
        "This is a glossary. It describes names and mechanics, and it gives no advice about training any of these holds. Each entry in our Technique Library carries its own safety note, and nothing here adds to them.",
      ],
    },
    {
      id: "how-judo-files-them",
      heading: "How judo files them",
      paragraphs: [
        "The Kodokan Judo Institute publishes its technique names in English, with a one-sentence definition of each. The list has two main headings: nage-waza, the throws, with 68 techniques, and katame-waza, with 32. Katame-waza is divided three ways, into osaekomi-waza (10 techniques), shime-waza (12) and kansetsu-waza (10). The Kodokan's English textbook for Katame-no-Kata glosses the three in one phrase: the kata teaches \"pinning, countering those pins, strangling and locking joints\". Two of the three families are submissions. The third is the pin.",
        "Several names on those lists are holds a no-gi beginner already knows. Hadaka-jime is defined as a choke applied from behind \"without using judogi\", and it is the hold our Library calls the rear naked strangle. Sankaku-jime is the triangle. Ude-hishigi-juji-gatame is the armbar, and ude-garami is the family our kimura article places that lock in.",
        "The definitions show what each family is made of. Eleven of the twelve shime-waza are defined as techniques to choke the neck region. The twelfth, do-jime, is a choke applied by \"holding his torso region between both legs\". Nine of the ten kansetsu-waza are defined as locks on the elbow joint, and the tenth, ashi-garami, as a lock on the knee joint. Within the elbow locks the wording separates two actions. Most are techniques to \"stretch and lock\" the joint, ude-garami is a technique to \"twist and lock\" it, and two definitions allow either.",
      ],
    },
    {
      id: "the-rule-books-single-word",
      heading: "The rule book's single word",
      paragraphs: [
        "The IBJJF rule book does not divide submissions into families. We read the PDF its site links today, marked version 6.1 and dated 2024. Article 2 defines a submission as a way a match ends, by a tap, a verbal withdrawal or a cry of pain, and our piece on what a tap is reads those clauses closely. The thing being applied is a \"submission hold\" throughout: in Article 1's clauses on the match area, in Article 3 on scoring, and in clause 5.3, which awards an advantage for an attempt that leaves the opponent \"in real danger of submitting\". The phrase is not defined in the text we extracted, and it covers a strangle and a joint lock alike.",
        "Individual holds are named in one place. Clause M of section 6.2.3, the severe fouls, applies when an athlete \"applies a hold prohibited for his/her respective division, as indicated in the following table\". The table's columns are age groups and belt ranks, and its rows are names. Read as vocabulary, the rows use several words for an attack on a limb: \"Wrist lock\", \"Straight foot lock\", \"Knee bar\", \"Toe hold\", \"Heel hook\", \"Bicep slicer\", \"Calf slicer\" and \"Locks twisting the knees\". Attacks on the neck are chokes or are named by their shape: \"Frontal guillotine choke\", \"Arm triangle\", and a pair that sets the choke against something else, \"Choke with spinal lock\" and \"Spinal lock without choke\".",
        "The table did not come through text extraction with its columns intact, so we report its row names and nothing about which division each applies to. Our article on how no-gi rulesets reshaped technique selection describes how the answer changed in 2021 for the leg locks.",
      ],
    },
    {
      id: "strangles-blood-and-air",
      heading: "Strangles: blood and air",
      paragraphs: [
        "Instructors who write their systems down sort by mechanism. Inside the neck family the first cut is the one our Library entry on the blood choke and the air choke makes: pressure on the two sides of the neck against pressure on the front of the throat.",
        "Stephan Kesting drew it in two Grapplearts articles in 2005 and attached a word to each side. A strangle, he wrote, is \"a grappling technique that restricts the flow of blood through the carotid arteries\", and \"proper strangles attack mainly the SIDES of the neck\". Two weeks later: \"A choke is a submission which primarily cuts off the flow of air through the windpipe\".",
        "BJJ Mental Models keeps the two mechanisms and drops the two words. Its Choking Mechanics entry opens: \"There are five types of chokes: air, blood, crank, compression, and hybrid.\" Blood chokes are defined there as compressing the carotid arteries along each side of the neck, and air chokes as compressing the trachea.",
        "The Kodokan's English does not keep the words apart either. Its definitions say choke for all twelve shime-waza, and the kata textbook has Tori strangle in one technique of the set and choke in the next. Our Library entry notes that many coaches reserve strangle for the blood mechanic and choke for the airway one, while ordinary gym speech calls all of them chokes. In this piece strangle names the family, as shime-waza does, and blood and air name the two mechanisms inside it.",
      ],
    },
    {
      id: "joint-locks-which-joint-which-direction",
      heading: "Joint locks: which joint, which direction",
      paragraphs: [
        "Joint locks are sorted twice, by which joint and by which direction.",
        "On which joint, the 3 Joint Rule entry at BJJ Mental Models lists three to a limb: for the arm \"the wrist, elbow, and shoulder\", and for the leg \"the ankle, knee, and hip\". Several rows of the IBJJF table carry their joint in the name: a wrist lock, a knee bar, a foot lock. The Kodokan's ten kansetsu-waza name two joints only, the elbow and the knee.",
        "On direction, a 2019 Grapplearts article by Kesting, drawing on a course he made with Rob Biernacki, gives three mechanisms: rotation, extension and compression. Its examples are the kimura for rotation, the armbar for extension and the biceps slicer for compression. The Breaking Mechanics entry at BJJ Mental Models has the same three under the names linear, rotational and compression, and adds a hybrid class. Its linear examples are kneebars and armbars, its rotational examples heel hooks and kimuras, and calf slicers are among its compression examples. The Kodokan's stretch and twist are the first two.",
        "That is enough to sort the names. A straight arm lock is extension at the elbow: the armbar, and most of judo's elbow locks. A bent arm lock is rotation with the elbow bent: the kimura, with ude-garami as its judo family. Leg locks split the same way, with the kneebar as the straight example and the heel hook as the rotational one. The foot has names of its own. A 2017 Grapplearts article on leg locks in IBJJF competition lists the ankle lock, the toehold and the Estima lock beside the kneebar, the calf slicer and the heel hook.",
      ],
    },
    {
      id: "where-the-bins-leak",
      heading: "Where the bins leak",
      paragraphs: [
        "Three kinds of hold sit awkwardly, and the sources file them differently.",
        "The first is the kimura's target. The Kodokan defines ude-garami as a technique to twist and lock the elbow joint. Kesting describes the kimura as \"rotation of the arm relative to the shoulder\", and our Library entry treats it as a shoulder lock that depends on the elbow staying bent. Our kimura article records a third name, catch wrestling's double wristlock. The hold is one shape, and each name points at a different joint.",
        "The second is the neck crank. BJJ Mental Models lists the crank among its five types of choke and defines cranks as \"Holds that apply torque to the neck and spine.\" The IBJJF table's wording treats a spinal lock as a thing apart from a choke, which can come with one or without. None of the Kodokan's twenty-two shime-waza and kansetsu-waza is defined as acting on the spine. Our Library entry on the triangle meets the same edge: a triangle around a head alone drifts into a neck crank.",
        "The third is compression. Squeezing the torso with the legs is a shime-waza to the Kodokan, a compression choke to BJJ Mental Models, whose examples include the body triangle, and in the IBJJF table a \"Lock inside the closed guard with legs compressing kidneys or ribs\". The slicers are compression applied to a limb, and Kesting and BJJ Mental Models both put them with the joint locks.",
      ],
    },
    {
      id: "what-the-family-tells-the-defender",
      heading: "What the family tells the defender",
      paragraphs: [
        "What follows is our reading. It is built on the Library's entries and not on any of the documents above. The family a hold belongs to tells a beginner what the defence is about, before any particular escape has been learned.",
        "A joint lock needs a limb that has been cut off from the rest of the body. The Library's armbar entry gives the condition in a sentence: the joint above the elbow fixed, the joint below it held, and a lever between them. Its leg entanglement entry says every leg lock needs the same thing, because otherwise the limb follows the force. The kimura entry adds the rotational case, an elbow kept bent and pinned to the chest so that turning the wrist turns the shoulder. The lock itself comes last, as extension or rotation past a fixed point. So the defence in this family is about the limb. Either it is never isolated, or the fixed point is taken away: the elbow comes back to the ribs, the knee comes out from between the thighs, the body turns the way the force is going.",
        "A strangle needs the neck enclosed. The Library describes each one as a closed structure with the neck between two surfaces: forearm and bicep in the rear naked strangle, thigh and the defender's own shoulder in the triangle, arm and trapped shoulder in the head-and-arm group. Nothing is extended and no joint is fixed. The structure has to shut. So the defence in this family is about the enclosure. The chin and the hands get in its way, the choking wrist is held before the second arm connects, and a turn takes the neck out of line.",
        "A beginner caught in an unfamiliar hold can still ask which family it is. Is something trying to straighten or turn a limb, or to close around the neck? The answer says what the defence concerns and does not say how to do it. For that there are the Library entries, with their safety notes, and the single-technique pieces in this Journal.",
      ],
    },
  ],
  sources: [
    {
      title:
        "Names of Judo Techniques: Katame-waza (32 techniques), divided into Osaekomi-waza (10), Shime-waza (12) and Kansetsu-waza (10), with a definition of each. The page links a PDF titled Kodokan Definitions of Judo Techniques 01.10.2022",
      publisher: "Kodokan Judo Institute",
      url: "https://kdkjudo.org/en/techniques/names-of-judo-techniques/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Katame-no-Kata, English translated version (kata textbook PDF; adopted 10 April 1960, amended 1 February 2006; copyright 2014): Introduction and the list of techniques in Sets 1 to 3",
      publisher: "Kodokan Judo Institute",
      url: "https://kdkjudo.org/wp-content/uploads/2024/10/katame_no_kata.pdf",
      accessed: "2026-11-11",
    },
    {
      title:
        "IBJJF Rule Book (PDF filename 2024JUN_IBJJF_Rules_EN.pdf; page footer reads VERSION 6.1 2024): submission at 2.1; submission holds at the match-area clauses of Article 1, at 3.1.1 and 3.3, and at 5.3; severe fouls at 6.2.3, clause M, and the table of illegal moves that follows clause M",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-11-11",
    },
    {
      title: "Anatomy of a Strangle, by Stephan Kesting, dated 27 June 2005",
      publisher: "Grapplearts",
      url: "https://www.grapplearts.com/anatomy-of-a-strangle/",
      accessed: "2026-11-11",
    },
    {
      title: "Air Chokes, by Stephan Kesting, dated 11 July 2005",
      publisher: "Grapplearts",
      url: "https://www.grapplearts.com/air-chokes/",
      accessed: "2026-11-11",
    },
    {
      title:
        "3 Tips to Tighten Any Joint Lock Technique, by Stephan Kesting, dated 13 October 2019 (rotation, extension and compression; draws on The Submission Formula, made with Rob Biernacki)",
      publisher: "Grapplearts",
      url: "https://www.grapplearts.com/3-tips-to-tighten-any-joint-lock-technique/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Which Leglocks Are Allowed in IBJJF Competition?, by Stephan Kesting, dated 1 September 2017. Cited for the names of leg locks only; the rules it describes predate the 2021 change",
      publisher: "Grapplearts",
      url: "https://www.grapplearts.com/leglocks-allowed-ibjjf-competition/",
      accessed: "2026-11-11",
    },
    {
      title: "Choking Mechanics (database entry; unsigned and undated on the page)",
      publisher: "BJJ Mental Models",
      url: "https://www.bjjmentalmodels.com/choking-mechanics",
      accessed: "2026-11-11",
    },
    {
      title: "Breaking Mechanics (database entry; unsigned and undated on the page)",
      publisher: "BJJ Mental Models",
      url: "https://www.bjjmentalmodels.com/breaking-mechanics",
      accessed: "2026-11-11",
    },
    {
      title: "3 Joint Rule (database entry; unsigned and undated on the page)",
      publisher: "BJJ Mental Models",
      url: "https://www.bjjmentalmodels.com/3-joint-rule",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "what-a-tap-is",
    "the-armbar-from-closed-guard",
    "the-kimura-as-a-control-before-it-is-a-finish",
    "the-rear-naked-strangle-from-back-control",
    "how-no-gi-rulesets-reshaped-technique-selection",
  ],
  contestedNotes: [
    "The closing section, on what the family tells a defender, is this site's reading. It is assembled from our own Technique Library entries. None of the cited documents makes the argument, and it is a description of mechanics, not an instruction.",
    "Strangle and choke are not used consistently. Stephan Kesting's 2005 articles reserve strangle for the blood mechanic and choke for the airway one. BJJ Mental Models calls both chokes, and the Kodokan's English texts use both words for shime-waza. Using strangle for the whole family is a choice made for this piece.",
    "The IBJJF table of illegal moves lost its column alignment in text extraction. Row names are quoted as they extracted, matched against the federation's separate one-page illegal-moves sheet, and no claim is made about which age group or belt any row applies to. The statement that the rule book does not define the term rests on searching the extracted text and would miss text set inside images.",
    "The Kodokan names different joints from the ones jiu-jitsu sources name for what we take to be the same holds: its definition of ude-garami names the elbow, where Kesting and our Library entry name the shoulder for the kimura. We report both and have not tried to settle it. Matching judo names to no-gi names follows our Library entries and the Kodokan's own definitions.",
    "The BJJ Mental Models entries are unsigned and undated on the page. The Breaking Mechanics entry says four types in its summary line and three in the sentence after it, then lists four; we follow the list. The Grapplearts article on leg locks dates from 2017 and is cited for names, not for what any rule set currently allows.",
  ],
};
