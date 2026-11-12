import type { PublishedArticle } from "../types.ts";

/**
 * A foundational piece on the two roles in a drilled repetition, and on the
 * one that jiu-jitsu writing leaves unnamed.
 *
 * What is sourced: the glosses of tori and uke as a teaching text for the
 * International Judo Federation's Academy courses prints them; the Kodokan's
 * description of kata on its English site; the Kodokan's English textbooks for
 * Nage-no-Kata and Katame-no-Kata, read as PDF text, for what uke is written
 * as doing (the opening grip or blow, the step to protect stability, the
 * resistance, the attempts to escape, the signal); the IJF Kata Commission's
 * criteria for the evaluation dated January 2024, for the mistakes it assigns
 * to uke and to the pair; two IJF articles on the two forms; and four
 * published jiu-jitsu pages on being a partner in a drill (two on Grapplearts,
 * by Stephan Kesting and by Jason Scully, one by Easton Training Center and
 * one on ONE Championship's site), each quoted as itself.
 *
 * What is the site's own argument, and is labelled as such in the body: that
 * the receiving role has three parts, that it is half of every repetition,
 * that the receiver is the person who makes a drill a rehearsal or a resisted
 * repetition, and that a role with a name can be taught and corrected in a
 * way an unnamed one cannot. The counts of the words Tori and Uke are ours,
 * made on the extracted text.
 *
 * The piece describes roles. It gives no advice about training, makes no
 * medical or injury claim, and does not say that naming the role changes any
 * outcome; nothing read for it measures that. Four jiu-jitsu pages are
 * evidence about those four pages only.
 *
 * Draft: no one has read and signed off this piece, so it carries no byline
 * and no date.
 */
export const toriAndUke: PublishedArticle = {
  status: "published",
  publishedAt: "2026-11-11",
  authorId: "guard-theory-editorial",
  slug: "tori-and-uke",
  category: "training-culture",
  title: "Tori and uke: the job of the partner being drilled on",
  metaTitle: "Tori and uke: the partner being drilled on",
  standfirst:
    "Every drilled repetition has two people in it. Judo names both and writes down what the receiving one does. The jiu-jitsu pages read here describe the same job and call the person a partner.",
  metaDescription:
    "Judo names both people in a drill: tori performs, uke receives. What the Kodokan and the IJF ask of uke, and what jiu-jitsu writes about the same job.",
  sections: [
    {
      id: "two-jobs-and-a-name-for-one",
      heading: "Two jobs, and a name for one of them",
      paragraphs: [
        "When a technique is drilled, two people are working. One performs the movement. The other is the person it is performed on, and then they swap. The four jiu-jitsu pages read for this piece call that second person a partner or a training partner, which is also what they call the first. None of them has a word for the job itself.",
        "Judo has one. A teaching text prepared for the International Judo Federation's Academy courses, which says its terminology follows the Kodokan's Japanese-English dictionary of judo, puts the two roles at the head of its list of terms. Tori is glossed \"doer\" and \"the thrower\": \"The person who applies a throw or other technique during repetition (uchikomi) or controlled (yakusoku) practice.\" Uke is glossed \"receiver\" and \"the thrown\": \"The person who receives a technique during repetition (uchikomi) or controlled (yakusoku) practice.\"",
        "This piece reads what judo's own documents ask of the receiver, then what jiu-jitsu has written about the same job. It ends with an argument that is ours and is marked as ours. It describes roles and gives no advice about training.",
      ],
    },
    {
      id: "what-the-throwing-form-asks-of-uke",
      heading: "What the throwing form asks of uke",
      paragraphs: [
        "The Kodokan publishes English textbooks for its kata. Its site describes kata as practice \"following a formal system of prearranged exercise\" and sets it against free practice. The textbook for Nage-no-Kata, which the site translates as forms of throwing, states its purpose in the introduction: the basis of throwing \"is acquired by practice of Kuzushi, Tsukuri, Kake and how to receive the technique\". Receiving is in the purpose statement, next to the throw.",
        "In the text itself the first movement is often uke's. Many techniques begin \"Uke attempts to grasp Tori\". In four, by the listing in the federation's judging criteria, uke opens with a blow to the top of tori's head. Tori acts second, and the textbook's recurring phrase for it is \"Tori seizes this opportunity\".",
        "Uke is then written as someone who does not want to be thrown. Pulled forward, uke steps \"so as to try to protect his stability\", a phrase the textbook repeats through the form. In Tomoe-nage, \"Uke resists Tori's push and attempts to push back\", and the throw goes in \"At the moment Uke pushes back\". In Yoko-guruma uke \"suddenly bends his upper body forward to try to avoid the throw\", and tori takes \"the opportunity of Uke's defensive posture\" to throw a different way. In each case the reaction is what makes the throw possible, and the reaction is uke's part of the script.",
        "A count points the same way. In the text extracted from the two textbooks read here, the word Uke occurs more often than the word Tori: 215 times to 174 in the throwing form, and 237 to 141 in the form of holds.",
      ],
    },
    {
      id: "on-the-ground-uke-resists-then-signals",
      heading: "On the ground, uke resists and then signals",
      paragraphs: [
        "Katame-no-Kata, in the Kodokan site's translation forms of grappling or holding, has fifteen techniques in three sets of five. Its textbook says the form teaches \"correct methods of pinning, countering those pins, strangling and locking joints\". Countering the pin is listed with the pin.",
        "For the first hold uke lies on his back \"with both arms along the side of his body\". Once the hold is on, the text reads \"Uke tries to escape, for example, by\", and three attempts follow, closed with \"and so forth\". All five holds are written that way. Then, in the textbook's words, uke finally signals \"Mairi\" when he cannot escape tori's control. The signal is given by \"tapping Tori's body or the mat twice with his hand\", or by tapping the mat twice with a foot when neither hand can be used. In the strangles and joint locks uke makes one attempt, and the sentence shortens: he tries to escape, but signals \"because he cannot escape\".",
        "Read in order, the receiver in this form has three jobs: to give the position, to try to get out of it, and to say when the attempt has failed. Our piece on the tap read five competition rule sets on the last of the three. The kata textbook also scripts the attempt that comes before it.",
      ],
    },
    {
      id: "judges-score-the-pair",
      heading: "Judges score the pair",
      paragraphs: [
        "The International Judo Federation runs kata as a competition, and its Kata Commission publishes the criteria the judges use. The version dated January 2024 lists six criteria for each technique, among them efficiency, realism and fluidity. The score it describes belongs to two people: a forgotten technique halves \"the total final score of the pair\".",
        "Several of the listed mistakes are uke's. Among the situations that score zero for a technique: \"Uke doesn't move, Tori grabs Uke and does the action.\" A big mistake is recorded \"If Tori or Uke does the full action correctly but the other does not apply the correct principle of action, attack or technique.\" Among the elements observed in the first throw is \"When Uke is thrown, he doesn't jump\". For the holds: \"During each technique Uke must demonstrate three attempts to escape.\"",
        "Two articles the federation published in September 2026 say the same in prose. On the throwing form: \"The work does not belong to tori alone.\" Uke \"attacks, gets into position, reacts and receives the technique with precision\". On the form of holds: \"Uke does not merely submit to a sequence.\"",
        "In these documents a receiver who stands still and a receiver who jumps are both making errors, and each error has a line in the judges' criteria.",
      ],
    },
    {
      id: "what-jiu-jitsu-writes-down",
      heading: "What jiu-jitsu writes down",
      paragraphs: [
        "The jiu-jitsu writing read for this piece is advice, published by instructors and organisations under their own names. Stephan Kesting's site Grapplearts carries a short article of his from January 2005 that sorts drills into three types. Two need a second person. In a cooperative drill \"you are working together with the other person to develop a certain motion or technique\". A competitive drill has you working \"against partial or full resistance from your partner\".",
        "The fullest account of the receiving job on that site is by Jason Scully, in an article published in March 2012 with additions from members of his forum. He remarks that the subject is rarely discussed. He names stages of drilling, among them \"Dead Pattern Training\", with no resistance, and \"Progressive Resistance Drilling\", and says what a partner owes at each. In the first, a good partner \"Will not be a dead body\" and will not tip over the moment a sweep is tried: \"React a bit to keep your balance because if your partner does the move correctly they should sweep you.\" In the second, resistance is added a little at a time, and the two people \"should discuss when more resistance should be added\".",
        "Two more pages make the same points briefly. Marika Dasbach, writing for Easton Training Center in July 2022: \"Giving our partner the right amount of resistance, especially when drilling, is important.\" Too little is a fault as well: \"Don't just flop over before the sweep has even happened.\" An article on ONE Championship's site from February 2017 tells readers to \"take note of how to react correctly when the move is being done on you\".",
        "All four pages describe the job, and all four call the person doing it a partner. Neither tori nor uke appears on any of them. Four pages are four pages, and we make no claim about how rooms in general talk.",
      ],
    },
    {
      id: "the-receiver-sets-the-drill",
      heading: "The receiver sets the drill",
      paragraphs: [
        "What follows is this site's argument. Receiving is a skill with content. The judo documents and the jiu-jitsu pages describe the same three parts of it: a posture or an attack that gives the technique something to work on, an amount of resistance, and a reaction like the one the technique would meet outside the drill. Because partners take turns, it is also half of every repetition a person does.",
        "Our piece on drilling separated rehearsing against a compliant partner from repetition against a defined and honest resistance, and argued that a room which calls both drilling cannot audit its own week. A coach can announce which of the two is meant. The person who makes it one or the other is the receiver. The same sweep is a rehearsal if the receiver lets it happen. It is a problem to solve if the receiver keeps their balance until the movement is done correctly, which is Scully's point and, in other words, the Kodokan's phrase about protecting stability.",
        "Kata settles the matter by script. The textbook says what uke does and when, and a judge can mark it. The jiu-jitsu pages read here leave it to the two people, and Scully says so directly: \"It is up to you, being their partner to tell them just how much resistance you might want also.\" On our reading that is the difference a name makes. A role with a name can be taught, demonstrated and corrected. A role without one is done however each person happens to do it.",
        "This is not a case for borrowing Japanese vocabulary, and nothing read for this piece measures whether naming the role changes anything. Our piece on judo's two principles argued that jiu-jitsu's customs are carried by rooms and not by texts, and the receiver's job is one of them. In a flow roll, as the people who teach it define it, both partners turn resistance down at once. In a drill one of them does it for the other. Judo gave that job a name and a script, and jiu-jitsu relies on it in every repetition without having either.",
      ],
    },
  ],
  sources: [
    {
      title:
        "IJF/Kodokan Classification of Judo (teaching text for IJF Academy Level 1 courses; PDF): the entries for Tori and Uke, and the statement that its terminology follows the Kodokan New Japanese-English Dictionary of Judo",
      publisher: "International Judo Federation Academy text, hosted by the British Judo Association",
      url: "https://www.britishjudo.org.uk/wp-content/uploads/2025/06/IJF-Kodokan-Classification-of-Judo.pdf",
      accessed: "2026-11-11",
    },
    {
      title: "Kata: the description of kata and randori, and the translated names of the forms",
      publisher: "Kodokan Judo Institute",
      url: "https://kdkjudo.org/en/techniques/kata/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Kata textbook: Nage-no-Kata, English translated version (copyright 2014; PDF), read in full as text",
      publisher: "Kodokan Judo Institute",
      url: "https://kdkjudo.org/wp-content/uploads/2024/07/Kata-textbook-Nage-no-Kata-2nd-20150415.pdf",
      accessed: "2026-11-11",
    },
    {
      title:
        "Kata textbook: Katame-no-Kata, English translated version (copyright 2014; PDF), read in full as text",
      publisher: "Kodokan Judo Institute",
      url: "https://kdkjudo.org/wp-content/uploads/2024/10/katame_no_kata.pdf",
      accessed: "2026-11-11",
    },
    {
      title:
        "Kata Competition: Criteria for the evaluation, January 2024, English (PDF); linked from the IJF documents page under Kata Commission",
      publisher: "International Judo Federation, Kata Commission",
      url: "https://78884ca60822a34fb0e6-082b8fd5551e97bc65e327988b444396.ssl.cf3.rackcdn.com/up/2024/01/IJF_KATA_EVALUATION_Jan_2024-E-1706106369.pdf",
      accessed: "2026-11-11",
    },
    {
      title: "Nage-no-kata: More Than a Sequence of Throws; the page is dated 26 September 2026",
      publisher: "International Judo Federation",
      url: "https://ijf.org/news/nage-no-kata-more-than-a-sequence-of-throws",
      accessed: "2026-11-11",
    },
    {
      title: "Katame-no-kata: The Laboratory of Groundwork; the page is dated 26 September 2026",
      publisher: "International Judo Federation",
      url: "https://ijf.org/news/katame-no-kata-the-laboratory-of-groundwork",
      accessed: "2026-11-11",
    },
    {
      title: "Stephan Kesting, \"Three Types of Drills\"; the page is dated January 2005",
      publisher: "Grapplearts",
      url: "https://www.grapplearts.com/three-types-of-drills/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Jason Scully and the Grappler's Guide forum membership, \"What Makes a Good Training Partner\"; the page is dated March 2012. Cited as one instructor's published advice",
      publisher: "Grapplearts",
      url: "https://www.grapplearts.com/what-makes-a-good-training-partner/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Marika Dasbach, \"5 Ways to Be a Better Training Partner (Part 1)\"; the page is dated July 15, 2022. Cited as one academy group's published advice",
      publisher: "Easton Training Center",
      url: "https://eastonbjj.com/mixed-martial-arts/5-ways-to-be-a-better-training-partner-part-1/",
      accessed: "2026-11-11",
    },
    {
      title:
        "\"How To Be A Great BJJ Training Partner\"; the page is dated Feb 7, 2017. Cited as one organisation's published advice",
      publisher: "ONE Championship",
      url: "https://www.onefc.com/lifestyle/how-to-be-a-great-bjj-training-partner/",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "drilling-rehearsing-and-positional-sparring",
    "maximum-efficiency-and-mutual-welfare",
    "what-a-tap-is",
    "flow-and-the-two-things-the-word-means",
    "oss-professor-and-the-bow",
  ],
  contestedNotes: [
    "The glosses of tori (\"doer\"; \"the thrower\") and uke (\"receiver\"; \"the thrown\") are printed in a teaching text for IJF Academy Level 1 courses, read in the copy the British Judo Association hosts. That text says its terminology follows the Kodokan New Japanese-English Dictionary of Judo (2000), which was not read. The two Kodokan kata textbooks use both words throughout and define neither. The article offers no translation of its own.",
    "The Kodokan textbooks are the English translated versions (copyright 2014), read as text extracted from the PDFs. In that extraction the possessive is spaced in places (\"Tori 's\"); quotations here close the space and change nothing else. The textbooks write uke and tori as \"he\" throughout, and quotations keep that wording. The word \"Mairi\" is printed as the textbook prints it and is not translated here, because the textbook does not translate it.",
    "The counts of the words Tori and Uke (174 and 215 in Nage-no-Kata; 141 and 237 in Katame-no-Kata) are this site's own, made on the extracted text of the two PDFs, and include headings and the photograph credits. They are offered as an illustration and not as a measure of anything.",
    "That four of the throwing form's techniques open with a blow to the top of tori's head is taken from the IJF criteria's wording. The Kodokan textbook names the target with a Japanese term it does not gloss.",
    "The IJF criteria cited are the version dated January 2024, the most recent English criteria listed on the federation's documents page on the accessed date. The document is laid out as a table, and in extracted text the grade of mistake does not always sit clearly beside its element, so the article gives a grade only for the two general definitions (zero, and big mistake) and otherwise reports that an element is listed.",
    "Four jiu-jitsu pages are quoted as their authors' and publishers' own advice. They are evidence about those four pages only. That none uses a name for the receiving role was checked by searching the four saved texts for tori and uke. No survey of rooms or of jiu-jitsu writing was located or attempted, and the article makes no claim about how common any way of talking is. The Scully article is from 2012 and the Kesting article from 2005; neither is presented as its author's current view.",
    "The closing section is this site's argument: that receiving has three parts, that it is half of every repetition when partners take turns, that the receiver is the person who makes a drill a rehearsal or a resisted repetition, and that a named role can be taught and corrected in a way an unnamed one cannot. No study was read that tests any of it, and the article does not claim that naming the role improves learning.",
    "The article gives no training, safety or injury advice. Passages in the sources that give such advice (in the Scully article and in the IJF criteria and articles) are left out, not endorsed or disputed.",
  ],
};
