import type { DraftArticle } from "../types.ts";

/**
 * A technique note, so the argument is ours and is labelled as ours. What is
 * sourced is everything that can be: Stephan Kesting's written material on the
 * technical standup, including the four variations he reports from Brandon
 * Mullins and the 2012 step list for the solo version; Ritchie Yip's solo
 * drills guide; one BJJ Mental Models definition; and what the IBJJF rule book
 * and the ADCC rules page say about a bottom player who gets to their feet.
 *
 * What is not sourced, and is said to be ours in the copy: the reading of the
 * four limbs as four jobs, the mapping of the half guard come-up onto the half
 * standup, the reading of the ADCC page on a stand-up that pauses, and the
 * whole comparison between the solo drill and the movement against a person.
 *
 * Internal consistency was the hard requirement in the brief. The seated guard
 * article, the underhook note and the underhook half guard entry already fix
 * what sitting up is for, what the rule books pay for and the order of the
 * come-up (elbow, hand, knee); this note quotes them and contradicts none.
 *
 * Several of the sources teach the movement for self defence and for mixed
 * martial arts. None of that is carried over. This is a grappling note, and it
 * contains no safety or injury advice.
 *
 * Draft: no author has read this piece, so it carries no byline and no date.
 */
export const theTechnicalStandUp: DraftArticle = {
  status: "draft",
  slug: "the-technical-stand-up",
  category: "technique-notes",
  title: "The technical stand-up, and getting up as a skill",
  metaTitle: "The technical stand-up as a skill",
  standfirst:
    "The technical stand-up is taught early and practised alone. Against a person it is a different job, and the rule books only pay for what it leads to.",
  sections: [
    {
      id: "taught-first-practised-alone",
      heading: "Taught first, practised alone",
      paragraphs: [
        "Ritchie Yip, in a guide to solo drills published on Grapplearts, writes that \"The Technical Standup is the first technique that everyone should learn when they're first introduced to Jiu Jitsu.\" Stephan Kesting, who runs that site, calls it \"an absolutely essential movement in BJJ\". Both present it as something to practise without a partner. Yip lists it in a sample solo workout, and Kesting says of the basic version: \"The best part is that you can practice this movement on your own.\"",
        "Kesting also gives it a place in the larger scheme. He sorts guard techniques into five categories: sweeps, submissions, strikes, survival, and standing back up to the feet. Strikes belong to other rule sets, which leaves four, and the last is the one he says gets forgotten: \"A ton of grapplers have this mindset where once they're in the guard they feel like they have to stay in the guard.\" Standing up, he writes, is \"a totally valid strategy in 'regular' BJJ class\".",
        "This note argues two things, and both are ours. The first is that the solo movement and the movement against a person share a shape and not much else. The second is that getting up is rarely the end of anything: in the two rule books read for this piece it scores nothing by itself. Much of the written material is addressed to self defence and mixed martial arts. We take only the grappling from it.",
      ],
    },
    {
      id: "four-limbs-four-jobs",
      heading: "Four limbs, four jobs",
      paragraphs: [
        "The clearest written breakdown we found is Kesting's report of how Brandon Mullins teaches it. The full version starts from a base \"with a post on each side of your body, for example your right hand and your left foot\". The posts are diagonal, and the article says what that buys: \"This allows your hips to float forwards and backwards and allows you to kick or hook with your bottom (right) leg.\"",
        "Then the leg travels. You \"lift your hips and turn your belly towards the floor as you pull your leg back\". The error the article singles out comes at the end of that step. Bringing the feet close together and standing from there \"is not at all stable\"; the leg goes all the way back so that you arrive in \"a nice wide, stable stance\". The fourth limb is the arm that is not on the mat, and in grappling it has work to do: \"in a strictly grappling situation that free arm might be used for maintaining distance and/or be controlling your opponent with a grip\".",
        "Kesting's older step list, from an article first published in Black Belt Magazine, adds that a key is to \"pendulum your body backwards as your weight is supported entirely by one hand and one foot\".",
        "Put those together and each limb has one job. This summary is ours. The posted hand and the posted foot carry the weight. The leg underneath is free because they carry it, and it is the only part that travels. The other arm deals with the opponent. Our note on base, posture and structure quotes a Library entry that defines base as \"the arrangement of the contact points on the floor\". The technical stand-up changes that arrangement from a seat to two feet without passing through a moment with one point on the floor.",
      ],
    },
    {
      id: "three-heights-and-the-way-back-down",
      heading: "Three heights, and the way back down",
      paragraphs: [
        "Mullins, as Kesting reports him, divides the movement into four. The three quarter standup is the full one, except that \"instead of pulling your bottom leg all the way out you first post on your knee\". The half standup changes the other end: \"you use your elbow for base instead of the hand\". The article ties both to load. The shorter movement is for when you are carrying a lot of the opponent's weight, and of the elbow version it says: \"Typically you'll do this if your opponent has a lot of weight on you.\" From the knee, you can \"either stand up to your feet or drive forward\". Yip's instruction matches: \"Be sure to practice the Technical Standup on both your elbow and your hand.\"",
        "Our Technique Library's underhook half guard entry gives the bottom player the same list: \"Come up in stages: elbow, then hand, then knee.\" Its reason is that each stage \"is a base you can stop on if the whizzer gets heavy, instead of one lunge that either works or collapses\". Kesting makes the general connection himself: \"The Technical Standup is even the core movement for many powerful sweeps from butterfly guard, half guard and X guard\". The specific mapping is ours. The come-up from an underhook is the half standup with the free arm already attached to the opponent's back, and it stops at the knee because the trapped leg is still in the way.",
        "The seated guard is the same movement paused one stage later. BJJ Mental Models defines a seated guard as one \"where you're sitting upright\", and our own piece on the two postures says that the body lock and the wrestle-up live there. On our reading, a seated player with a hand behind them and a foot flat on the mat is already in the first frame of the full standup.",
        "The fourth variation runs the other way. The reverse technical standup is \"the act of going from a standing or kneeling position back to the ground\". Elsewhere Kesting describes standing up, clinching and sitting back down as one of the simplest ways to get good grips from guard. Whether sitting back down is free depends on the rule book.",
      ],
    },
    {
      id: "what-the-rule-books-pay-for",
      heading: "What the rule books pay for",
      paragraphs: [
        "Neither rule book pays for standing up. Both pay for what happens next.",
        "The IBJJF awards two points for a sweep, and the third of its sweep clauses, article 4.6.3, is when the athlete on bottom with the opponent in guard or half guard \"gets to his/her feet, puts the opponent down and maintains the grips necessary to hold the opponent in bottom position for 3 (three) seconds\". The feet are the first of three requirements, and there is a clock on the second. Article 4.1.5 says that where athletes who started from guard \"remain on their feet for 3 seconds, the combat shall then be considered standing combat\". After that, putting the opponent down is a takedown under article 4.1.1, also two points. Article 4.1.4 covers the same three seconds from the other side: a top player who throws the sweeper during them is not awarded takedown points or an advantage.",
        "The same book has a line for getting up and leaving. Among its serious fouls, article 6.2.2 E reads: \"When an athlete on the ground stands to escape combat and does not return to combat on the ground.\" And clause A of that article, cited in our seated guard piece, penalises kneeling, sitting or pulling guard without a grip, which is what a reverse standup with no grip amounts to.",
        "The ADCC's published rules contain no clause about coming to the feet. They define the act by its result: \"Sweep is considered when two athletes are facing each other, change the position from bottom to top and establish for 3 secs or more.\" It scores two points ending in guard or half guard and four ending past it, the same figures as a takedown and a clean takedown. One sentence matters for a stand-up that pauses: \"Every sweep must be completed in one continuous motion in order to get points awarded.\" The page does not say when a bottom player who has stood up becomes a wrestler starting a new exchange. We read the continuous-motion sentence as the one that would decide it, and that is a reading. The penalties run both ways. A fighter who \"disengages from contact, starts backing up and avoids engaging again\" is given a minus point, and so is one who goes from standing to a non-standing position voluntarily and stays down for three seconds or more.",
      ],
    },
    {
      id: "alone-and-against-someone",
      heading: "Alone, and against someone",
      paragraphs: [
        "Kesting names two keys to learning to get up. The first is knowing the steps. The second is to \"practice against a resisting opponent. Grab a partner, put him on top of you and tell him not to let you stand up.\" In a later article he writes that the more advanced applications typically involve \"carrying or resisting some amount of your opponent's weight\". His phrase for the general case is \"Getting back up to your feet against pressure\". The comparison that follows is ours.",
        "Three things are absent from the solo drill. Nothing is pressing you back toward the mat, so the posted hand only ever holds your own weight and the full-height version always works. The free arm has nobody to hold off or hold on to, so it is carried and not used. And the repetition ends when you are standing, which the IBJJF's clause treats as the first of three requirements.",
        "The measure changes with them. Alone, the measure is whether you arrived on your feet in balance. Against a person who wants you down, the questions are which height you can reach under the weight you are carrying, whether you could stop at that stage without being flattened, and where your free arm is attached when you get there.",
        "We could not find a study of whether the solo drill carries over to getting up against resistance, and we make no claim about that. The claim is about what the drill contains.",
      ],
    },
    {
      id: "getting-up-as-a-threat",
      heading: "Getting up as a threat",
      paragraphs: [
        "Kesting's case for the stand-up in grappling is that it is one option among the others and makes the others better. He writes that if you have good takedowns, \"one of the best 'sweeps' you can do is to stand up and then take the other guy down\", and he reports his coach, Marcus Soares, giving the same answer: \"Stand up and then try to take him down!\" He also describes what the threat does to the top player. An opponent worried about you getting to your feet will often drive forward into you, which opens sweeps and submissions. In his words, \"The standup sets up sweeps and submission attacks\", and the attacks set up the stand-up in turn.",
        "That fits the rules as read above. Under both sets, the stand-up is worth what it connects to: a takedown, a sweep finished from the knees, a better grip on the way back down.",
        "This is a reading of one movement, and it cannot stand in for a coach watching you do it under someone's weight. Written material cannot feel where that weight is, and the Technique Library says so on every entry. What it can do is change the question in the warm-up, from whether you stood up to which stage you could have stopped at and what your free hand was doing.",
      ],
    },
  ],
  sources: [
    {
      title:
        "The Four Variations of the BJJ Technical Standup (dated April 20, 2022): the full, three quarter, half and reverse standups as taught by Brandon Mullins, with the posts, the leg and the free arm described for each",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/the-four-variations-of-the-bjj-technical-standup/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Getting Back to Your Feet in BJJ (dated June 22, 2018): five categories of guard technique, standing up as a strategy in grappling, the standup while supporting weight, standing up to get grips",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/getting-back-to-feet-bjj/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Get Up, Stand Up! (dated March 9, 2012; originally published in Black Belt Magazine): the solo standup step list and the two keys to developing standup techniques",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/get-up-stand-up/",
      accessed: "2026-11-11",
    },
    {
      title:
        "3 Open Guard Options vs. Standing Opponents (dated January 20, 2022): standing up as the third option, Marcus Soares's advice, and the technical standup as the core movement of sweeps from butterfly guard, half guard and X guard",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/3-open-guard-options-vs-standing-opponents/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Closed Guard to Shin Shield to Technical Standup (dated June 2, 2018): getting back to the feet against pressure",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/closed-guard-to-shin-shield-to-technical-standup/",
      accessed: "2026-11-11",
    },
    {
      title:
        "The Ultimate Guide To BJJ Solo Drills, by Ritchie Yip (dated July 24, 2020): the technical standup as the first technique to learn, practised on both the elbow and the hand, and listed in a sample solo workout",
      publisher: "Grapplearts",
      url: "https://www.grapplearts.com/the-ultimate-guide-to-bjj-solo-drills/",
      accessed: "2026-11-11",
    },
    {
      title:
        "IBJJF Rule Book (PDF filename 2024JUN_IBJJF_Rules_EN.pdf; page footer reads VERSION 6.1 2024): takedown at articles 4.1.1, 4.1.4 and 4.1.5; sweep, 2 points, articles 4.6.1 to 4.6.3; serious fouls at article 6.2.2, clauses A and E",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-11-11",
    },
    {
      title:
        "ADCC Rules and Regulations: sweeps and takedowns ending in guard or half guard 2 points, clean sweeps and clean takedowns 4 points, the continuous-motion requirement for sweeps, and minus points for disengaging and for going from standing to non-standing. Published without a version number or revision date",
      publisher: "Abu Dhabi Combat Club",
      url: "https://adcombat.com/adcc-rules-regulations/",
      accessed: "2026-11-11",
    },
    {
      title: "Seated vs. Supine Guards: definitions of a supine guard and a seated guard",
      publisher: "BJJ Mental Models",
      url: "https://www.bjjmentalmodels.com/seated-vs-supine-guards/",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "seated-guard-and-supine-guard",
    "why-the-underhook-decides-half-guard",
    "the-bridge-and-the-hip-escape",
    "base-posture-and-structure",
  ],
  contestedNotes: [
    "The reading of the four limbs as four jobs, and of the stand-up as a change in the arrangement of contact points, is this site's summary. The instructional sources cited describe the posts, the travelling leg and the free arm; none of them states the division in those words.",
    "The mapping of the half guard come-up from an underhook onto the half technical standup is this site's argument. Stephan Kesting writes that the technical standup is the core movement of many sweeps from butterfly guard, half guard and X guard; he does not set out that mapping, and our Technique Library entry on the underhook does not use the term.",
    "The comparison between the solo drill and getting up against a person is this site's argument. We located no study of whether solo practice of the movement carries over to standing up against resistance, and the piece makes no claim either way.",
    "The four variations are attributed as Stephan Kesting reports them from Brandon Mullins. The detail is taught in a video on that page; this piece relies only on the written summary beneath it.",
    "The ADCC rules page has no clause about a bottom player coming to their feet and does not say when a stand-up that pauses becomes a new standing exchange. Our statement that the continuous-motion sentence would decide it is a reading of the page and not a ruling. The page carries no version number or revision date, so it is cited as read on the accessed date only.",
    "Several of the cited articles teach the stand-up primarily for self defence and mixed martial arts. Nothing from those parts is used here, and the piece makes no claim about either.",
    "Names and spellings vary. The sources write technical standup as two words; this site hyphenates stand-up as a noun and keeps the sources' spelling inside quotations.",
  ],
};
