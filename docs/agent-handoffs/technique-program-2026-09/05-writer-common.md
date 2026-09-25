# Common instructions for every technique writer (2026-09-25)

Repo: C:\Users\RickD\AndroidStudioProjects\guard-theory (Next.js 16, TypeScript content registry). The MAIN tree is on `main` and other agents work in sibling worktrees — never touch the main tree or any worktree that is not yours.

## Setup (exactly)
1. `git fetch origin`
2. `git worktree add ../<WORKTREE> -b <BRANCH> origin/feat/technique-review-gate` (the gate branch adds `TechniqueEntry.review`; PR #16).
3. node_modules junction — the Bash tool's `cmd /c mklink` silently does nothing. Use the PowerShell tool with absolute paths:
   `New-Item -ItemType Junction -Path "C:\Users\RickD\AndroidStudioProjects\<WORKTREE>\node_modules" -Target "C:\Users\RickD\AndroidStudioProjects\guard-theory\node_modules"`
   Remove at the end (PowerShell): `(Get-Item "C:\Users\RickD\AndroidStudioProjects\<WORKTREE>\node_modules").Delete()` — then verify `C:\Users\RickD\AndroidStudioProjects\guard-theory\node_modules\next` still exists — then `git worktree remove ../<WORKTREE>`.
4. Never `npm ci` / `npm install`.
5. Unit tests need a database: `npm run db:local -- --port <PORT>` in the background; export BOTH `DATABASE_URL` and `DATABASE_URL_UNPOOLED` to `postgresql://postgres@127.0.0.1:<PORT>/postgres?sslmode=disable`; `npm run db:migrate` once; run unit tests with `node --test --test-concurrency=1` (or however `npm run test:unit` invokes it, plus that flag). Stop PGlite at the end.

## Read before writing (all of it)
- AGENTS.md; docs/technique-pipeline.md (the authorization format, the claim ledger, the PR Authorization block template — on your branch).
- src/content/technique/types.ts (every field required; `review` block), src/content/technique/index.ts, src/content/editorial-voice.ts, tests/unit/content.test.ts, tests/unit/technique-review.test.ts.
- C:\Users\RickD\AppData\Local\Temp\claude\C--Users-RickD\b0cdda04-bc73-4c94-b200-11730461983b\scratchpad\research\entry-audit.md — section (c) "House style fingerprint" and "Tics NOT to copy" are binding.
- The three style-standard entries: entries/underhook-half-guard.ts, leg-entanglement-as-control.ts, knee-cut-pass.ts.
- Your rows in C:\Users\RickD\AppData\Local\Temp\claude\C--Users-RickD\b0cdda04-bc73-4c94-b200-11730461983b\scratchpad\research\target-list.md, and §4/§5 of search-demand.md in the same folder (what the searcher asks; what competitors' pages lack).

## The rule above all
Never invent a fact. No statistics, dates, named attributions ("Danaher teaches…"), rule citations, injury-frequency or anatomy claims beyond general mechanics. Terms are reported the house way ("many gyms call this…", "usually called…"). Where a claim would need a URL, it does not belong in an entry (entries have no sources field): cut it or phrase it as mechanics. Rules/legality: "most adult no-gi rulesets…; check the one you compete under", never a specific rule text.

## Each entry
- Every `TechniqueEntry` field. `title` ≤ 45 chars (the layout appends " · Guard Theory"; a test enforces it), concept-first. `summary` ONE sentence; if it runs past ~150 chars add `metaDescription` 120–158 chars in different words (tests enforce 110–160 effective and that it differs). `objective` one sentence. `keyMechanics` 5–8 ordered by importance, each an imperative + the mechanical reason. `commonErrors` 4–6 as the error and its consequence, never the person. `safetyNote` specific: the structure, the load direction, who is exposed, what both partners do; no incidence or prognosis; ≥ 80 chars. `trainingProgression` 5–7 steps, least → most resistance, register-labelled (Static / Cooperative / Constrained / Positional / Live), last step asks the reader to observe. `relatedSlugs` 3–5 existing published slugs (the sixteen on main plus any you create in this batch — never a slug another writer is creating).
- `review: { drafted: "Assisted draft, 2026-09-25, from docs/agent-handoffs/technique-program-2026-09 (brief 04, <slug>); written by a Claude Code agent from the research brief and the house style fingerprint.", factAudit: "Pending: independent fact-and-mechanics audit not yet run.", voiceAudit: "Pending: independent voice audit not yet run.", approvedBy: null }` — every string ≥ 40 chars (tested). approvedBy stays null.
- Search fit: the entry's listed phrases appear naturally in title/summary/body, including the synonyms ("rear naked choke" AND "strangle"; "d'arce" AND "brabo"). Answer the searcher's actual question in `positionAndProblem`/`coreConcept` (e.g. "how a rear naked choke works", "arm triangle vs d'arce") without writing an FAQ.
- Voice: sentences 18–25 words with a verb and a reason; zero em-dashes; no rhetorical questions; no "in this entry"; no motivational lines; no "It is worth…"; no "X is not Y, it is Z" opener; no "The specific risk…" opener in safety notes; no wry one-line closers; no repetition between fields; no banned constructions (tested, including metaDescription).
- Depth: each entry should carry roughly 900–1,400 words across its fields. That is where a written entry beats the 500–1,100-word pages ranking today: complete mechanics, the failure and the counter, and how to train it.

## Wiring
Import and add each entry to `ENTRIES` in index.ts in alphabetical position. Add crosslinks in src/content/crosslinks.ts ONLY where the basis is traceable to text in both documents (quote it in the basis); it is normal to add none. Do not touch category summaries or other entries.

## Gates
`npm run typecheck && npm run lint && npm run test:unit` — zero warnings, all green. Do NOT run `next build` (CI does).

## PR
Commit(s): plain lowercase subject, why in the body, ending `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. Push. `gh pr create --draft --base feat/technique-review-gate` with title "content: <n> <categories> entries (drafts, unapproved)" and a body that is the Authorization block from docs/technique-pipeline.md filled in, including the CLAIM LEDGER (one row per checkable sentence: entry · field · quote · class general-mechanics | hedged-terminology | cut), ending with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`. `gh pr checks --watch`; fix red. Never merge. Clean up (junction via PowerShell, worktree, PGlite).

## Report
PR URL, the slugs and titles written with word counts, crosslinks added (with basis), gate results, anything you cut for being unverifiable. No memory files.
