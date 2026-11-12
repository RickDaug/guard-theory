import type { PublishedArticle } from "../types.ts";

/**
 * A philosophy piece on the argument about whether jiu-jitsu is a sport or a
 * method of self-defence. What is sourced is every statement about what an
 * organisation says its programme or its competition is for, and every
 * statement about what a rule set pays for, forbids or permits: Gracie
 * University's course page for its beginner programme and its About page,
 * the IBJJF rule book, graduation page and first-championship guide, the ADCC
 * about page and rules page, and the UKBJJA's about page, each read from the
 * raw page or from PDF text on the accessed date. Quotations keep the
 * spelling of the page they come from.
 *
 * What is ours, and labelled as ours in the body and in contestedNotes: the
 * reading that the two camps describe different constraints on one practice
 * and not two arts, that what a person practises against decides what they get
 * good at, and that a beginner is entitled to know which a room is teaching.
 *
 * The piece gives no self-defence advice, makes no claim about what works
 * outside a training room, cites no crime figure and names no fight result.
 * Where an organisation makes such a claim about its own programme, the piece
 * reports that the claim is made, or leaves it out. It is consistent with the
 * MMA transfer article (skill is priced by a rule set) and with the early-UFC
 * article, and repeats neither.
 *
 * Draft: no author has read this piece, so it carries no byline and no date.
 */
export const sportOrSelfDefenceAndWhatJiuJitsuIsFor: PublishedArticle = {
  status: "published",
  publishedAt: "2026-11-11",
  authorId: "guard-theory-editorial",
  slug: "sport-or-self-defence-and-what-jiu-jitsu-is-for",
  category: "training-culture",
  title: "Sport or self-defence, and what jiu-jitsu is for",
  metaTitle: "Sport or self-defence: what jiu-jitsu is for",
  standfirst:
    "One camp calls jiu-jitsu a method of self-defence and the other calls it a sport. We read what each side publishes about its own purpose, and what the rule books make people practise.",
  metaDescription:
    "Is jiu-jitsu a sport or a method of self-defence? What organisations on each side say it is for, and what the rule books make people practise.",
  sections: [
    {
      id: "one-question-two-kinds-of-answer",
      heading: "One question, two kinds of answer",
      paragraphs: [
        "Ask what jiu-jitsu is for and the answers sort into two camps. One says it is a method of self-defence that happens to have competitions. The other says it is a sport, with athletes, brackets and a rule book, that happens to have a self-defence history. The argument is usually conducted by each camp describing the other.",
        "This piece does something narrower. We read what organisations on each side publish about their own purpose, in their own words, and then what two competition rule sets pay for, forbid and permit. Those are the only two kinds of evidence used here.",
        "Some things are therefore out of scope. Nothing below says what works outside a training room, nothing is advice about personal safety, and no fight is cited as proof of anything. Where an organisation makes a claim of that kind about its own programme, we report at most that it makes the claim. The conclusion at the end is ours and is labelled as ours.",
      ],
    },
    {
      id: "what-a-self-defence-curriculum-says-it-is-for",
      heading: "What a self-defence curriculum says it is for",
      paragraphs: [
        "Gracie University teaches a beginner course called Gracie Combatives, and its course page is direct about the split. \"Sport BJJ can be very fun for advanced practitioners, but the sheer number of techniques can be overwhelming for beginners,\" it says, and it describes its own answer as spending \"100% of the training time on the highest probability street self-defense situations\". The page presents the course as a selection from inside the art, not as a different one: it says Brazilian jiu-jitsu contains more than 600 techniques and that the course is dedicated to 36 of them.",
        "The same organisation's About page, in a section answering students' questions, states the aim in one sentence: \"The objective of the Gracie Combatives course is to prepare you to defend against the most common attacks that a larger, unskilled opponent would use in a real fight.\" That sentence specifies three things. The opponent is larger. The opponent is untrained. The setting is a fight, not a match.",
        "The section then tells the training partner what the job is: to \"consistently simulate the most common behavior\". A partner who keeps changing the attack in order to beat the technique is described there as a poor one. The course page adds that the programme contains no sparring, that students work with \"a cooperative partner\", and that sparring begins in the programme that follows it. The current edition also adds bonus material aimed at \"an opponent who may have some jiu-jitsu or grappling experience\", which tells a reader that the default opponent has none.",
        "The page also describes the other camp, saying that at most schools beginners are taught \"without any emphasis on street self-defense\". That is one organisation's account of its competitors. We have no count of what most schools teach and do not adopt the sentence. What matters here is that this curriculum defines itself, in writing, by an opponent, a setting and a manner of practice.",
      ],
    },
    {
      id: "what-the-sport-bodies-say",
      heading: "What the sport bodies say",
      paragraphs: [
        "We looked for a statement of purpose on the IBJJF's website and did not find one among the pages we read. What its documents do say is consistent. The page introducing its graduation system says the system exists to \"unify and standardize the teachings, practice, and competition of modern Jiu-Jitsu\". The rule book and the General System of Graduation call the person on the mat an athlete throughout, and in the text we extracted from both, the term self-defence does not occur in either spelling. The rule book does contain one sentence about what a match is supposed to be: \"Matches should unfold as a progression of positions of technical control that ultimately result in a submission hold.\"",
        "The ADCC's about page tells two stories. The first is about a club in Abu Dhabi whose stated goals include \"to train people in all aspects of self defense, which in turn builds self-confidence\". The second is about the competition. The page says that instructors of different styles each claimed their art was the best, that because every style had its own rules there was no way to establish which was most effective, and that the championship was created in 1998 with one set of rules under which grappling styles could meet \"without the brutality of strikes\". It calls the result \"a whole new sport\".",
        "The UKBJJA, which describes itself as the recognised national governing body for the United Kingdom, declines to choose. Its about page calls Brazilian jiu-jitsu \"a martial art and combat sport\", lists among its objectives \"To preserve and protect the integrity of BJJ as a performance based martial art\", and tells newcomers: \"Whether you want to get fit, learn self defence or compete, jiu jitsu is for everyone.\"",
        "So none of the three sport bodies says that self-defence is beside the point. The IBJJF documents regulate competition and rank and do not raise the subject. The ADCC names self-defence as a goal of its club and built its competition without strikes. The UKBJJA names both purposes in one sentence.",
      ],
    },
    {
      id: "what-the-rule-books-rehearse",
      heading: "What the rule books rehearse",
      paragraphs: [
        "A purpose statement is what an organisation says. A rule book is what its competitors practise against, and three of its features bear on this argument.",
        "First, positions are paid. The IBJJF awards points when an athlete stabilises a position for three seconds: two for a takedown, a sweep or knee on belly, three for a guard pass, four for mount or back control. The ADCC pays for a similar list at different rates, also on a three-second hold, and opens its matches with a period in which no positive points are scored. Other articles here read those tables line by line; the point for this one is only that arriving somewhere and staying there is itself the scoring act.",
        "Second, strikes are removed. The IBJJF lists striking, and the intentional use of \"a traumatic blow of any kind\", among its disciplinary fouls, for which the penalty is disqualification from the match and from the competition. The ADCC's list of illegal techniques includes \"No striking of any kind\", and a fighter who intentionally hits or kicks an opponent is disqualified.",
        "Third, an athlete may choose to start on the ground. Under the IBJJF book, sitting or pulling guard is a serious foul only when it is done without first establishing a grip; done with a grip, it costs nothing. The ADCC charges a minus point to a fighter who jumps to guard, or who goes from standing to the floor and stays there for three seconds, which is a price and not a prohibition.",
        "There is a fourth feature that sits outside the scoring pages. The IBJJF's guide to a first championship has a competitor register under a current belt, in a weight division and in an age division. The opponent across the mat has registered the same way and is trying to win under the same rule book.",
      ],
    },
    {
      id: "different-constraints-not-different-arts",
      heading: "Different constraints, not different arts",
      paragraphs: [
        "What follows is our reading of those documents. It is an argument, not a finding.",
        "Set side by side, the documents do not describe two arts. They describe one body of technique practised under two sets of constraints, and the constraints differ on four counts. Who the opponent is: larger and untrained in the curriculum's own sentence, matched by belt, weight and age in the federation's. What the opponent may do: the same About page poses a student's question about being punched, while both rule books disqualify a competitor for striking. How the partner behaves: one document asks for a cooperative partner repeating the most common attack, and a tournament supplies someone trying to win. What counts as success: meeting the curriculum's stated objective in one case, and points, a submission or a referee's decision in the other.",
        "Each set of constraints leaves something out, and each document says so openly. The beginner course, by its own description, has no sparring and defers the skilled opponent to later study. The rule books have no strikes and let an athlete sit down to start. Neither omission is a mistake from the inside. Each is a design choice made for a stated purpose.",
        "Our article on sport jiu-jitsu and mixed martial arts argued that skill is priced by a rule set. This is the same claim extended by one step: skill is shaped by whatever a person practises against, whether that is written in a rule book or in a curriculum. Rehearse against a scripted, untrained attacker and that is the problem you become fluent in. Rehearse against a matched grappler under a points table and you become fluent in that one.",
        "We are not saying that either practice prepares anyone better for anything outside its own terms. That would take measurement, and this article cites none.",
      ],
    },
    {
      id: "what-a-beginner-should-know-about-a-room",
      heading: "What a beginner should know about a room",
      paragraphs: [
        "The practical consequence is small. A room is teaching toward something, and the two published models differ enough that a beginner is entitled to know which one is in front of them. A room need not belong to either camp, and nothing we read says how many do.",
        "The documents suggest the questions. Is there a written beginner curriculum, and what opponent does it assume? Do beginners spar, and from when? Which rule set, if any, does the room's sparring follow? Is striking ever part of the practice? Every organisation quoted above answers at least one of those on paper. A room can answer them in a sentence.",
        "We are not recommending an answer. Someone who wants to compete and someone who wants what the beginner course describes are asking for different practice, and the UKBJJA's sentence lists both, alongside fitness, as reasons to start. The old argument asks which camp owns the name. The documents point to a more useful question: what the practice in front of you is practised against.",
      ],
    },
  ],
  sources: [
    {
      title:
        "Course: Gracie Combatives 2.0 - Official Beginner Program (course description: the 36 techniques, \"Self-Defense Emphasis\", \"Safety First\", \"Bonus Slices\")",
      publisher: "Gracie University",
      url: "https://www.gracieuniversity.com/Pages/Public/Course.aspx?se=293",
      accessed: "2026-11-11",
    },
    {
      title:
        "About Gracie University: \"The Five Questions\", questions 2 and 3 (the objective of the Gracie Combatives course and the training partner's role)",
      publisher: "Gracie University",
      url: "https://www.gracieuniversity.com/Pages/Public/About?t=5",
      accessed: "2026-11-11",
    },
    {
      title:
        "IBJJF Rule Book, footer \"VERSION 6.1 2024\" (file 2024JUN_IBJJF_Rules_EN.pdf, linked from the Books and Videos page as v6.0): items 3.1, 3.2, Article 4, 6.1.3, 6.2.2 A and 7.1",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-11-11",
    },
    {
      title:
        "IBJJF Graduation System page, and the General System of Graduation, June 2026, linked from it",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/graduation-system",
      accessed: "2026-11-11",
    },
    {
      title: "My First Championship: membership under a current belt, weight division, age division",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/my-first-championship",
      accessed: "2026-11-11",
    },
    {
      title: "About Abu Dhabi Combat Club: \"Our Goal\" and \"The Competition\"",
      publisher: "Abu Dhabi Combat Club",
      url: "https://adcombat.com/about-abu-dhabi-combat-club/",
      accessed: "2026-11-11",
    },
    {
      title:
        "ADCC Rules and Regulations: time limits, illegal techniques, positive points, penalties",
      publisher: "Abu Dhabi Combat Club",
      url: "https://adcombat.com/adcc-rules-regulations/",
      accessed: "2026-11-11",
    },
    {
      title: "About the UKBJJA: mission and objectives, \"What is BJJ?\", \"Start training\"",
      publisher: "United Kingdom Brazilian Jiu Jitsu Association",
      url: "https://www.ukbjja.org/about/",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "why-sport-jiu-jitsu-does-not-transfer-directly-to-mma",
    "what-the-early-ufc-tournaments-demonstrated",
    "position-before-submission-and-what-the-points-table-teaches",
    "how-no-gi-rulesets-reshaped-technique-selection",
  ],
  contestedNotes: [
    "The reading that the two camps describe different constraints on one practice, and that what a person practises against decides what they get good at, is this site's argument. It is drawn from the documents cited and is not a measured result. No study comparing the two kinds of practice is cited, and no claim is made about what either prepares a person for outside its own terms.",
    "Gracie University's pages make claims about how its techniques perform in real fights, about how often injuries occur in its programme and about what most other schools teach. None of those claims is adopted here. The article reports only how the organisation describes the purpose, the assumed opponent and the manner of practice of its beginner course.",
    "The statement that the IBJJF publishes no statement of purpose is limited to the pages we read on 11 November 2026: the home page, Books and Videos, Graduation System, Join Us, My First Championship, Safe Sport, Academy Registration Information and Terms of Use. The statement that the term self-defence does not occur is limited to text extracted from the rule book PDF and the June 2026 General System of Graduation PDF. A statement of purpose may exist elsewhere, including in documents the federation does not publish on its site.",
    "The ADCC about page's history of the club and the championship is the organisation's own account and has not been cross-checked against an independent record. It is quoted as what the ADCC says about itself.",
    "One organisation stands here for the self-defence-first camp because it publishes its curriculum's purpose in detail. It is an example, not a survey, and other self-defence-first schools may describe themselves differently.",
  ],
};
