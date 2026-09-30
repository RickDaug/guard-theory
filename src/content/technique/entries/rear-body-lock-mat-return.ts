import type { TechniqueEntry } from "../types.ts";

export const rearBodyLockMatReturn: TechniqueEntry = {
  slug: "rear-body-lock-mat-return",
  category: "wrestling-for-bjj",
  title: "The rear body lock and the mat return",
  summary:
    "A rear body lock clasps your hands around a standing opponent's hips from behind, and the mat return takes them down by breaking their base beside you rather than dropping them from a height.",
  metaDescription:
    "Rear body lock takedowns in no-gi and BJJ: lock at the hips, break the base, return them to the mat under control, and take the back once they are down.",
  difficulty: "Intermediate",
  relevance: "No-gi first",
  positionAndProblem:
    "You have got behind a standing opponent, after an arm drag, a go-behind from a front headlock or a scramble, and your arms are around their waist. Without a gi there is no belt or collar to hold, so this clasp is the whole of your connection. They peel at your hands, widen their stance, and turn in toward you to face you again, and if they manage it the position you worked to reach is gone. The rear body lock is how the position is kept, and the mat return is how it is finished: rather than dropping the opponent from a lift, you take away the base they are standing on, sometimes with a short lift first, and bring them down beside you, still attached, with their back to you.",
  objective:
    "Lock your hands at their hip line, chest against their back, break their base by stepping behind or taking a leg, and bring them to the mat beside you under control so you arrive on their back.",
  coreConcept:
    "From behind, the opponent has two ways out: turn in to face you, or peel your hands open. Both depend on how high the lock sits. Clasped at the hip line with your chest glued to their back and your head to one side, the lock holds the pelvis, and a person whose pelvis is held can barely turn it toward you; they can only turn their shoulders, which leaves them still facing away. Clasped around the ribs, it controls the upper body only, the pelvis turns beneath it, and they come round inside the lock. The grip itself matters too: palm to palm, or one hand holding the other wrist, keeps the fingers out of reach, while interlaced fingers give them fingers to peel. With the lock set, the takedown comes from their base, not from your arms. Someone standing is balanced over two feet, and the mat return removes one of them or pulls the hips back past them. You can step a leg behind one of theirs and sit them down over it, drop a knee behind their knee so it folds, or pull their hips back and down toward you so they have to sit or fall forward onto their hands. Whichever you use, you stay attached and they land beside you or in front of you, on their side or their seat, still pressed to their back. From there the back is available: the seat belt replaces the lock, and hooks follow. Lifting them high and dropping them does the same job with far more risk, since a person lifted from behind cannot see the mat or catch themselves. IBJJF rules (the June 2024 rule book, version 6.1, p. 29) class as a severe foul any suplex that projects or forces the opponent's head or neck into the ground, and allow a suplex that does not.",
  keyMechanics: [
    "Lock at the hip line, not the ribs. Their hips are what swing round toward you, and arms holding the pelvis keep that swing from getting started.",
    "Keep your chest on their back and your head to one side. Any space between you and their back is room for them to turn, and a head in the middle can be caught under an arm.",
    "Clasp palm to palm or hand on wrist, not with interlaced fingers. They will attack the hands first, and interlaced fingers give them something to peel.",
    "Lower your hips below theirs before you try to take them down. A lock held from above can be dragged forward, while hips below theirs let you pull their weight back onto you.",
    "Break the base on one side. Step a leg behind theirs, fold a knee with yours, or pull the hips back until they sit; a person short of a foot on that side has to go down there.",
    "Return them to the mat beside you and stay attached as they land. Landing still pressed against their back is what turns the takedown into back control.",
    "Change grips on the way down. The lock becomes a seat belt, and the hooks go in once they are sitting or turned onto their side.",
  ],
  commonErrors: [
    "Letting the lock ride up to the chest, where their hips can turn beneath your arms until they face you.",
    "Interlacing the fingers, so they peel one finger back and the lock opens.",
    "Standing tall behind them with the hips level with theirs, which gives you no way to draw their weight back.",
    "Lifting them straight up and dropping them, which gives up the connection in the air and risks landing them on the head.",
    "Letting go of the lock as they land, so they turn to face you from the mat instead of giving up the back.",
  ],
  safetyNote:
    "A partner returned from a rear body lock cannot see the mat and has their arms partly trapped, so a lift and drop puts them on the head, the neck or a posted arm with no way to break the fall. In training, bring partners down by removing their base and lowering them with you, not by lifting them off the mat; if you do lift, keep it low and return them feet and hips first. The partner being returned should tuck the chin and let the side or seat take the landing rather than reaching back with a straight arm. The hands are exposed on both sides: a defender peeling fingers can dislocate one, so the attacker keeps the grip palm to palm and the defender works on wrists, not single fingers. When you are the one with the lock and they sit down hard, let your knee come off the mat to one side rather than letting them sit on your ankle.",
  trainingProgression: [
    "Static: partner stands still. Clasp at the hip line, chest to their back, head to one side, and have them try to turn their hips so you feel how much a higher or lower clasp changes.",
    "Cooperative: from the lock, partner stands in a normal stance. Lower your hips, step behind one of their legs and sit them down beside you, following them to the mat with the lock still on.",
    "Cooperative: repeat with the other methods, the knee folded behind their knee and the hips pulled back, until each one lands them on their side or seat.",
    "Hand-fighting drill: partner works only on your grip while you keep the lock at the hips and move your feet. Reset when the hands open.",
    "Constrained: start in the rear body lock at full resistance. Partner may widen, peel and turn in; you may only return them to the mat. Reset on a turn-in or a controlled landing.",
    "Standing rounds: from every rear body lock you reach, go for the mat return before they have widened their stance.",
  ],
  relatedSlugs: [
    "seat-belt-and-hooks",
    "arm-drag",
    "sprawl-hips-back-and-down",
    "two-on-one-controls-one-arm",
  ],
  review: {
    drafted:
      "assisted draft, 2026-09-29, from technique batch 3 target list (2)",
    factAudit:
      "Fact audit, assisted (Claude Code agent), 2026-09-29: IBJJF v6.1 p. 29 s. 6.2.3 L and Obs. re-read, suplex sentence exact (row 26 and 'Slam' row 21 marked in every division); hip-line lock and grip consistent with body-lock-pass-locks-the-hips; REVISE (3), fixes applied: 'cannot turn' hedged; mat return no longer defined as lift-free (short lift plus controlled return) in the summary and the opening; invented rule rationale cut from the safety note, the rule itself staying in the core.",
    voiceAudit:
      "Voice audit, assisted (Claude Code agent), 2026-09-29: mechanics clean; REVISE (3), fixes applied: safety-note restatement of the IBJJF suplex rule, with its attributed motive, cut; ribs-or-hips last step and ribs error shared with body-lock-pass-locks-the-hips reworded, last step made an instruction; 'and they know it' aside cut.",
    approvedBy: null,
  },
};
