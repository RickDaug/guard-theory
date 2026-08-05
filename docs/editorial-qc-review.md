# Editorial QC review — published corpus

**Reviewer:** editorial-qc agent
**Date:** 2026-08-04
**Scope at start of pass:** 12 Journal articles, 12 Technique Library entries, 10 Figure
profiles, and their files in `content/research/`. Six further submission articles
(`the-kimura-as-a-control-before-it-is-a-finish`, `taking-the-back-from-turtle`,
`the-rear-naked-strangle-from-back-control`, `the-triangle-and-the-angle`,
`the-guillotine-from-the-front-headlock`, and one further) appeared during the pass and
were **not** reviewed. `src/content/journal/index.ts` was not touched.

**Method:** every URL below was fetched directly. Rule books and standards were downloaded
as PDFs and read from extracted text, not from summaries. Wikimedia licences were read
from the Commons API `extmetadata` and from raw file-page wikitext. Every numeric claim
checked was compared against the source's own tables, not its abstract, wherever both
exist.

**`npm run test:unit`: 27 tests, 27 pass, 0 fail.** No test was weakened.

---

## Fabricated citations

**No fabricated citation was found anywhere in the corpus.**

This was the highest-stakes check and it came back clean. Specifically, and in contrast to
the previous pass that turned up an invented `NAC 467.430`:

- **`NAC 467.427(7)`, `NAC 467.7952`, `NAC 467.7954` all exist and all say what they are
  cited for.** Verified against the full chapter text pulled from
  `leg.state.nv.us/nac/NAC-467.html`. 467.427(7) reads "For contests or exhibitions of
  mixed martial arts, each unarmed combatant must wear gloves that weigh not less than 4
  ounces and not more than 8 ounces." 467.7952(3)(a) and (d) give the 20–32 foot width,
  the one-inch closed-cell foam and the 5-to-7-foot fence posts. 467.7954 gives the round
  limits.
- **Every IBJJF clause number checked resolved to the clause claimed**, including the
  awkward one: `how-a-bjj-rash-guard-should-fit.ts:32` cites §8.1.16 for the no-gi shirt
  rule, and 8.1.16 is indeed the last of the five numbered items on p.36 of the v6.1 PDF.
  The quoted sentence is verbatim.
- **The IBJJF version number is right and the site's own label is wrong.**
  `ibjjf.com/books-videos` calls the rule book "v6.0"; the PDF footer reads "VERSION 6.1
  2024". `how-no-gi-rulesets-reshaped-technique-selection.ts:101` says so explicitly
  ("PDF footer reads v6.1, 2024JUN"). That is the correct handling.
- **All eight image licences match the Commons file pages exactly**, including the two
  Arquivo Nacional accession numbers (`BR_RJANRIO_PH_0_FOT_24370_001`,
  `BR_RJANRIO_PH_0_FOT_24373_003`) and the otherwise unguessable "Photograph by Kerri
  Roberts" on `File:RogerGracie.JPG`, which is buried in the description field and not in
  the API metadata. One credit is nevertheless wrong — see B4.

---

## URLs verified

**37 content-verified** (fetched and checked against the claim they support); a further
**20 resolve-checked** (HTTP 200, publisher and title consistent).

Content-verified: `leg.state.nv.us/nac/NAC-467.html` · ABC Unified Rules 8.2025 PDF · ABC
Unified Rules July 2022 PDF · `adcombat.com/adcc-rules-regulations/` ·
`ibjjf.com/books-videos` + `2024JUN_IBJJF_Rules_EN.pdf` · `ibjjf.com/news/new-rules-updates`
· `ibjjf.com/graduation-system` + `20260611_IBJJF_Graduacao_EN.pdf` ·
`ibjjf.com/hall-of-fame` · eight Wikimedia Commons file pages (+ the parent
`File:Kyragracie1.jpg`) · PMC9570736 · PMC4249026 · PMC11237090 · PMC3690734 · PMC2607440 ·
`shura.shu.ac.uk/31193/` + its PDF · Frontiers 10.3389/fpsyg.2018.00025 ·
`nj.gov/oag/sacb/docs/martial.html` · `statleaders.ufc.com` · `ufc.com/athlete/royce-gracie`
· `sherdog.com/fighter/Royce-Gracie-19` · five BJJ Heroes pages ·
`grapplearts.com/the-de-la-riva-guard/` · `rogergracie.com` ·
`graciemag.com/academias/oswaldo-fadda/` · `ndl.go.jp/brasil/e/column/kodekoma.html` ·
`sonnybrown.net/top-20-myths-about-mitsuyo-maeda/`.

**Two URLs could not be verified by any automated means** (both return 403 to scripted
retrieval; neither is evidence of a bad citation):

- `https://www.iso.org/standard/61686.html` — cited in `how-a-bjj-rash-guard-should-fit.ts:119`.
- `https://doi.org/10.1177/17479541231210979` (SAGE) — cited in
  `guard-retention-as-a-system.ts:109`. This means the **Lamas figures are the only
  quantitative claims on the site I could not check**: "1.03 [submission attempts] per
  competitor per match" and the transition probability of "0.30"
  (`guard-retention-as-a-system.ts:40`, `:70`). See S10.

---

## BLOCKING

### B1. Two live articles publish incompatible figures from the same paper, and the one they publish is contradicted by that paper's own data table

`src/content/journal/entries/seated-guard-and-supine-guard.ts:60`

> "Spanias and colleagues, analysing matches from official no-gi submission-only tournaments
> with 26 regional and 26 international athletes, report a **standing-to-ground time ratio
> of 1:2** for both groups."

Repeated in `seated-guard-and-supine-guard.ts:123`.

`src/content/journal/entries/guard-retention-as-a-system.ts:39`

> "…reported a mean match duration of 278 seconds, of which roughly **87 per cent was spent
> on the ground and 9 per cent standing**."

87:9 is roughly 1:9.7. It is not 1:2. Both cannot be right.

I read the paper. **`guard-retention-as-a-system` is correct and `seated-guard-and-supine-guard`
is not.** Spanias et al. Table 4 ("No-gi comp." column) gives *Total match duration (s) 278,
Standing time (%) 9, Ground time (%) 87*, and Table 5 gives total stand-up time of 28 ± 34 s
(regional) and 21 ± 33 s (international) against total ground time of 208 ± 202 s and
279 ± 189 s — ratios of about 1:7 and 1:13. The "1:2" figure appears only in the paper's
**abstract**, where it is inconsistent with the paper's own tables. It looks like an error in
the source.

The research files confirm exactly how this happened.
`content/research/seated-guard-and-supine-guard.md:27` records: *"Abstract read directly on
the SHURA record"*. `content/research/guard-retention-as-a-system.md:16-17` records:
*"Spanias et al., Table 3"* and *"Table 4… read directly"*.

This is blocking on three counts: the published figure is wrong; it is load-bearing in the
section it appears in ("the time distribution is heavily toward ground exchanges in the first
place"); and a reader who follows the `relatedSlugs` link from one article to the other finds
Guard Theory contradicting itself about a number.

The fix is not to average them. It is to use the tables, and to say in `contestedNotes` that
the source's abstract disagrees with its own tables — which is exactly the kind of thing this
publication is supposed to be good at reporting.

### B2. An unsourced clinical injury claim in a published article

`src/content/journal/entries/how-no-gi-rulesets-reshaped-technique-selection.ts:94`

> "**Rotational knee injuries are frequently silent until the damage is done**, which removes
> the ordinary feedback that lets a training partner protect themselves."

That is a claim about how a class of injury presents. It has no source. The article's seven
sources are two rule books, one federation news page and four grappling-journalism reports
(lines 98–137); none of them is about injury. `content/research/how-no-gi-rulesets-reshaped-technique-selection.md`
contains no injury source either — the whole of §2 is rule books and FloGrappling/BJJEE, and
line 119 records only that the safety paragraph *mentions* "silent injury", not where it came
from.

It also runs directly into the site's own published policy at
`src/content/policies/index.ts:277`:

> "We make no medical, hygiene or injury-prevention claims."

The sentence is very probably true and it is widely believed. Neither is a source. Cut it, or
source it to a clinical reference and accept that doing so puts a medical claim on the page
that the policy says will not appear.

### B3. Two epidemiological claims in the Technique Library with no sources field to hang them on

Technique entries carry no `sources` array at all, so anything empirical in them is unsourced
by construction. Two go past mechanism into measurable claims about frequency and healing:

- `src/content/technique/entries/inside-position.ts:410` — "Fingers get caught, jammed and
  sprained here **more than almost anywhere else in training**, and **finger injuries are slow
  to heal and easy to re-injure**." That is an injury-incidence claim and a prognosis claim.
- `src/content/technique/entries/elbow-knee-escape.ts:266` — "driving the top of the skull into
  the mat to lift a heavier partner loads the neck in extension, and it is **a well-known way to
  leave a session with a stiff or strained neck**."

`inside-position.ts` is labelled in its own file comment (lines 376–381) as the exemplar every
other entry is written to. Whatever it does, eleven other entries copy.

Both can be rewritten to describe the mechanical exposure without asserting incidence or
recovery time, which is what the other ten safety notes already do well (`knee-shield.ts:501`
and `knee-cut-pass.ts:453` are the models: they say what load arrives where and what to do,
and claim nothing about outcomes).

### B4. The Kyra Gracie image credit attributes the licence permission to the wrong person

`src/content/figures/entries/kyra-gracie.ts:13`

> "Uploaded to Wikimedia Commons **by user Kimsaka** under Wikimedia permission ticket
> 2008021310000886; no photographer is named on the file page."

and `kyra-gracie.ts:30`

> "The Wikimedia Commons file page names no photographer, giving only \"self-made\" and a
> permission ticket reference. The credit line reflects exactly what the file page states."

It does not. I pulled both file pages' wikitext and their upload histories:

- `File:Kyragracie1 (cropped).jpg` was uploaded by **Kimsaka on 2018-10-10**. Its wikitext has
  `|Permission=` **empty**. There is no ticket on the page the entry cites.
- `File:Kyragracie1.jpg` — the parent — was uploaded by **Veritas~commonswiki on 2008-02-13**
  and carries `{{PermissionTicket|id=2008021310000886}}`.

So the credit names the person who cropped the image in 2018 as the person who obtained
permission in 2008, and the actual rights holder is not credited at all. The licence is
`{{GFDL|migration=relicense}}`, which the Commons API resolves to CC BY-SA 3.0 — a licence
whose one substantive condition is correct attribution.

Everything else about the licensing on this site is meticulous, which is why this one matters:
it is the only credit line that would not survive being checked.

---

## SHOULD FIX

### S1. The site refuses to state early-UFC results in one article and states them to the second in another

`src/content/journal/entries/what-the-early-ufc-tournaments-demonstrated.ts:25`

> "One rule applies throughout: no bout outcome appears here. Results from those events
> circulate in many versions, the promotion's own statistical record does not cover them, and
> repeating a result second-hand is the easiest mistake to make in writing about this period."

`src/content/figures/entries/royce-gracie.ts:19`

> "At UFC 1 in Denver on 12 November 1993 he beat the boxer Art Jimmerson by smother choke in
> 2:18, Ken Shamrock by lapel choke in 0:57, and the savate fighter Gerard Gordeau by rear
> naked choke in 1:44."

I verified all of it on Sherdog and it is exact, down to the referees (Jimmerson: Joao Alberto
Barreto; the other two: Helio Vigio — the entry says "two of the three", which is right). UFC 2
likewise: Ichihara 5:08, DeLucia 1:07, Pardoel 1:31, Smith 1:17, so "three of them in under a
hundred seconds each" is exactly three. The standfirst's "under five minutes of mat time" is
4:59.

So the facts are fine and the *stated rationale* is not. One piece tells the reader these
results cannot be responsibly reported; another reports them. Pick one. The defensible version
is the Royce entry's — a fight-finder record with per-bout method, time and referee is a
traceable source — which means `what-the-early-ufc-tournaments-demonstrated.ts:25` and its
`contestedNotes[0]` (line 122) should narrow their claim to *no result is needed for this
argument*, rather than *no result can be verified*.

### S2. An ADCC penalty is stated more broadly than the rule reads

`src/content/journal/entries/seated-guard-and-supine-guard.ts:43`

> "…and **a standing competitor** who puts one or both knees on the mat for more than three
> seconds draws the same."

`src/content/journal/entries/how-no-gi-rulesets-reshaped-technique-selection.ts:52`

> "…as does putting one or both knees on the mat for more than three seconds **while standing**."

The rule, verbatim from `adcombat.com/adcc-rules-regulations/`:

> "**If both fighters are standing up** and one of them puts one or both of his knees on the mat
> for more than 3 sec, he will be punished by a minus point."

The precondition is that *both* fighters are standing. As written, both articles tell a reader
the penalty applies whenever they put a knee down while standing — including, for example,
against a seated opponent, where the rule does not reach.

This is the exact defect class the brief flags, and the corpus already knew the right text:
`content/research/seated-guard-and-supine-guard.md:20` records the sentence verbatim **with**
the precondition, marked "**verbatim**". It was dropped between the research file and the
article. (Both articles get "one or both knees" right, which is the harder half.)

### S3. A finding stated more strongly than the paper supports

`src/content/journal/entries/guard-retention-as-a-system.ts:83`

> "…the paper's most striking observation is that **every athlete in the sample** who won by a
> lower-body submission had spent **no time** in what the study defined as a dominant position."

Spanias et al. say: "athletes winning by lower-body submissions, in most cases a heel hook,
exerted no positional control prior to their victory", and the results section reports the
correlation between positional dominance and lower-body submissions as *r* = −0.21, *p* = 0.145
— a non-significant correlation with variance in it, not a set of zeroes. "Every athlete… no
time" is a stronger and more countable claim than the source makes. "Exerted no positional
control" is the phrase to use.

### S4. A waivable rule stated as absolute

`src/content/journal/entries/why-sport-jiu-jitsu-does-not-transfer-directly-to-mma.ts:69`

> "Nevada adds that a non-championship contest **must not exceed** three rounds and a
> championship or special event five."

NAC 467.7954 opens: "**Except with the approval of the Commission or its Executive Director:**
1. A nonchampionship contest or exhibition of mixed martial arts must not exceed three rounds…"

Six words, and they change the rule from a limit to a default. The same section's paragraph 3
("A period of unarmed combat… must not exceed 5 minutes… A period of rest… must be 1 minute")
carries the same carve-out.

### S5. Three "and/or" clauses rendered as "or"

Same file, all quoting the ABC Unified Rules (2025 text verified from the PDF):

- `:38` — "permit a soft neoprene sleeve only over the knee **or** ankle". Rule 10(b): "may use a
  soft neoprene type sleeve to cover only the knee **and/or** ankle joints."
- `:41` — "a form-fitting rash guard **or** sports bra for women". Rule 11(d): "form fitting rash
  guard **and/or** sports bra(s)."
- `:80` — "real, significant **or** sustained effort". Standing up or Breaking Fighters: "real,
  significant **and/or** sustained effort."

These are milder than the "and/or → and" defect already found — inclusive "or" mostly survives
the substitution — but this article's whole method is close reading of a rule document, and it
quotes the rule's exact words everywhere else. Where the document writes "and/or", write
"and/or".

### S6. One researcher, two positions, both quoted accurately

`src/content/journal/entries/maeda-and-the-arrival-of-judo-in-brazil.ts:66`

> "Pedreira goes furthest. His position is that … **there is no evidence Carlos ever met Maeda at
> all**."

`src/content/figures/entries/mitsuyo-maeda.ts:26` and `carlos-gracie.ts:23, :28`

> "…none of them met him, **with the possible but by no means certain exception of Carlos**."

Both are verbatim from `sonnybrown.net/top-20-myths-about-mitsuyo-maeda/` — the first from
"Myth 2", the second from the introduction. The source contradicts itself; Guard Theory
inherits the contradiction without noticing it, and a reader moving between the Journal and
the Figures index sees the same researcher given two positions. Say which is his stated
conclusion and note that the page also carries the softer formulation.

### S7. An asserted source discrepancy that is weaker than claimed

`src/content/journal/entries/de-la-riva-and-the-guard-that-took-his-name.ts:45` and
`contestedNotes[1]` (line 121)

> "The two pages also **describe the outcome differently**, and this article is not going to state
> one."

I read both. The biography: de la Riva "beat the (until then) unbeaten Royler Gracie at the
Copa Cantão". The feature: "he showed that he was worthy of the challenge, making the most of
his trademark leg hook, **taking Royler to a referee decision victory**." Both most naturally
read as de la Riva winning; what differs is the *method* (unstated vs. referee decision), and
the feature's phrasing is ambiguous rather than contradictory.

The three-dates finding is real and well made — 1985 in the bio, "around 1986" in the feature,
a photo caption reading 1987, all verified. The outcome claim is not the same quality of catch
and should be described as what it is: one page gives no method, the other gives a referee
decision, and the wording of the second is ambiguous.

### S8. A fourth date divergence, sitting inside a source the article already cites

`maeda-and-the-arrival-of-judo-in-brazil.ts:64` and `carlos-gracie.ts:18` both use Cairus's
"no more than three years" for Carlos Gracie's apprenticeship, with departure from the Amazon
"between 1919 and 1920".

The National Diet Library column — cited in both pieces — says in its Annotation 2: "After
learning from Maeda for **approximately 4 years**, he then moved back to Rio de Janeiro in
**1925**."

That is a fourth serious source disagreeing on duration and on the departure year, and the
articles do not mention it. Given that the whole architecture of the Maeda piece is "here is
where the sources disagree", leaving out a disagreement that is sitting in a source already
on the page is the one omission that undercuts the method.

### S9. An injury-causation aside in an article that disclaims injury claims

`src/content/journal/entries/how-a-bjj-rash-guard-should-fit.ts:89`

> "A top that genuinely restricts the shoulder changes how you frame, and you will compensate
> somewhere else without deciding to. **Compensation you have not noticed is a reasonable
> description of how a lot of people accumulate shoulder and neck complaints.**"

Eleven lines earlier, at `:78`, the same article says: "We are not going to tell you that a rash
guard… reduces injuries. We do not have evidence that would justify any of those sentences."
The second sentence quoted above is an unsourced claim about how injuries accumulate, and it is
doing the same rhetorical job in the opposite direction. The paragraph works without it.

### S10. The only unverifiable numbers on the site

`guard-retention-as-a-system.ts:40` and `:70` — "Submission attempts averaged 1.03 per
competitor per match" and "the highest transition probability… at 0.30" — come from the Lamas
et al. paper at `https://doi.org/10.1177/17479541231210979`, which returns HTTP 403 to every
automated retrieval method available here. Not a defect and not a fabrication; recorded so the
next pass knows these two numbers have never been independently confirmed and should be checked
from a library copy.

### S11. Cite the graduation document by version as well as by date

`the-dropout-number-nobody-can-source.ts:53, :88` cite the "IBJJF General System of Graduation,
in the June 2026 version". The PDF is `20260611_IBJJF_Graduacao_EN.pdf` and every figure the
article quotes is exact — white belt no minimum, blue 2 years, purple 1½, brown 1, the
world-champion and juvenile carve-outs, "counted from the day the athlete completes registration
of each belt rank with IBJJF", and "at the professor's discretion. However, IBJJF will only
recognize the graduation if it meets the mandatory minimum times". But the document's own footer
reads "VERSION 3.1 2025". The rule-book citations elsewhere in the corpus handle exactly this
mismatch well (see the note at `how-no-gi-rulesets-reshaped-technique-selection.ts:101`); this
one should too.

---

## TASTE

### T1. Nine of twelve articles end on a limits section

`why-sport-jiu-jitsu…` ("What this argument is, and what it is not"), `seated-guard…` ("What
this account does not settle"), `guard-retention…` ("What this account does not do"),
`drilling…` ("The honest size of the claim"), `the-dropout-number…` ("The answer we can
defend"), `how-to-wash…` ("What this adds up to"), `how-a-bjj-rash-guard…` ("What we are not
going to tell you"), `grip-decay…` (closes on "The last honest note is about what none of this
can tell you"), `de-la-riva…` ("What the sources do not support").

Each one is right on its own. As a set of nine they are a formula, and the formula is legible
to anyone who reads two articles in a row. The house voice's best move has become its only
closing move. At least two of these should end somewhere else — the limits can be carried in
`contestedNotes`, which is what `contestedNotes` is for.

### T2. The vocabulary tic that goes with it

Across the twelve articles in scope: **"worth" 42 times** ("worth having", "worth stating",
"worth noticing", "worth pausing on", "It is worth" × 9), **"honest" 15 times**, "which is a"
13, "That is not…" 9. `guard-retention-as-a-system.ts` alone uses "worth" seven times.

These are the words the voice reaches for when it is about to qualify something, and qualifying
is what this publication does. That is fine until the reader can predict the sentence.

### T3. The Technique Library never varies its shape

All twelve entries run six `keyMechanics`, five `commonErrors` and six `trainingProgression`
steps, except `inside-position.ts` (five, four, five). Within `keyMechanics`, almost every
bullet is imperative-then-because: "Sit up. Your head should be…", "Bend the elbow and support
it. An unsupported straight arm…", "Get on your side, hip stacked over hip, before anything
else. A knee shield played from a flat back…". Each entry reads well alone; read four in
sequence and the cadence is the loudest thing on the page.

Letting an entry run to four bullets where four is what it has, or eight where it has eight,
would cost nothing and would break the pattern.

### T4. A small under-statement

`grip-decay-and-the-half-life-of-a-no-gi-grip.ts:45` — "One match, then, costs something in the
region of **ten to sixteen** per cent of maximal handgrip in that sample." The figures given
three lines above are 45.9 → 40.1 (−12.6%) and 44.2 → 37.0 (−16.3%). "Twelve to sixteen"
is both accurate and stronger.

### T5. Two inferences presented at the same confidence as the clauses around them

- `why-sport-jiu-jitsu…ts:40` — "the toe hold sits on the legal side of the same clause". The
  small-joint clause says fingers and toes are small joints, that wrists/ankles/knees/shoulders/
  elbows are large, and that "Grabbing the majority of fingers/toes at once is allowed". The toe
  hold's legality follows from the ankle being a large joint plus that permission — it is a
  correct inference, but it is an inference, in a paragraph otherwise made of quotations.
- `seated-guard-and-supine-guard.ts:33` renders IBJJF 4.6.3 as the bottom athlete getting to
  their feet, putting the opponent down "and **holds the top position**". The clause says
  "maintains **the grips necessary to hold the opponent in bottom position**". Close, and not
  identical.

---

## What is genuinely good

The rule-document work is the best thing here and it is not close. Every one of the ~35 clause
citations I checked across the ABC Unified Rules (2025 and 2022), the IBJJF Rule Book v6.1, the
IBJJF Graduation System, the ADCC rules and Nevada's NAC 467 resolved to the clause claimed and
said what it was cited for — including the 2022→2025 foul renumbering, the grounded-fighter
redefinition, the 20-second 50/50 clause with its "regardless of intention", and the "Ex: Guard
pass followed by mount shall add up 7 points (3+4)" example. `contestedNotes` are doing real
work rather than performing caution: the three-different-dates catch on the de la Riva match,
the flagged 3-vs-4-second discrepancy inside the Andreato paper, the refusal to publish a doping
allegation on a single community source, and the two figure profiles that ship with **no
portrait** because the only Commons candidates carried licences that could not be true are all
decisions a less careful publication would have gone the other way on. B1 is a real error, but
it is an error of reading an abstract instead of a table — which is a far better failure mode
than the one this review was looking for, and it did not find.
