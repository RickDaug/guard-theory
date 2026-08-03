# Handoff 03 — Technique Library, first content pass

**Owner:** BJJ Research and Fact-Checking Editor
**Date:** 2026-08-03
**Status:** Complete for this batch. Twelve of twelve categories now have at least one entry.

---

## 1. Work completed

Wrote one `TechniqueEntry` for each of the eleven categories in `CATEGORIES` that did not already
have one. `no-gi-systems` was already covered by the exemplar (`inside-position`), which was not
modified.

Every entry conforms to `src/content/technique/types.ts` — all fields are required by the type, and
`npx tsc --noEmit` confirms none are missing or mistyped. Each entry was written to the exemplar's
standard: a concept rather than a flashy technique, mechanics ordered by importance, errors phrased
as errors rather than as scoldings, and a safety note naming the actual injury exposure of that
specific position rather than a generic warning.

### Category → entry map

| Category | Slug | Difficulty | Relevance |
| --- | --- | --- | --- |
| `closed-guard` | `closed-guard-posture-battle` | Foundational | Gi and no-gi |
| `open-guard` | `connection-in-open-guard` | Foundational | No-gi first |
| `half-guard` | `knee-shield` | Intermediate | Gi and no-gi |
| `butterfly-guard` | `butterfly-hook-as-lever` | Foundational | Gi and no-gi |
| `guard-retention` | `getting-hips-underneath` | Intermediate | Gi and no-gi |
| `escapes` | `elbow-knee-escape` | Foundational | Gi and no-gi |
| `passing` | `knee-cut-pass` | Foundational | Gi and no-gi |
| `back-control` | `seat-belt-and-hooks` | Foundational | No-gi first |
| `submissions` | `blood-choke-versus-air-choke` | Foundational | Gi and no-gi |
| `defensive-concepts` | `frames-versus-blocks` | Foundational | Gi and no-gi |
| `wrestling-for-bjj` | `arm-drag` | Intermediate | No-gi first |
| `no-gi-systems` | `inside-position` (pre-existing exemplar, untouched) | Foundational | No-gi first |

---

## 2. Files created

All under `src/content/technique/entries/`:

- `closed-guard-posture-battle.ts` → `closedGuardPostureBattle`
- `connection-in-open-guard.ts` → `connectionInOpenGuard`
- `knee-shield.ts` → `kneeShield`
- `butterfly-hook-as-lever.ts` → `butterflyHookAsLever`
- `getting-hips-underneath.ts` → `gettingHipsUnderneath`
- `elbow-knee-escape.ts` → `elbowKneeEscape`
- `knee-cut-pass.ts` → `kneeCutPass`
- `seat-belt-and-hooks.ts` → `seatBeltAndHooks`
- `blood-choke-versus-air-choke.ts` → `bloodChokeVersusAirChoke`
- `frames-versus-blocks.ts` → `framesVersusBlocks`
- `arm-drag.ts` → `armDrag`

Plus this handoff document.

**Nothing else in the repo was touched.** No index file was created, `types.ts` and
`inside-position.ts` are unchanged, and no git commands were run.

---

## 3. Assumptions

1. **No index/barrel file exists yet, and creating one was out of scope.** Whoever builds the
   rendering layer will need to collect these eleven exports plus `insidePosition`. Every file
   exports exactly one const named as the camelCase form of its slug, so a glob-and-import or a
   hand-written barrel are both straightforward.
2. **The import specifier keeps the `.ts` extension**, matching the exemplar. `tsconfig.json` has
   `allowImportingTsExtensions: true`, so this typechecks; it is a deliberate convention rather than
   an oversight, and future entries should copy it.
3. **`relatedSlugs` is validated at build time** per the comment in `types.ts`. Every reference used
   here resolves to a slug created in this batch or to `inside-position`. Verified by extracting all
   quoted lowercase-hyphen strings and diffing against the slug set — no orphans.
4. **Titles are sentence case**, matching "Inside position". Not "Title Case".
5. **One entry per category was the brief**, so topic choice favoured the concept that the rest of
   the category will hang off, not the most searched-for technique. `docs/keyword-map.md` describes
   entry URLs as `/technique/[category]/[slug]`, which these slugs fit without collision.
6. **Slug wording was chosen to be descriptive rather than keyword-stuffed.** The keyword map's
   worked example for half guard was `knee-shield-retention`; I used `knee-shield` because this
   entry covers the position rather than the retention game specifically. If SEO wants the longer
   form, renaming is a one-line change in three places (filename, `slug`, inbound `relatedSlugs`).

---

## 4. Sources consulted

No source is cited inside the entry files — they are prose content, not referenced articles. These
were used to check terminology and mechanical description, all consulted 2026-08-03:

- **Choke vs strangle, blood vs air** — digitsu.com "BJJ Chokes vs Strangles"; bjj-world.com "Blood
  vs Air Jiu-Jitsu Chokes"; themmaguru.com "Are BJJ Chokes Really Strangles?"; Wikipedia
  "Chokehold". Used to confirm that the choke/strangle terminology split follows judo usage and is
  genuinely inconsistent in ordinary gym speech. The entry says so rather than picking a side.
- **Knee shield vs Z-guard** — evolve-mma.com "Complete Guide To The BJJ Z Guard"; bjjfanatics.com
  "Z Guard BJJ"; submissionsearcher.com comparison piece; Wikipedia "Half guard". Confirmed that the
  two names are used interchangeably by many and distinguished by others (Z-guard = bottom leg
  hooked deep, feet connected). The entry states the disagreement.
- **Knee cut vs knee slice** — evolve-mma.com; bjjgraph.org "Knee Cut Pass"; nagafighter.com.
  Confirmed the two terms name the same pass. Stated in the entry so a reader is not hunting for a
  distinction that does not exist.
- **Seat belt / harness, hooks vs body triangle** — evolve-mma.com "A Beginner's Guide To The Seat
  Belt In BJJ" and "BJJ 101: The Back Mount"; nagafighter.com "What is Back Control in BJJ";
  pioneergrapplingacademy.com. Confirmed the seat belt/harness synonymy and that hooks vs body
  triangle is a live preference question rather than a settled one.
- **Hip escape / shrimp / elbow escape naming** — breakingmuscle.com hip-escape article;
  agjiujitsu.com; martialboss.com. Confirmed these are near-synonyms emphasising different parts of
  the same movement; the entry names all of them instead of asserting one is correct.
- **Frames as skeletal structure** — evolve-mma.com "What Is Framing In BJJ"; howbjjworks.com;
  bjjmentalmodels.com core mechanics; afterthemat.com "Frames, Levers, and Wedges". Used to check
  that the frame/push distinction is described the same way across independent sources.
- **Butterfly hook mechanics and loading** — bjjgraph.org "Butterfly Guard" and "Elevator Sweep";
  evolve-university.com butterfly guide; digitsu.com. Used for the load-then-lift sequencing and for
  the seated-posture requirement.

---

## 5. Risks and editorial decisions

1. **No named attributions anywhere.** Several of these concepts have popular attributions floating
   around (the arm drag's wrestling lineage, various coaches' framing vocabulary). The arm drag entry
   says the mechanic "comes from wrestling", which is uncontested; nothing is credited to an
   individual. If `/figures/[slug]` profiles later want to claim someone influenced a position, that
   claim belongs there with sources, not in these entries.
2. **Contested terminology is flagged in-text in three entries** — choke/strangle, knee shield vs
   Z-guard, knee cut vs knee slice, plus the shrimp/hip escape/elbow escape naming in the escape
   entry. This is deliberate and matches the brief. A copy editor should not "clean these up" into a
   single confident term.
3. **Safety notes make mechanical claims, not medical ones.** They describe what loads what, and what
   to do instead. The one place this comes closest to a health statement is the strangle entry, which
   says a blood strangle can take effect before a partner taps and that an unresponsive partner must
   be released immediately — this is standard mat-safety practice rather than a physiological claim,
   and it is phrased as an instruction to the reader. Anyone editing that entry should keep it that
   way and should not add anything about physiological mechanisms, timings or outcomes.
4. **No competition results, rules or records appear anywhere.** The `defensive-concepts` line in
   `docs/keyword-map.md` promises a survival-vs-stalling angle that includes "the
   competition-rules consequence"; the entry written here deliberately does not do that, because
   rules claims were out of scope. That is a gap between the keyword map and the content — see
   recommendations.
5. **Difficulty ratings are judgement calls.** Three entries are marked Intermediate (`knee-shield`,
   `getting-hips-underneath`, `arm-drag`) on the basis that they require a working guard game to be
   useful, not because the movement is hard. If the library later gets a difficulty rubric, these
   should be re-checked against it.
6. **Cross-linking is one-directional toward `inside-position`.** The exemplar has
   `relatedSlugs: []` and was not modifiable under this brief, so four entries link to it and it
   links back to nothing. If the rendering layer surfaces "related entries" as a bidirectional graph,
   this will look asymmetric and `inside-position` should be given its own `relatedSlugs`.

---

## 6. Tests performed

| Check | Command | Result |
| --- | --- | --- |
| Typecheck | `npx tsc --noEmit` from repo root | **Pass**, exit 0, no diagnostics |
| Lint | `npx eslint src/content/technique/entries` | **Pass**, exit 0, no warnings |
| Banned-phrase grep | case-insensitive grep for the prohibited marketing vocabulary across `entries/` | **No matches.** Two initial hits were removed: "unlocked" (literal, describing the legs) and repeated "elevate/elevation" in the butterfly entry, rewritten to "lift" and "raise" |
| Category coverage | grep of every `category:` field | Twelve distinct categories, each appearing exactly once |
| `relatedSlugs` integrity | extracted every quoted slug-shaped string and diffed against the created slug set plus `inside-position` | No dangling references |
| Field completeness | enforced by the type; `tsc` passing is the check | Pass |

Not run: `npm run build` (no route consumes these entries yet, so there is nothing for Next.js to
render) and `npm run test:unit` (only `tests/unit/contrast.test.ts` exists and is unrelated).

---

## 7. Remaining recommendations

1. **Build the index and the build-time validator next.** `types.ts` says `relatedSlugs` is
   "validated at build time" but no validator exists yet. It should assert: every slug is unique;
   every `relatedSlugs` member resolves; every `category` is a real `CategorySlug`; and — worth
   adding — that the filename matches the slug and the export name is its camelCase form, since
   nothing currently enforces that convention.
2. **Give `inside-position` its own `relatedSlugs`.** It is the hub four entries point at and it
   currently points nowhere. `arm-drag`, `connection-in-open-guard` and `knee-cut-pass` are the
   natural targets.
3. **Second entry per category.** Each category can now carry two or three more before it needs
   sub-structure. The obvious next round: closed guard sweeps as a base-breaking problem; the
   underhook half guard game (to sit alongside the knee shield); a side control escape to pair with
   the mount escape; the leg drag or a pressure pass to give `passing` a second family; the straight
   arm lock as a lever-mechanic counterpart to the strangle entry.
4. **Decide the rules question for `defensive-concepts`.** The keyword map wants a
   survival-vs-stalling distinction that touches competition rules. If that page is going to make
   rules claims, it needs a ruleset named and dated, because rulesets differ between organisations
   and change. Otherwise, soften the keyword map's promise.
5. **Media plan.** These entries describe mechanics that are genuinely hard to follow in prose —
   the knee cut diagonal, the butterfly load, the elbow-knee sequence. Each would benefit from a
   diagram or a short loop. The `Plate` and `GuardSystemMap` components in `src/components/notation/`
   suggest a house diagram style already exists; someone should check whether these entries can be
   illustrated with it before commissioning anything.
6. **Surface `COACH_DISCLAIMER` on every rendered entry.** It is exported from `types.ts` and the
   file comment says every rendered entry says so. Nothing enforces that yet; it belongs in the entry
   template, not in individual content.
