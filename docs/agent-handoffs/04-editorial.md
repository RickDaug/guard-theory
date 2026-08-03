# Handoff 04 — Editorial Writer and Content Strategist

**Agent:** Editorial Writer and Content Strategist
**Date:** 2026-08-03
**Repo:** `C:\Users\RickD\AndroidStudioProjects\guard-theory`

---

## 1. Work completed

Three finished flagship Journal articles, in three different categories, each fully sourced and each accompanied by a research file recording the claims, the sources, the contradictions, and the claims that were cut.

All three are `status: "draft"`. None carries a publication date, because `DraftArticle` has no field for one and there is no real author byline yet.

| Slug | Category | Sections | Words | Sources |
| --- | --- | --- | --- | --- |
| `how-a-bjj-rash-guard-should-fit` | equipment-and-apparel | 7 | ~2,110 | 6 |
| `maeda-and-the-arrival-of-judo-in-brazil` | bjj-history | 8 | ~2,200 | 7 |
| `how-no-gi-rulesets-reshaped-technique-selection` | competition-analysis | 8 | ~2,190 | 6 |

All three fall inside the 1,400–2,200 word and 5–8 section brief. Word counts include section headings, which is how `readingTimeMinutes()` in `types.ts` counts them.

## 2. Files created

| File | Contents |
| --- | --- |
| `src/content/journal/entries/how-a-bjj-rash-guard-should-fit.ts` | Draft article. High commercial intent, no commercial ask, no hygiene / performance / injury-prevention claim, no call to action. |
| `src/content/journal/entries/maeda-and-the-arrival-of-judo-in-brazil.ts` | Draft article. Five `contestedNotes`; every disputed claim carries at least two named researchers who disagree. |
| `src/content/journal/entries/how-no-gi-rulesets-reshaped-technique-selection.ts` | Draft article. Argued from the IBJJF and ADCC rule books; states no competition result. |
| `content/research/how-a-bjj-rash-guard-should-fit.md` | Research file: claims, sources with URLs and access dates, contradictions, dates, names, approved quotations, image requirements, rights, fact-check status, editorial notes. |
| `content/research/maeda-and-the-arrival-of-judo-in-brazil.md` | Same structure. Includes a rights section flagging this as the highest-risk piece of the three. |
| `content/research/how-no-gi-rulesets-reshaped-technique-selection.md` | Same structure. Includes a clause-by-clause map of every rule cited. |
| `docs/agent-handoffs/04-editorial.md` | This file. |

**Nothing else was created, edited or deleted.** `types.ts` is untouched, no index or barrel file was created, `src/app/`, `src/components/`, `tests/` and all config files are untouched. **No git commands were run.**

## 3. Key decisions

1. **Three articles, not six.** The brief allowed it and the quality bar required it. Each of these took a full primary-source pass; six would have meant citing other people's summaries.
2. **Categories chosen for interlinking as well as coverage.** Equipment, history and competition analysis give three genuinely different research problems and cross-link cleanly. `relatedSlugs` reference only slugs written in this batch. No slug was invented.
3. **The rash-guard article makes no benefit claim at all.** Its sixth section says explicitly what we are *not* claiming and why, and cites the compression-garment literature only as evidence that the question is unsettled. This is the piece's integrity load-bearer; if it is cut for length the article stops satisfying the brief.
4. **No call to action anywhere in the equipment piece.** It ends on a coach.
5. **The Maeda article is structured anti-narratively.** Agreed facts first, then one section per disputed claim, then a methodological close. Rewriting it into a chronological story would undo its point.
6. **Wikipedia is cited nowhere.** Its wikitext was read for its citation apparatus, and three facts that traced only to it were dropped as a result.
7. **The rulesets article names no athlete and states no match result.** Everything is argued from two published rule books. It is checkable by a reader with two browser tabs.
8. **Every rule quoted was read in the primary PDF**, downloaded from `ibjjf.com/books-videos` and extracted with `pdftotext -layout`, never from a blog summary. Two apparel-brand blogs and one third-party mirror were rejected.
9. **Diacritics are dropped in article bodies** (Belem, Gastao, Jose) to match the ASCII convention of the existing content files. They are recorded correctly in the research files. **Reverse this if the build handles UTF-8 in content strings, which it almost certainly does — this was a consistency choice, not a technical one.**
10. **Safety framing is technique-specific**, per the standard in `docs/assumptions.md`. The rulesets article's safety paragraph is about rotational knee attacks, silent injury and division-by-division legality, and points to a qualified coach. The equipment article distinguishes annoyance-level fit problems from ones that warrant a clinician.

## 4. Assumptions

| # | Assumption | Risk if wrong |
| --- | --- | --- |
| A1 | The Journal renders `sections[].id` as anchor targets and `contestedNotes` as visible text. If `contestedNotes` were rendered only in metadata, the Maeda article would lose half its honesty. | The article body also states each dispute in prose, so nothing is lost silently. |
| A2 | `relatedSlugs` may reference draft articles. All three cross-link only within this batch. | If related links are only rendered for published articles, these degrade to nothing, which is fine. |
| A3 | Article bodies are plain text, not Markdown. No inline formatting or links are used. | If Markdown is supported, the pieces would benefit from linked citations in-body. Cosmetic. |
| A4 | The equipment article may live in the Journal at all. See R1. | Material — see risks. |
| A5 | Sources are rendered with title, publisher and URL. Titles are written to be readable in a citation list rather than to match page `<title>` tags exactly. | Cosmetic. |

## 5. Sources consulted

**19 sources cited across the three articles** (6 + 7 + 6), plus roughly a dozen more consulted and rejected. All accessed **2026-08-03**.

The ones that carry the most weight:

- **IBJJF Rule Book v6.1 (2024JUN)** — https://ibjjf.com/books-videos — downloaded and read as a PDF. Source for the no-gi uniform rule quoted verbatim in the equipment article and for fourteen separate clauses in the rulesets article.
- **IBJJF Rules Update Guide 2024** and **IBJJF "New Rules Updates"** — https://ibjjf.com/news/new-rules-updates — the governing body's own record of the 1 January 2021 heel hook and knee reaping change, corroborated independently by FloGrappling and BJJ Eastern Europe.
- **ADCC Rules & Regulations** — https://adcombat.com/adcc-rules-regulations/ — read in full for time limits, positive and negative points, and legal techniques.
- **José Cairus, "Modernization, nationalism and the elite: the Genesis of Brazilian jiu-jitsu, 1905-1920"**, *Revista Tempo e Argumento* — https://www.redalyc.org/journal/3381/338130377006/html/ — peer-reviewed history; source of the one approved direct quotation and of the 1928 Otake remark.
- **Roberto Pedreira, "Top 20 Myths about Mitsuyo Maeda"** — https://www.sonnybrown.net/top-20-myths-about-mitsuyo-maeda/ — the archival researcher's position on the fight record and on whether Carlos Gracie ever met Maeda.
- **Robert Drysdale interview, BJJ Heroes** — https://www.bjjheroes.com/interview/robert-drysdale-on-the-first-5-brazilians-promoted-by-mitsuyo-maeda — the five Brazilians Maeda promoted, and the São Paulo arrival dating that contradicts the widely circulated one.
- **National Diet Library (Japan), "Undefeated Conde Koma who challenged the Amazon"** — https://www.ndl.go.jp/brasil/e/column/kodekoma.html — institutional account; also the source that repeats the thousand-fight claim the article contests.
- **Jovanović et al., *Materials* 15(19):6512 (2022)** — https://pmc.ncbi.nlm.nih.gov/articles/PMC9570736/ — elastane percentage and the size of the elastic region; DOI, journal and abstract verified via Crossref.
- **ASTM D2594/D2594M-21** and **ISO 8559-1:2017** — stretch/growth measurement and anthropometric definitions.

Rejected on source grounds: every apparel brand's blog on IBJJF uniform rules (the brief forbids them as sole authority, and the primary PDF was available); a Facebook page transcribing a passport; retail listings used as book citations; several undated third-party rule-book mirrors.

## 6. Tests performed

| Test | Method | Result |
| --- | --- | --- |
| TypeScript compilation | `npx tsc --noEmit` from the repo root | **Exit 0, zero errors.** |
| The new files are actually in the compilation | `npx tsc --noEmit --listFiles \| grep journal` | All three entry files listed alongside `types.ts`. |
| Word count per article | Node script extracting string literals between `sections: [` and `sources: [`, excluding kebab-case ids | 2,107 / 2,200 / 2,193 — all inside 1,400–2,200 |
| Section count per article | Count of `id: "` within the sections block | 7 / 8 / 8 — all inside 5–8 |
| Banned constructions | The 10 regexes already enforced in `tests/unit/content.test.ts`, plus 7 more for the brief's additional bans (`realm`, `delve`, `dominate`, `elevate`, `journey`, `dynamic`, `tapestry`), run over each whole file | **Clean on all three.** |
| Every cited URL resolves | HTTP request per URL with a browser user agent | All resolve. `iso.org` and `doi.org`→MDPI return 403 to automated requests (bot mitigation) and resolve normally in a browser; the MDPI paper is therefore cited via its PubMed Central mirror instead. |
| Quotations checked verbatim | Each quotation re-read against the extracted source text | 5 rule-book quotations and 1 interview quotation confirmed exactly, including the source's own typo ("color(belt)"). |
| No fabricated results | Manual review | **No competition result, medal, record or statistic appears in any of the three articles.** |
| File ownership respected | Directory listing before and after | 7 files created; nothing modified elsewhere; no git commands run. |

Reproduce the count and banned-phrase check with the script recorded in the scratchpad, or re-implement it: it reads each file in `src/content/journal/entries/`, slices between `sections: [` and `sources: [`, extracts double-quoted string literals, drops pure kebab-case ids, and counts words.

## 7. Risks

| # | Risk | Severity | Mitigation |
| --- | --- | --- | --- |
| R1 | **`how-a-bjj-rash-guard-should-fit` collides with the planned `/size-and-fit` route.** `docs/assumptions.md` and `docs/keyword-map.md` both assign this exact intent to `/size-and-fit`, not to the Journal. Shipping both is the thin keyword-variant pattern the SEO strategy forbids. | **High** | Owner decision needed. Either publish this article as the canonical `/size-and-fit` content, or narrow `/size-and-fit` to charts and measuring instructions and let the Journal carry the argument. Do not ship both covering the same ground. |
| R2 | **The Maeda article touches a living family's public identity.** | Medium-High | Every contested claim is attributed to a named published researcher and paired with the position that contradicts it. No motive is imputed to anyone. One sentence ("the person with the most to gain from it") is flagged in the research file as safely cuttable if legal review objects. |
| R3 | **Nothing can be published until there is a real named author.** All three are drafts by design; the E-E-A-T strategy in handoff 02 depends on a byline that does not exist. | Medium-High | Already escalated as owner-decision item 2. These articles are ready the day an author is. |
| R4 | **The IBJJF illegal-moves table could not be reconstructed reliably from extracted PDF text.** Its six-column grid collapses under `pdftotext`. | Medium | The article's specific permission claims rest on the IBJJF's own 2021 announcement plus two independent reports, and the limitation is stated in `contestedNotes`. **Anyone revising must read the table from the rendered PDF, not from extracted text.** |
| R5 | **The ADCC ruleset is published undated and unversioned.** No claim about any past ADCC edition can be sourced from it. | Medium | Stated in the article body and in `contestedNotes`; the article makes no claim about any past event. |
| R6 | **Rule books change.** Version 6.1 will be superseded, and the 2021 leg-lock permissions could be revised. | Medium | Every rule citation names its version and clause, so a future reader can tell what was true when. Re-verify before publishing and at each rule-book release. |
| R7 | **`contestedNotes` may not be rendered.** The Maeda piece in particular depends on them being visible. | Medium | Each dispute is also stated in the body prose, so the article is honest even if the notes are only metadata. Build agent should render them. |
| R8 | **`iso.org` blocks automated requests.** An automated link-checker will flag it as broken. | Low | It resolves in a browser. Any link-check test needs an allow-list or a browser user agent, or the citation moves to a mirror. |
| R9 | **The Journal now has three categories with one article each and five with none.** The technique library's test requires every category to have an entry; if an equivalent test is written for the Journal it will fail. | Low-Medium | Deliberate — the remaining three commissions should fill `guard-systems`, `mma-and-jiu-jitsu` and one of `influential-practitioners` / `training-culture` / `technique-notes`. Do not write a Journal category-coverage test until the set is complete. |

## 8. Remaining recommendations

1. **Resolve R1 before anything is written for `/size-and-fit`.** It is a five-minute decision now and a redirect later.
2. **Commission the remaining three from the brief's list**, prioritising `guard-systems` ("guard retention as a system") — it is closest to the brand thesis and it is the pillar the Technique Library should link up into — then `mma-and-jiu-jitsu`, then one of the remaining categories.
3. **Reinstate the cut Donato Pires dos Reis claim if it can be sourced properly.** His reported 1931 public denial that Carlos Gracie was a direct pupil of Maeda is the strongest contemporary evidence on the article's central dispute, and it was cut only because it could not be traced past a secondary summary. A page reference in *Choque* or in Serrano's *O Livro Proibido do Jiu-Jítsu*, or the newspaper citation itself, would restore it.
4. **Write the submission-only companion.** A section on EBI-style overtime and submission-only formats was cut from the rulesets article because their published rules could not be located in citable form. That is a real gap in the competition-analysis coverage.
5. **Build agent: render `contestedNotes` visibly**, and render `sources` with publisher and access date. The access date is doing real work in a piece about a rule book that changes.
6. **Do not add a lineage diagram to the Maeda article.** Every such diagram published elsewhere resolves precisely the questions the article says are unresolved.
7. **Re-verify all six IBJJF and ADCC citations immediately before publication**, and add a recurring check at each IBJJF rule-book release.
8. **Illustration briefs are written per article** in the research files, including explicit prohibitions (no product photography, no identifiable athletes, no match screenshots, no re-creations). Hand those to whoever draws the plates.
9. **Confirm whether content strings may contain non-ASCII.** If they may, restore the diacritics in Belém, Gastão, José, França, Jovanović and *primeiro galão* from the research files.
