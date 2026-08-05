# 08 — BJJ domain and content audit

**Auditor:** BJJ domain and content
**Date:** 2026-08-04
**Scope:** the six unreviewed submission and transition articles as the priority
(`the-armbar-from-closed-guard`, `the-triangle-and-the-angle`,
`the-rear-naked-strangle-from-back-control`,
`the-kimura-as-a-control-before-it-is-a-finish`,
`the-guillotine-from-the-front-headlock`, `taking-the-back-from-turtle`), read
end to end, plus consistency across all 18 Journal articles, 12 Technique Library
entries and 10 Figure profiles.

**Method:** every source document cited by the six was downloaded and read from
extracted text, not from a summary or a search result. That is nine documents:
the UWW *Grappling Rules 2025* PDF, the UWW *International Wrestling Rules* PDF,
the IJF *Sport and Organisation Rules* v12.03.2024 Appendix D PDF, the ABC
*Unified Rules of MMA* August 2025 PDF, the ADCC rules page (raw HTML,
de-tagged), the IBJJF `books-videos` page **and** the two PDFs it links
(`2024JUN_IBJJF_Rules_EN.pdf`, `20240101_GolpesProibidos_EN.pdf`), and the
Spanias et al. paper PDF from SHURA. Every one of the 32 `sources` entries across
the six articles was checked against the document it names. `npm run test:unit`:
27 tests, 27 pass, 0 fail. No build, dev server, Playwright or Lighthouse command
was run.

---

## Fabricated citations

**No fabricated citation was found in the six new articles.** Every URL resolves,
every document says what it is cited for, and every clause number and quoted
phrase I checked is exact. Specifically verified verbatim:

- UWW Grappling, age restrictions: *"U13 and U15 are not allowed to perform
  guillotines (except arm-in guillotine), footlocks (except straight footlock),
  calf/bicep slicers, or kneebars."*
- UWW Grappling, the crank footnote: *"It is legal and not considered a neck
  crank if during a choking technique is applied pressure to the neck (for
  example during a guillotine or a rear naked choke)"*
- UWW Grappling, back mount: *"When a grappler controls the opponent from the
  back, with his/her chest to the opponent's back and his/her heels between both
  of the opponent's thighs, or in a body triangle with the legs in a position to
  trap up to one of the opponent's arms, for the count of 3 seconds."*
- UWW Wrestling Art. 51: *"In freestyle, a scissor-lock with the feet crossed on
  the head, neck or body is forbidden."* Art. 47 forbids strangling. Both exact.
- IJF Appendix D, Art. 18.1.2 item 27 (sankaku), the kata-sankaku four-picture
  passage, Art. 18.2.2 items 8 and 9, the kneeling-athlete passage, and the
  elbow-joint sentence in the preamble. All present, all as cited.
- ADCC: *"Any kind of choke (except for using the hand to close the windpipe)"*,
  *"Any arm bar, shoulder lock, or wrist lock"*, *"Can Opener is allowed"*,
  *"No neck cranks that trap both shoulders and puts downward pressure on the
  neck"*, *"No crossface guillotine twisting the chin"*, *"Back mount with hooks
  = 3 points"*, *"Your hooks must not be over any of the shoulders"*, *"CAN NOT
  roll forward while someone is on your back"*, *"No spiking your opponent's head
  when opponent is on your back"*, the slamming clause. All exact.
- IBJJF v6.1: 4.1.2, 4.5, 5.6.5, 6.2.2 W (verbatim, including "Flying Triangles
  and Flying Armbars"), 6.2.3 I, and the illegal-moves table rows. All exact.
- ABC Unified Rules: foul 6(a) including the elevating-out-of-a-submission
  clause, foul 8(a), foul 16(a). All exact.
- Spanias et al.: 26 matches (13 regional + 13 international), two UK events,
  heel hook as the most frequent finish, dominant position defined as *"side
  control, mount, back control, back mount, or north-south position for ≥ 3
  seconds"*, r = 0.50 / r = −0.21. All exact.

The research files' honesty about what they could *not* read is also confirmed
true: I pulled `20240101_GolpesProibidos_EN.pdf` and the illegal-moves grid does
extract its 26 row captions as text while the per-division column marks are
images and do not. The four `contestedNotes` that say so are accurate, and the
instruction in `content/research/the-triangle-and-the-angle.md:48` ("Do not 'fix'
this by guessing") should be obeyed.

The failures below are all failures of *inference from* correctly read sources,
not of sourcing.

---

## BLOCKING

### B1. The organising evidence of two articles is a convergence that does not exist in two of the three documents

This is the most serious finding in the set, because it is not a detail — it is
the thesis, the standfirst and the closing paragraph of one article and the
opening argument of another.

`src/content/journal/entries/taking-the-back-from-turtle.ts:20` (standfirst)

> "**Three scoring tables define back control in three different ways, and all of
> them put the chest connection before the legs.**"

`taking-the-back-from-turtle.ts:38`

> "Three tables, three point values, and one shared picture: **attached at the
> chest**, legs inside the thighs, at most one arm trapped, and nothing above the
> shoulder line."

`taking-the-back-from-turtle.ts:39`

> "That disagreement is about the legs. **Nobody disagrees about the chest.** When
> independent committees writing for different sports converge on a clause and
> diverge on the ones around it, the converged clause is worth taking seriously."

`taking-the-back-from-turtle.ts:88`

> "Back control is defined, by **three organisations that did not consult each
> other**, as **a chest connection** with legs attached."

And the same claim carries the opening of the sibling article,
`src/content/journal/entries/the-rear-naked-strangle-from-back-control.ts:24` and
`:26`:

> "That ordering is not a preference, and **the rule books agree with it more
> explicitly than most coaching does**." … "Three organisations, three scoring
> tables, and **the same picture in each: chest to back**, legs inside the thighs,
> not above the shoulder line."

**Only one of the three documents mentions the chest.** Here are all three, read
from the sources:

- **UWW Grappling Rules 2025**, Back Mount (4 points): "When a grappler controls
  the opponent from the back, **with his/her chest to the opponent's back** and
  his/her heels between both of the opponent's thighs, or in a body triangle…"
  — chest clause present.
- **IBJJF v6.1 §4.5**, Back Control (4 points): "When the athlete takes control of
  the opponent's back, placing his/her heels between the opponent's thighs without
  crossing his/her legs and in a position to trap up to one of the opponent's arms
  without trapping the arm above the shoulder line — and thus remains for 3
  (three) seconds." — **no chest clause, and no torso clause of any kind.**
- **ADCC**: "Back mount with hooks = 3 points — (Both hooks and body triangle are
  acceptable… Your hooks must not be over any of the shoulders)." — **no chest
  clause.** ADCC's definition is *entirely* about the legs.

Two of the three documents are silent on the chest. Silence is not agreement, and
an argument built on three-way convergence collapses to one document — which
happens also to be the one that is not a jiu-jitsu ruleset.

The other three elements of the claimed "shared picture" fail too, in the other
direction:

| Claimed shared element | UWW | IBJJF 4.5 | ADCC |
|---|---|---|---|
| attached at the chest | ✔ | **✘ absent** | **✘ absent** |
| legs inside the thighs | ✔ | ✔ | ✔ (as "hooks") |
| at most one arm trapped | ✔ | ✔ | **✘ absent** |
| nothing above the shoulder line | **✘ absent** | ✔ (the *arm*) | ✔ (the *hooks*) |

Not one of the four elements appears in all three documents, and the last one
means two different things in the two documents that have it: IBJJF restricts
where the *trapped arm* may be, ADCC restricts where the *hooks* may be. Those
are different rules about different limbs, presented as one shared clause.

The research files show this was avoidable. `content/research/taking-the-back-from-turtle.md:20`
(A2) and `:25` (A7) record the IBJJF and ADCC definitions correctly and **neither
contains the word chest**. The claim was manufactured between the research file
and the article, and then repeated in a second article.

This is blocking because it is load-bearing three times over: it is the
standfirst, it is the stated reason to believe the chest-first coaching argument
(`:46`–`:48`), and it is the final sentence of the piece. It is also the exact
failure mode this publication exists to avoid — an inference dressed as a
citation. The fix is available and is better writing than the original: **UWW
alone** puts the chest in its definition, and UWW alone also writes the chest
into its overtime Back Mount Restart position ("controlling his opponent with the
chest in contact with the back, the heels between the opponent thighs and the arm
connected in a seat belt control"). One ruleset that describes the position the
way the article argues for it, stated as one ruleset, is a real and interesting
finding. Three, when there are not three, is not.

### B2. The kimura article states a legality claim about judo that is wrong, contradicts its own paragraph three sections earlier, and appears nowhere in its research file

`src/content/journal/entries/the-kimura-as-a-control-before-it-is-a-finish.ts:78`

> "Judo restricts joint attacks more narrowly than any of them. The IJF's rules
> describe the sport as one where, apart from the elbow joint, techniques are
> executed in the sense of the articulation and never in hyperextension. **A
> shoulder lock does not sit inside that boundary**, which is a reminder that the
> legality of a technique is a property of a document rather than of the
> technique."

Compare the same article at `:28`:

> "It has more names than most techniques. **Judo's nomenclature places it in the
> ude-garami family**, catch wrestling calls it a double wristlock, and most
> jiu-jitsu rooms call it a kimura."

Both cannot be true. *Ude-garami* is one of the official Kodokan *kansetsu-waza*,
it is legal in IJF competition, and it acts primarily on the shoulder. The
article has told the reader that this grip is judo's own named technique and then
told them, ten paragraphs later, that judo's rules place it outside their
boundary. A judoka or a black belt with any judo background stops reading at that
sentence, and reasonably.

The quoted IJF sentence does not support the inference either. Read in full from
Appendix D:

> "Apart from the elbow joint where one must leave the possibility for their
> adversary to quit, all techniques are executed in the sense of articulation and
> never in hyper extension."

That is a rule about the *direction* in which a joint may be loaded —
techniques go with the articulation, not into hyperextension — with the elbow
carved out as the joint where hyperextension is permitted provided the opponent
can submit. It is not an enumeration of which joints may be attacked, and it
says nothing about shoulders. "Judo restricts joint attacks more narrowly than
any of them" and "a shoulder lock does not sit inside that boundary" are two
inferences stacked on a sentence that carries neither.

`content/research/the-kimura-as-a-control-before-it-is-a-finish.md:19` records A5
as the IJF sentence and nothing more. **The shoulder-lock exclusion appears in no
row of that file's claim table.** By the standard the brief sets, it is
unsourced.

The same sentence is used more carefully in the armbar piece
(`the-armbar-from-closed-guard.ts:68`), where it is only asked to support "the
elbow is the exception the whole rest of the joint-lock policy is written
around". That framing is defensible. The kimura article's is not.

### B3. An unsourced injury-incidence claim, in the article whose safety section is built on it

`src/content/journal/entries/the-guillotine-from-the-front-headlock.ts:65`

> "This is one of the few submissions where **the attacker is regularly the one who
> gets hurt**, and any honest account of it has to say so."

That is a claim about the relative frequency of injury by role. It has no source.
`content/research/the-guillotine-from-the-front-headlock.md` records it nowhere
in §1's verified-claims table; it appears only at `:96` as the *editorial reason*
the section exists ("§5 exists because this is one of the few submissions where
the attacker is more often the one hurt"), with no support attached. The same
research file's §9 explicitly cut a *lower*-stakes frequency claim ("most
guillotines fail because people pull with the arms — a frequency claim. Rewritten
as a description of the failure and a diagnostic"). The rule was applied to the
mechanics and not to the injury sentence.

It also runs into the site's own published policy at
`src/content/policies/index.ts:277`:

> "We make no medical, hygiene or injury-prevention claims."

and into the calibration set by the previous QC pass, which ranked two
comparable claims in the Technique Library as blocking (its B3) and had them
removed.

The paragraph does not need it. Everything after it — the ABC elevating clause,
the ADCC slamming clause, and "do not hold a guillotine on somebody who is
standing up with you" — stands on the two rule books and is the strongest safety
writing in the set. The claim to cut is the count, not the caution. "The rules of
two organisations are written on the assumption that the person holding the
guillotine is the one at risk of being put down" is sourced, and says the same
thing.

---

## SHOULD FIX

### S1. The "and/or → and" defect, for the fourth time in this corpus, now in three articles at once

The UWW Grappling illegal-actions list reads, verbatim:

> "Neck cranks* **and/or** any submission deemed as applying pressure to the spine
> (crucifix, full-nelson, twister neck crank, can opener, Chin Ripping neck crank
> etc.)"

All three articles that quote it drop the "/or":

- `the-triangle-and-the-angle.ts:58` — "prohibit neck cranks **and** any submission
  deemed to apply pressure to the spine"
- `the-rear-naked-strangle-from-back-control.ts:45` — "prohibit neck cranks **and**
  any submission deemed to apply pressure to the spine"
- `the-guillotine-from-the-front-headlock.ts:56` — "prohibit neck cranks **and** any
  submission deemed to apply pressure to the spine"

It was dropped upstream too, in `content/research/the-triangle-and-the-angle.md:19`
(A5), `.../the-rear-naked-strangle-from-back-control.md:22` (A4) and
`.../the-guillotine-from-the-front-headlock.md:16` (A2), which is why it
propagated to three files identically. Here "and" is readable as requiring both
conditions — a hold that is a neck crank *and* applies pressure to the spine —
which is narrower than the document, in a clause about what will get a competitor
cautioned four times for hurting somebody. This is the same defect class the brief
flags and the same one the previous pass found three times (its S5). Where the
document writes "and/or", write "and/or".

### S2. A stoppage reported as a penalty

`src/content/journal/entries/the-triangle-and-the-angle.ts:40`

> "A kata-sankaku grip, taken with both arms around the neck and one shoulder, is
> permitted on the ground and **penalised when it is taken standing** or carried
> into a throw…"

The IJF text, four sentences, read in order:

> "The kata-sankaku grip … in ne-waza action is allowed (picture 1). If the
> kata-sankaku grip is used starting from ne-waza going to tachi-waza, or in
> tachi-waza directly, **mate will be immediately called** (picture 2). A
> kata-sankaku grip in tachi-waza **with a throwing action will be considered
> hansoku-make** (picture 3). Kata-sankaku grip in ne-waza with blocking the
> opponent's body with the legs is hansoku-make (picture 4)."

Taking it standing draws *matte* — the referee stops the contest — and no
penalty. The penalty attaches to the throwing action. The article merges the two
into one "penalised when… or…", which strengthens the rule. The article's own
`contestedNotes` and the rest of its rule work are scrupulous about exactly this
distinction, which is why it is worth correcting: the sentence is one word from
right ("stopped when it is taken standing, and penalised when it is carried into
a throw").

The same paragraph's summary at `:40` — "the enclosure applied to a neck alone or
applied **while somebody is falling** is not [allowed]" — also loosens *tachi-waza*
(standing) into "falling", which is not what the document restricts.

### S3. The triangle's "clearest diagnostic" contradicts the article's own description of the shape

`the-triangle-and-the-angle.ts:27` defines the position:

> "One leg goes across the back of the opponent's neck, **the other hooks over that
> ankle**…"

`the-triangle-and-the-angle.ts:49` gives the diagnostic:

> "The clearest diagnostic is what **your locking leg** is doing. If your knee is
> pointing at the ceiling and **your ankle is hooked over your own shin**, you are
> square and applying front to back."

Per `:27`, the locking leg hooks its *knee* over the strangling leg's *ankle*. Its
own ankle is not hooked over anything. Two readings are possible and neither
works: if "your ankle" is the locking leg's, the sentence describes a
configuration the article has just said does not exist; if it is the strangling
leg's ankle, the sentence attributes a knee and an ankle from two different legs
to one named leg, and the reader — for whom this is offered as the *clearest*
diagnostic — has no way to tell which. If the intent is to describe the sloppy
ankle-cross lock rather than the figure-four, say that; it is a good distinction
and it is currently invisible.

The second half of the diagnostic ("if your knee has come across and down, so
that your thigh is close to parallel with their shoulders, you have the angle") is
correct and is the useful half. The rest of the article's mechanics — hips out to
the trapped-arm side, shin crossing the neck on the diagonal, the finish coming
from pulling the head toward your own hip rather than from tightening the legs —
are right and are well described.

### S4. A frequency claim inside an article that says no frequency has been measured

`the-kimura-as-a-control-before-it-is-a-finish.ts:47`

> "**In practice the grip is a sweep more often than it is a finish**, because the
> moment they defend the arm, their base changes and the sweep is there."

`the-kimura-as-a-control-before-it-is-a-finish.ts:85`, two sections later

> "There is **no measurement of how often a kimura control leads to a sweep, a back
> take or a finish**…"

`content/research/…the-kimura….md:28` (B3) says the half-guard account is a
"coaching account, presented as such". In the article it is not presented as such
— it is asserted as what happens "in practice", with a comparative. This is the
same construction the research file cut elsewhere in the set ("most triangles fail
because of the angle", "most guillotines fail because people pull with the arms").
"The sweep is usually the thing that becomes available first" carries the coaching
point without the count.

### S5. A pronoun that moves a rule from one athlete to the other

`src/content/journal/entries/taking-the-back-from-turtle.ts:27`

> "The IBJJF awards takedown points against somebody who ends up on all fours only
> when **the athlete who put them there** controls the back, without any requirement
> for hooks, and keeps at least one of **their** knees on the ground for three
> seconds."

IBJJF 4.1.2, verbatim: "…points shall only be awarded once the athlete performing
the takedown controls the opponent's back without the requirement of placing
hooks and keeping **at least one of the opponent's knees** on the ground for 3
(three) seconds."

The knee that must stay down belongs to the athlete being taken down. In the
article's sentence, "their" attaches most naturally to the nearest subject — the
athlete who performed the takedown — which inverts the condition. One word
("their" → "the opponent's") fixes it.

### S6. The risk inference the research file cut, back in the article in softer words

`content/research/the-triangle-and-the-angle.md:86` records:

> "*Cut:* a planned assertion that the arm-in requirement exists 'because of the
> risk to the neck'. The rule books state the prohibition, not the reason."

`the-triangle-and-the-angle.ts:38` says:

> "Take the arm out and you have your legs around a head and a neck with nothing
> else inside the loop, which is **a different technique with a different risk
> profile**."

"A different risk profile" is the cut inference with the word "risk" still in it
and the reason removed. Nothing consulted for the article compares the risk of the
two. "A different technique, and one a governing body treats differently" is what
the sources support and is what the next sentence already goes on to say.

### S7. The turtle article restates an existing Technique Library entry, near-verbatim, and neither links to the other

`src/content/technique/entries/seat-belt-and-hooks.ts` and
`src/content/journal/entries/taking-the-back-from-turtle.ts` share four passages
that are the same sentence with the nouns swapped:

| Technique entry | Journal article |
|---|---|
| `:16` "the opponent escapes by rotating their shoulders toward you and getting their back to the mat, and that rotation is fought at the shoulder line, not at the hip. If your chest is glued to their upper back with the over-shoulder arm deep and the under-arm elbow tight, they can move their hips a long way without ever changing which way they are facing." | `:47` "Somebody escapes the back by rotating their shoulders toward you and getting their back to the mat. That rotation is fought at the shoulder line. If your chest is fixed to their upper back with the over-shoulder arm deep and the under-arm elbow tight to your own ribs, they can move their hips a considerable distance without changing which way they are facing." |
| `:20` "Follow them to the mat on the side of your under-arm shoulder. If they turn toward your over-shoulder side, you end up under them…" | `:57` "you follow them to the mat on the side of your under-arm shoulder. Turn toward the over-shoulder side and you end up underneath them…" |
| `:21` "Treat the hooks as directional, not symmetric. The bottom hook stops them sitting down toward the mat; the top hook stops them turning into you." | `:66` "Hooks are directional rather than symmetric. The bottom hook stops somebody sitting down toward the mat; the top hook stops them turning into you." |
| `:23` "Recover the seat belt before you recover the legs. Losing both hooks with the harness intact is a recoverable position; losing the harness with both hooks in is usually the start of an escape." | `:68` "Recover the harness before you recover the legs. Losing both hooks with the chest connection intact is a recoverable position. Losing the chest connection with both hooks in is usually the start of an escape that has already worked." |

The body-triangle trade-off (`:16` vs `:67`), the crossed-ankle warning (`:22` vs
`:59`) and the body-triangle safety note (`:33` vs `:78`) are also duplicated.
`content/research/taking-the-back-from-turtle.md:36` acknowledges the entry as the
source of the coaching account, which is honest, but the published pages do not:
`taking-the-back-from-turtle.ts:129`'s `relatedSlugs` are three Journal slugs and
`seat-belt-and-hooks.ts:42`'s are three technique slugs. A reader who lands on one
has no route to the other and, if they find both, reads the same paragraphs twice
with no acknowledgement.

The category description sets the relationship the site intends —
`src/content/journal/types.ts:44`: "The Technique Library is the reference; these
are the arguments." The turtle article currently duplicates the reference instead
of arguing with it. The article's distinctive material is the rule-book reading;
the harness and hooks mechanics belong to the entry and should be pointed at, not
re-typed.

### S8. Two live pages take opposite positions on whether this site states physiology

`src/content/technique/entries/blood-choke-versus-air-choke.ts:16`

> "A blood choke works by **compressing the carotid arteries** on the sides of the
> neck; an air choke works by compressing the trachea at the front."

`blood-choke-versus-air-choke.ts:33`

> "a well-applied blood strangle **can take effect before a partner decides to
> tap**…"

`content/research/the-rear-naked-strangle-from-back-control.md:99`

> "*Cut:* **every physiological statement.** No arteries, no airway, no blood flow,
> no unconsciousness, no timing… This is a hard constraint from the commission and
> it should not be relaxed by a later editor 'for clarity'."

Both pages describe the same mechanic; one names arteries and asserts a timing
relationship, the other refuses to say anything about the body at all. The
research file at `:112` sees this and rules that the entry "carries the older
standard", which is a decision about provenance rather than about what the site
publishes. `src/content/policies/index.ts:277` promises one standard, not two,
and the previous QC pass removed comparable sentences from two other technique
entries. A reader following `blood-choke-versus-air-choke` → `seat-belt-and-hooks`
→ `the-rear-naked-strangle-from-back-control` moves through three pages on the
same position and the middle one is written to a different rule.

Pick the standard and apply it to both. If the physiology stays, the RNS
article's refusal to explain why release matters (`research …md:110`) becomes
unmotivated; if it goes, the entry loses one clause and nothing else.

### S9. A contestedNote misdescribes the scoring tables it is drawn from

`the-guillotine-from-the-front-headlock.ts:128`

> "The inference that a front headlock is not a dominant position under the
> scoring tables cited is drawn from those tables, **which define side control,
> mount and back control as the scoring positions**."

That is UWW's list (side mount, full mount, back mount). It is not IBJJF's, which
scores the guard pass, knee-on-belly, mount, back control, takedown and sweep and
has no "side control" score at all; nor ADCC's, which scores passing the guard,
knee on stomach, mount, back mount, takedown and sweep. Repeated in
`content/research/the-guillotine-from-the-front-headlock.md:30` (B4).

The *conclusion* is right — a front headlock scores nothing under any of the
three, and it is also absent from Spanias et al.'s definition of a dominant
position ("side control, mount, back control, back mount, or north-south position
for ≥ 3 seconds"). Only the description of the tables needs correcting.

### S10. A note for whoever acts on the previous review: its S3 was wrong, and the new article has it right

The previous pass ranked as SHOULD FIX the sentence in
`guard-retention-as-a-system.ts` that said "every athlete in the sample who won by
a lower-body submission had spent no time in what the study defined as a dominant
position", on the grounds that the paper only supports "exerted no positional
control". The sentence was duly softened; it now reads at `:83` "athletes winning
by lower-body submissions exerted no positional control prior to their victory".

Reading the paper's Results and Conclusions rather than its Discussion, the
stronger claim is the paper's own:

- Results: "Interestingly, **those winning by lower-body submission spent no time
  in a dominant position**."
- Conclusions: "athletes winning by lower-body submissions, primarily heel hook,
  **did not record a single second in a dominant position**."

So `taking-the-back-from-turtle.ts:86` — "the athletes who won that way had spent
no time in dominant positions at all" — is accurate and should **not** be softened
to match the neighbouring article. If anything, `guard-retention-as-a-system.ts:83`
can go back to the stronger wording, which is the paper's. Recording this so the
two articles are not made "consistent" in the wrong direction: they currently
state the same finding in two strengths, and the weaker one is the one to change.

---

## TASTE

### T1. The limits ending is now the house's only ending, and it got worse after being flagged

The previous pass counted nine of twelve articles closing on a limits section and
asked for at least two to end somewhere else. Six articles were written after
that note. **Five of the six close on a limits section:**

- `the-armbar-from-closed-guard.ts:75` — "What is not known"
- `the-triangle-and-the-angle.ts:75` — "What this argument does not cover"
- `the-kimura-as-a-control-before-it-is-a-finish.ts:83` — "What can and cannot be claimed"
- `the-guillotine-from-the-front-headlock.ts:73` — "What nobody has measured"
- `taking-the-back-from-turtle.ts:83` — "What the scoring tables do not tell you"

Fourteen of eighteen. The one exception is
`the-rear-naked-strangle-from-back-control.ts:71` ("The name settles nothing"),
which is a better ending than any of the five and is proof the voice can do
something else.

### T2. The template is measurable

Restricting to prose (paragraphs and `contestedNotes`, metadata excluded), the six
articles share **496 distinct eight-word sequences**. The recurring blocks:

- The Spanias sentence, in five of six, in the final or penultimate section, in
  near-identical words: `the-armbar…ts:77`, `the-triangle…ts:78`,
  `the-kimura…ts:86`, `the-guillotine…ts:76`, `taking-the-back…ts:86`. Four of
  them share the string "no-gi submission-only matches, found that time…".
- The IBJJF illegal-moves `contestedNote`, in four of six, effectively
  copy-pasted: `the-triangle…ts:136`, `the-rear-naked…ts:126`,
  `the-kimura…ts:143`, `the-guillotine…ts:127`. Shared string: "…column
  assignments could not be read reliably from the PDF text… named as appearing in
  the table without a claim about which divisions they are prohibited for."
- The Spanias `contestedNote`, in four of six, sharing "…at two no-gi
  submission-only events, coded by human raters, and describe that sample only."
- The safety boilerplate, in all six, in three interchangeable shapes: "This is a
  technique to be introduced by a qualified coach and drilled with a cooperative
  partner…" (`the-armbar…:60`, `the-triangle…:60`, `the-kimura…:59`) / "Learn this
  from a qualified coach, in a supervised room…" (`the-rear-naked…:64`,
  `the-guillotine…:68`) / "All of this belongs in a supervised room…"
  (`taking-the-back…:78`); plus a release-on-tap sentence in all six.

The safety boilerplate *should* be identical — it is a standing instruction and
varying it for freshness would be worse than repeating it. The right answer is
to stop hand-writing it in prose: make it one shared component rendered beneath
the article body, so it is verbatim by construction, testable, and not competing
with the article's own voice. The Spanias paragraph and the IBJJF-table note have
no such excuse; the note in particular is a production fact about a PDF and
belongs once, somewhere central, not four times in four articles.

### T3. Uniform shape

All six articles have **exactly six sections**. Section paragraph counts across the
set: 4,4,4,5,4,3 · 4,4,4,4,4,3 · 4,4,4,3,3,3 · 3,4,4,4,4,3 · 3,4,4,4,4,3 ·
4,4,4,4,3,4. Twenty-eight of thirty-six sections are four paragraphs. Word counts
land in a 155-word band (1,591–1,746). Read two in a row and the shape is audible
before the argument is.

### T4. The vocabulary, now measured on the new six

"rather than" **56** times (9.3 per article); "worth" **19**; "which is a / which is
the / which is why" **19**; the antithesis "X is not A. It is B" **13**;
"stated plainly / worth naming / worth stating / worth insisting" **5**. The
previous pass flagged "worth" and "That is not…" as the tic; "rather than" is the
one that has taken over, and it is doing the same job — signalling a correction
about to be issued.

### T5. Two dash conventions on one site

All twelve Technique Library entries use em dashes (53 across the set, 1 spaced
hyphen). All ten Figure profiles and all eighteen Journal articles use a spaced
ASCII hyphen (2 em dashes total). The new six add five more spaced hyphens
(`the-armbar…:127`, `the-triangle…:39`, `:48`, `taking-the-back…`, and others). A
reader moving from `/technique/...` to `/journal/...` sees the punctuation change.
Pick one; the em dash is the one the more carefully typeset half of the site
already uses.

### T6. The category label promises something the articles are not

`src/content/journal/types.ts:44` describes `technique-notes` as "**Shorter
pieces** on single mechanics." The five new entries in that category run
1,591–1,746 words, which is the same length as everything else on the site and
longer than four articles in other categories. Before these six, the category held
one genuinely short piece. Either change the summary or accept that the category
is now the site's main body of work and describe it as such.

### T7. Two smaller things

- `taking-the-back-from-turtle.ts:17` files the article under `guard-systems`,
  whose summary is "The structures underneath the positions", while the article's
  first heading (`:24`) is "Turtle is not a guard". The research file explains why
  it is not `technique-notes`; it does not explain why it is `guard-systems`.
- `the-kimura…ts:27` — "The shoulder is the joint it acts on. **The elbow is where
  it is held.**" The grip is held at the wrist and at the upper arm, with the bent
  elbow as the vertex the rotation turns around. The sentence is a nice shape and
  is not quite what the hands are doing.
- The ABC small-joint clause is now quoted in three articles in almost the same
  words (`why-sport-jiu-jitsu…ts:40`, `the-armbar…ts:67`, `the-kimura…ts:76`).
  Correct in all three; the third time it reads as a stock paragraph.
- The IJF elbow-joint sentence is introduced twice as "the IJF's rules describe
  the sport as…" (`the-armbar…ts:68`, `the-kimura…ts:78`). It sits in Appendix D's
  historical preamble about what Jigoro Kano created, three sentences after "Judo
  is a method of physical, intellectual and moral education". The armbar research
  file (`§3`) knows this and says so; the articles' framing is defensible but is
  carrying more weight than a preamble should bear, and in B2 it broke.

---

## What is right, and should be protected in any rewrite

The safety sections are the best thing in the set and they clear the bar the brief
sets, all six of them. Each names where the risk actually is, in mechanical
rather than physiological terms, and each names it in the section where the
mechanic arises rather than in a footer box:

- `the-armbar…ts:57` — the joint's travel is short and the hips deliver more
  movement in a fraction of a second than the arms can; the two situations that
  close the gap fastest are named.
- `the-triangle…ts:57` — the hazard is explicitly *not* the strangle but what the
  position becomes when the angle is missing and the attacker compensates with the
  arms, and the strangle/crank line is taken from four documents and attributed to
  them.
- `the-rear-naked…ts:44`–`:47` — the cleanest statement of the distinction on the
  site, built on the UWW footnote, and correct that the conversion "is small, fast,
  and entirely within the attacker's control".
- `the-kimura…ts:58` — rotational range is short, the attacker's weight can move
  through it faster than a person can decide to tap, and the recipient cannot see
  it happening. Three specific facts, no physiology.
- `the-guillotine…ts:58`, `:66` — the risk to the *attacker* is a genuinely
  under-written subject and the two rule clauses it is built on are exactly on
  point.
- `taking-the-back…ts:75`–`:78` — correctly says the risk in a transition is not
  concentrated in one joint, then sources three clauses in two documents to the
  specific dangers.

None of the six makes a physiological claim. None attributes a technique to a
named person: the kimura article declines the naming story explicitly at `:28` and
`:141`, and `content/research/…the-kimura….md:32` records that it was declined
because printing it would require stating a competition result. No competition
result or statistic about any individual appears anywhere in the six. The IBJJF
illegal-moves table is handled with unusual restraint — the grid genuinely does
not extract its column marks, I checked, and four `contestedNotes` say so rather
than guessing.

And the rule-document work, B1 aside, is again the strongest thing here. Thirty-two
citations, nine documents, every clause where it is claimed to be. The ADCC-permits-
the-can-opener versus UWW-prohibits-it contradiction (`the-guillotine…ts:57`,
`:125`) is a real find, correctly reported as a contradiction and not reconciled.
The observation that UWW writes a junior-division exception for the arm-in
guillotine, and the refusal at `:126` to read it as evidence that the arm-in
version is safer, is the single best editorial decision in the set.

---

## Score: 71 / 100

Three blocking findings in six articles is a poor rate for a corpus that has just
been through a QC pass, and the first of them is the worst kind: the standfirst
and closing sentence of one article, and the opening argument of another, rest on
a three-way agreement between rule books that two of the three rule books do not
contain — and the research files record the correct text, so the claim was
introduced after the sourcing was done. The kimura article's judo paragraph
contradicts its own third paragraph and would be caught by any judoka in the first
week. Against that: the citation work is genuinely excellent, and I could not
break it — thirty-two citations across nine documents, every clause number, every
quoted phrase and every figure exact, including the awkward ones, and the research
files' account of what they could not read from the IBJJF grid is true. The safety
material clears the bar in all six articles and in two of them is better than
anything comparable I have read on a commercial site. What has degraded is not
rigour but judgement about the distance between a source and a conclusion: every
blocking finding is an inference presented at the confidence of a citation, and
the slop measurements — five of six ending on a limits section after that was
flagged, 496 shared eight-grams, one Spanias sentence in five articles — say the
same thing from the other side, which is that the form is now being filled in
rather than written. Fix B1 and B2 and the score is mid-eighties; the rest is
tractable in an afternoon.
