# Guard Theory — Article Briefs

**Owner:** Content Strategist
**Status:** v1, drafted 2026-08-03
**Companion docs:** `editorial-calendar.md`, `topic-clusters.md`, `keyword-map.md`,
`internal-linking-map.md`, `seo-strategy.md`

---

## 0. How to use this document

Eighteen briefs. Each is a commission, not a draft. A writer should be able to start from one
without re-deciding what the piece is for.

**Nothing here is scheduled to publish until owner-decision item 2 is resolved.** There is no named
author with credentials, so every finished piece stays `status: "draft"`. See `editorial-calendar.md`.

### Route reality — read this before writing any internal link

`keyword-map.md` and `internal-linking-map.md` were written against a planned URL shape that the
application does not use. The routes that actually exist in `src/app/` are:

| Planned in SEO docs | What is really built |
| --- | --- |
| `/journal/[category]/[slug]` | **`/journal/[slug]`** — flat, no category segment |
| `/journal/[category]` | **`/journal/category/[slug]`** |
| `/figures/[slug]` | **does not exist** — only `/figures`, an index of names in preparation |
| `/editorial-policy`, `/corrections`, `/privacy` … | **`/policies/[slug]`** — `editorial`, `corrections`, `privacy`, `terms`, `shipping`, `returns`, `cookies`, `accessibility`, `affiliate-disclosure` |
| `/journal/page/[n]` | **does not exist** |

Every internal link in this document uses the real routes. Do not copy link targets out of
`keyword-map.md` — they will fail `tests/e2e/links.spec.ts`.

**Journal articles that exist and can be linked today** (all drafts):
`/journal/how-a-bjj-rash-guard-should-fit` · `/journal/maeda-and-the-arrival-of-judo-in-brazil` ·
`/journal/how-no-gi-rulesets-reshaped-technique-selection`

Three further articles are being written now — `guard-systems`, `mma-and-jiu-jitsu`,
`training-culture`. **Their slugs are not known to this document, so no brief links to them.** When
those slugs exist, revisit the internal-link lists marked *(pending)*.

**Technique Library entries that exist and can be linked today:**
`/technique/no-gi-systems/inside-position` · `/technique/closed-guard/closed-guard-posture-battle` ·
`/technique/open-guard/connection-in-open-guard` · `/technique/half-guard/knee-shield` ·
`/technique/butterfly-guard/butterfly-hook-as-lever` ·
`/technique/guard-retention/getting-hips-underneath` · `/technique/escapes/elbow-knee-escape` ·
`/technique/passing/knee-cut-pass` · `/technique/back-control/seat-belt-and-hooks` ·
`/technique/submissions/blood-choke-versus-air-choke` ·
`/technique/defensive-concepts/frames-versus-blocks` · `/technique/wrestling-for-bjj/arm-drag`

### Standing prohibitions — apply to all eighteen

These are in addition to each brief's own "must not claim" list.

- **No medical, hygiene, injury-prevention or infection claim.** Not for fabric, not for washing,
  not for warm-ups, not for tapping early. Injury epidemiology may be *described* as what a study
  found; it may never be turned into advice.
- **No performance claim for a garment.** No "improves recovery", "reduces fatigue", "increases
  grip endurance". The compression-garment literature is unsettled and the house position
  (established in `how-a-bjj-rash-guard-should-fit`) is to say so.
- **No unverified record, medal count, streak or "undefeated" claim.** If a result cannot be found
  in a primary or federation source, it does not appear. Community wikis are not sources.
- **No ranking of people.** No "greatest", "best ever", "top five". `/figures` is alphabetical by
  design and the copy must not undo that.
- **No invented statistic.** No search volumes, no "90% of people", no "most grapplers".
- **No AI-generated prose.** `/policies/editorial` states this publicly.
- **Banned constructions** (enforced by `tests/unit/content.test.ts`): "in the ever-evolving world
  of", "whether you're a seasoned practitioner", "it is important to note", "this comprehensive
  guide will delve into", "game-changer", "legendary", "tapestry", "revolutioniz*".

### Source-verification status

URLs below were returned by live web search or live fetch on **2026-08-03**, or are carried forward
from sources already verified in `docs/agent-handoffs/04-editorial.md`. Where a source is real but
its URL could not be confirmed, it is named and marked **URL to verify**. No URL in this document
was written from memory.

---

## B1 — Where the guard came from

**Slug** `where-the-guard-came-from` · **Category** `bjj-history` · **Flagship, ~2,000 words**

**The question.** Where did fighting from your back become a deliberate system rather than a losing
position, and how much of that can actually be documented?

**Why we can write it.** The house already owns a method for this: `maeda-and-the-arrival-of-judo-in-brazil`
established that we name the disagreement instead of picking a version. This piece applies the same
discipline to the position the brand is named after.

**Reader, and what changes.** A practitioner who has been told the guard was "invented in Brazil".
Afterwards they can distinguish what the sources support (judo *newaza* practice, a competitive
context that rewarded ground fighting) from what is retrofitted narrative, and they know which
claims are unsourceable.

**Sections.**
1. What a "guard" is, before the word existed
2. Newaza inside the Kodokan syllabus, and what its ranking of ground work reveals
3. What arrived in Brazil, and what the label on it was
4. The competitive pressure that made bottom position pay
5. The gap in the record, 1920s–1950s, and why it is a gap
6. What changed when the gi came off
7. What we do not know, listed plainly

**Research leads.**
- Kodokan Judo Institute, English-language institutional site — `kdkjd.org` returned in search as
  the English Kodokan site; `kdkjudo.org` is also described as official. **URL to verify** before
  citing; use whichever resolves to the institution itself, not a mirror.
- José Cairus, "Modernization, nationalism and the elite: the Genesis of Brazilian jiu-jitsu,
  1905-1920", *Revista Tempo e Argumento* — https://www.redalyc.org/journal/3381/338130377006/html/
- Roberto Pedreira, *Choque: The Untold Story of Jiu-Jitsu in Brazil*, vols 1–3, and the Global
  Training Report archive he has published since 2000 (`global-training-report.com`, **URL to
  verify**). Book record: https://books.google.com/books/about/Choque.html?id=gc80rgEACAAJ
- Robert Drysdale, interview on the first five Brazilians promoted by Maeda, BJJ Heroes —
  https://www.bjjheroes.com/interview/robert-drysdale-on-the-first-5-brazilians-promoted-by-mitsuyo-maeda
- IBJJF Rule Book (current version), linked from https://ibjjf.com/books-videos — for how the
  modern scoring definition of "guard" is actually written down.

**Factual risks.**
- Conflating *newaza*, *katame-waza* and "ground fighting" as one term. They are not interchangeable
  and the Kodokan's own usage matters.
- Attributing the guard's invention to one person. No source supports that.
- Treating period newspapers' use of "jiu-jitsu" as evidence of what was practised. Handoff 04
  already established this trap.
- Assuming the guard as taught in 1930 resembles the guard as scored in 2026.

**Must not claim.** That any named individual invented the guard. That the Kodokan "neglected"
ground work (a contested reading, not a fact). Any specific match result from the pre-federation era.
That no-gi is "closer to the original", which is unfalsifiable.

**Internal links.** `/technique/closed-guard/closed-guard-posture-battle` (what closed guard is
structurally) · `/technique/open-guard/connection-in-open-guard` · `/technique` ·
`/journal/maeda-and-the-arrival-of-judo-in-brazil` · `/journal/how-no-gi-rulesets-reshaped-technique-selection` ·
`/journal/category/bjj-history` · `/policies/editorial`. **No commercial link** (rule P-7).

---

## B2 — Luta livre, and Brazil's other grappling tradition

**Slug** `luta-livre-and-brazils-other-tradition` · **Category** `bjj-history` ·
**Flagship, ~1,900 words**

**The question.** Brazil had a no-gi submission grappling art running in parallel to jiu-jitsu for
most of the twentieth century. What happened to it, and what does its near-erasure tell us about how
grappling history gets written?

**Why we can write it.** A no-gi-first brand writing about the Brazilian tradition that was *already*
no-gi is the most on-thesis history piece available to us, and nobody in the apparel category has
written it. It also lets us examine the class dimension Cairus documents, which most retellings omit.

**Reader, and what changes.** A grappler who assumes no-gi is a recent American invention.
Afterwards they can place leg-lock-forward grappling in a much longer lineage and read
rivalry-era stories with appropriate scepticism.

**Sections.**
1. Two arts, one city, different clothes
2. Euclydes "Tatu" Hatem and what is documented about him
3. Class, access and the gi as a cost barrier — the Cairus reading
4. The rivalry, the challenge matches, and why the record is unreliable
5. What luta livre kept that jiu-jitsu de-emphasised
6. The absorption: where those ideas surface in modern no-gi
7. What cannot be settled from the available record

**Research leads.**
- Roberto Pedreira, *Choque* vol. 2 (1950–1960) and vol. 3 (1961–1999) — newspaper-archive-based;
  the only systematic English-language treatment. **URL to verify** (Amazon/Google Books records
  exist; cite the book, not a retail listing).
- José Cairus, as B1 — https://www.redalyc.org/journal/3381/338130377006/html/ — for the elite/class
  framing of early Brazilian jiu-jitsu.
- BJJ Heroes fighter profile for Euclydes Hatem ("Tatu") — the site's URL pattern is
  `bjjheroes.com/bjj-fighters/<name>`, but this specific page was **not confirmed. URL to verify.**
- Hemeroteca Digital Brasileira, Fundação Biblioteca Nacional — the primary Brazilian newspaper
  archive Pedreira works from. **URL to verify.**
- Robert Drysdale's published historical work and interviews, as B1.

**Factual risks.**
- The George Gracie / Hatem match circulates widely with confident detail and thin sourcing. Treat
  every round, method and date as unverified until found in an archive.
- "Luta livre" names both a wrestling-derived art and, in other periods, professional wrestling
  entertainment. Say which one is meant, every time.
- Birth and founding dates for luta livre figures vary between sources.
- The rivalry has partisans on both sides still alive. Attribute, do not adjudicate.

**Must not claim.** That either art "beat" the other. Any match result not found in a primary
archive. That luta livre "invented" leg locks. That modern no-gi descends from luta livre — the
influence is arguable, the descent is not documented.

**Internal links.** `/technique/no-gi-systems/inside-position` ·
`/technique/no-gi-systems` · `/journal/maeda-and-the-arrival-of-judo-in-brazil` ·
`/journal/category/bjj-history` · `/technique` · `/policies/editorial`. **No commercial link.**

---

## B3 — Oswaldo Fadda, and the lineage that grew outside the family

**Slug** `oswaldo-fadda-and-the-lineage-outside-the-family` · **Category** `influential-practitioners`
· **Flagship, ~1,800 words**

**The question.** What did Fadda's line actually contribute technically, and why is the standard
"non-Gracie lineage" framing itself disputed?

**Why we can write it.** The Maeda article already flagged the Franca–Fadda thread as "documented
less carefully than it deserves". This is the follow-up that piece implicitly commissioned, and it
lets us demonstrate the contribution-not-ranking standard `/figures` is built on.

**Reader, and what changes.** A reader whose mental map of BJJ history has one family in it.
Afterwards they can name a second documented teaching line, explain what it emphasised, and
articulate why the "non-Gracie" label is contested.

**Sections.**
1. Bonsucesso, and what teaching in a poor suburb actually constrained
2. Luiz França, and the link to Maeda's club that is asserted more than shown
3. The foot-lock emphasis: what the sources say, and what has been added later
4. Why Drysdale questions the "non-Gracie" framing
5. What the line looks like now
6. What a contribution claim requires before we publish it

**Research leads.**
- BJJ Heroes, Oswaldo Fadda facts and biography —
  https://www.bjjheroes.com/bjj-fighters/oswaldo-fadda-facts-and-bio
- BJJ Heroes, Luiz França record and lineage entry —
  https://www.bjjheroes.com/bjj-fighters/luiz-franca
- Robert Drysdale — his BJJ Heroes interview (URL in B1) plus his published historical writing;
  he has publicly questioned the non-Gracie framing. Book/essay **URL to verify.**
- Roberto Pedreira, *Choque* vols 1–2, for the newspaper record of the period. **URL to verify.**
- IBJJF graduation system, https://ibjjf.com/graduation-system — for what a rank did and did not
  certify institutionally, as a contrast to the informal period.

**Factual risks.**
- Fadda's foot-lock reputation is repeated everywhere and sourced almost nowhere. Find the primary
  claim or write that it cannot be found.
- Dates of the Fadda–Gracie academy challenge vary by source.
- "Marine" / military service details differ between retellings.
- Community reference sites reproduce each other. Two sites agreeing is not two sources.

**Must not claim.** That Fadda's students "proved" anything against another academy. Any specific
match record. That Fadda invented the footlock. That his line is or was superior — this is a
contribution profile, not a comparison.

**Internal links.** `/technique/submissions/blood-choke-versus-air-choke` (as the model for how we
treat submission mechanics) · `/figures` · `/journal/maeda-and-the-arrival-of-judo-in-brazil` ·
`/journal/category/influential-practitioners` · `/policies/editorial` ·
`/policies/corrections`. **No commercial link** (rule P-7).

---

## B4 — De la Riva, and the guard that took his name

**Slug** `de-la-riva-and-the-guard-that-took-his-name` · **Category** `influential-practitioners` ·
**Short, ~1,300 words**

**The question.** What problem was the de la Riva hook solving, and why did a gi-era guard survive
into a no-gi game that removed most of its grips?

**Why we can write it.** It is a checkable technical contribution — a named mechanic, a documented
originator, and a clear before/after in how open guard is played. That is exactly the standard
`/figures` sets.

**Reader, and what changes.** An open-guard player who uses the hook without knowing what it is for.
Afterwards they can say what the outside hook controls, and what has to replace the sleeve grip when
the sleeve is gone.

**Sections.**
1. The problem: a standing passer with a free leg
2. What the outside hook actually controls
3. Why it was originally called something else, and what that tells you
4. What the position loses without cloth
5. Where it sits in the open-guard family now

**Research leads.**
- BJJ Heroes, Ricardo de la Riva profile —
  https://www.bjjheroes.com/bjj-fighters/ricardo-de-la-riva-wiki-bio
- BJJ Heroes, "The De La Riva Guard" feature —
  https://www.bjjheroes.com/featured/the-de-la-riva-guard
- Stephan Kesting / Grapplearts, "The de la Riva Guard" —
  https://www.grapplearts.com/the-de-la-riva-guard/ — a long-running written resource, useful as a
  technical cross-check rather than a historical one.
- IBJJF Rule Book, https://ibjjf.com/books-videos — for how sweeps from the position score, which is
  part of why it spread.

**Factual risks.**
- The origin story (the beach, the year, the first use in competition) is repeated with varying
  detail. Attribute it to the source that states it.
- The original Portuguese name for the position appears in several spellings.
- Crediting later refinements to de la Riva himself. Separate the originator from the developers.

**Must not claim.** Any competition result. That the position is "the best" open guard, or that any
named athlete is the best user of it. That it was invented on a specific date unless a source states
that date.

**Internal links.** `/technique/open-guard/connection-in-open-guard` ·
`/technique/open-guard` · `/technique/guard-retention/getting-hips-underneath` ·
`/technique/no-gi-systems/inside-position` · `/figures` ·
`/journal/category/influential-practitioners`. **No commercial link.**

---

## B5 — Marcelo Garcia and the arm drag as a system

**Slug** `the-arm-drag-as-a-system` · **Category** `influential-practitioners` ·
**Short, ~1,300 words**

**The question.** What is the structural idea that connects the arm drag, the butterfly hook and the
back take into one game, and why did it transfer so cleanly to no-gi?

**Why we can write it.** We already have three Technique Library entries that are the components of
this argument (`arm-drag`, `butterfly-hook-as-lever`, `seat-belt-and-hooks`). The piece is the
systems essay that connects them, which is the site's whole organising claim.

**Reader, and what changes.** A grappler who drills the arm drag as an isolated move. Afterwards
they can describe it as an entry into a chain with a defined destination, and can name the reaction
each link is built on.

**Sections.**
1. Not a move: a way of taking the near side
2. Why the drag survives without a sleeve
3. The hook that makes the drag pay
4. Chest connection before hooks, and why the ordering matters
5. What the system asks of your conditioning
6. Naming the contribution without ranking the person

**Research leads.**
- BJJ Heroes, Marcelo Garcia fighter profile —
  https://www.bjjheroes.com/bjj-fighters/marcelo-garcia-fighter-profile
- FloGrappling athlete page — https://www.flograppling.com/people/5950193-marcelo-garcia
- ADCC results archive — https://adcombat.com/adcc-events/results/ and
  https://adcombat.com/event-category/adcc-worlds/ — **use only to verify a result you intend to
  state; prefer stating none.**
- "Physical and Physiological Profiles of Brazilian Jiu-Jitsu Athletes: a Systematic Review",
  *Sports Medicine – Open* — https://link.springer.com/article/10.1186/s40798-016-0069-5 — for the
  conditioning section, described as findings, never as training advice.

**Factual risks.**
- Medal counts and "most gold medals" claims circulate in several versions. Either verify against
  the federation archive or omit — omitting is preferred.
- Attribution creep: the arm drag predates any modern practitioner by a long way in wrestling. Say
  what was popularised, not what was invented.
- Nicknamed techniques ("the Marcelotine") are community coinages, not technical terms. Flag them as
  such or leave them out.

**Must not claim.** That he is the greatest ADCC competitor, or any superlative — this category is
explicitly not a ranking. Any specific medal tally not verified in the ADCC archive. That the system
"works for everyone" or is body-type-neutral.

**Internal links.** `/technique/wrestling-for-bjj/arm-drag` ·
`/technique/butterfly-guard/butterfly-hook-as-lever` · `/technique/back-control/seat-belt-and-hooks`
· `/technique/no-gi-systems` · `/figures` · `/journal/category/influential-practitioners`.
**No commercial link.**

---

## B6 — What the cage did to the guard

**Slug** `what-the-cage-did-to-the-guard` · **Category** `mma-and-jiu-jitsu` ·
**Short, ~1,400 words**

**The question.** How does a vertical wall change guard play, and why does a guard that works on a
mat become a liability against a fence?

**Why we can write it.** It is a structural argument about the environment, not a highlight reel,
and it is checkable against published time-motion research on how much of a fight happens at the
fence.

**Reader, and what changes.** A grappler who cross-trains and cannot work out why their guard fails
in MMA rooms. Afterwards they can name the specific mechanical differences — the wall as a frame the
top player owns, the loss of the back-step escape, the change to hip escape distance.

**Sections.**
1. A surface that only one player can push off
2. What the published time-motion work says about fence time
3. Wall-walking, and the escape that the mat does not have
4. Guards that lose their exit against a wall
5. What transfers back the other way

**Research leads.**
- "Winning techniques and time characteristics in UFC lower weight classes", *Combat Sports Science*
  — https://www.cambridgepublish.com/css/article/download/243/250/797 (PDF; verify the article
  landing page and cite that where one exists).
- "The Risk of Joint and Neck Injuries in Mixed Martial Arts — Grappling and Submission Techniques
  in Professional Fights", *Journal of Clinical Medicine* —
  https://pmc.ncbi.nlm.nih.gov/articles/PMC12610064/ (DOI https://doi.org/10.3390/jcm14217467)
- Unified Rules of Mixed Martial Arts, Association of Boxing Commissions — the primary rules text
  governing cage dimensions and fence grabbing. **URL to verify.**
- UFC Record Book — https://statleaders.ufc.com/ — note its own stated limitation: it covers UFC 28
  onward, which is a real constraint on any historical claim.

**Factual risks.**
- Cage dimensions and fence-grab rules differ by promotion and commission. Name which ruleset.
- Time-motion percentages are specific to the sample studied (weight class, era, promotion). Do not
  generalise a single study's figure to "MMA".
- "Wall-walking" and "cage wrestling" are coaching terms with no fixed definition. Define them in
  the piece.

**Must not claim.** That BJJ "does not work" in MMA — that argument belongs to the in-progress
`mma-and-jiu-jitsu` piece and duplicating it would be a duplicate-intent page. Any fight result
without a primary source. Any injury-risk advice.

**Internal links.** `/technique/guard-retention/getting-hips-underneath` ·
`/technique/half-guard/knee-shield` · `/technique/defensive-concepts/frames-versus-blocks` ·
`/technique/guard-retention` · `/journal/category/mma-and-jiu-jitsu` ·
*(pending)* the in-progress MMA article, once its slug exists. **No commercial link.**

---

## B7 — What the early UFC tournaments actually demonstrated

**Slug** `what-the-early-ufc-tournaments-demonstrated` · **Category** `mma-and-jiu-jitsu` ·
**Flagship, ~1,900 words**

**The question.** The early UFC events are cited as proof that grappling beats striking. What did
they actually test, and what did their format make impossible to conclude?

**Why we can write it.** The house method is interrogating evidence rather than repeating a
conclusion. This is the most-repeated conclusion in the sport and the one with the weakest
experimental design behind it.

**Reader, and what changes.** Anyone who has used "the early UFC proved it" in an argument.
Afterwards they can state precisely what a single-night, small-bracket, minimal-ruleset tournament
can and cannot establish — and can defend the actual, narrower claim, which is still substantial.

**Sections.**
1. The claim as usually stated
2. What the format was: bracket size, night length, rule set, selection of entrants
3. Selection effects — who agreed to compete, and who did not
4. The sample problem, stated plainly
5. What the events do support
6. What changed once everyone trained grappling
7. Why the weaker claim is the more useful one

**Research leads.**
- UFC Record Book — https://statleaders.ufc.com/ — and note its stated coverage from UFC 28 onward,
  which means the earliest events are *not* in the official statistical record. That absence is
  itself part of the article.
- Unified Rules of Mixed Martial Arts, Association of Boxing Commissions — for what "no rules" did
  and did not mean, and when regulation arrived. **URL to verify.**
- "Concussion vs. resignation by submission: Technical–tactical behavior analysis considering injury
  in mixed martial arts" — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9473287/
- "The Risk of Joint and Neck Injuries in Mixed Martial Arts" —
  https://pmc.ncbi.nlm.nih.gov/articles/PMC12610064/
- Sherdog Fight Finder, as a bout-record cross-check only — **URL to verify**, and treat as
  secondary; a fight database is not a federation record.

**Factual risks.**
- "No rules" is false. There were rules. State them.
- Event numbering, dates and bracket sizes are misremembered constantly.
- Retrospective interviews are memory, not record, and the incentives are obvious.
- Conflating the promotion's early events with the sport as it later became regulated.

**Must not claim.** Any specific bout outcome, time or method without a primary source. That any
style is superior. That any competitor was "undefeated". Anything about a named fighter's medical
history.

**Internal links.** `/technique/submissions/blood-choke-versus-air-choke` ·
`/technique/back-control/seat-belt-and-hooks` · `/technique/no-gi-systems` ·
`/journal/how-no-gi-rulesets-reshaped-technique-selection` (rulesets shape what you see) ·
`/journal/category/mma-and-jiu-jitsu` · `/policies/editorial`. **No commercial link.**

---

## B8 — How the guard reorganised around leg entanglements

**Slug** `how-the-guard-reorganised-around-leg-entanglements` · **Category** `guard-systems` ·
**Flagship, ~2,000 words**

**The question.** When leg attacks became legal at more levels of competition, what happened to the
rest of the guard — and which long-standing positions stopped being safe?

**Why we can write it.** It is argued entirely from published rule books, which is the method
`how-no-gi-rulesets-reshaped-technique-selection` already established here. It is also the single
biggest structural change in the modern guard and no apparel brand has written it.

**Reader, and what changes.** A guard player whose game predates the change. Afterwards they can
audit their own positions by asking what each one exposes below the knee, and know which rule set
they are actually training for.

**Sections.**
1. The guard's old assumption: the legs are the tool, not the target
2. What the rule books changed, and for which divisions
3. Entanglement as a position rather than a submission
4. Guards that became expensive: the exposure audit
5. Guards that became more valuable, and why butterfly is the usual answer
6. The two-ruleset problem for anyone who competes in both
7. What is still unsettled

**Research leads.**
- IBJJF Rule Book, current version, from https://ibjjf.com/books-videos — read the PDF, not a
  summary. Handoff 04 warns the illegal-moves table collapses under `pdftotext`; read it rendered.
- IBJJF new rules updates — https://ibjjf.com/news/new-rules-updates — the federation's own record
  of the 2021 change.
- ADCC Rules & Regulations — https://adcombat.com/adcc-rules-regulations/ — note it is published
  undated and unversioned, which limits any claim about past editions.
- "Injuries Common to the Brazilian Jiu-Jitsu Practitioner" —
  https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10181877/ — knee injury prevalence, reported as a
  study finding only.
- "Injury prevalence among Brazilian Jiu-Jitsu practitioners globally: a cross-sectional study in
  881 participants" — https://pubmed.ncbi.nlm.nih.gov/40092168/

**Factual risks.**
- Legality is division-specific (age, belt, gi/no-gi) and promotion-specific. A blanket "heel hooks
  are legal now" is wrong.
- Rule books are versioned and change. Cite version and clause, as handoff 04 requires.
- Terminology for entanglements is unstandardised and partly proprietary to particular schools. Name
  the dispute rather than picking a vocabulary.
- Do not date the change from when it became popular; date it from the rule text.

**Must not claim.** That any position is "safe" or "unsafe" — that is an injury claim. That leg
attacks are more or less dangerous than other submissions. Any injury rate not stated in a cited
study, and no advice derived from one.

**Internal links.** `/technique/butterfly-guard/butterfly-hook-as-lever` ·
`/technique/half-guard/knee-shield` · `/technique/guard-retention/getting-hips-underneath` ·
`/technique/open-guard/connection-in-open-guard` · `/technique/no-gi-systems` ·
`/journal/how-no-gi-rulesets-reshaped-technique-selection` ·
`/journal/category/guard-systems` · *(pending)* the in-progress guard-systems pillar.
**No commercial link** (rule G4).

---

## B9 — Seated guard and supine guard are two different jobs

**Slug** `seated-guard-and-supine-guard` · **Category** `guard-systems` · **Short, ~1,400 words**

**The question.** Sitting up and lying back are usually taught as preferences. What if they are
actually two different control problems with different failure modes?

**Why we can write it.** It is a systems argument built directly on entries we already publish
(`butterfly-hook-as-lever`, `getting-hips-underneath`, `connection-in-open-guard`), and it is the
kind of organising claim the Technique Library is structured to support.

**Reader, and what changes.** A guard player who switches between the two without a rule for when.
Afterwards they have a decision cue — where the opponent's weight is, and whether they can still get
underneath it.

**Sections.**
1. Two postures, two definitions of "connected"
2. What sitting up buys, and what it costs
3. What lying back buys, and what it costs
4. The transition, and the moment it goes wrong
5. A decision rule you can actually use in a round

**Research leads.**
- Guard Theory Technique Library entries, as the internal reference standard — the piece must not
  contradict them.
- Kodokan Judo Institute classification of *newaza* postures, for the historical vocabulary.
  **URL to verify** (see B1).
- IBJJF Rule Book, https://ibjjf.com/books-videos — for how each posture is treated by the sweep and
  stalling rules, which is a real and often unnoticed incentive.
- BJJ Mental Models concept database — https://www.bjjmentalmodels.com/database — a written
  concept-first reference; useful as a comparison point for how others frame this, and to make sure
  we are not restating someone else's framework without attribution.

**Factual risks.**
- Terminology: "seated guard", "sitting guard" and "butterfly" are used interchangeably by different
  schools. Define ours and say it is ours.
- Attributing the seated-guard emphasis to a particular modern athlete. Do not.
- Presenting a preference as a biomechanical necessity.

**Must not claim.** That one posture is superior. That either is safer. Any claim about which is
better for a body type — no source supports that.

**Internal links.** `/technique/butterfly-guard/butterfly-hook-as-lever` ·
`/technique/guard-retention/getting-hips-underneath` · `/technique/open-guard/connection-in-open-guard`
· `/technique/butterfly-guard` · `/technique/open-guard` · `/journal/category/guard-systems`.
**No commercial link.**

---

## B10 — Why the underhook decides half guard

**Slug** `why-the-underhook-decides-half-guard` · **Category** `technique-notes` ·
**Short, ~1,100 words**

**The question.** Half guard is taught as one position with many sweeps. What single variable
actually determines which of them is available?

**Why we can write it.** We already publish `knee-shield` and `frames-versus-blocks`. This is the
short argumentative companion the `technique-notes` category exists for — the Library defines, the
note argues.

**Reader, and what changes.** A half-guard player who collects sweeps. Afterwards they check one
thing first — who has the underhook — and pick from a much smaller, correct set.

**Sections.**
1. One name, three games
2. The underhook as a claim on the far shoulder
3. What the knee shield is doing while you fight for it
4. Losing the underhook: what is left, honestly
5. The one-question checklist

**Research leads.**
- Guard Theory Technique Library: `/technique/half-guard/knee-shield` and
  `/technique/defensive-concepts/frames-versus-blocks` — internal consistency is a hard requirement.
- Stephan Kesting / Grapplearts written half-guard material — https://www.grapplearts.com/ — one of
  the longest-running written BJJ resources; **verify the specific article URL** before citing.
- IBJJF Rule Book, https://ibjjf.com/books-videos — for how a half-guard sweep is scored, and why
  that shapes what gets drilled.
- BJJ Mental Models — https://www.bjjmentalmodels.com/database — as a check that we are not
  restating an existing named concept unattributed.

**Factual risks.**
- "Deep half" and "knee shield half" have different underhook logic; do not blur them.
- Attributing the underhook-first framing to a named coach without a citation.
- Claiming a sweep "always" works. Nothing always works.

**Must not claim.** Any injury or safety guidance beyond the technique entry's own safety note. That
this replaces coaching — `COACH_DISCLAIMER` is the house position and the article should be
consistent with it.

**Internal links.** `/technique/half-guard/knee-shield` ·
`/technique/defensive-concepts/frames-versus-blocks` · `/technique/half-guard` ·
`/technique/passing/knee-cut-pass` (the other side of the argument) ·
`/journal/category/technique-notes`. **No commercial link.**

---

## B11 — Grip decay, and the half-life of a no-gi grip

**Slug** `grip-decay-and-the-half-life-of-a-no-gi-grip` · **Category** `technique-notes` ·
**Short, ~1,200 words**

**The question.** A gi grip can be held for a minute. A no-gi grip cannot. How short is the window
really, and what does designing around it look like?

**Why we can write it.** It is the mechanical premise underneath the whole brand: no-gi is not gi
with the jacket removed, it is a different control-duration problem. There is published grip-fatigue
research to anchor it, and we already publish `inside-position`.

**Reader, and what changes.** A gi player crossing over who keeps trying to hold. Afterwards they
plan grips as expiring assets and sequence attacks accordingly.

**Sections.**
1. Cloth is a lock; skin is a delay
2. What the grip-fatigue literature actually measured
3. Sweat, and the part nobody quantifies
4. Designing sequences around an expiring grip
5. Where inside position replaces grip entirely

**Research leads.**
- "Analysis of grip specificity on force production in grapplers and its effect on bilateral
  deficit" — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10563762/
- "Does Grappling Combat Sports Experience Influence Exercise Tolerance of Handgrip Muscles in the
  Severe-Intensity Domain?", *Sports* — https://doi.org/10.3390/sports12030066
- "Physical and Physiological Profiles of Brazilian Jiu-Jitsu Athletes: a Systematic Review",
  *Sports Medicine – Open* — https://link.springer.com/article/10.1186/s40798-016-0069-5
- AATCC test methods for liquid moisture management in textiles (for the sweat/friction section) —
  the standards body is `aatcc.org`; **specific method number and URL to verify.**

**Factual risks.**
- Nearly all published grip research uses **gi** grip tests. Say so. Applying a kimono-grip finding
  to no-gi without flagging the difference is the error this piece is most likely to make.
- Percentages of strength loss vary hugely between protocols. Quote the study's own figure with its
  protocol, or quote none.
- "Sweat reduces friction" is intuitive but needs a source or an explicit "we could not source this".

**Must not claim.** That any garment, fabric or grip trainer improves grip endurance. Any training
prescription. Any figure not stated in a cited study.

**Internal links.** `/technique/no-gi-systems/inside-position` · `/technique/no-gi-systems` ·
`/technique/wrestling-for-bjj/arm-drag` · `/technique/open-guard/connection-in-open-guard` ·
`/journal/category/technique-notes`. **No commercial link** — the temptation to bridge to fabric
here is exactly what rule G4 exists to stop.

---

## B12 — What to wear to your first no-gi class

**Slug** `what-to-wear-to-your-first-no-gi-class` · **Category** `training-culture` ·
**Short, ~1,200 words**

**The question.** What does a beginner actually need for a first no-gi session, and how much of it
do they already own?

**Why we can write it.** The honest answer costs us a sale, which is the point. It is the highest
beginner-intent topic in the keyword map and the piece where refusing to sell is the whole trust
argument (`internal-linking-map.md` §6, Example 3).

**Reader, and what changes.** Someone booking a first class this week. Afterwards they know what to
turn up in, what is not allowed on the mat and why, and that they do not need to buy anything yet.

**Sections.**
1. What you probably already own
2. The three things a gym will actually object to (pockets, zips, anything with a loop)
3. Fitted versus loose, and what "fitted" means in practice
4. Shorts, spats and the question nobody asks out loud
5. What to check on your gym's own rules before you go
6. What to buy later, once you know you are staying

**Research leads.**
- IBJJF Rule Book uniform section, from https://ibjjf.com/books-videos — competition rules are not
  gym rules, and the piece must say so, but they explain where the conventions come from.
- ADCC Rules & Regulations — https://adcombat.com/adcc-rules-regulations/ — the other reference
  ruleset a beginner will eventually meet.
- Three real academy published beginner/uniform policies, collected at draft time with URLs and
  access dates. **URLs to be gathered — none are cited here because none has been verified.**
- Competitor treatments, as gap analysis only and **not citable in copy**: Kingz beginner clothing
  guide (https://www.kingz.com/blogs/news/what-to-wear-to-no-gi-bjj-a-complete-beginner-s-clothing-guide),
  Valor (https://www.valorfightwear.com/blogs/news/what-to-wear-for-your-first-no-gi-bjj-class-a-beginners-guide).

**Factual risks.**
- Gym rules vary and are not the IBJJF's rules. Do not present competition uniform requirements as
  what a gym will demand on a Tuesday night.
- Some gyms require a rash guard; some do not. Do not generalise.
- Groin protection rules differ by ruleset and by gym.

**Must not claim.** Anything about mat hygiene, skin infection, ringworm or staph. Anything about
what a garment prevents. That any specific item is required — say "check with your gym".

**Internal links.** `/size-and-fit` (what "fitted" should feel like) ·
`/journal/how-a-bjj-rash-guard-should-fit` · `/technique/no-gi-systems` ·
`/journal/category/training-culture` · `/faq` · *(pending)* the in-progress training-culture piece.
**No link to `/first-edition`** — this is the deliberate decision recorded in
`internal-linking-map.md` §6, Example 3, and it should not be quietly reversed.

---

## B13 — The dropout number nobody can source

**Slug** `the-dropout-number-nobody-can-source` · **Category** `training-culture` ·
**Flagship, ~1,800 words**

**The question.** "Ninety per cent of white belts quit." Where does that figure come from, and what
would it take to actually know?

**Why we can write it.** It is the house method applied to the sport's most-repeated statistic. It
demonstrates the editorial standard more convincingly than any statement of principles, and it is a
piece only a publication willing to end on "we do not know" can write.

**Reader, and what changes.** A practitioner who has repeated the number, or a gym owner who has
been sold it. Afterwards they can tell a survey from an inference from a guess, and they have a
short list of what a real answer would require.

**Sections.**
1. The number, and the six versions of it in circulation
2. Following each version back to its source
3. What a retention rate would actually require: a denominator, a time window, a definition of "quit"
4. What the self-published belt-progression datasets do and do not measure
5. What the sport-participation literature says, and why transfer to adult martial arts is limited
6. What the IBJJF's own time-in-grade minimums bound
7. The honest answer, and why it is more useful than the confident one

**Research leads.**
- BJJ Analytics belt statistics — https://www.bjjanalytics.com/belt-statistics — the most-cited
  quantitative source. **Treat as the object of study, not as an authority:** establish its
  methodology, sample and denominator before repeating any figure from it.
- IBJJF graduation system — https://ibjjf.com/graduation-system — time-in-grade minimums that bound
  any progression claim.
- Sport-dropout literature. Crane & Temple, "A systematic review of dropout from organized sport
  among children and youth", *European Physical Education Review* — real paper, **URL to verify** —
  and note it is youth sport, so transfer to adult recreational martial arts is limited and must be
  stated as such.
- "Injuries Common to the Brazilian Jiu-Jitsu Practitioner" —
  https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10181877/ — and "Injury prevalence … 881
  participants" — https://pubmed.ncbi.nlm.nih.gov/40092168/ — for injury as one *reported* reason,
  never as a causal claim about dropout.
- Blog-tier restatements (BJJ Fanatics, HeavyBJJ, Jiu Jitsu Haus and similar) — collect them as
  **evidence of circulation**, cite them as such, and never as sources for the figure itself.

**Factual risks.**
- The largest risk is reproducing the number while debunking it. Every figure quoted must be
  attributed in the same sentence.
- Belt-progression data and retention data are different things. A promotion rate is not a quit rate.
- Survivorship bias in any gym-sourced dataset.
- Self-selected online surveys are not samples of the population.

**Must not claim.** Any dropout percentage as fact. That injuries cause dropout. Any claim about why
individuals quit that is not attributed to a study or a named person. Any implication that a gym,
style or belt system is responsible.

**Internal links.** `/journal/category/training-culture` · `/policies/editorial` ·
`/policies/corrections` · `/about` · `/figures` (as an example of the same evidentiary standard) ·
*(pending)* the in-progress training-culture piece. **No commercial link.**

---

## B14 — How to wash a rash guard

**Slug** `how-to-wash-a-rash-guard` · **Category** `equipment-and-apparel` · **Short, ~1,300 words**

**The question.** Which laundry rules for elastane-containing knitwear are supported by materials
science, and which are folklore?

**Why we can write it.** We are specifying a garment, so we have to answer this for ourselves. The
piece explains the mechanism rather than issuing rules, which is the only version that survives a
reader who wants to argue.

**Reader, and what changes.** Someone whose rash guard has gone baggy or smells after a wash.
Afterwards they know which variable (heat, alkalinity, chlorine, mechanical action, drying) they are
actually controlling and why.

**Sections.**
1. What is in the fabric, and which part fails first
2. Heat: the one variable with the clearest evidence
3. Alkalinity, detergent and what "gentle" means chemically
4. Chlorine, and where it comes from if you never swim
5. Drying, and why the dryer is the expensive mistake
6. Odour: what is actually established, and what is not
7. The care label, and reading it as a specification

**Research leads.**
- Jovanović et al., *Materials* 15(19):6512 (2022) — https://pmc.ncbi.nlm.nih.gov/articles/PMC9570736/
  — already verified in handoff 04; elastane percentage and elastic region.
- Epps, "Degradation of Swimwear Fabrics: Effects of Light, Sea Water and Chlorine", *Clothing and
  Textiles Research Journal* (1987) — https://journals.sagepub.com/doi/10.1177/0887302X8700500205
- AATCC test methods — dimensional change in laundering, and colourfastness to laundering. Standards
  body `aatcc.org`; **method numbers and URLs to verify.** Do not cite a method number from memory.
- ISO 3758 textile care-labelling code / GINETEX symbol system — **URL to verify**; `iso.org` blocks
  automated requests (handoff 04, R8), so verify in a browser.

**Factual risks.**
- Vendor blogs quote very specific degradation percentages with no traceable study behind them. One
  such set surfaced during research for this brief and was rejected. Do not reuse a number you
  cannot open the study for.
- Elastane, spandex and Lycra are the same fibre class under different names; one is a trademark.
- Polyester and elastane fail differently. Do not describe "the fabric" as one material.
- Care-label symbols differ between the ISO/GINETEX and North American systems.

**Must not claim.** That any washing routine kills bacteria, prevents infection, or is hygienic.
That any product removes odour. Any specific temperature threshold not stated in a cited source.
Any lifespan figure for our own garment — we have none.

**Internal links.** `/journal/how-a-bjj-rash-guard-should-fit` · `/size-and-fit` ·
`/journal/category/equipment-and-apparel` · `/shop/theory-01-long-sleeve` (construction and fabric,
**one link, below the fold, per rule P-2**) · `/policies/editorial`.

---

## B15 — Long sleeve or short sleeve

**Slug** `long-sleeve-or-short-sleeve` · **Category** `equipment-and-apparel` ·
**Flagship, ~1,600 words**

**The question.** Is there a decision rule for sleeve length, or is it genuinely preference?

**Why we can write it.** We make both, which means we have had to answer it internally, and we can
publish the reasoning rather than the conclusion. `internal-linking-map.md` §6 already contains a
full link plan for this piece.

**Reader, and what changes.** Someone about to buy their first or second rash guard. Afterwards they
have a rule keyed to gym temperature, session length and what they personally do about skin contact
— and they know both lengths are competition-legal for no-gi while sleeveless is not.

**Sections.**
1. The variables that actually differ
2. Grip and friction on the forearm
3. Heat, and why the fabric matters at least as much as the sleeve
4. Skin contact, stated without a health claim
5. Competition legality, quoted from the rule book
6. A decision rule, and where it breaks down
7. What we chose, and what we accepted in exchange

**Research leads.**
- IBJJF Rule Book, current version, from https://ibjjf.com/books-videos — quote the uniform clause
  verbatim with its version and clause number, as handoff 04 did.
- ADCC Rules & Regulations — https://adcombat.com/adcc-rules-regulations/ — the second ruleset, and
  it is published undated, which must be stated.
- Jovanović et al., *Materials* 15(19):6512 — https://pmc.ncbi.nlm.nih.gov/articles/PMC9570736/ —
  for the fabric half of the heat argument.
- Clothing and thermoregulation during exercise — a review in a sports-science journal is needed
  here and none has been verified. **Source to find and verify before the heat section is written;
  if none is found, the section states that the evidence is thin and stops.**
- Category treatments as gap analysis only, **not citable**: BJJ Fanatics
  (https://bjjfanatics.com/blogs/news/rashguards-long-sleeve-vs-short-sleeve), Elite Sports
  (https://www.elitesports.com/blogs/news/long-sleeve-vs-short-sleeve-rash-guards-for-bjj).

**Factual risks.**
- Uniform legality is division- and ruleset-specific. Quote, do not paraphrase.
- The "10% belt-rank colour" ranked-rash-guard requirement applies to specific IBJJF contexts and is
  frequently misstated. Read the clause.
- Sleeve length and fabric weight are confounded in every real comparison.

**Must not claim.** That either length prevents mat burn, skin infection or injury. Any thermal
comfort figure without a source. Any durability claim about our own garment.

**Internal links.** `/technique/no-gi-systems` (how grips behave without a gi) ·
`/technique/guard-retention` · `/journal/how-no-gi-rulesets-reshaped-technique-selection` ·
`/journal/how-a-bjj-rash-guard-should-fit` · `/size-and-fit` ·
`/first-edition` (**the single sanctioned commercial link — closing paragraph, below the fold, rule
G3/P-2**) · `/policies/editorial`.

---

## B16 — Rash guard fabric, from the specification side

**Slug** `rash-guard-fabric-explained` · **Category** `equipment-and-apparel` ·
**Flagship, ~1,900 words**

**The question.** What do the numbers on a rash guard spec sheet — the blend ratio, the GSM, the
seam type, the print method — actually change on the mat?

**Why we can write it.** `competitor-research.md` §3 Tier 2 found that nobody in the category
publishes garment measurements and only a handful disclose composition properly. Writing from the
position of someone specifying a garment, including the trade-offs we accepted, is a position no
competitor currently occupies.

**Reader, and what changes.** Someone comparing two products by their spec lists. Afterwards they
know which specs are meaningful, which are marketing, and which cannot be compared across brands at
all.

**Sections.**
1. Polyester and elastane: two materials, two failure modes
2. Blend ratio, and what a higher elastane percentage buys and costs
3. GSM, and why it is not comparable across constructions
4. Knit structure, the spec almost nobody publishes
5. Flatlock and overlock: what the seam does under load
6. Sublimation, and why the printing process shaped the whole category's aesthetics
7. What we specified, and what we gave up

**Research leads.**
- Jovanović et al., *Materials* 15(19):6512 (2022) — https://pmc.ncbi.nlm.nih.gov/articles/PMC9570736/
- ASTM D2594/D2594M-21 (stretch and growth of knitted fabrics) and ISO 8559-1:2017 (anthropometric
  definitions) — both named in handoff 04 as read; **standards-body URLs to verify in a browser**,
  since `iso.org` blocks automated requests.
- AATCC test methods for dimensional stability and moisture management — `aatcc.org`, **method
  numbers and URLs to verify.**
- Spec-disclosure comparators, citable as examples of what a competitor publishes about its own
  product: Hyperfly Core Ranked (https://hyperfly.com/products/core-ranked-rash-guard), Scramble
  Senshu (https://scramblestuff.com/product/senshu-rashguard-26-black/). These are evidence of a
  published claim, not evidence the claim is true.

**Factual risks.**
- GSM is measured differently across mills and is not comparable between knit structures. This is
  the single most misused number in the category.
- "Four-way stretch" is used loosely and sometimes wrongly.
- Sublimation only works on polyester-dominant fabric — the process constrains the blend, not the
  other way round.
- Our own specification is not final (owner-decision item 3). **Do not publish our numbers until
  they exist.** Write the section as "what we are deciding and on what basis" if they do not.

**Must not claim.** Any performance, recovery or thermoregulation benefit. Any antimicrobial or
odour-control claim. Any lifespan figure. Any of our own measurements before owner-decision item 3
is resolved.

**Internal links.** `/journal/how-a-bjj-rash-guard-should-fit` · `/size-and-fit` ·
`/first-edition` (construction rationale — **one link, below the fold**) ·
`/shop/theory-01-long-sleeve` · `/shop/theory-01-short-sleeve` ·
`/technique/no-gi-systems` (the one sanctioned Cluster A cross-link, rule T→J-4) ·
`/journal/category/equipment-and-apparel`.

---

## B17 — The IBJJF no-gi uniform rules, read carefully

**Slug** `ibjjf-no-gi-uniform-rules-read-carefully` · **Category** `competition-analysis` ·
**Flagship, ~1,700 words**

**The question.** What does the IBJJF rule book actually require of a no-gi competitor's uniform,
and which parts of it does the apparel industry consistently get wrong?

**Why we can write it.** We are constrained by these rules as a manufacturer, we have already read
the primary PDF for two published drafts, and `competitor-research.md` §2.1 established that the
category's monochrome-plus-rank-stripe look is partly a rule-book artefact that nobody explains.

**Reader, and what changes.** A competitor buying a rash guard for a specific event. Afterwards they
can check a garment against the actual clause rather than a product page's "IBJJF legal" badge.

**Sections.**
1. Where the rules live, and which version you are reading
2. The rash guard clause, quoted
3. The rank-colour requirement, and the arithmetic people get wrong
4. Shorts and spats: the separate clauses
5. What "IBJJF legal" on a product page is worth
6. What changes at the check-in table, and what the referee actually inspects
7. Reading a rule book as a design constraint

**Research leads.**
- IBJJF Rule Book, current version, downloaded from https://ibjjf.com/books-videos. **Read the PDF.**
  Handoff 04 records that the illegal-moves table collapses under text extraction; the same caution
  applies to any table.
- IBJJF new rules updates — https://ibjjf.com/news/new-rules-updates
- IBJJF graduation system — https://ibjjf.com/graduation-system — the belt colours the rank
  requirement refers to.
- Third-party summaries as *evidence of what circulates*, explicitly not citable as authority:
  BJJ Heroes (https://www.bjjheroes.com/bjj-news/ibjjf-no-gi-uniform-requirements), Scramble
  (https://scramblestuff.com/ibjjf-legal-ranked-rashguards-all-you-need-to-know/).

**Factual risks.**
- Rule books are versioned and superseded. Name the version and date in the copy, and add a
  re-verification note (handoff 04, R6).
- Requirements differ by division: adult/juvenile/master, gi/no-gi, and by event tier.
- Third-party summaries disagree with each other and with the PDF. The PDF wins.
- The rank-colour percentage requirement is about area, and is routinely misdescribed.

**Must not claim.** That any Guard Theory product is IBJJF legal — we have no finished garment and
no measurement (owner-decision item 3). That a competitor's product is or is not legal. Any referee
practice not written in the rules.

**Internal links.** `/journal/how-no-gi-rulesets-reshaped-technique-selection` ·
`/journal/how-a-bjj-rash-guard-should-fit` · `/size-and-fit` · `/first-edition` (**one link, below
the fold** — the design constraint is genuinely the subject) · `/journal/category/competition-analysis`
· `/policies/editorial`.

---

## B18 — Submission-only, and the overtime problem

**Slug** `submission-only-and-the-overtime-problem` · **Category** `competition-analysis` ·
**Flagship, ~1,800 words**

**The question.** Removing points was supposed to remove stalling. What did submission-only formats
replace it with, and how do overtime systems try to fix that?

**Why we can write it.** Handoff 04 §8.4 explicitly commissions this: a submission-only section was
cut from the published rulesets article because the rules could not be located in citable form. That
gap is real, and a piece that *reports the gap* is more honest than one that papers over it.

**Reader, and what changes.** A competitor choosing between formats. Afterwards they can predict
what each ruleset will reward, and they know which promotions publish their rules and which do not.

**Sections.**
1. What points were doing, including the parts nobody misses
2. Pure submission-only, and the incentive it creates
3. Overtime as an answer: the escape-time and position-start family
4. What overtime rewards that a normal round does not
5. The transparency problem: which promotions publish a rule book at all
6. What a competitor should actually check before entering
7. What we could not source, stated plainly

**Research leads.**
- ADCC Rules & Regulations — https://adcombat.com/adcc-rules-regulations/ — the reference points
  system, and note it is published **undated and unversioned** (handoff 04, R5).
- IBJJF Rule Book — https://ibjjf.com/books-videos — for the points-and-advantages contrast.
- Submission Challenge, published rules — https://submissionchallenge.com/pages/rules — a
  submission-only promotion that does publish a ruleset. Useful precisely because it is checkable.
- Eddie Bravo Invitational / Combat Jiu-Jitsu overtime rules — **no primary published ruleset was
  located. URL to verify.** Descriptions circulate on third-party sites (BJJ Fanatics, Attack The
  Back, Elite Sports, Gold BJJ) and on video. If no primary source exists, **say so in the article**
  and describe the format as "as described by the promotion in interviews", attributed.
- Jits Magazine (https://jitsmagazine.com) and FloGrappling (https://www.flograppling.com) for event
  reporting leads — reporting, not rules.

**Factual risks.**
- This is the highest sourcing risk of the eighteen. Several well-known formats have no published
  rule book, and the community descriptions of them differ in detail.
- Overtime formats have changed between editions of the same event, usually without a changelog.
- Do not describe a promotion's current ruleset from a years-old article.
- "Submission-only" covers formats with time limits and draws as well as ones without. Distinguish.

**Must not claim.** Any match result, time or outcome. That one format is fairer or better. Any rule
detail sourced only from a third-party blog without labelling it as such. Any claim about athlete
safety under a given ruleset.

**Internal links.** `/journal/how-no-gi-rulesets-reshaped-technique-selection` ·
`/technique/submissions/blood-choke-versus-air-choke` · `/technique/back-control/seat-belt-and-hooks`
· `/technique/no-gi-systems` · `/journal/category/competition-analysis` · `/policies/editorial` ·
`/policies/corrections`. **No commercial link.**

---

## 19. Coverage check

| Category | Existing | Briefed here | Total |
| --- | --- | --- | --- |
| `bjj-history` | 1 (Maeda) | B1, B2 | 3 |
| `influential-practitioners` | 0 | B3, B4, B5 | 3 |
| `mma-and-jiu-jitsu` | 1 in progress | B6, B7 | 3 |
| `guard-systems` | 1 in progress | B8, B9 | 3 |
| `technique-notes` | 0 | B10, B11 | 2 |
| `training-culture` | 1 in progress | B12, B13 | 3 |
| `equipment-and-apparel` | 1 (fit) | B14, B15, B16 | 4 |
| `competition-analysis` | 1 (rulesets) | B17, B18 | 3 |

Every category ends with at least two pieces, which is the minimum for a category page to be worth
indexing (`seo-strategy.md` §5 sets three as the threshold for technique categories; the Journal
should hold to the same bar before any category page is submitted in a sitemap).

**Not briefed, deliberately:** any "best of" or "greatest ever" ranking; any city or location page;
any competitor-comparison page we cannot substantiate with our own testing; anything about
mouthguards, tape or mats, because there is no product and nothing to say yet
(`seo-strategy.md` §2, future adjacencies).
