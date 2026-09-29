import type { TechniqueEntry } from "../types.ts";

export const legLockDefenceKneeLine: TechniqueEntry = {
  slug: "leg-lock-defence-knee-line",
  category: "leg-locks",
  title: "Defending leg locks in order, knee first",
  summary:
    "Defending leg locks is mostly a matter of where your knee is: on your side of the line the attacker's thighs make, you have time to work, and once it is trapped past that line you are defending the finish rather than the position.",
  metaDescription:
    "Leg lock defence in BJJ, in order: clear the knee line, hide the heel, fight the hands on the foot, then free the leg. Why early beats clever, and when to tap.",
  difficulty: "Intermediate",
  relevance: "Gi and no-gi",
  positionAndProblem:
    "Your leg is caught between theirs and you start doing everything at once: pulling the foot, pushing their head, rolling one way and then the other. Some of it works, some of the time, and none of it is repeatable, because the defence has no order. Leg-lock escapes that only begin once a hand is on the heel are defending the last step of an attack that was built over several earlier ones. The better defence starts with the question the attacker is asking first, which is where your knee is. While your knee is on your side of their thighs, the entanglement is loose and you can still pull the leg out, stand, or pass. Once the knee has been drawn past that line and pinched between or behind their thighs, the attacker holds the leg above the joint and most of the leg-lock family becomes available.",
  objective:
    "Keep your knee, or get it back, on your side of the line the attacker's thighs make, and only then deal with the foot and the hands.",
  coreConcept:
    "The knee line is the line the attacker's thighs make across your leg. Your knee on your side of it means they are holding a lower leg, which moves with you when you move; your knee past it, trapped between or behind their thighs, means they are holding a thigh still while they work on what is below it. The heel hook and the kneebar need that fixed thigh and the straight ankle lock needs some of it, which is why clearing the knee line takes apart most leg attacks at once. That gives defence an order: the knee, then the heel, then the hands on the foot, then the whole leg. Each step removes something the next part of the attack needs, so working in order makes each step easier, and starting anywhere but the knee leaves every later step working against a thigh that is still held. Defending early also matters more than defending cleverly. An entanglement is easiest to leave when it is being built, so keep your knees in and your feet close when you pass, and treat a leg swinging across your hips as the start of the attack. Spinning under a heel hook is a common way for this to go wrong. A blind roll can turn your thigh against the heel they are holding and add to the twist at your own knee, so clear the knee line before any rotating escape, and learn each escape's direction from a coach in person.",
  keyMechanics: [
    "Clear the knee first. Pull the knee back to your side of their thighs and bring your hips with it, because the locks that attack the knee need the thigh held.",
    "Hide the heel. Turn the foot so the heel faces away from their grip and flex the foot toward your shin, which takes the handle away from a heel hook and stiffens the ankle against a straight lock.",
    "Fight the hands on the foot. Strip the grip at the wrist or push the forearm off the tendon toward your heel, since a grip broken early costs the attacker the whole finish.",
    "Keep your free leg active and in front of their hips. It is the leg you push with, step over with and stand on, and it stays out of their reach while it works.",
    "Sit up and stay upright where you can. A defender lying flat cannot reach the attacker's hands or hips and ends up defending with the leg alone.",
    "Free the leg completely, then take a position. Standing, passing or coming up on top takes you out of reach before they can wrap the leg again.",
    "Defend while the entanglement is being built. Knees in and feet close when passing, and a quick withdrawal of the leg the moment it is wrapped, prevent most of the finishes above.",
  ],
  commonErrors: [
    "Winning the fight for the foot while the knee is still trapped behind their thighs, which leaves the position that made the lock possible.",
    "Spinning hard before you know which way the lock is turning, which can put more turn on your own knee than their grip was applying.",
    "Lying flat with the arms away from the leg, so the attacker's hands and hips are out of reach while they work.",
    "Waiting until a lock hurts to begin defending, by which point the knee is held and the options are few.",
    "Escaping the leg and then staying where you are, so the same entanglement is waiting for the next attempt.",
  ],
  safetyNote:
    "The dangerous moment in leg-lock defence comes when the defender moves hard against a lock they have not diagnosed. With your knee trapped and the heel caught, a roll or a spin in the wrong direction turns your own thigh against the held heel, adding to the twist at your knee, and knee ligaments can be damaged before pain says anything. Once the heel is in their grip with your knee behind their thighs, tapping is the defence and spinning is not. Keep escapes slow when the partner has a grip, clear the knee before trying to rotate out, and practise escapes only with partners who apply leg locks slowly and release on a tap or a word. The attacker's job during defence drills is to hold the position without turning anything, so the defender can learn the escape without the finish arriving. Anyone whose knee has been twisted in an exchange stops training on it for the day and has it examined.",
  trainingProgression: [
    "Static: partner builds an entanglement on your leg with no grips. Touch the line their thighs make, then pull your knee back across it and describe what changed in their control.",
    "Cooperative: partner builds the entanglement slowly while you withdraw the knee at each stage, so you learn what the early, easy moments feel like.",
    "Priority drill: start with the knee trapped and a light grip on the heel. Work the order aloud, knee, heel, hands, leg, and restart if you skip a step.",
    "Constrained: attacker holds the position with no submissions allowed, defender scores by clearing the knee and freeing the leg.",
    "Positional sparring from a passing exchange where the bottom player may attack legs, the top player's goal being to pass without a knee ending up behind the bottom player's thighs.",
    "Live rounds with a partner who applies leg locks slowly, reviewing each leg-lock exchange afterwards by where your knee was when you first reacted.",
  ],
  relatedSlugs: [
    "leg-entanglement-as-control",
    "saddle-traps-the-knee",
    "straight-ankle-lock-is-a-lever",
    "frames-versus-blocks",
  ],
  review: {
    drafted:
      "assisted draft, 2026-09-29, from technique batch 2 target list (B)",
    factAudit:
      "Fact audit, assisted (Claude Code agent), 2026-09-29: knee-line definition consistent with leg-entanglement-as-control and heel-hook-is-rotation, now worded as the line the attacker's thighs make throughout; escape direction left to a coach as in the heel-hook entry; REVISE (3), fixes applied: 'every leg lock needs the fixed thigh' scoped to knee attacks to match the ankle-lock entry; self-loading roll re-described as thigh against held heel; forearm-strip direction framed toward the heel.",
    voiceAudit:
      "Voice audit, assisted (Claude Code agent), 2026-09-29: mechanics clean (title 40, meta 159); REVISE (5), fixes applied: title moved off the library's 'X starts at Y' template to 'Defending leg locks in order, knee first'; two errors and the coach-on-the-body closer copied from heel-hook-is-rotation rewritten; the tap line and static drill varied from the heel-hook wording; 'won rather than survived' slogan closer cut.",
    approvedBy: null,
  },
};
