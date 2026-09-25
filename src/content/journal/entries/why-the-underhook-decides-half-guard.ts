import type { DraftArticle } from "../types.ts";

/**
 * A technique note, so the argument is ours and is labelled as ours. What is
 * sourced is everything that can be: how the two rule books define and score the
 * position, and what Stephan Kesting's written half-guard material says about
 * the near-side underhook from both sides of it.
 *
 * Internal consistency was the hard requirement in the brief. The knee shield,
 * frames-versus-blocks and knee-cut-pass entries already say who the underhook
 * belongs to and what happens when it is lost; nothing here contradicts them,
 * and the three exits named in the knee shield entry are the ones used here.
 *
 * Draft: no author has read this piece, so it carries no byline and no date.
 */
export const whyTheUnderhookDecidesHalfGuard: DraftArticle = {
  status: "draft",
  slug: "why-the-underhook-decides-half-guard",
  category: "technique-notes",
  title: "Why the underhook decides half guard",
  standfirst:
    "Half guard is taught as one position with a long list of sweeps. Most of the list is closed at any given moment, and one arm decides which part is open.",
  sections: [
    {
      id: "one-name-three-games",
      heading: "One name, three games",
      paragraphs: [
        "The IBJJF rule book defines half guard in one sentence: it is \"the guard where the athlete on bottom is lying on his/her back or side and has one of the top-positioned athlete's legs trapped\", blocking the top athlete from side or north-south control. That is a definition written for referees. It has to cover every version of the position, so it says nothing about which version you are in, and it treats a bottom player flat on their back and one on their side as the same thing.",
        "On the mat they are not the same thing. Stephan Kesting's glossary of guards on Grapplearts separates the family into named positions and the descriptions are instructive. What he calls standard half guard is on your side, inside leg hooking, with \"some sort of underhook with your top arm\". His Z guard, which our Technique Library files as the knee shield, holds distance with the top knee while, without the gi, \"you often frame his neck with your forearm\". His deep half guard has the top arm controlling the opponent's hip or thigh rather than their torso.",
        "Read those three descriptions for what the top arm is doing and they turn into three different jobs. In the first it is an underhook on the body. In the second it is a frame. In the third it has gone under a leg instead. The legs are doing roughly similar work in all three; the arm is what changes. This note argues that the arm is the variable worth checking first, because it sorts the long list of half guard sweeps into a short list that is open and a longer one that is not.",
      ],
    },
    {
      id: "a-claim-on-the-far-shoulder",
      heading: "The underhook as a claim on the far shoulder",
      paragraphs: [
        "The near-side underhook is contested from both directions, and the same author describes it from both. From the bottom, Kesting writes that getting the underhook in butterfly and half guard \"is incredibly important\", and his glossary describes the underhooked half guard as \"great for taking the back, sweeping an opponent by getting under their hips, and coming up to your knees\". From the top, in his piece on defending the crossface, the top player who digs under your top elbow \"can use that underhook to drive you flat onto your back\", which is why \"denying him the underhook is critical\". One space under one armpit, and whoever's arm is in it is playing offence.",
        "The reason is mechanical and it is about the shoulder on the far side of that arm. The bottom player's underhook reaches across the top player's back. Once it is there, the top player cannot bring that shoulder down onto your chest without going through your arm, and cannot easily turn to face you as you come up. It is a claim on where their far shoulder is allowed to go. The top player's underhook is the mirror image: it goes under your top arm, takes your top shoulder to the mat and turns a player on their side into a player on their back.",
        "BJJ Mental Models files this under a general heading it calls inside channel control, defined as dominating the space \"between your opponent's legs or under their armpits\", and notes that it lets you \"access the levers on your opponent's body, while denying them control of your levers\". The half guard underhook is one instance of that idea, not a separate discovery, and we are not claiming the framing as ours. What we are claiming is narrower: in this position the contest for that one channel is settled early, it is visible, and most of what happens next follows from it.",
        "Our own knee cut entry says the same thing from the passer's side: win the near-side underhook or a strong crossface before the knee travels, because whoever has the underhook decides whether the exchange ends as a pass or a sweep.",
      ],
    },
    {
      id: "what-the-knee-shield-is-doing",
      heading: "What the knee shield is doing while you fight for it",
      paragraphs: [
        "If the underhook decides the position, the obvious question is what the knee shield is for, since it involves no underhook at all. The answer is that it is where you stand while the contest is undecided. A shin across the hip or ribs stops the chest arriving. A chest that has not arrived cannot pin your top arm, and an arm that is not pinned can still pummel.",
        "The Library entry on the knee shield is specific that the shield does not settle the upper body: it \"stops the chest; it does not stop the shoulder or the crossface, and the pass usually begins above the shield rather than through it\". That is why the entry asks for a frame or an underhook in the head-and-arm space as well. The frame is the holding answer. It is bone against their neck or shoulder, it costs little to keep, and it denies the top player their own underhook without winning yours.",
        "The trade between the two is the whole decision in knee shield half guard. A frame keeps distance and gives up reach; you cannot frame someone's neck and wrap their back with the same arm. Swapping the frame for the underhook means letting the distance close on purpose, for the moment it takes to swim the arm through, and that moment is when the knee shield matters most. If the shin is still in place, a lost pummel costs you a reset. If the shin has already been folded, a lost pummel costs you the position.",
      ],
    },
    {
      id: "what-the-scoreboard-pays-for",
      heading: "What the scoreboard pays for",
      paragraphs: [
        "There is a rules reason to expect the underhook game to get drilled. The IBJJF awards two points for a sweep, and its sweep article lists three ways to earn them from guard or half guard. Two involve inverting the position. The third, article 4.6.3, is when the bottom athlete \"gets to his/her feet, puts the opponent down and maintains the grips necessary to hold the opponent in bottom position\" for three seconds. That is a description of coming up on an underhook and finishing as a wrestler would, and the rule book scores it exactly as it scores rolling someone over.",
        "The ADCC's published rules pay two points for a sweep that ends in guard or half guard and four for one that ends past the guard, with the position established for three seconds and no submission threat. They also state that points go only to the fighter who initiates the sweep. Neither document mentions an underhook, and neither needs to. Both pay for ending on top, and the underhook is the half guard connection that travels with you as you get up. A frame, by design, stays where it is.",
        "The top player's incentives are set out in the same pages. Among the IBJJF's examples of an advantage from a guard pass, at 5.6.2, is the athlete who starts from guard, \"achieves half-guard control over the opponent, but does not solidify the pass\". Clause 5.7.2 withholds that advantage when the half guard \"did not originate from a guard-pass attempt\". A passer who has your leg trapped between theirs is therefore already partly paid, and is looking for the upper-body control that finishes the job.",
      ],
    },
    {
      id: "losing-the-underhook",
      heading: "Losing the underhook: what is left, honestly",
      paragraphs: [
        "When the top player has the underhook and the crossface, the position is a pass in progress. Kesting's description of that state is blunt: with both attachments the top player can turn your head away, put a great deal of pressure on you, and \"move relatively easily into guard passes and submissions\". Nothing in this note changes that, and a list of sweeps that ignores it is a list of techniques for a position you are no longer in.",
        "What is left is a smaller set, and it is mostly not sweeps. The first option is to get the frames back: elbow tight to the ribs and forward of the hip so there is nothing to dig under, the bottom arm guarding the head against the crossface. That is recovery of the contest, not a win. The second is to stop contesting the torso and go under a leg instead, which is the deep half guard logic. It is a genuinely different game with its own risks, which is why the brief for this piece warned against blurring the two: deep half does not need the torso underhook because it has given up on the torso. The third is the one the knee shield entry ends on, which is to concede the position early and recover guard from underneath, before the shin is on your own chest.",
        "None of those is guaranteed, and nothing in half guard is. The point is only that they are the honest menu once the underhook is lost, and that the come-up sweeps are not on it.",
      ],
    },
    {
      id: "the-one-question-checklist",
      heading: "The one-question checklist",
      paragraphs: [
        "Before choosing a technique from half guard, ask who has the underhook on the side of the trapped leg. There are three answers.",
        "You have it. The short list is open: come up to your knees and finish on top, go to the back if they turn away, or change to a guard that uses the same connection. Move now, because an underhook held from a flat back is a block, not a frame, and it is on a timer.",
        "Nobody has it. You are in the knee shield's territory. Keep the shin in place, keep a frame in the head-and-arm space, and treat the pummel as the next exchange to win. Attacks that do not need the underhook are available here, the kimura grip among them, which a separate Journal note covers from half guard. The come-up is not available yet.",
        "They have it. Frames back first. If the frames will not come back, choose between going under the leg and conceding to recover, and choose while there is still room to move.",
        "This is a reading of the position, not a substitute for a coach watching you play it. Written material cannot feel where your weight is, and the Technique Library says so on every entry. What a note like this can do is shrink the decision. Half guard has a great many sweeps. At any moment, one arm has already decided which few of them you are being offered.",
      ],
    },
  ],
  sources: [
    {
      title:
        "IBJJF Rule Book (PDF filename 2024JUN_IBJJF_Rules_EN.pdf; page footer reads VERSION 6.1 2024): half-guard definition at article 4.2 (Guard Pass) Note 2; sweep, 2 points, articles 4.6.1 to 4.6.3; advantage from guard pass at 5.6.2; half-guard advantage exclusions at 5.7.1 and 5.7.2",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-09-18",
    },
    {
      title:
        "ADCC Rules and Regulations: sweeps ending in guard or half guard 2 points, clean sweeps ending past the guard 4 points, three-second establishment, points only to the fighter who initiates the sweep. Published without a version number or revision date",
      publisher: "Abu Dhabi Combat Club",
      url: "https://adcombat.com/adcc-rules-regulations/",
      accessed: "2026-09-18",
    },
    {
      title:
        "A Glossary of Guards Part 3: The Half Guard. Standard half guard, half butterfly, lockdown, deep half guard and Z guard described separately, including what the top arm does in each",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/a-glossary-of-guards-part-3-the-half-guard/",
      accessed: "2026-09-18",
    },
    {
      title: "Getting the Underhook in BJJ",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/getting-the-underhook-in-bjj/",
      accessed: "2026-09-18",
    },
    {
      title:
        "How to Defend and Counter the Crossface from Bottom Half Guard: layered frames, and denying the top player's underhook at close range",
      publisher: "Grapplearts (Stephan Kesting)",
      url: "https://www.grapplearts.com/how-to-defend-and-counter-the-crossface-from-bottom-half-guard/",
      accessed: "2026-09-18",
    },
    {
      title: "Inside Channel Control",
      publisher: "BJJ Mental Models",
      url: "https://bjjmentalmodels.com/inside-channel-control/",
      accessed: "2026-09-18",
    },
  ],
  relatedSlugs: [
    "the-kimura-as-a-control-before-it-is-a-finish",
    "guard-retention-as-a-system",
    "how-no-gi-rulesets-reshaped-technique-selection",
  ],
  contestedNotes: [
    "The central claim, that the near-side underhook is the first thing to check in half guard, is this site's argument and not a finding. No dataset of half guard outcomes by upper-body control exists that we could locate, and the piece cites instructional writing and rule books, not measurements.",
    "Half guard terminology is inconsistent between rooms. Grapplearts uses Z guard for what our Technique Library calls the knee shield, and some coaches reserve Z guard for a narrower position. The names used here follow the Library.",
    "The ADCC rules are a web page with no version number or revision date, so they are cited as read on the accessed date only.",
  ],
};
