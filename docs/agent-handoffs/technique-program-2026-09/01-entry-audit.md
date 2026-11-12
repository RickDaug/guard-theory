# Technique Library entry audit — 16 entries on `main`

Read-only. Repo: `C:\Users\RickD\AndroidStudioProjects\guard-theory`. Entries: `src/content/technique/entries/*.ts`. Scores 0–3 per criterion (3 = nothing to fix).

**Title template** (`src/app/layout.tsx:21`): `%s · Guard Theory` = 15 chars of suffix, so a title must be ≤45 chars. The keyword map's `<Technique Name> — <Category>` template is **not implemented**; `[slug]/page.tsx` passes `entry.title` bare. `content.test.ts` checks title length for Journal articles only — no technique title is guarded.

**Headline finding before the tables:** `category-gate.ts` requires 3 entries per category and the maximum any technique category has is 2. **All 12 `/technique/[category]` pages are currently noindex.** Adding one entry each to open-guard, half-guard, butterfly-guard and submissions opens four of them.

## Per-entry scorecards

Columns: F = factual safety · M = mechanical accuracy · S = structure v. type · V = voice/slop · Q = search fit · L = internal links.

### seat-belt-and-hooks (back-control · Foundational)
| | | |
|---|---|---|
| F | 3 | "also commonly called the harness" is properly hedged; no dates, names or stats. |
| M | 2 | Fall-side rule (under-arm side) and no-crossed-ankles are correct. "Bottom hook stops them sitting down; top hook stops them turning into you" is a simplification stated as fact — most coaches describe the bottom hook as the one stripped to slide the hips to the mat; say "roughly" or re-word. |
| S | 3 | Objective one sentence; errors phrased as errors; progression static→live; body-triangle vs two-hooks preference honestly left open. |
| V | 2 | Three em-dashes; "then wondering where the back went" and "In most rounds it is the harness, even when it felt like a hook" are wry closers that recur across the library (see fingerprint). |
| Q | 1 | **Never says "rear naked choke", "RNC" or "back mount".** Says "strangle" only. A searcher for "seat belt grip bjj"/"back control no gi" gets the title; one for "rear naked choke position" gets nothing. |
| L | 3 | 3 related; 3 Journal crosslinks (RNC, turtle, overtime) + 2 figures. Best-linked entry. |

### blood-choke-versus-air-choke (submissions · Foundational)
| | | |
|---|---|---|
| F | 3 | Carotid/trachea mechanics are textbook; "many coaches, following judo usage, reserve strangle…" correctly hedged. |
| M | 3 | Chin, closed structure, back-and-chest, head control — complete and safe. Safety note (release on limp/unresponsive partner, no last squeeze) is the best in the library. |
| S | 3 | Summary is exactly 160 chars — at the ceiling with no `metaDescription`; one character of editing breaks the test. |
| V | 1 | **Seven em-dashes**, the most in the library; "You have a neck." opener is a knowing joke; "it is worth saying so plainly" (the T2 tic); "Tap." one-word closer. |
| Q | 2 | Has "rear naked strangles", "triangles", "guillotines", "carotid". Missing "rear naked choke", "RNC", "strangle vs choke" as a phrase; title uses "versus" where searchers type "vs". |
| L | 2 | 2 related; second one (`closed-guard-posture-battle`) has no stated basis in either text. 2 Journal crosslinks (RNC, guillotine). |

### inside-position (no-gi-systems · Foundational) — the file-comment "exemplar"
| | | |
|---|---|---|
| F | 3 | No checkable claims; QC B3's incidence/prognosis sentence has been removed. |
| M | 3 | Forearm-not-hand, both sides of centreline, elbow inside, feet match hands, re-take not retain. Correct and a good conceptual model. |
| S | 2 | Shortest entry (5/4/5). Summary is a "Why…" fragment, not a sentence. `relatedSlugs: []` — **the exemplar links to nothing while 8 entries link to it.** |
| V | 3 | Zero em-dashes, no tics. Three "X is a claim on space, not a grip" constructions — the source of the pattern others copied. |
| Q | 2 | Never says "inside control", "pummel/pummelling" or "hand fighting" as a phrase (only "Hand-fighting" in the safety note). |
| L | 1 | 0 outbound related; 3 Journal crosslinks inbound. Fix is trivial. |

### arm-drag (wrestling-for-bjj · Intermediate)
| | | |
|---|---|---|
| F | 3 | "The mechanic comes from wrestling" is uncontested; no names. "an angle for about half a second" is illustrative, not a stat. |
| M | 3 | Wrist + tricep grips, across not toward, hips travel, chest to torso, far hand to far hip/ankle. Safety note on the planted arm is precise and correct. |
| S | 3 | All fields in order; progression is the best-graded in the library (static → reaction → angle-only → constrained → positional → live). |
| V | 2 | Mixed dash: 3 em-dashes plus one spaced hyphen `" - the failed attempts"` in the last progression step — inconsistent with the rest of the file. |
| Q | 3 | "arm drag", "back", "standing/seated/guard" all in title/summary/meta. |
| L | 2 | 3 related; **no Journal crosslink** (only figure: Marcelo Garcia). `taking-the-back-from-turtle` or `seated-guard-and-supine-guard` would be candidates if either text names the drag. |

### closed-guard-posture-battle (closed-guard · Foundational)
| | | |
|---|---|---|
| F | 3 | No checkable facts. |
| M | 2 | Posture/base distinction is good. "Crossing the ankles high on the back, near the shoulder blades" describes something few adults can do — the real error is mid-back; "Heels low on the back near the belt line" is one school's teaching stated as the rule. |
| S | 3 | Clean. |
| V | 2 | "It is worth separating two things that get spoken about as one" (T2); "That number is usually the thing to fix" closer formula; 4 em-dashes. |
| Q | 2 | Has "closed guard", "posture", "break". Missing "break posture"/"posture break" as a phrase and "hip bump"/"sweep" (the entry says base-breaking makes sweeps appear but names none). |
| L | 3 | 3 related; 2 Journal crosslinks (armbar, triangle) + figure. Nothing links **back** to it except blood-choke (weak). |

### elbow-knee-escape (escapes · Foundational)
| | | |
|---|---|---|
| F | 2 | "cervical spine at its least stable angle" is an anatomical assertion with no source — the softened successor of QC B3 still makes a claim. Cut "at its least stable angle". |
| M | 3 | Bridge → shrimp → elbow inside knee → knee through, settle for half guard. Correct sequence; far-arm warning is right. |
| S | 3 | "Names vary a lot … gyms rarely agree" is the right hedge for shrimp/elbow escape terminology. |
| V | 2 | "Two things go wrong here in a specific way"; "The delay, rather than the technique, is usually the thing costing you" — same closer shape as posture-battle. 5 em-dashes. |
| Q | 3 | "mount escape", "elbow escape", "shrimp", "hip escape", "knee-elbow escape" all present. |
| L | 1 | 2 related; **zero Journal crosslinks** — unreachable from any article. |

### frames-versus-blocks (defensive-concepts · Foundational)
| | | |
|---|---|---|
| F | 3 | Mechanical only. |
| M | 3 | Bone-to-mat load path, directionality, withdraw-a-losing-frame. Coach-correct. |
| S | 3 | Comparison drill (30 s push vs 30 s frame) is the single best progression step in the library. |
| V | 2 | "The difference is the whole lesson and it does not need explaining" — then explains it; "The push is not a failure of will — it is a frame whose geometry was never set up." 4 em-dashes, 2 "worth". |
| Q | 2 | "frames bjj", "framing" present. "side control escape frames" — side control appears only in progression. |
| L | 3 | 3 related; 2 Journal crosslinks. |

### butterfly-hook-as-lever (butterfly-guard · Foundational)
| | | |
|---|---|---|
| F | 3 | Leg-entanglement-resistance claim is hedged twice ("structural tendency, not a guarantee"). |
| M | 2 | Connect → load → lift is right. "High and shallow, on the crook of the knee… less risk of being sat on; deep toward the groin… easier to get flattened over" — the depth trade-off is stated backwards from how most coaches describe it (a deep hook is what gets sat on); at minimum it is contested and should be hedged. |
| S | 3 | Clean; relatedSlugs (4) all justified. |
| V | 1 | **7 em-dashes**; "A related property worth knowing"; "not lift and hope". |
| Q | 1 | **Never says "butterfly sweep"** — the phrase a searcher types. Says "sweep" and "butterfly guard" separately. |
| L | 3 | 4 related; Journal (seated-guard) + figure. |

### connection-in-open-guard (open-guard · Foundational)
| | | |
|---|---|---|
| F | 3 | — |
| M | 3 | Paired contacts, bent pushing leg, load not push, hand off before stripped. Toes/locked-knee safety note is specific and right. |
| S | 3 | Summary is 202 chars — the longest on-page line; fine since meta exists, but it is two clauses stapled. |
| V | 1 | 6 em-dashes; "There is usually one, and it usually happened before you noticed the pass" — the wry live-round closer again; "Name out loud what each one prevents". |
| Q | 2 | "open guard" yes; "seated guard", "supine", "open guard retention" absent. |
| L | 3 | 4 related; 2 Journal crosslinks. |

### de-la-riva-hook (open-guard · Intermediate)
| | | |
|---|---|---|
| F | 1 | Safety note: "the outer side of the knee and the meniscus are the structures most often named when this guard hurts the person playing it" — **an unsourced injury-frequency claim ("most often named" — by whom?)**, the exact class QC B3 removed elsewhere, and it sits beside the site's "no medical claims" policy. |
| M | 3 | Outside leg around lead leg, foot to inside thigh, same-side ankle grip, second foot on far hip/knee, knee drawn out and forward. Correct, and the "let it go when they kneel on it" guidance is right. |
| S | 3 | 7 mechanics, no metaDescription (summary 157 — fits). |
| V | 3 | Zero em-dashes; plain declaratives. One of the four later-cohort entries that read cleanest. |
| Q | 1 | **Never says "de la Riva guard"** or "DLR" — only "the de la Riva hook" and "this guard". Searchers type the guard, not the hook. |
| L | 3 | 3 related; Journal crosslink to the de la Riva history article. |

### getting-hips-underneath (guard-retention · Intermediate)
| | | |
|---|---|---|
| F | 3 | — |
| M | 3 | Hips first, frame-then-move, shrimp-then-knee, shoulders as pivot, know your rung. Excellent. |
| S | 3 | Clean. |
| V | 2 | "It is also worth being clear"; "a frame is a payment for a hip movement, not a place to live"; "There is no version of this where…" 4 em-dashes. |
| Q | 1 | Title "Getting the hips back underneath" carries no query term; "guard retention" appears once in summary as "retention failures", never as the phrase "guard retention" in title or meta. |
| L | 3 | 4 related; Journal (guard-retention-as-a-system). |

### knee-cut-pass (passing · Foundational)
| | | |
|---|---|---|
| F | 3 | "knee cut and knee slice refer to the same pass; both are common and neither is more correct" — asserted without the house hedge, but uncontroversial. |
| M | 3 | Underhook/crossface before the knee travels, diagonal cut, trailing toes down, clear the foot first. Safety note on the bottom player's laced knee is the correct one. |
| S | 3 | Clean. |
| V | 2 | 6 em-dashes; metaDescription uses a spaced hyphen `" - and why"` where the file otherwise uses em-dashes. |
| Q | 3 | "knee cut pass", "knee slice", "half guard", "underhook" all present. |
| L | 3 | 4 related; Journal (underhook article). |

### knee-shield (half-guard · Intermediate)
| | | |
|---|---|---|
| F | 3 | Z-guard terminology properly hedged ("Many people… others reserve…"). |
| M | 3 | Hip over hip, shin on hip/ribs, knee toward far shoulder, bottom leg active, win the head, exits chosen early. Coach-correct. |
| S | 3 | Summary 199 chars is two sentences' worth of clauses; meta covers it. |
| V | 2 | "Terminology here is genuinely inconsistent"; "This is the round that shows whether your shield was ever the real problem." 4 em-dashes. |
| Q | 3 | "knee shield", "z guard", "half guard" — good. |
| L | 3 | 4 related; Journal (underhook). |

### leg-entanglement-as-control (submissions · Intermediate)
| | | |
|---|---|---|
| F | 3 | "IBJJF… allowed them in adult brown and black belt no-gi divisions since 1 January 2021" — matches the IBJJF rule change announced late 2020 and the Journal's own rulesets article (which the QC review verified against the v6.1 PDF). Reaping definition paraphrase is close to the rule book's. "often called… ashi garami", "what coaches commonly call the knee line" both hedged. |
| M | 3 | Knee before foot, hips tight, feet active, second leg, side not flat, grip last. Safety note (slow rotation, tap on the catch, do not spin out of an unidentified twist) is exactly right. |
| S | 3 | Title is 42 chars → **57 with suffix**, 3 from the cut. |
| V | 3 | Zero em-dashes. |
| Q | 2 | "ashi garami", "heel hook", "leg lock", "knee reaping" present. Deliberately omits "saddle", "inside sankaku", "50/50", "single leg X" — defensible editorially, costly for search. |
| L | 2 | 2 related (no other leg-lock entry exists); 2 Journal crosslinks. |

### sweeping-toward-the-missing-post (butterfly-guard · Foundational)
| | | |
|---|---|---|
| F | 3 | — |
| M | 3 | Sweep toward the trapped arm, lift with the opposite hook, fall to the shoulder, drive off the free foot. Direction logic is correct (checked: overhook their right → fall left → lift with your right hook). Landing-responsibility safety note is the right one for this sweep. |
| S | 3 | 7 mechanics; summary 159 — one char under the ceiling with no meta. |
| V | 3 | Zero em-dashes. |
| Q | 0 | **Title contains no searchable term** ("missing post"); body never says "butterfly sweep", "off-balance" as a noun, or "kuzushi". |
| L | 1 | 2 related; **zero Journal crosslinks**. |

### underhook-half-guard (half-guard · Intermediate)
| | | |
|---|---|---|
| F | 3 | "many gyms call the position the dogfight", "usually called a whizzer" — hedged. |
| M | 2 | Side first, deep underhook, head low, come up in stages, circle behind the hip — correct. "move your hook from a lockdown or a triangle" uses "lockdown" (a 10th Planet term) unexplained and unhedged. |
| S | 3 | 7 mechanics; summary 157 with no meta. |
| V | 3 | Zero em-dashes. |
| Q | 3 | "underhook", "half guard", "dogfight", "whizzer", "come up" — good. |
| L | 0 | **The Journal article `why-the-underhook-decides-half-guard` has four technique crosslinks and none of them is this entry.** The entry is unreachable from the one article that is about it. |

## (a) Ten most valuable fixes, ranked

1. **`src/content/crosslinks.ts`** — add an edge. Current: no edge touches `underhook-half-guard`. Proposed:
   `{ a: journal("why-the-underhook-decides-half-guard"), b: technique("underhook-half-guard"), basis: "The entry is the underhook game the article argues decides half guard." }`

2. **`inside-position.ts` · `relatedSlugs`** — Current: `[]`. Proposed: `["arm-drag", "connection-in-open-guard", "knee-cut-pass", "underhook-half-guard"]` (all four already link in; all four texts name inside/underhook contests).

3. **`de-la-riva-hook.ts` · `safetyNote`** — Current: "…and the outer side of the knee and the meniscus are the structures most often named when this guard hurts the person playing it." Proposed: "…Each of those puts a sideways, twisting load through a bent knee." (end the sentence there; delete the clause).

4. **`de-la-riva-hook.ts` · `summary`** — Current: "A leg wrapped around the outside of a standing passer's lead leg attaches one corner of their base to you, and everything else in the guard is built on that." Proposed: "The de la Riva guard starts with a leg wrapped around the outside of a standing passer's lead leg, attaching one corner of their base to you; everything else is built on that." (add a `metaDescription` ≤160 if this runs over.)

5. **`sweeping-toward-the-missing-post.ts` · `title` + `summary`** — Current title: "Sweeping toward the missing post". Proposed: "The butterfly sweep and the missing post" (40 chars + 15 = 55). Current summary opens "A sweep works in the direction…"; proposed: "A butterfly sweep works in the direction where the top player has nothing to put on the mat, so the work is removing a post and tipping them over it, not lifting harder." (169 — add a `metaDescription`: "A butterfly sweep goes where the top player has nothing to post. Remove the post, tip them over it, then lift; lifting harder is not the answer.")

6. **`seat-belt-and-hooks.ts` · `positionAndProblem`** — Current: "…usually while the person holding it is busy hunting a strangle…" Proposed: "…usually while the person holding it is busy hunting a rear naked choke…" (one phrase, and the page now contains the query every back-control searcher types).

7. **`butterfly-hook-as-lever.ts` · `objective`** — Current: "Transfer the opponent's weight onto your hook so that raising the leg lifts the opponent rather than just moving your own foot." Proposed: "Transfer the opponent's weight onto your hook so that raising the leg produces a butterfly sweep rather than just moving your own foot." Also hedge the depth trade-off in `keyMechanics[2]`: prefix with "Coaches disagree on depth, and it is a decision, not a default."

8. **`getting-hips-underneath.ts` · `title`** — Current: "Getting the hips back underneath". Proposed: "Guard retention: the hips back underneath" (41 + 15 = 56). Keeps the entry's phrase and puts the category query in the one place it is missing.

9. **`elbow-knee-escape.ts` · `safetyNote`** — Current: "…loads the neck in extension, which puts the weight of two people through the cervical spine at its least stable angle." Proposed: "…loads the neck in extension with the weight of two people on it." Also add crosslink `journal("guard-retention-as-a-system") ↔ technique("elbow-knee-escape")` only if that article's text names the mount escape (it may not — check before adding; otherwise the entry stays orphaned until an escapes article exists).

10. **`blood-choke-versus-air-choke.ts` · `coreConcept`** — Current: "Rear naked strangles, triangles, guillotines with the correct alignment and most of the standard finishes in the sport are built as the first kind." Proposed: "The rear naked choke, the triangle, the guillotine with the correct alignment and most of the standard finishes in the sport are built as the first kind." Also trim two of the seven em-dashes in the file to bring it under the library norm.

Honourable mentions: `arm-drag.ts` and `knee-cut-pass.ts` spaced-hyphen inconsistencies; `underhook-half-guard.ts` "lockdown" → "a lockdown (the 10th Planet term) or a triangle"; add a `metaDescription` to `blood-choke` (summary sits at exactly 160).

## (b) Thin categories and undelivered promises

Counts (16 entries, 12 categories; gate = 3; **none indexable**): open-guard 2 · half-guard 2 · butterfly-guard 2 · submissions 2 · closed-guard 1 · guard-retention 1 · escapes 1 · passing 1 · back-control 1 · defensive-concepts 1 · wrestling-for-bjj 1 · no-gi-systems 1.

What the summaries/metaDescriptions (`types.ts`) and keyword-map §4 promise that nothing delivers:
- **Half guard** promises "three separate games: knee shield, underhook, and deep half" — deep half absent. One entry opens the category page.
- **Open guard** promises "De La Riva, Spider, Seated" — seated guard (the brand's core no-gi guard) has a Journal article and no entry. One entry opens the page.
- **Butterfly** promises "why butterfly is the safest sitting guard against leg entanglements" — only a hedged aside in `butterfly-hook-as-lever`. One entry opens the page.
- **Submissions** promises "blood, air, lever and rotation" — lever (armbar, kimura) has two Journal articles and no entry. One entry opens the page.
- **Escapes** promises "Mount, Side Control, Back and North-South" and "where the reason an escape fails is almost always sequence" — mount only.
- **Passing** promises "pressure, movement and leg drag" as three families — one pass.
- **Back control** promises "finishing without gi grips" — no RNC entry despite a Journal article and the seat-belt entry never naming it.
- **Defensive concepts** promises "surviving vs stalling, including the competition-rules consequence" — frames only; no posture, no stalling entry.
- **Wrestling for BJJ** promises "takedowns… single leg… the scramble that follows the shot" — the arm drag is the only entry and is not a takedown.
- **Guard retention** promises a ladder "frame, re-angle, invert, recover" — one entry; inversion is only a safety warning.
- **No-gi systems** promises "grip duration, pace, friction" — inside position only; grip decay has a Journal article and no entry.
- **Closed guard** promises "sweeps that still function in no-gi and when to let it open" (keyword map) — no sweep entry.

## (c) House style fingerprint — what the best entries do

1. **A concrete scene opens `positionAndProblem`, in the second person, present tense, and the problem is a sensation not a diagnosis.** "Then you lift, and nothing happens — the opponent stays exactly where they are." (butterfly-hook)
2. **`coreConcept` names one governing idea in the first sentence and then reasons from it.** "Retention is a hip problem that presents as a leg problem." (getting-hips)
3. **A mechanic is an imperative, then the mechanical reason in one sentence, then nothing else.** "Bend the elbow and support it. An unsupported straight arm carries the load in the shoulder; an elbow braced against your own ribs or hip sends it into your torso and the mat." (frames)
4. **Contrast pairs carry the explanation: the right thing and the wrong thing in one sentence, separated by a semicolon.** "The hook stops the leg going sideways; the hand stops it going backwards." (de-la-riva)
5. **Terminology is reported, never legislated — a term arrives with who uses it.** "many coaches, following judo usage, reserve strangle for the blood mechanic and choke for the airway mechanic, while ordinary gym speech calls all of them chokes." (blood-choke)
6. **A contested question is stated as contested and left open, with both options' costs.** "two hooks are more mobile and give up less if the opponent stands, while a body triangle is harder to strip… Both are standard." (seat-belt)
7. **A common error is a gerund phrase naming the action and its mechanical consequence, never the person.** "Shrimping backward without re-inserting a knee, which returns the space that was just bought." (getting-hips)
8. **The safety note names one structure, the load direction, who is exposed, and what both partners do — no incidence, no prognosis.** "When their foot is still hooked or laced on your leg and you rotate and drive across, the rotation arrives at their knee, which is fixed at one end by their hook and loaded at the other by your body weight. Clear the foot before you cut." (knee-cut)
9. **Progression steps start with a register label and a colon, and each adds exactly one variable.** "Cooperative: partner reaches for a collar tie or a wrist each repetition; you drag the reaching arm as it comes, then reset." (arm-drag)
10. **The last progression step asks the reader to observe one thing, not to do one thing.** "Live rounds: count your drag attempts rather than your successes." (arm-drag)
11. **Sentences average 18–25 words; the longest carry a list, never a subordinate clause chain.** Later-cohort entries (de-la-riva, leg-entanglement, sweeping, underhook) use zero em-dashes and read no worse — that is the target.
12. **Hedged frequency words are "usually", "often", "most", "tends to" — never a number and never "always".** "the person who is lower and further behind the other's hip tends to win." (underhook)

**Tics a new writer must not copy** (present in 10+ of 16): the safety note opening with "The specific risk/exposure…" or "Two specific…" — the word "specific" is being used to prove the test passes; the `coreConcept` opener "X is not Y, it is Z" (nine entries); "It is worth…" (six); a wry one-line closer on the last progression step ("That number is usually the thing to fix").

## (d) Banned constructions, verbatim from `src/content/editorial-voice.ts`

```
/in the ever[- ]evolving world of/i,
/whether you(?:'|')re a seasoned (?:practitioner|grappler)/i,
/it is important to note/i,
/this comprehensive guide will delve into/i,
/\bgame[- ]chang(?:er|ing)\b/i,
/\blegendary\b/i,
/\btapestry\b/i,
/\brevolutioniz/i,
/\bunlock (?:your|the) (?:potential|game)/i,
/\bembark on (?:a|your) journey/i,
```

(The apostrophe alternation in the second pattern is `'` or the typographic `’`.) `content.test.ts` runs every one against title, summary, positionAndProblem, objective, coreConcept, safetyNote, keyMechanics, commonErrors and trainingProgression — **not `metaDescription`**, which is a gap. Also enforced: safetyNote > 80 chars and not matching `/^(train safely|be careful|listen to your body)\.?$/i`; ≥4 keyMechanics, ≥3 commonErrors, ≥4 trainingProgression; effective description 110–160 chars; a metaDescription must differ from the summary in text and length; no dangling or self-referential relatedSlugs; every category ≥1 entry.
