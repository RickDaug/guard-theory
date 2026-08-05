# Guard Theory — audit summary

Nine independent auditors, one dimension each, run against the deployed site at
`guardtheory.net` and the repository at commit `psdmbkaig`. Each ran its own
gates rather than trusting the project's claims, and several proved findings by
driving the live site rather than reading source.

**Verdict as audited: 68/100 — SHIP WITH FIXES.**

All 34 blocking findings have since been fixed and deployed. The site has not
been re-audited, so the scores below stand as the record of what was found, not
as a claim about the current state. Anyone wanting a number for today's build
should re-run the auditors.

---

## Scores

| Dimension | Score | Blocking |
|---|---|---|
| Security and privacy | 78 | 0 critical, 1 high |
| Performance | 76 | 3 |
| Accessibility | 73 | 2 |
| Content and BJJ accuracy | 71 | 3 |
| SEO and structured data | 63 | 6 |
| UX and copy | 62 | 6 |
| Design and brand | 62 | 7 |
| Engineering correctness | 61 | 3 |
| Legal and commercial risk | 58 | 4 |

Median 68. Mean 67.

---

## The five patterns

Individual findings are in the numbered reports. These are the shapes that
recurred across dimensions, and they are the part worth acting on.

### 1. Correctness was verified against the test suite and localhost, never against production

The archetype: **both public forms failed on every submission.** Both stores
wrote under `process.cwd()/.data`, which is read-only on a serverless runtime.
`mkdir` threw, both catch blocks swallowed it, and the reader was told "we could
not save your details just now". The site's only conversion point had a zero per
cent success rate.

Every gate was green throughout. 27 unit tests, 93 Playwright specs, Lighthouse
at 90+, a passing CI pipeline. None of them touched the deployed runtime, and
there is no logging anywhere in `src/` — so nothing reported it and nothing could
have.

Three auditors found it independently within an hour, all by the same method:
they POSTed to the real endpoint.

**The lesson is not "write more tests."** It is that a test suite which never
leaves the developer's machine measures the developer's machine.

### 2. Statements were true when written and became false as the site grew

Six live falsehoods, none of them ever a lie:

- The FAQ said there was no size chart — written before one existed, and it was
  being emitted as `FAQPage` structured data.
- The FAQ said articles were held in draft awaiting a byline — eighteen were
  published, bylined and dated.
- The terms said photographs of people appear "with their agreement" — written
  when the site had no photographs of people; it later acquired eight, none of
  whom consented, all used under licence.
- The privacy policy promised a twelve-month deletion schedule nothing
  implements.
- Search said the Journal was unindexed and still in draft.
- Contact promised a reply "usually within a working day", on a site publishing
  no email address and storing messages nowhere durable.

Every one passed review at the time. Nobody re-reads a policy page after
shipping a feature, and no tooling connects "we added a size chart" to "the FAQ
denies there is one".

### 3. The gates measured what they were built to measure, and the site outgrew them

- The colour-contrast system was exhaustive for **text** — a computed table on
  `/design-system`, a build-failing unit test, measured ratios in every token
  comment — and was never extended to non-text. The focus ring was hard-coded to
  citrine: 11.5:1 on ink, **1.31:1 on bone**, invisible across roughly forty
  long-form pages.
- Lighthouse watched three pages, chosen when the site had three page types.
  `/search` fell under the threshold and the gate could not see it.
- `metadata.spec.ts` asserted a draft article is noindex. That article is
  published; all eighteen are. It passed only because Playwright builds without
  indexing enabled, making the whole site noindex.
- axe's `heading-order` rule is tagged `best-practice`, so the chosen tag
  selection never ran it — and an article page opened with an `h2` before its
  `h1`.
- axe missed WCAG 2.2 target-size entirely; Lighthouse caught it.

Two automated tools, two different blind spots, and a suite whose most-praised
assertions included one that could not fail.

### 4. Where a document and the build disagreed, the document was usually right

`docs/visual-identity.md` states that Martian Mono "is never used as a
decorative section label, which is the crutch the brief specifically warns
about". The build did exactly that in **29 places**, including four per page in
the footer — making it the single most repeated gesture on the site.

`AGENTS.md` states that a diagram's meaning must live in its key, never only in
the drawing. The guard system map's entire argument — the edges — existed only
inside an `aria-hidden` SVG, while its caption promised the key carried it.

`docs/visual-identity.md` states "numbers only where they refer". Four unrelated
numbering schemes referenced nothing.

The documents were not aspirational. They were correct and the build had drifted
from them, which is a much easier problem to fix than the reverse.

### 5. Rule documents were narrowed or strengthened in transcription — five times

- "both knees" for a rule reading "one or both knees"
- "and" for "and/or", three separate clauses
- a precondition dropped: the ADCC penalty applies only when **both**
  competitors are standing
- a rule the Nevada Commission can waive, stated as absolute
- a non-significant correlation written as "every athlete… no time"

In every case the research file recorded the source correctly and the prose
reached past it. This is the failure mode of a project that sources well: the
citation is right, so the claim is trusted, and nobody re-reads the quotation
against the document.

---

## What held up

Stated once, because a review that only finds fault is not calibrated.

- **No fabricated citations.** 37 URLs content-verified in the editorial pass, 32
  more across the submission articles, 27 across the figure profiles. Every legal
  clause number, every ruleset section, every Wikimedia licence checked out.
- **No secrets in the public repository**, across the entire git history. No
  `.env`, no `.vercel`, no credentials, no submission data.
- **Zero third-party requests and zero cookies** on every page, verified live —
  the privacy policy's central claim is true.
- **No `Product`, `Offer`, `AggregateRating` or `Review` schema anywhere**, and a
  CI test that fails if any appears. There is no price and no stock, and nothing
  pretends otherwise.
- **106 KB of pointed competitor criticism in the research documents reached zero
  published pages.**
- **The editorial firewall is real**: reference material carries no commercial
  links in body copy, verified by link-graph analysis rather than assertion.
- **The safety writing on the submission articles** — where the risk is, the
  strangle/crank distinction, no physiological claims — was called the best thing
  on the site by the domain auditor.
- **Rate limiting measured better than its own documentation feared**, and
  `x-forwarded-for` proved unspoofable on this host.

---

## Open, ranked

Nothing below is fixed. The first three need the owner.

1. **No legal entity, address, or contact email anywhere**, while the Terms form
   contracts and invoke UK, EU and California regimes. Nothing identifies who is
   contracting. This is the largest launch blocker.
2. **The fabric specification and size chart describe a garment that has never
   been manufactured.** They become contract terms under CRA 2015 s.11 and UCC
   §2-313 the moment anyone buys against them.
3. **No mail provider.** Submissions no longer fail, but a temp directory does
   not survive a cold start. Nothing is durable.
4. **Right of publicity** on five living subjects whose portraits sit on a site
   that sells apparel. Copyright licences do not convey publicity rights, and
   Brazil's STJ Súmula 403 presumes damages without proof of harm.
5. **Fifteen category pages of 53–76 words** are in the sitemap, against the
   project's own thin-content rule.
6. **Zero internal links between the Journal, the Technique Library and the
   Figures index.** Three sealed rooms.
7. **Returns commitments are operationally expensive**: free two-way exchange
   postage, replacement dispatched before the return arrives, worldwide, on a
   debut product.

---

## Method

Nine agents, one dimension each, no shared context, each with authority to
reject. Eight ran read-only against the live site and the committed screenshots;
one owned the build and the port, because a stale server serving a previous
build's assets had already produced false results twice in this project.

Two process notes worth recording. A concurrent Playwright run killed the
performance auditor's server mid-measurement and its audit had to be re-run —
`playwright.config.ts` and `scripts/lighthouse.mjs` both hard-code port 3100.
And the working tree changed under two auditors during their runs; both stated
which build their numbers came from.

The audit cost roughly 1.9 million tokens across nine agents. It found three
defects that would have embarrassed the brand on launch day and one that made
the site's only conversion point non-functional. Every one was invisible to a
green CI pipeline.
