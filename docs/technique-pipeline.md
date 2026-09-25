# Technique Library pipeline — from brief to sign-off

How a Technique Library entry gets written and how it gets published. The two
are separate, and the second is a person, not a process. The code that holds
this is `TechniqueReview` in `src/content/technique/types.ts`,
`isPublishedEntry` in `src/content/technique/index.ts`, and
`tests/unit/technique-review.test.ts`. The public statement of it is the
editorial policy's "Drafting and sign-off" section.

## The gate, in one paragraph

An entry drafted with research or writing assistance carries a `review` from
its first commit. While `review.approvedBy` is `null` the entry is a draft:
it renders at its own address so it can be read, and nowhere else. It is not
in its category listing or count, not in the sitemap, not in search, not
linked from any Journal article or figure profile, and not listed as related
from any published entry. It carries `noindex, nofollow`, emits no Article
schema, and says at the top that nobody has yet signed it off and how it was
drafted. Setting `approvedBy` — a name and an ISO date, in a commit — is the
only thing that changes any of that. Entries with no `review` predate the
gate and are published as they were; nobody invents a signature for them.

## The stages

### 1. Research brief

A short file under `content/research/` naming the concept, the category, the
reader's situation, what the entry must and must not claim, and the sources
found. A brief that turns up no source for a mechanic says so; the entry then
states that mechanic as general mechanics or leaves it out.

### 2. Draft, with the claim ledger

Write to `TechniqueEntry`, every field, in the voice in `AGENTS.md` and
`docs/visual-identity.md`. Concepts, not move lists. The safety note names the
injury exposure of this position. Nothing in `BANNED_CONSTRUCTIONS`.

Alongside the draft, keep a claim ledger in the brief: every checkable
sentence, tagged one of three ways.

- `general-mechanics` — body mechanics any coach would state the same way.
- `sourced(URL)` — a rule, a number, a named person's stated position, a
  historical fact. The URL was opened and read, not remembered.
- `hedged` — the entry says "often", "tends to", "in most rooms", and the
  ledger says why that was the honest strength.

A sentence that fits none of these is cut. The ledger is what the fact audit
reads.

Commit with `review.drafted` filled in and `approvedBy: null`:

```ts
review: {
  drafted: "assisted draft, 2026-09-25, from research brief technique-batch-3",
  factAudit: "",   // filled at stage 3
  voiceAudit: "",  // filled at stage 4
  approvedBy: null,
},
```

The unit suite refuses a ledger line under 40 characters, so the draft commit
fails until stages 3 and 4 have written theirs. That is intended: an entry
never sits in `main` with an empty audit line.

### 3. Fact audit

A second reader — a different person, or a separately briefed agent that has
not seen the draft's reasoning — reads the entry against the ledger and the
sources. Every `sourced` URL is opened. Every `general-mechanics` claim is
checked for the case where it is wrong. The verdict goes into
`review.factAudit`: who or what, the date, what was found, what changed. "Two
mechanics rewritten, one epidemiological claim cut, ADCC rule quoted from the
PDF" is a fact audit. "Checked" is not.

### 4. Voice audit

The same standard, for the writing: `AGENTS.md` ("never invent a fact",
"absence is not a subject"), `BANNED_CONSTRUCTIONS`, and the existing entries
as the register to match. Into `review.voiceAudit`, the same way.

### 5. Gates

```
npm run typecheck && npm run lint && npm run test:unit
```

`content.test.ts` holds the entry to the safety-note floor, the mechanics and
errors minimums, the banned constructions and the meta-description window.
`technique-review.test.ts` holds the ledger. `claims.test.ts` holds the
editorial policy's sentence about this process to the code that makes it true.

### 6. Pull request, with an Authorization block

The PR carries the block below, filled in, at the top of its description. A
PR without one is not reviewed.

```
## Authorization

Entry: src/content/technique/entries/<slug>.ts
Category: <category>  ·  Status on merge: DRAFT (approvedBy: null)

Drafted:      <review.drafted, verbatim>
Fact audit:   <review.factAudit, verbatim>
Voice audit:  <review.voiceAudit, verbatim>

Claim ledger: content/research/<brief>.md §Ledger
  general-mechanics: <n>   sourced: <n>   hedged: <n>   cut: <n>

Preview: <Vercel preview URL>/technique/<category>/<slug>

What the owner is being asked to do: read the entry at the preview address,
then either set review.approvedBy on this branch and merge, or say what is
wrong and it goes back to stage 2.
```

### 7. The owner reads it

On the preview, at the entry's address, as a reader would. The draft notice
at the top is what confirms it is the unsigned version. Nothing about the gate
substitutes for this reading; the audits reduce what it has to catch, they
do not replace it.

### 8. Sign-off

The owner, in their own commit on the branch:

```ts
approvedBy: { name: "Rick R", date: "2026-09-27" },
```

The date is the day they read it. The test refuses a future date and a
malformed one. This commit is the authorization; the merge that follows is
mechanical.

### 9. Merge

On the next build the entry enters its category listing and count, the
sitemap, search and the cross-links, and its page gains its Article schema
and loses the notice. Nothing else is flipped by hand. If the category now
holds three published entries, the three-entry gate opens it in the same
build.

## Things this does not do

It does not review prose that nobody registered in the ledger. It does not
sign anything off on a person's behalf: a `factAudit` string, however
thorough, is not `approvedBy`. And it does not apply to the Journal, whose
gate is the byline and the publication date in `src/content/journal/types.ts`.
