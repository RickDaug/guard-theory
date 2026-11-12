import type { PublishedArticle } from "../types.ts";

/**
 * A foundational piece for a reader who is learning to pass guard. The count
 * it starts from is sourced: Denis Kang and Stephan Kesting's sentence that
 * there are three kinds of guard pass, over, under or around the legs, and
 * their three stages of passing. The fourth word, through, is also sourced,
 * to a phrase of Kesting's about the knee cut and to an open guard rule
 * credited to David Ruiz that reached print in a reader's letter. No source
 * read counts four routes, so the headline follows the one stated count and
 * the piece reports where the lists fail to line up.
 *
 * What a guard pass is on paper is read from the IBJJF rule book and the ADCC
 * rules page and cited by article number as printed. The other ways of
 * sorting passes (speed and pressure, standing and kneeling, range) are
 * quoted from Kesting, and the layers of the guard and the knee line from
 * BJJ Mental Models, not adapted.
 *
 * What is ours, and labelled as ours wherever it appears: reading the route
 * as a statement of what each pass has to beat, with feet, knees and arms as
 * the layers in front; filing the knee slide under over and the leg drag
 * under around; and reading the same list from underneath as a retention
 * checklist.
 *
 * Internal consistency was a hard requirement. The Technique Library already
 * holds the tight and loose axis in its entry on pressure and loose passing;
 * this piece is the route axis and does not restate that entry. The knee cut,
 * knee-between and retention ladder entries are quoted, and the retention,
 * closed guard and underhook pieces are cited for what each already argues.
 * Kang and Kesting's article is addressed to a setting outside the sport;
 * only its count and its stages are used.
 *
 * Draft: no author has read this piece, so it carries no byline and no date.
 */
export const overUnderOrAround: PublishedArticle = {
  status: "published",
  publishedAt: "2026-11-11",
  authorId: "guard-theory-editorial",
  slug: "over-under-or-around",
  category: "guard-systems",
  title: "Over, under or around: the ways past the legs",
  standfirst:
    "Every guard pass has to get the passer's hips past the other person's legs, and there are only a few ways to go. One written count gives three. A fourth word keeps turning up beside it, and the route a pass takes says what it has to beat.",
  metaDescription:
    "Every guard pass must get past the legs. One written count gives three routes, over, under or around, and each route tells a beginner what the pass must beat.",
  sections: [
    {
      id: "one-count-of-three",
      heading: "One count of three",
      paragraphs: [
        "A beginner on top meets guard passing as a list of names: toreando, knee cut, double under, leg drag, over-under. The names say little about what the passes have in common, and the list keeps growing. One way to shrink it is to ask a plainer question of each pass: which way past the legs does it go?",
        "The clearest written answer we found is in an article by Denis Kang and Stephan Kesting, posted on Grapplearts under a 2012 date and marked there as first published in Grappling Magazine in October 2005: \"Fundamentally there are 3 kinds of guard passes: you can pass over, under or around his legs.\" The sentence comes at the end of a sequence. \"Guard passing is a multi-stage process\", they write. A closed guard has to be opened, the passer has to establish some control over the hips and legs, and only then does the pass go over, under or around.",
        "Their article is about passing where strikes are allowed, a setting this piece does not take up. Only the count and the stages are used here. The count is theirs. What we do with it is ours: we use the route to tell a beginner what each pass has to beat, and we connect it to what the person underneath is doing in the retention pieces.",
      ],
    },
    {
      id: "what-the-rule-books-require",
      heading: "What the rule books require",
      paragraphs: [
        "Neither of the two rule books read for this piece has a view on the route. The IBJJF's article 4.2 awards three points for a guard pass when the athlete on top \"manages to surmount the legs of the opponent in bottom position\" and maintains side control or north-south for three seconds. Note 1 to the same article defines the thing being passed as \"the use of one or more legs to block the opponent from reaching side-control or north-south position\".",
        "The ADCC's published rules are shorter. \"Passing the guard = 3 points\", and the judges look for control, with \"at least 75% of the opponent's back\" on the mat. A further line deals with a pass that skips a step: \"When passing the guard straight to mount or knee on the stomach, points will only be awarded for passing the guard.\"",
        "Both documents describe an end state and a hold. The legs are behind the passer and the top position is kept, and how the passer got there is left open. Surmount is the nearest either text comes to a direction, and article 4.2 applies it to every pass. A sort by route is therefore an instructor's tool with no official list behind it. That is our reading of the two texts. Neither says so in terms.",
      ],
    },
    {
      id: "a-pass-for-each-word",
      heading: "A pass for each word",
      paragraphs: [
        "Kesting's written descriptions supply an example for each word. For around there is the toreando, which he also calls the matador pass. In the oldest version he describes, the passer controls both ankles from a distance, fakes one way, throws the legs the other and will \"use a zig-zag stepping pattern to pass the guard\". In his article on countering it, a passer who has pinned the legs may \"hop around to side control using quick left-right motions\". The legs stay roughly where they were put, and the passer's feet carry the hips past them.",
        "For under, Kang and Kesting name the double underhook pass, \"where you place both your arms under your opponent's legs\", and they call passes of this kind \"slow and methodical, relying on tight grips and a crushing energy\". A later Kesting article files the same pass among \"the low passes\" and gives the bottom player's side of it: the hips hoisted up and the body bent in half.",
        "Over is the word the sources illustrate least directly. A companion page to the 2005 article shows Kang's knee slide, in which the passer \"cross-drops his right knee across his opponent's right thigh\". Filing that pass under over is our inference. The page does not say which of the three it is.",
        "The over-under pass shows how the words can slide. Kesting describes it as coming \"over one of his legs and under his other leg with your arms\". Two of the three routes are in the name, and there they describe where the passer's arms go. Which way the hips finally travel is a separate matter.",
      ],
    },
    {
      id: "through-the-word-outside-the-count",
      heading: "Through, the word outside the count",
      paragraphs: [
        "A fourth word turns up in the same body of writing without being counted. Introducing a video on defending the knee cut, Kesting warns that at some point someone will try to \"knife through your legs\" with it. Our own Library entry on the knee cut uses the same picture: \"instead of going around the legs, you cut through the space between them\".",
        "The word appears from the bottom player's side as well. Kesting printed a reader's letter passing on three open guard rules credited to the instructor David Ruiz. The third is to keep the knees flared out: \"This makes passing around the guard much more difficult and leaves the best option for the opponent to pass through the center where your arms and grips can come into play more effectively.\" That sentence sorts passes into two, around and through the centre. It reaches print as a student's account of his instructor's rule, and we cite it as that.",
        "So the lists do not line up. One count has three routes and no through. One rule has two routes and no over or under. Nothing we read says whether a knee cut is a fourth route or a kind of over, with the knee crossing one thigh while the body lands between the legs. The headline keeps the count of three because it is the only one stated as a count. We treat through as a fourth word in real use whose place nobody has fixed.",
      ],
    },
    {
      id: "other-ways-the-same-passes-get-sorted",
      heading: "Other ways the same passes get sorted",
      paragraphs: [
        "Route is one axis among several, and the same author uses others. In 2019 Kesting wrote: \"Fundamentally there are two styles of guard passing: speed based and pressure based.\" Elsewhere he divides passes into standing and kneeling. The Grapplearts article on the leg drag sorts by range, setting that pass at the far end of the guard against closer passes such as the double under, the knee cut and the over-under.",
        "The Technique Library's entry on pressure and loose passing works on the first of those axes and makes three families of it: pressure, movement and the leg drag. That entry is the reference for how tight a pass is, and this piece does not repeat it. A route and a family are separate descriptions. The knee cut is a pressure pass in the Library and a pass through the legs in Kesting's phrase, and both are true of it at once.",
        "The leg drag strains the idea of a route more than any other pass here. The Grapplearts article calls it \"a form of redirection pass\", in which the passer works to \"redirect their legs past your hips\". The Library says the drag turns both of the bottom player's knees away. In the other examples the passer travels and the legs stay. Here the legs are moved and the passer barely has to travel. We would file it as around, with the travelling done by the other person's legs, and that filing is ours.",
      ],
    },
    {
      id: "what-a-route-has-to-beat",
      heading: "What a route has to beat",
      paragraphs: [
        "Here is the argument, and it is ours. The legs in front of a passer are more than one obstacle. The leg drag article speaks of the \"layers of their guard\" and puts the feet at the furthest range, ahead of the shins and knees. BJJ Mental Models has an entry called Layers of Guard, which puts the legs first and the arms behind them, and its entry on the knee line says: \"To pass, you must clear the knee line.\" The Library's retention entry draws the same line across the bottom player's knees and says that \"past the knee line is what passed means\".",
        "Feet first, then knees, then arms. Each route is a decision about how to get the hips past the first two. Going around leaves the feet and knees intact and tries to outrun them, so what it has to beat is the turn of the bottom player's hips. The Library puts the failure in one clause, \"going around watches the hips turn and the knees follow\", and Kesting says of butterfly hooks that the bottom player can keep them against the inside of your legs and \"track you\".",
        "Going over has to put a knee or a shin down and keep it there. The Library again: \"Going over meets a shin\". Going under lifts the legs instead of flattening them, which puts the feet and knees above the passer and asks for the grips and patience Kang and Kesting describe. Going through splits the knees and arrives between them. That is where the Ruiz rule says the bottom player's arms and grips come into play, and where the Library's knee cut entry says the underhook decides whether the exchange ends as a pass or a sweep.",
        "Read from underneath, the same list is a retention checklist. A knee facing the passer's chest is, in the Library's words, \"a wall they have to go around\", and the second rung of its retention ladder begins when the passer is \"beside your knees and moving around them\". Flared knees, on the Ruiz rule, make the outside harder and leave the middle. The Journal's piece on retention as a system names angle as one of its three variables, and an around pass is an attack on that variable. Kesting's version is short: \"Guard passing and guard retention are two sides of the same coin.\"",
      ],
    },
    {
      id: "what-the-sort-leaves-out",
      heading: "What the sort leaves out",
      paragraphs: [
        "This is a way of sorting. We found no count of which route succeeds more often, and none is claimed here. The three-way list comes from one article by two authors, and the fourth word from a phrase and a relayed rule.",
        "The route is the last decision, with others in front of it. A closed guard has to be opened before any of the three is available. That is the first of Kang and Kesting's stages and the subject of our piece on the locked ankles. In half guard one of the passer's legs is already trapped, and the note on the underhook covers what decides that exchange.",
        "For a beginner the use is small and practical. When a pass is shown, ask which way it goes past the legs and what was in the way on that side: feet, a knee, a shin, a pair of arms. When your own guard is passed, ask the same question about the pass that did it. A coach who watches you roll will answer both faster than a list of words can. The words are for the rounds in between.",
      ],
    },
  ],
  sources: [
    {
      title:
        "Passing the Guard in MMA, by Denis Kang and Stephan Kesting: guard passing as a multi-stage process; three kinds of guard pass, over, under or around the legs; the double underhook pass. Page dated May 2, 2012 and marked as originally published in Grappling Magazine, October 2005",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/passing-the-guard-in-mma/",
      accessed: "2026-11-11",
    },
    {
      title:
        "More on the Unpassable Guard: a reader's letter relaying three open guard rules credited to David Ruiz, including passing around the guard and through the center. Page dated December 18, 2008",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/more-on-the-unpassable-guard/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Knee Slide Guard Pass: captions to Denis Kang's cross knee slide. Page dated June 6, 2009",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/knee-slide-guard-pass/",
      accessed: "2026-11-11",
    },
    {
      title:
        "The 5 Main Variations of the Toreando Guard Pass: the old school version and its stepping pattern. Page dated September 29, 2022",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/the-5-main-variations-of-the-toreando-guard-pass/",
      accessed: "2026-11-11",
    },
    {
      title:
        "How to Counter the Toreando Guard Pass: the passer pinning the legs and hopping around to side control. Page dated June 11, 2021",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/how-to-counter-the-toreando-guard-pass/",
      accessed: "2026-11-11",
    },
    {
      title:
        "How to Stop the Double Underhooks Guard Pass: the pass as one of the low passes, and the bottom player's position in it. Page dated December 2, 2015",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/how-to-stop-the-double-underhooks-guard-pass/",
      accessed: "2026-11-11",
    },
    {
      title:
        "How To Do the Over-Under Pass: the arms over one leg and under the other. Page dated February 24, 2020",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/how-to-do-the-over-under-pass/",
      accessed: "2026-11-11",
    },
    {
      title:
        "5 Techniques for Knee Cut Guard Pass Defense and Prevention: the knee cut as knifing through the legs. Page dated December 29, 2018",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/knee-cut-guard-pass-defenses/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Does Pressure Passing Work for Small Guys?: two styles of guard passing, speed based and pressure based. Page dated February 22, 2019",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/does-pressure-passing-work-for-small-guys/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Standing vs Kneeling Guard Passes: the division of passes into standing and kneeling. Page dated November 12, 2018",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/standing-vs-kneeling-guard-passes/",
      accessed: "2026-11-11",
    },
    {
      title:
        "How to do the Leg Drag Guard Pass: long range and close range passes, layers of the guard, the leg drag as a redirection pass. Page dated April 5, 2020",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/how-to-do-the-leg-drag-guard-pass/",
      accessed: "2026-11-11",
    },
    {
      title:
        "3 Great Ways to Pass Butterfly Guard: instep hooks that track a passer running around the guard. Page dated July 3, 2025",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/3-ways-to-pass-butterfly-guard/",
      accessed: "2026-11-11",
    },
    {
      title:
        "How to Do the Leg Weave Guard Pass... And How to Counter It Too!: guard passing and guard retention as two sides of the same coin. Page dated February 17, 2020",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/how-to-do-the-leg-weave-guard-pass/",
      accessed: "2026-11-11",
    },
    {
      title: "Layers of Guard: legs, then arms, then stabilising the position",
      publisher: "BJJ Mental Models",
      url: "https://www.bjjmentalmodels.com/layers-of-guard",
      accessed: "2026-11-11",
    },
    {
      title: "Knee Line: the line between the knees, and clearing it to pass",
      publisher: "BJJ Mental Models",
      url: "https://www.bjjmentalmodels.com/knee-line",
      accessed: "2026-11-11",
    },
    {
      title:
        "IBJJF Rule Book (PDF filename 2024JUN_IBJJF_Rules_EN.pdf; page footer reads VERSION 6.1 2024): guard pass, 3 points, article 4.2 and its Note 1 defining guard",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-11-11",
    },
    {
      title:
        "ADCC Rules and Regulations: positive points for passing the guard; passing straight to mount or knee on the stomach. Published without a version number or revision date",
      publisher: "Abu Dhabi Combat Club",
      url: "https://adcombat.com/adcc-rules-regulations/",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "guard-retention-as-a-system",
    "sweep-submit-or-stand",
    "closed-guard-and-what-the-locked-ankles-buy",
    "why-the-underhook-decides-half-guard",
  ],
  contestedNotes: [
    "The count of three kinds of guard pass, over, under or around the legs, is Denis Kang and Stephan Kesting's, from an article about mixed martial arts. Only the count and the three stages of passing are used here, and this piece makes no claim about that setting. No source read for this piece counts four routes.",
    "Through is not in that count. It is taken from Kesting's phrase about the knee cut and from an open guard rule credited to David Ruiz, which reached print in a reader's letter and is cited as a student's account. Whether a pass through the legs is a fourth route or a kind of over is not settled by anything read here.",
    "Filing the knee slide under over, and the leg drag under around with the legs doing the travelling, are this site's choices. The sources name those passes without assigning them to a route.",
    "That each route can be read as a statement of what the pass has to beat, with feet, knees and arms as layers, is this site's argument. The layers are named in the Grapplearts leg drag article and in BJJ Mental Models' entries; pairing a route with a layer is ours, and so is the description of what going under does to the feet and knees.",
    "BJJ Mental Models defines the knee line as the line between your own knees and extends it to a triangle with the groin. The Technique Library uses the term for the line across the bottom player's knees that a pass has to cross. The two uses are close and are not identical.",
    "No count of which route succeeds more often was located, and this article does not claim one exists. The ADCC rules page carries no version number or revision date and is cited as read on the accessed date only.",
  ],
};
