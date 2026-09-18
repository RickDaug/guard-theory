# Database runbook

Everything you need to do by hand, and what to do when something is wrong.
Phase 1 of `docs/commerce-plan.md`.

---

## Setting it up, once

### 1. Create the database

Vercel dashboard → your project → **Storage** → **Neon** → create.

**Region: match the functions, not yourself.** Every query is made by a Vercel
function, never by a browser in Los Angeles, so what costs milliseconds is the
distance from the function to the database. This project sets no `regions`, so
it runs in Vercel's default `iad1` (us-east-1) — and the database is in
`aws-us-east-1`, beside it. An earlier draft of this file said to choose the
region nearest Los Angeles; that was wrong, and following it would have put a
continent of latency in every signup.

This injects four variables into the project automatically. Two matter:

| Variable | Which connection | Used by |
|---|---|---|
| `DATABASE_URL` | **pooled** (`-pooler` in the hostname) | every query the site makes |
| `DATABASE_URL_UNPOOLED` | **direct** | migrations, `pg_dump`, restores |

They are not interchangeable. Neon's pooled endpoint runs PgBouncer in
transaction mode, which cannot carry `SET`, session state, temporary tables, or
`pg_dump`. Pointing the app at the direct URL to "avoid the pooler" is the
opposite of the right move — the pooler is what makes serverless connections
survivable at all.

### 2. Pull them locally

**`vercel env pull` does not work for these.** It writes every key with an
**empty value** — not only the Neon ones, the pre-existing `NEXT_PUBLIC_*` pair
too. Vercel will not return a stored value through the CLI, and it fails
silently: you get a plausible-looking `.env.local`, and `db:status` then reports
`no DATABASE_URL_UNPOOLED or DATABASE_URL set` — which reads as a missing
database rather than a hollow file. Confirmed 2026-09-17.

Use the Neon CLI, which returns the real strings:

```
npx neonctl@latest auth                          # once, opens a browser
npx neonctl@latest orgs list                     # find the "Vercel: ..." org
npx neonctl@latest projects list --org-id <org-id>
```

Then write both, without echoing either to a terminal:

```
P=<project-id>
{
  echo "DATABASE_URL=$(npx neonctl@latest cs --project-id $P --pooled)"
  echo "DATABASE_URL_UNPOOLED=$(npx neonctl@latest cs --project-id $P)"
} > .env.local
```

`--pooled` is the only thing separating the two, and the pooled string is the
one with `-pooler` in the hostname. Assert that before trusting the file.

On Git Bash, prefix a raw `neon api /path` call with `MSYS_NO_PATHCONV=1`, or
MSYS rewrites the leading slash to `C:/Program Files/Git/...` and the CLI
rejects the path.

`.env.local` is gitignored. Nothing else needs configuring.

**Nothing loads `.env.local` on its own.** Node does not read it automatically,
so until 2026-09-17 the `db:*` scripts ignored the very file this step creates,
and these instructions could not have worked as written. They now run under
`--env-file-if-exists=.env.local`.

### 3. Apply the schema

```
npm run db:migrate      # apply everything outstanding
npm run db:status       # show applied and pending, change nothing
```

Migrations live in `migrations/`, run in filename order, and each one runs inside
a transaction together with the row recording it — so a migration cannot be
half-applied and marked done.

**Editing a migration that has already run is refused, loudly.** The runner
checksums each file; a change to an applied one means this database and every
other one have quietly diverged. Write a new migration instead.

### 4. Import the old waitlist — once, from this machine only

```
npm run db:import-ndjson -- --dry-run     # count and validate, write nothing
npm run db:import-ndjson                  # do it
```

**Read this before skipping it.** `.data/waitlist.ndjson` holds **54 signups**
and is gitignored, so it exists only on the machine that ran the site in
development. The production copy lived in the serverless temp directory and is
already gone — a cold start took it, exactly as the old store warned it would.
So this file is the entire recoverable set, and only this machine has it.

Safe to run twice: an address already in the database is left alone, because a
live signup after the cutover outranks a stale copy from the file.

### 5. Vercel Blob, for product photography

Vercel dashboard → **Storage** → **Blob** → create. Then set
`NEXT_PUBLIC_BLOB_HOSTNAME` to the store's public hostname
(`<store-id>.public.blob.vercel-storage.com`).

It is `NEXT_PUBLIC_` because `next.config.ts` reads it at build time to pin
`images.remotePatterns`. It is not a secret — it is a public hostname — but it
**is inlined at build**, so changing it needs a redeploy, not a restart.

Uploads themselves arrive with the portal in Phase 3.

---

## Backups

### What Neon does for you

Instant Restore is continuous point-in-time restore inside a rolling window:
**6 hours on Free**, 7 days on Launch, 30 days on Scale. A restore preserves the
pre-restore state as a branch named `{branch}_old_{timestamp}`, so restoring is
itself undoable.

### What it does not do

Keep a copy anywhere but Neon. Six hours is no answer to noticing on Monday that
Friday's migration corrupted something, and no answer at all to losing access to
the account.

### So: take one yourself

```
npm run db:backup                 # writes to ./backups, gitignored
```

Uses `pg_dump` when it is on PATH, and writes a JSON export of every row when it
is not — rather than not backing up, which is the failure this whole section is
about. Either is a complete backup, because `migrations/` is in git: **schema
from source, rows from the backup file.**

On the Free plan, do this weekly at minimum. Six hours is the entire safety net
otherwise. Keep the files somewhere that is not this laptop.

---

## Restoring

### Recent damage, inside the window — use Neon

Neon console → your branch → **Backup & Restore** → pick the branch → **From
history** → choose a timestamp or LSN → **Restore**.

Takes seconds and **drops existing connections**. By CLI:

```
neon branches restore <target> <source@2026-08-23T04:00:00Z>
```

### Older damage, or a lost account — use your own backup

```
npm run db:migrate                                            # schema, from git
pg_restore --no-owner --dbname "$DATABASE_URL_UNPOOLED" <file> # rows
```

For a JSON backup, replay the rows per table after migrating.

### Rehearse it before it matters

Do a restore drill on a Neon branch **before Phase 2 puts money through this
database**. A backup nobody has restored is a belief, not a backup.

---

## When something is wrong

**Signups fail and the reader is told "we could not save your details just now".**
That message is honest — nothing was lost on their side, and nothing was written.
Check `DATABASE_URL` is set for the environment that is failing. The logs carry
the reason, prefixed `[guard-theory]`; failures are never swallowed.

**Logs say "signups are being kept in memory".** There is no `DATABASE_URL` and
this is a development process. In development that is fine and the warning is
just telling you the truth. If you see it anywhere real, the variable is missing.

**Logs say "DATABASE_URL is not set in production. A waitlist signup was refused".**
The site refused rather than accepting a signup it could not keep. Set the
variable and redeploy; the reader was told to try again and can.

**The shop is down and Neon says compute is suspended.** The Free plan allows 100
compute-hours a month and suspends until the next month when they are used up. A
store with traffic trickling in around the clock never idles long enough to stay
inside that. Watch the CU-hours graph in the Neon console during month one; the
fix is the Launch plan, which is usage-billed with no monthly minimum.

**Check the compute floor before you trust that budget.** 100 compute-hours is a
CU-hour budget, not a clock, so what it buys depends entirely on the endpoint's
minimum size. Vercel provisioned this one autoscaling **1 → 2 CU**, which spends
the whole month in roughly 100 active hours — about three a day — while the
estimate everyone was working from assumed the 0.25 CU floor and about four times
that. It was lowered to **0.25 → 2 CU** on 2026-09-17, before any traffic. Check
it after any re-provision:

```
MSYS_NO_PATHCONV=1 npx neonctl@latest api /projects/<project-id>/endpoints
```

A waitlist insert does not need a whole CU sitting warm, and autoscaling still
takes it to 2 when something actually asks for it.

**A migration failed.** It was rolled back — nothing is half-applied. Fix the SQL
and run `npm run db:migrate` again.

**`npm run db:migrate` says a migration has changed since it was applied.** Someone
edited a file that has already run. Revert the edit and write a new migration.

---

## Running the tests

CI runs a real Postgres service container, so the code under test there is the
code that ships. Locally, `npx playwright test` works without a database: the
harness sets `GUARD_THEORY_ALLOW_EPHEMERAL_STORE=1`, which permits an in-memory
store for the length of the process.

**That flag cannot take effect on a deployment.** `ephemeralStoreAllowed()`
refuses twice over: Vercel always sets `VERCEL=1`, and separately the site must
be serving from a loopback address. The second check is the one that matters,
because the first only knows about one host — if this ever moves to a VPS, to
Cloudflare, or anywhere else, a `VERCEL`-only test would quietly stop protecting
anything, and a real deployment always has a real `NEXT_PUBLIC_SITE_URL`
whoever is hosting it. `tests/unit/storage.test.ts` asserts both.

Set `DATABASE_URL` locally and the real Postgres path is exercised instead.
