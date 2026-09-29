import type { TechniqueEntry } from "../types.ts";

export const straightAnkleLockIsALever: TechniqueEntry = {
  slug: "straight-ankle-lock-is-a-lever",
  category: "leg-locks",
  title: "How a straight ankle lock loads the ankle",
  summary:
    "A straight ankle lock is a lever: the bone of your forearm lifts under the Achilles tendon while the foot is held pointed, so the ankle is bent along its own hinge rather than twisted.",
  metaDescription:
    "Straight ankle lock mechanics in BJJ: forearm under the Achilles, foot in the armpit, hips finishing the lever, and how it differs from a heel hook.",
  difficulty: "Intermediate",
  relevance: "Gi and no-gi",
  positionAndProblem:
    "You have a foot under your arm, you fall back, and nothing happens except that they sit up, pull the leg toward themselves and step over your hip. Or the lock bites, but in the calf, and they wait it out while your forearms burn. The straight ankle lock, also known as the straight footlock or the Achilles lock, is often the first leg lock people learn, and it is commonly forced with the arms alone. Both failures come from position rather than strength: the forearm has landed on the wrong part of the leg, or the leg above the ankle is still free to follow the foot.",
  objective:
    "Hold their knee with your legs, set the bony edge of your forearm under the Achilles with the foot trapped at your armpit, and finish by arching the hips rather than pulling with the arms.",
  coreConcept:
    "The lock is a lever with your forearm as the fulcrum. The bony edge of the forearm near the wrist sits under the back of the ankle, low on the leg where the calf has narrowed into tendon, and the top of their foot is held against your side under the armpit. When you arch your hips toward their knee and drop your shoulders back, the forearm rises into the back of the ankle while the foot stays trapped, so the foot is forced to point past its range and the tendon is pressed by the bone of the forearm. Nothing in that movement turns the leg: the ankle is bent along the hinge it already has, which is why pain tends to arrive earlier and more plainly than in a twisting lock. The lock needs less control above the joint than the heel hook does, but it still needs some. If their knee can bend and their hips can come forward, they sit up into you, the lever shortens, and the foot slides down the forearm until the blade is on the calf. That is why the finish is taken from an entanglement such as ashi garami or single-leg X, with your legs holding their knee and a foot on their hip to stop them following the leg. The attacker turning their body toward the foot that is not under attack while applying it is an IBJJF foul up to purple belt, and that turn is where the lock starts to add twist to the leg.",
  keyMechanics: [
    "Control the knee before you sit back. Your legs have to hold their knee straight and your foot has to keep their hip away, or the leg bends, they sit up and the lever loses its length.",
    "Place the bony edge of the forearm under the Achilles, low enough that it presses tendon rather than muscle. A forearm on the calf gives them a soft cushion to wait on.",
    "Trap the foot deep under the armpit, with the top of the foot against your side. A foot held only in the hand has room to flex back toward the shin and slide out.",
    "Lock the grip by joining your hands or taking your own forearm with the free hand, and keep the elbow pinned to your ribs. An elbow that drifts away opens a gap for the heel.",
    "Finish by arching the hips toward their knee and taking the shoulders back toward the mat. The arms hold the shape; the body moves the lever, which is slower to tire and easier to stop.",
    "Stay square to the attacked leg while you arch. Leaning off to one side tends to turn the lever into a partial twist and lets the foot rotate out of the armpit.",
    "Keep your own feet tidy and out of their reach during the finish. A leg left loose while you fall back gives them one to attack.",
  ],
  commonErrors: [
    "Setting the forearm on the calf, which lets them tense the muscle and wait while your arms tire.",
    "Holding the foot in the hands rather than the armpit, so the foot flexes back toward their shin and slides free.",
    "Falling flat on the back with the legs slack, which lets their knee bend and their hips sit up into the space.",
    "Pulling with the arms and shoulders, which moves the foot instead of the lever and spends grip for nothing.",
    "Setting the forearm on the heel bone instead of the tendon, so the foot slides out past the wrist as soon as they pull.",
  ],
  safetyNote:
    "Forcing the foot to point past its range presses the Achilles against the forearm and strains the front of the ankle, and the person being attacked usually feels it build before anything tears, though not every time. Someone with loose ankles, or someone who is sure they can wait it out, can pass the point of pain and reach damage in the same moment, so tap on a set lock rather than when it hurts. The attacker arches slowly, holds the finish at the first sign of resistance, and never adds a twist to a straight lock that is not coming; a turned ankle lock loads the ligaments at the sides of the ankle and starts passing rotation up to the knee. Settle whether counter leg locks are allowed before you start, since falling back for the lock puts your own heel near their hands. An ankle that has been bent hard is rested and examined before it is trained on again.",
  trainingProgression: [
    "Static: partner lies back on their elbows with one leg straight and does not grip. Build the entanglement, trap the foot at the armpit and set the forearm under the tendon, then have your partner say whether they feel bone or pressure on the calf.",
    "Cooperative: partner slowly tries to sit up and bend the knee while you keep the foot on their hip and the knee straight. Nothing is finished.",
    "Slow finish: arch the hips a few degrees and stop at the first pressure. Your partner taps there, before pain, and you both note how far the hips had moved.",
    "Constrained: attacker starts with the foot trapped and has until the defender clears the knee to set the forearm under the tendon. No finishes.",
    "Positional sparring from the entanglement, with the straight ankle lock the only submission allowed and taps agreed as early. Swap roles each round.",
    "Live rounds: after each ankle lock attempt, tell your partner where the forearm ended up, under the tendon or on the calf.",
  ],
  relatedSlugs: ["leg-entanglement-as-control", "leg-lock-defence-knee-line", "inside-position"],
  review: {
    drafted:
      "assisted draft, 2026-09-29, from technique batch 2 target list (B)",
    factAudit:
      "Fact audit, assisted (Claude Code agent), 2026-09-29: IBJJF v6.1 p. 29 rows 3 and 16 re-read from the rendered table, both match; lever, blade and armpit mechanics confirmed; REVISE (2), fixes applied: the row-16 sentence now names the attacker as the one turning, and 'stops being an ankle lock' is replaced with the ankle's side ligaments plus rotation to the knee. The row-3 legality sentence was later cut in the voice revision; the category rules note carries it.",
    voiceAudit:
      "Voice audit, assisted (Claude Code agent), 2026-09-29: mechanics clean (title 41, meta 148); REVISE (5), fixes applied: heel-hook comparison lines copied from heel-hook-is-rotation rewritten or cut; static, slow-finish, constrained and safety-closer lines shared with sibling leg-lock entries varied; doubled 'often' hedged; the general IBJJF legality sentence cut, keeping only the rule that explains the twist.",
    approvedBy: null,
  },
};
