import type { DraftArticle } from "../types.ts";

/**
 * B5. A systems essay, not a biography and not a ranking. The mechanics are
 * argued from the Technique Library's own entries (arm-drag,
 * butterfly-hook-as-lever, seat-belt-and-hooks) and from how two rule books
 * pay for each outcome of the drag; the person is reported from BJJ Heroes and
 * Grapplearts, each attributed in the sentence that uses it.
 *
 * No medal tally is stated. The one competition result used, the 2003
 * Brazilian ADCC trials bout lost on a guard-pull penalty, is single-sourced to
 * BJJ Heroes and says so, including that its biography calls the bout the final
 * and its record table a semi-final. Nothing is credited as his invention:
 * Grapplearts says the drag came from wrestling, and the piece repeats that as
 * Grapplearts' statement. Nicknamed techniques are left out. A conditioning
 * section drawn from a systematic review (Andreato et al. 2017) was cut in
 * revision: its discriminating grip tests were done on the gi, and it
 * measured nothing specific to this game.
 *
 * BJJ Heroes' submission panel prints a percentage and then a count for each
 * technique (RNC "29 16" is 29 percent, 16 wins). The counts sum to the 55
 * submission wins the panel states, which is how the reading was checked.
 *
 * Draft: no one has read and signed off this piece, so it carries no byline
 * and no date. AI-assisted pieces are published under the "Guard Theory
 * editorial" byline (authorId "guard-theory-editorial"; owner, 2026-09-29),
 * once a person has reviewed them.
 */
export const theArmDragAsASystem: DraftArticle = {
  status: "draft",
  slug: "the-arm-drag-as-a-system",
  category: "influential-practitioners",
  title: "Marcelo Garcia and the arm drag as a system",
  standfirst:
    "The arm drag came from wrestling. What Marcelo Garcia showed in public was a chain, drag to butterfly hook to back, built so that defending one link opens the next.",
  metaDescription:
    "Marcelo Garcia did not invent the arm drag. He built a chain around it, drag to hook to back, in which defending one link opens the next.",
  sections: [
    {
      id: "what-is-being-credited",
      heading: "What is being credited",
      paragraphs: [
        "Stephan Kesting, writing on Grapplearts in 2016, asks whether Garcia invented the arm drag and answers that he certainly did not: he took it from wrestling, where it sets up takedowns. The same article says he was the first to popularise it in jiu-jitsu by landing it successfully and repeatedly at the biggest events, ADCC among them. That second sentence is Kesting's judgement, not a record.",
        "BJJ Heroes records that Garcia started judo and jiu-jitsu in Minas Gerais, moved to Sao Paulo as a brown belt, first to Terere's academy and then to Fabio Gurgel's Alliance headquarters, and had never trained or competed without the gi until he began doing so there. It lists his favourite positions as the arm drag, X-guard, butterfly guard, the guillotine and the mata leao, the rear naked choke.",
        "The claim here is about an arrangement. A drag, a hook and a back take are three techniques anyone can learn separately. Put in order, with each one built on the reaction the previous one draws, they become a game that does not need the opponent to cooperate at any single step, and that is the game the record associates with him.",
      ],
    },
    {
      id: "where-the-drag-ends",
      heading: "Where the drag ends",
      paragraphs: [
        "The Technique Library's entry on the arm drag describes it as a redirection. You take an arm the opponent has already extended, grip it at the wrist and above the elbow, and carry it across their centreline, so their shoulders turn away and the side the arm was defending is left open. Kesting's description matches: same-side wrist, cup the triceps, step and swing the arm past you.",
        "What matters is where it ends. From standing, Kesting writes, a successful drag puts you directly behind the opponent, often in a rear bear hug. From the guard it puts you on the back without first having to sweep and then pass. A sweep followed by a pass is two separate contests, each of which the opponent can win. The drag skips both and arrives at the position both of them were trying to reach.",
        "The rule books say the same thing in points. Under the IBJJF Rule Book, version 6.1, back control is worth four points and a sweep two. ADCC's published rules pay three for back mount with hooks and two for a sweep. Under both, the drag's intended destination is worth more than the sweep a guard player would otherwise be working for.",
      ],
    },
    {
      id: "why-the-drag-survives-without-a-sleeve",
      heading: "Why the drag survives without a sleeve",
      paragraphs: [
        "No-gi rule books take away every handle a gi guard is built on. ADCC forbids holding the T-shirt or the shorts, and the IBJJF makes grabbing any part of the uniform in no-gi a serious foul. The Journal's piece on de la Riva traces what that did to one guard: the hook survived and the sleeve and trouser grips around it had to be replaced.",
        "The arm drag never had those grips to lose. Both of its handles are on the body: a wrist, which the hand can close around, and the back of the arm above the elbow, which the other hand cups. Neither handle depends on cloth, so the drag transfers to a no-gi match with no parts missing. A plausible reading, and it is ours, is that this suited a grappler who, on BJJ Heroes' account, first trained without the gi as a brown belt: of everything in a gi game, it was the piece that did not have to be rebuilt.",
      ],
    },
    {
      id: "the-hook-that-makes-the-drag-pay",
      heading: "The hook that makes the drag pay",
      paragraphs: [
        "Kesting writes that the drag is typically done from butterfly guard: cup the triceps, bring one leg outside, pull the opponent forward and shift the hips to one side. If it works, the opponent lands beside you and you take the back. If it does not, and they turn in to face you in time, the same motion is still a sweep, which the IBJJF scores at two.",
        "The drag has a failure mode that scores. An opponent who defends the back take by turning in has turned into the sweep, and an opponent who posts a hand to stop the sweep has extended the arm the drag wants. The Library's entry on the butterfly hook explains why the hook is there at all: a hook only lifts once the opponent's weight is loaded onto it through an upper-body connection, and a drag that pulls the opponent forward is one way of bringing their weight onto it.",
        "Kesting's list for Garcia runs on from butterfly to the X-guard and the single-leg X-guard, which he describes as places the butterfly guard lets him move to. The first time Kesting saw Garcia compete, in his 2003 ADCC match against Renzo Gracie, the match turned on a position he did not recognise, the X-guard, which he, like other grapplers of the time, then set about reverse-engineering. Across all of them the idea is the same: keep the opponent's weight moving towards you, and be ready to take whichever side they give up.",
      ],
    },
    {
      id: "chest-before-hooks",
      heading: "Chest connection before hooks",
      paragraphs: [
        "The chain ends on the back, and its last link is the one the Library's entry says most people learn in the wrong order. That entry, on the seat belt and hooks, argues that back control is held by the chest first and the legs second, because the opponent escapes by turning their shoulders, and that turn is fought at the shoulder line, not at the hips. The arm drag entry says the same thing about the moment of arrival: get the chest onto the side of the torso, not behind the arm, or the exposed back becomes a scramble.",
        "Kesting reports a detail from Garcia's game that fits that ordering. Going for the choke before the hooks are in is ordinarily, in his words, a rookie mistake, and Garcia sometimes does it anyway: an opponent busy blocking the choke is not defending the hooks, which then go in easily.",
        "His recorded finishes point the same way. BJJ Heroes' panel lists 85 wins, 55 of them by submission, and breaks the 55 down by technique. The rear naked choke is the largest single entry at 16, which is 29 percent of those submission wins. The record mixes gi and no-gi events and is compiled by a community site, not a federation, so it describes a tendency, not a statistic about the sport.",
      ],
    },
    {
      id: "a-system-is-what-happens-next",
      heading: "A system is what happens next",
      paragraphs: [
        "The clearest evidence that this was a system and not a signature move is what happened when opponents learned it. Kesting writes that for a long time the arm drag to back take to choke was Garcia's staple, and then opponents stopped letting him take the back so easily, and he moved on to the north-south choke. When the X-guard spread and people learned to defend it, he moved to the single-leg X-guard.",
        "A move stops working when the opponent learns it. A system is built so that the opponent's defence is the next entry: turn in and you are swept, post a hand and you are dragged, and, on Kesting's account, shut the back and the attack moves to the north-south choke. The record does not show that Garcia invented any of its parts. A seated game also had costs: BJJ Heroes records that he lost at the 2003 Brazilian ADCC trials by a single point, which it attributes to a guard-pull penalty (its biography calls the bout the final; its record table lists it as a semi-final), under a rule set whose current version still charges for sitting down.",
        "That is the contribution the sources support: techniques that already existed, put in an order where defending one opens the next, and changed when opponents learned them: to the north-south choke when they stopped giving up the back, and to single-leg X when the X-guard spread.",
      ],
    },
  ],
  sources: [
    {
      title: "Stephan Kesting, \"10 Key Techniques and Tactics of Marcelo Garcia\" (17 November 2016)",
      publisher: "Grapplearts",
      url: "https://www.grapplearts.com/10-key-tactics-marcelo-garcia/",
      accessed: "2026-09-29",
    },
    {
      title: "Marcelo Garcia, fighter profile, biography and grappling record",
      publisher: "BJJ Heroes",
      url: "https://www.bjjheroes.com/bjj-fighters/marcelo-garcia",
      accessed: "2026-09-29",
    },
    {
      title:
        "IBJJF Rule Book, version 6.1 (2024JUN): 4.5 back control, 4.6 sweep, 6.2.2 N (no-gi uniform grip)",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-09-29",
    },
    {
      title:
        "ADCC Rules and Regulations: positive points, penalties, and prohibited holds on the T-shirt and shorts",
      publisher: "Abu Dhabi Combat Club",
      url: "https://adcombat.com/adcc-rules-regulations/",
      accessed: "2026-09-29",
    },
  ],
  relatedSlugs: [
    "de-la-riva-and-the-guard-that-took-his-name",
    "the-rear-naked-strangle-from-back-control",
    "grip-decay-and-the-half-life-of-a-no-gi-grip",
    "seated-guard-and-supine-guard",
  ],
  contestedNotes: [
    "Whether Garcia was the first to popularise the arm drag in jiu-jitsu is Stephan Kesting's judgement on Grapplearts, not a documented fact. No source consulted credits Garcia with inventing the arm drag, the butterfly guard, the X-guard or the north-south choke, and this article does not.",
    "The 2003 ADCC trials result, a one-point loss attributed to a guard-pull penalty, comes from BJJ Heroes alone, and BJJ Heroes is not consistent about it: its biography says he lost the final, and its record table lists the bout, against Daniel Moraes, as a semi-final (\"ADCC Trials 77KG SF 2003\"). The article names neither round. No official ADCC bracket record was read, and the ADCC rules page read for this article is undated, so the 2003 rule is taken from BJJ Heroes' description.",
    "The submission breakdown is BJJ Heroes' compilation, which mixes gi and no-gi events and does not link each result to an official record. The panel prints each technique as a percentage followed by a count; the counts are used here, and they sum to the 55 submission wins the panel states.",
  ],
};
