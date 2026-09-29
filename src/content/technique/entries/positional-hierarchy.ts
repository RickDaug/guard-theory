import type { TechniqueEntry } from "../types.ts";

export const positionalHierarchy: TechniqueEntry = {
  slug: "positional-hierarchy",
  category: "defensive-concepts",
  title: "Positional hierarchy, ranked by the hips",
  summary:
    "Position before submission is a statement about force: grappling positions rank by whose hips are free, who can see, and who can leave, and most points-based rulesets score a similar ladder.",
  metaDescription:
    "Grappling positions ranked by mechanics rather than feel: whose hips are free, who can see and who can leave. Position before submission, read as mechanics.",
  difficulty: "Foundational",
  relevance: "Gi and no-gi",
  positionAndProblem:
    "You are underneath in side control and you have spotted their arm. It is right there, so you reach for the kimura with both hands, and a few seconds later you are mounted with both arms above your head. Most people meet the phrase position before submission early and hear it as etiquette, or as a coach's preference for patience. Read as mechanics it is neither. It says that from where you were, your hips were pinned, your arms were the only thing you could generate force with, and the arm you attacked belonged to a person whose whole body was free. The ranking of BJJ positions that most gyms teach, back, mount, side control, and down through half guard to guard, is a ranking of who can move and who can generate force.",
  objective:
    "Read every position by what each person's hips, eyes and exits can do, so that the order you defend and attack in follows from mechanics rather than from habit.",
  coreConcept:
    "A positional hierarchy is a ranking of force. Almost everything a grappler does with power starts at the hips: bridging, shrimping, standing, turning, and most sweeps and passes. A position ranks higher the more completely it takes one person's hips out of use while leaving the other's free. Two further questions refine the order: whether the pinned person can see the attacker, and whether either person can leave. Back control sits at the top because the pinned person's hips are held, they cannot see the attacks coming, and their arms defend alone. Mount holds the hips as completely, but the bottom player can see, can frame and can bridge, so it ranks a step lower. Side control pins the hips with the top player beside rather than on them, which leaves one hip mobile and makes frames possible. Knee on belly is a lighter version of the same pin that trades weight for the top player's mobility. Half guard sits between: the bottom player's hips are half free, and which half decides whether it is a guard or the last station before the pass. Guard is the floor of the ladder rather than a rung on it: both players have their hips free, one is on their back and one is not, and the contest is over who keeps that freedom. Standing is neutral in the same way. A leg entanglement sits outside the ladder altogether, because it pins one leg rather than the hips. Most points-based rulesets score a ladder close to this one, awarding points for arriving in a dominant position and holding it briefly, and some value mount and the back equally. How much each rung is worth, what counts as control and how long it must be held differ between organisations, so check the ruleset you compete under before trusting any number.",
  keyMechanics: [
    "Rank a position by whose hips are free. The hips drive almost every powerful movement in grappling, so the person whose hips are pinned is the person who cannot bridge, shrimp, stand or sweep.",
    "Refine the rank by sight and exit. A pinned person who can see the attack can frame against it, and a person who can stand up or step away can leave a position they are losing; the back removes the first and mount removes the second.",
    "Attack from a rung where their hips are held, and defend from one where yours are not yet. A submission attempted from a pinned position spends the arms, the only force left, on something the free person can move away from.",
    "Escape to the position the escape can actually reach. An escape from the back arrives facing them, usually in their guard, and an escape from mount usually arrives in half guard; aiming past what the escape reaches is how the current position is lost more completely.",
    "Trade down early rather than late. Giving up guard for half guard with the knee inside costs one rung; holding on until the pass finishes costs two, and the second is the one that comes with a crossface.",
    "Treat guard as neutral and keep it that way. Both players have their hips free in guard, which makes it a contest rather than a pin, and the moment your hips are stopped the position has become something else.",
    "Separate surviving from stalling. Surviving is defending on a rung while working for the next one; stalling is holding a rung with no movement, and most rulesets penalise the second in some form and define it in their own words.",
  ],
  commonErrors: [
    "Attacking a submission from a rung where the hips are pinned, which spends the arms on something the free person can move away from and leaves nothing for the escape.",
    "Escaping toward the top of the ladder in one movement, which skips the rung the escape can actually reach and usually returns you to the one you left.",
    "Holding a scoring position without progressing and treating it as winning, which gives the person underneath time to rebuild frames on a rung they should be losing.",
    "Ranking positions by how they feel, so knee on belly is dreaded more than mount even though it leaves more of the hips free and is easier to leave.",
    "Fitting a leg entanglement onto the ladder, which either overvalues a caught foot with the knee already free or undervalues a pinned knee with the hips held.",
  ],
  safetyNote:
    "Each rung up the ladder removes a defensive tool from the person underneath, and the one it removes last is the bridge. A submission set from mount or the back arrives on a body that cannot lift or turn to relieve it. A strangle or an arm attack from the top rungs therefore closes faster and with less warning than the same attack from guard. The person underneath taps as soon as a strangle or a joint lock closes on one of those rungs, because there is no bridge left to beat it with. Scrambles between rungs carry the other exposure: two bodies move fast and neither is managing the other's head, so when a turn starts to become a roll both partners slow it down, and the top player never stops a turn by holding the head.",
  trainingProgression: [
    "Static: partner moves through back, mount, side control, knee on belly, half guard and guard with no pressure while you say aloud, at each one, what your hips can do and whether you can see them.",
    "Cooperative: partner holds each position for thirty seconds and you move only your hips, to feel what each rung leaves you.",
    "Constrained: rounds start one rung below neutral, in bottom side control. You score by reaching guard and they score by reaching mount, and nobody attacks a submission.",
    "Ladder rounds: start on the back. The round ends when the bottom player has climbed two rungs or the top player has finished, and the pair name the rungs afterwards.",
    "Positional: full resistance with submissions, restarting at the rung the round began on, so the same rung is met many times in one session.",
    "Live rounds: afterwards, reconstruct the rungs the round passed through, and note on which one every submission attempt began.",
  ],
  relatedSlugs: [
    "frames-versus-blocks",
    "escaping-side-control",
    "escaping-back-control",
    "seat-belt-and-hooks",
    "leg-entanglement-as-control",
  ],
  review: {
    drafted:
      "Assisted draft, 2026-09-25, from docs/agent-handoffs/technique-program-2026-09 (brief 04, positional-hierarchy); written by a Claude Code agent from the research brief and the house style fingerprint.",
    factAudit:
      "Fact audit, assisted (Claude Code agent), 2026-09-28, ledger built by the auditor (PR #23 comment): 'same ladder / time held' scoring claim corrected (IBJJF scores mount and back equally after a 3-second hold); 'every gym' hedged; back-escape outcome aligned with escaping-back-control. Applied 2026-09-28, with the escape mechanic reworded so it no longer contradicts its own example.",
    voiceAudit:
      "Voice audit, assisted (Claude Code agent), 2026-09-28: 'physics claim' title and meta changed to mechanics; 'everyone learns' and 'every gym' hedged; aphorism closer, pointer to the leg-entanglement entry and 'simply' cut; safety note's tap line and roll line varied from the sibling back entries. Applied 2026-09-28.",
    approvedBy: null,
  },
};
