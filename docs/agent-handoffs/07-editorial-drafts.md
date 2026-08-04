# Handoff 07 — Editorial Writer, six short drafts

**Agent:** Editorial Writer
**Date:** 2026-08-03
**Repo:** `C:\Users\RickD\AndroidStudioProjects\guard-theory`
**Predecessors:** `docs/agent-handoffs/04-editorial.md`, `docs/agent-handoffs/05-editorial-flagships.md`
**Commission:** six briefs from `docs/article-briefs.md`, 1,200–1,700 words, 5–7 sections, across at least four categories

---

## 1. Work completed

Six Journal articles, shorter and tighter than the flagships and held to the same sourcing standard. Six different categories, one each. All are `status: "draft"`; none carries a publication date, because `DraftArticle` has no field for one and there is still no author byline.

| Brief | Slug | Category | Sections | Body words | Sources |
| --- | --- | --- | --- | --- | --- |
| B13 | `the-dropout-number-nobody-can-source` | training-culture | 7 | 1,518 | 8 |
| B14 | `how-to-wash-a-rash-guard` | equipment-and-apparel | 7 | 1,661 | 7 |
| B11 | `grip-decay-and-the-half-life-of-a-no-gi-grip` | technique-notes | 6 | 1,372 | 6 |
| B4 | `de-la-riva-and-the-guard-that-took-his-name` | influential-practitioners | 6 | 1,662 | 5 |
| B7 | `what-the-early-ufc-tournaments-demonstrated` | mma-and-jiu-jitsu | 7 | 1,385 | 4 |
| B9 | `seated-guard-and-supine-guard` | guard-systems | 7 | 1,582 | 4 |

Body words counts `sections[].paragraphs` only, matching the 1,200-word floor in `tests/unit/content.test.ts`.

The Journal now holds twelve articles across all eight categories. `bjj-history` (1) and `competition-analysis` (1) are the thinnest; `influential-practitioners` and `technique-notes` now have one each, filling the two gaps handoff 05 flagged.

## 2. Files created

| File | Contents |
| --- | --- |
| `src/content/journal/entries/the-dropout-number-nobody-can-source.ts` | Draft. Catalogues five circulating dropout figures, each attributed in the sentence it appears in, and endorses none. Ends without an answer. |
| `src/content/journal/entries/how-to-wash-a-rash-guard.ts` | Draft. Refuses the rules-list format; devotes a section to the four claims that could not be sourced. |
| `src/content/journal/entries/grip-decay-and-the-half-life-of-a-no-gi-grip.ts` | Draft. Cuts the "sweat makes grips slip" claim and says why. |
| `src/content/journal/entries/de-la-riva-and-the-guard-that-took-his-name.ts` | Draft. Names no competition result; prints three conflicting dates from one source. |
| `src/content/journal/entries/what-the-early-ufc-tournaments-demonstrated.ts` | Draft. Names no fighter, states no result, gives no event date or bracket size. |
| `src/content/journal/entries/seated-guard-and-supine-guard.ts` | Draft. Defines its own terminology and labels it as ours. |
| `content/research/*.md` (six files, same slugs) | Research files: claims, sources with dates, contradictions, dates and names verified, quotations approved, image requirements, rights concerns, fact-check status with every cut, editorial notes. |
| `docs/agent-handoffs/07-editorial-drafts.md` | This file. |

**Nothing else was created, edited or deleted.** `types.ts`, the six existing articles, `src/content/journal/index.ts`, `src/app/`, `src/components/`, `docs/article-briefs.md`, `tests/` and all config files are untouched. **No git commands were run.** Per instruction, `npm run build`, `npm run dev`, `npm run start`, Playwright and Lighthouse were **not** run.

## 3. The one thing that must happen next

**The six new articles are not registered.** `src/content/journal/index.ts` imports entries explicitly and was outside this agent's file ownership.

```ts
import { theDropoutNumberNobodyCanSource } from "./entries/the-dropout-number-nobody-can-source.ts";
import { howToWashARashGuard } from "./entries/how-to-wash-a-rash-guard.ts";
import { gripDecayAndTheHalfLifeOfANoGiGrip } from "./entries/grip-decay-and-the-half-life-of-a-no-gi-grip.ts";
import { deLaRivaAndTheGuardThatTookHisName } from "./entries/de-la-riva-and-the-guard-that-took-his-name.ts";
import { whatTheEarlyUfcTournamentsDemonstrated } from "./entries/what-the-early-ufc-tournaments-demonstrated.ts";
import { seatedGuardAndSupineGuard } from "./entries/seated-guard-and-supine-guard.ts";
```

Add all six to `ARTICLES` **together**. `seated-guard-and-supine-guard` lists `grip-decay-and-the-half-life-of-a-no-gi-grip` in `relatedSlugs`, so registering a subset will fail the dangling-slug assertion. Every other `relatedSlugs` target is an already-registered article.

## 4. Source verification

Every URL was fetched during this pass. Three notes the next agent needs:

- **R1 — one DOI is dead.** Sülar & Öner (2019), the repeated-home-laundering study central to `how-to-wash-a-rash-guard`, has DOI `10.5604/01.3001.0012.7513`, which resolves to `ftee.com.pl` and returns **404**. The article cites the publisher-hosted PDF at `publisherspanel.com`, which returns 200 and is the paper itself. If FTEE restores a stable landing page, swap it.
- **R2 — three publishers block automated requests.** `journals.sagepub.com` (403), `mdpi.com` (403) and `iso.org` (403) all refuse `curl` with a browser user agent. Where a PMC mirror existed it was used; for Crane & Temple the ERIC record (`EJ1050586`) is cited instead of SAGE; the ISO 3758 fact is taken from GINETEX rather than from ISO. **None of these is a broken link, and none should be "fixed" by removing the citation.**
- **R3 — a summarising fetch produced a filename that was not in the page HTML**, and it turned out to be real only after the `active_storage` link list was grepped out of the raw markup. Everything numeric in these six articles was read from raw HTML or from a PDF via `pdftotext`, not from a summary. Keep doing that.

Primary documents read in full rather than summarised: the IBJJF Rule Book v6.1 (2024JUN) PDF, the IBJJF *General System of Graduation* June 2026 PDF, the ABC Unified Rules of MMA August 2025 PDF, the NJ SACB 2002 rules proposal, the ADCC rules page, and the Sülar & Öner PDF.

## 5. Key decisions

1. **Category spread was chosen for sourcing, not for interest.** Six briefs, six categories. B2 (luta livre) and B3 (Fadda) were considered and dropped: both depend on newspaper archives or on community wikis reproducing each other, and neither could be written to the standard in this pass. B6 (`what-the-cage-did-to-the-guard`) and B17 (IBJJF uniform rules) were dropped for **duplicate intent** — the fence is already a section of `why-sport-jiu-jitsu-does-not-transfer-directly-to-mma`, and IBJJF clause 8.1.16 is already quoted at length in `how-a-bjj-rash-guard-should-fit`. B8 (leg entanglements) was dropped because the January 2021 rule change is already the subject of a section in `how-no-gi-rulesets-reshaped-technique-selection`.
2. **The dropout piece names its five sources of circulation and endorses none.** Every percentage in it is attributed inside the sentence that contains it, and each is followed by what that publisher says about its own method. BJJ Analytics is treated as the object of study, exactly as the brief required.
3. **`how-to-wash-a-rash-guard` has no rules list.** Four of the standard instructions — wash temperature, detergent chemistry, chlorine, fabric softener — could not be sourced and are named as gaps in a dedicated section. The one measured variable turned out to be the number of wash cycles.
4. **The grip piece cuts the sweat claim.** The only friction measurement located (Gerhardt et al. 2008) found friction *increasing* with skin hydration, in a skin-on-textile test. The article states that the grappling case is unmeasured and makes no claim in either direction.
5. **The de la Riva piece states no date and no result for the Copa Cantão match.** BJJ Heroes gives 1985, "around 1986" and a 1987 photo caption across two of its own pages, and the two pages describe the outcome differently. That disagreement is the article's third section.
6. **The early-UFC piece describes the format only through a regulator.** The New Jersey State Athletic Control Board's 2002 proposal states that the sport "generally did not divide contestants into weight classes, had contestants participate in several matches on the same evening and did not provide time limits on either round or bout length". No fighter, result, event date or bracket size appears anywhere in the article.
7. **The seated/supine piece defines its own terms and says so.** No governing body defines either posture, and the IBJJF's own definition of guard is posture-neutral — which is the article's opening argument.

## 6. Claims cut, by article

Full lists are in each research file's §9. The ones a reviewer is most likely to want restored:

- **Dropout:** every percentage as fact; any origin story for the ninety per cent figure; anything linking injury to dropout; any worldwide practitioner total.
- **Wash:** a maximum wash temperature; detergent chemistry; chlorine (the 1987 Epps paper covering chlorine could not be opened — SAGE 403 — and should be revisited); fabric softener; specific AATCC method numbers; the tumble-dryer instruction as a rule.
- **Grip:** "sweat makes grips slip"; any duration figure for a no-gi grip; the papers' own training recommendations.
- **De la Riva:** the Copa Cantão date and result; "until then unbeaten"; the 2002 Worlds medal, the 2003 ADCC appearance and the 1993 retirement; the attribution of the outside hook to Oda Tsunetane; a peer-voted "top five technical fighters" ranking.
- **Early UFC:** every bout result; bracket size (an earlier draft said "eight-person or four-person"; removed); event dates; the 1996–97 political history; everything from the 2009 ABC report, which is a scanned PDF with no extractable text.
- **Seated/supine:** the entire planned Kodokan *newaza* vocabulary section — `kodokanjudoinstitute.org` redirects to `kdkjudo.org`, whose `/en/` path 404s and whose content is Japanese-language, so no institutional citation was possible; also any superiority, body-type or safety comparison.

## 7. Verification run

`npx tsc --noEmit` — **passes, exit 0**. `tsconfig.json` includes `**/*.ts`, so the six new entries are type-checked even though they are not yet imported by the registry.

A local check reproduced the assertions in `tests/unit/content.test.ts` against the six new files: ≥5 sections, ≥1,200 body words, ≥3 sources, unique kebab-case anchors, no banned construction, no non-ASCII characters in body copy. All pass. The suite itself cannot see them until §3 is done.

## 8. What is still open

- **Twelve briefs remain unwritten.** B1, B2, B3, B5, B6, B8, B10, B12, B15, B16, B17, B18. B18 (submission-only) remains the highest sourcing risk of the set, as its brief says.
- **`bjj-history` and `competition-analysis` are now the thinnest categories**, at one article each. B1 and B18 would fix that, in that order of confidence.
- **Images.** Every research file's §7 specifies what the piece needs. Two carry hard prohibitions worth surfacing now: the GINETEX care symbols are **trademarked** and must not be reproduced without clearance, and no photograph of any identifiable competitor may be used in the de la Riva piece.
- **Nothing may be published** until owner-decision item 2 supplies a real named author.
