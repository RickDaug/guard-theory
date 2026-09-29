import type { TechniqueEntry } from "../types.ts";

export const kneebarIsAnArmbarOnTheLeg: TechniqueEntry = {
  slug: "kneebar-is-an-armbar-on-the-leg",
  category: "leg-locks",
  title: "Kneebar mechanics borrowed from the armbar",
  summary:
    "A kneebar straightens the knee over your hips, so it works when the joint sits just past your hips and the leg above it is held.",
  metaDescription:
    "How the kneebar works in BJJ: hips as the fulcrum just above the knee, the heel held at your shoulder, where it comes from, and what rule books say about it.",
  difficulty: "Advanced",
  relevance: "Gi and no-gi",
  positionAndProblem:
    "You have their leg hugged to your chest and you arch as hard as you can, and they look at you, bend the knee a little and pull it out. Or you catch the leg as they step past your guard and roll onto it, and end up lying on their thigh with nothing happening. A kneebar that fails like this is usually a sound idea in the wrong place. The lock depends on where the fulcrum sits, and a leg is heavy and strong enough that a fulcrum slightly out of place gets nothing from it.",
  objective:
    "Hold the leg straight along your body with the knee just past your hips and the heel at your shoulder, then extend the hips slowly into the leg just above the knee.",
  coreConcept:
    "Any lock that straightens a joint needs three points: the limb held at the far end, held at the near end, and pushed at the joint in between. In an armbar those are the wrist at your chest, the shoulder pinned by your legs, and your hips against that shoulder with the elbow just past them. In a kneebar they are the heel or lower shin held at your shoulder, the thigh squeezed between your legs, and your hips pressing just above the knee. When the hips extend and the heel is held, the knee has nowhere to go but straight and then past straight. Everything depends on that middle point. With the knee sitting just past your hips, the whole length of the leg works for you. Because the thigh is thick and strong, a fulcrum that lands a little too high, up the thigh and away from the knee, sits in muscle and leaves no joint in the lever, which is why getting into position matters as much as the finish. The lock is commonly reached from two places. One is the saddle or another entanglement, when the defender turns the knee out and presents the leg straight. The other is a back-step, when a passer steps across your guard and you fall or roll to their leg as it plants. The IBJJF rule book (version 6.1, June 2024) keeps the kneebar for brown and black belts, gi and no-gi, and makes it a foul for everyone under 18 and for white, blue and purple belts at adult and master ages.",
  keyMechanics: [
    "Put the knee past your hips, not level with them. Slide your hips up the leg until you can feel the joint beyond them, because a fulcrum on the thigh bends nothing.",
    "Squeeze the thigh between your knees and cross or pinch the legs over it. The near end of the leg must not move, or the knee just bends away from the lever.",
    "Hug the lower leg with the heel or ankle trapped at your shoulder. A leg held at the shin with space around the foot lets them bend the knee and pull it back.",
    "Keep the leg straight in line with your body rather than turned. A kneebar that twists as it straightens starts loading the knee as rotation as well.",
    "Extend the hips slowly and hold the foot still. The finish comes from the hips moving under the joint, not from pulling the heel toward your face.",
    "Stay tight to their hip on the way in. Any gap there lets the knee bend and slide out before the lock is set.",
  ],
  commonErrors: [
    "Arching with the hips on the middle of the thigh, which spends effort against muscle and gives them time to bend the knee.",
    "Leaving the thigh loose between your legs, so the knee travels with the pressure instead of straightening against it.",
    "Holding the leg at the shin with the foot free, which lets them bend the knee toward their seat and extract it.",
    "Wrenching the heel toward your head to make up for a bad fulcrum, which moves the lock faster than the partner can answer.",
    "Rolling for the kneebar on a passer's planted leg at full speed, which catches the knee with weight on it before either of you can stop.",
  ],
  safetyNote:
    "A kneebar straightens the knee past its range, loading the capsule at the back of the knee and the ligaments that stop it bending backward, the cruciates among them, and at the end of that range there is little warning between stiffness and injury, because a knee that is already straight has little give left. Apply the hips slowly and stop at the first resistance. If you are caught, tap once your leg is straight and your knee sits past their hips, before it hurts. A particularly dangerous version is the one caught during a pass: the passer is upright and stepping, their weight is on the leg, and a fast fall onto it can straighten the knee under body weight before a tap is possible. In training, enter those kneebars slowly or from positions where the partner is already seated. Do not let a straight lock drift into a twist on either side of it. Whoever is caught must not roll or stand out of a locked kneebar, since the attacker's hips are already at the joint and any movement adds to the lever.",
  trainingProgression: [
    "Static: partner lies on their back and offers a leg. Build the three points in order, thigh between your knees, heel at your shoulder, knee past your hips, then check the knee's position by touch before any pressure.",
    "Cooperative: partner slowly bends the knee and tries to pull it back while you slide your hips up the leg to keep the joint past them. No finishing pressure.",
    "Slow finish: with a partner you trust to tap early, extend the hips a small amount and stop at the first resistance. Your partner taps on the straight leg, not on pain.",
    "Constrained: start in the saddle or another entanglement with the kneebar the only finish allowed, and the defender working to bend and free the knee.",
    "Back-step entry drill: partner walks a slow pass across your guard; fall to the leg only when the step lands, and set the three points without extending.",
    "Live rounds where kneebars are allowed: stop at each catch and ask whether their knee was past your hips.",
  ],
  relatedSlugs: [
    "leg-entanglement-as-control",
    "saddle-traps-the-knee",
    "leg-lock-defence-knee-line",
    "straight-ankle-lock-is-a-lever",
  ],
  review: {
    drafted:
      "assisted draft, 2026-09-29, from technique batch 2 target list (B)",
    factAudit:
      "Fact audit, assisted (Claude Code agent), 2026-09-29: three-point lever and fulcrum placement confirmed, compatible with the corrected armbar-is-hip-to-shoulder-distance; REVISE (4), fixes applied: legality reworded to IBJJF v6.1 p. 29 row 14 exactly (under 18, white/blue/purple at adult and master ages); unsound 'long leg magnifies the error' line replaced with thigh bulk; posterior capsule and cruciates named; 'most dangerous' hedged. Optional armbar wording (hips against the shoulder, elbow just past them) also applied.",
    voiceAudit:
      "Voice audit, assisted (Claude Code agent), 2026-09-29: mechanics clean (title 42, meta 157); REVISE (5), fixes applied: no lines copied from the armbar entry, and the analogy now stated once in the body (core concept), cut from the opening and the summary; 'the entry matters' reworded; hip-space and last-step lines shared with heel-hook-is-rotation varied; IBJJF sentence reframed to match the category rules note, with the fact audit's age wording.",
    approvedBy: null,
  },
};
