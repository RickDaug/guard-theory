# Technique writer brief — template (filled per category after research)

Repo: C:\Users\RickD\AndroidStudioProjects\guard-theory (Next.js 16). Main tree is on `main` — never work in it.
Worktree: `git fetch origin && git worktree add ../gt-<cat> -b content/technique-<cat>-2026-09 origin/<BASE>`
node_modules junction: `cmd /c mklink /J ..\gt-<cat>\node_modules C:\Users\RickD\AndroidStudioProjects\guard-theory\node_modules`
(remove with `cmd /c rmdir ..\gt-<cat>\node_modules` BEFORE `git worktree remove`). Never npm ci/install.

READ FIRST: AGENTS.md (all), src/content/technique/types.ts, src/content/technique/index.ts,
src/content/editorial-voice.ts (BANNED_CONSTRUCTIONS), tests/unit/content.test.ts, docs/technique-pipeline.md,
and these three entries as the style standard: underhook-half-guard.ts, leg-entanglement-as-control.ts, knee-cut-pass.ts.

THE RULE ABOVE ALL: never invent a fact. No statistics, dates, named attributions ("Danaher says"),
rule citations, or anatomy claims you cannot state as general mechanics. Terms are hedged the house way
("many gyms call this…", "usually called…"). If a claim needs a source, it does not belong in a technique
entry (those have no sources field) — cut it or phrase it as mechanics.

EACH ENTRY (TechniqueEntry, every field required):
- slug (kebab, matches file), category, title (concept-first, ≤ ~55 chars: "The rear naked strangle: …" style),
  summary (ONE sentence; if > ~150 chars add metaDescription 120–158 chars, different wording),
  difficulty, relevance, positionAndProblem (a paragraph: the situation and what goes wrong),
  objective (ONE sentence), coreConcept (a paragraph: the single idea that makes the rest cohere),
  keyMechanics (5–8, ordered by importance, each a mechanic with the reason it matters),
  commonErrors (4–6, phrased as the error, not a scold), safetyNote (specific to this entry, ≥ 80 chars,
  names the actual exposure and what to do), trainingProgression (5–7, least → most resistance),
  relatedSlugs (3–5 real slugs), review: { drafted, factAudit: "pending", voiceAudit: "pending", approvedBy: null }.
- Search fit: the searcher's words appear naturally in title/summary and body (the exact phrases listed per entry),
  including the common synonyms (e.g. "rear naked choke" and "strangle"; "d'arce" and "brabo").
- Voice fingerprint: <FILLED FROM AUDIT>. Sentences carry a verb and a reason. No rhetorical questions,
  no "in this entry we will", no motivational lines, no listicle cadence, no repetition between fields.

CLAIM LEDGER: in the PR body, for every sentence that a reader could check (a rule, a name, a number, a
"tends to"), one row: entry · field · quote · class (general-mechanics | hedged-terminology | cut).
Anything that would need a URL was cut.

WIRING: import + add to ENTRIES in index.ts (alphabetical), add to src/content/crosslinks.ts ONLY where a
basis is traceable to text in both documents (it is normal to add none).

GATES in the worktree: `npm run typecheck && npm run lint && npm run test:unit`
(PGlite: `npm run db:local` in background; export BOTH DATABASE_URL and DATABASE_URL_UNPOOLED to it;
node tests with `--test-concurrency=1`). Zero warnings. No `next build` (CI).

PR: `gh pr create --draft` to <BASE>, title "content: <n> <category> entries (drafts, unapproved)",
body = the Authorization block from docs/technique-pipeline.md with the claim ledger, ending with
`🤖 Generated with [Claude Code](https://claude.com/claude-code)`. Commits end with
`Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. Never merge. Clean up junction + worktree.
No memory files.

---

# Fact/mechanics auditor brief — template

READ-ONLY on the PR (`gh pr diff N`, `git show origin/<branch>:<path>`). You are an experienced no-gi coach
and a sceptical editor. For EACH entry: (1) every checkable claim → verified-general / hedged-ok / INVENTED /
WRONG, with the quote and field; use WebSearch only to disprove, never to add facts; (2) mechanics: anything
incorrect, incomplete, dangerous, or that contradicts another entry on the site (quote both); (3) the safety
note names the real exposure; (4) the training progression is genuinely ordered by resistance.
Verdict per entry: APPROVE / REVISE (numbered, actionable, with replacement text) / REJECT (why).
Write the verdicts as a PR review comment (`gh pr review N --comment -b`), and return them.

# Voice/slop auditor brief — template

READ-ONLY. Against AGENTS.md, BANNED_CONSTRUCTIONS, and the fingerprint. For each entry quote every
sentence that reads machine-written (filler, generic, symmetrical triads, "not X but Y" tics, throat-clearing,
repetition between fields, adjectives doing the work of mechanics), and give the replacement or "cut".
Check search fit: the listed phrases appear naturally. Verdict per entry: APPROVE / REVISE with the list.
PR review comment + return.
