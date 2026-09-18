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
too. The cause is the **Sensitive** toggle in the integration's connection
dialog (§2a), which is on: a Sensitive variable can be written and used at build
and runtime, but never read back out.

It fails silently: you get a plausible-looking `.env.local`, and `db:status`
then reports `no DATABASE_URL_UNPOOLED or DATABASE_URL set` — which reads as a
missing database rather than a hollow file. Confirmed 2026-09-17.

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

### 2a. Preview deployments get their own database

Enabled 2026-09-17, and verified: a signup made against a preview wrote to the
preview branch while production stayed empty.

Every Preview deployment now gets its own Neon branch — a copy-on-write fork of
`main`, so it inherits the schema without a migration run. They are named after
the git branch (`preview/feat/waitlist-db`). Production keeps `main`.

**Before this, Preview and Production shared one branch**, which made pointing
Playwright at a preview URL a way to write `test-*@example.com` into the real
waitlist table — the same mechanism that filled the August NDJSON file with 55
fixtures. If the setting is ever turned off, that hazard returns.

To check or change it: **Storage → the database → Projects tab → the row's ⋯ menu
→ Update Project Connection → Create Database Branch For Deployment → Preview.**

There is **no need to disconnect the project** to change this, and you should not
try — the connect flow refuses a project that is already connected ("already
connected to the target store in one of the chosen environments"), and
disconnecting would pull `DATABASE_URL` out of Production. Updating in place
leaves all sixteen injected variables untouched; that was diffed before and
after.

The same dialog holds a **Sensitive** toggle, and it is on. That — not some
general Vercel policy — is why `vercel env pull` returns empty values. Leave it
on and use the Neon CLI; a connection string that can be read back out of the
platform is worth less than the convenience.

Confirm a branch actually appeared after a preview builds:

```
MSYS_NO_PATHCONV=1 npx neonctl@latest api /projects/<project-id>/branches
```


### 3. Apply the schema

```
npm run db:migrate      # apply everything outstanding — LOCAL databases only
npm run db:status       # show applied and pending, change nothing

npm run db:status:production    # the same, against the host in .env.local
npm run db:migrate:production
```

**A database that is not on this machine has to be asked for by name.** The
runner prints the host it is about to touch — host, port and database, never
the user or password — and then refuses anything that is not loopback unless
`--production` was passed, which is all the `:production` scripts add.
`.env.local` points at Neon and the scripts prefer `DATABASE_URL_UNPOOLED`, so
before this guard a bare `npm run db:migrate` meant for a local database
migrated production. Read the printed host every time; it is the check.

A migration waits at most five seconds for a lock (`lock_timeout`) and then
fails, rolled back, rather than queueing behind a long transaction with every
other query queueing behind it. Run it again.

Migrations live in `migrations/`, run in filename order, and each one runs inside
a transaction together with the row recording it — so a migration cannot be
half-applied and marked done.

**Editing a migration that has already run is refused, loudly, and the run
stops there.** The runner checksums each file; a change to an applied one means
this database and every other one have quietly diverged, and nothing after it is
applied on top. Write a new migration instead.

Checksums are of the file with LF line endings, and `.gitattributes` keeps
`migrations/*.sql` LF on every checkout. An already-applied migration is also
accepted if its recorded checksum is that of the CRLF form of the same file: the
runner used to hash raw bytes, and a Windows checkout with `core.autocrlf=true`
wrote CRLF, so a migration applied from such a machine carries the CRLF
checksum. Same file, either ending, accepted; any other difference is an edit.

### 4. There is no import step

`.data/waitlist.ndjson`, the pre-database store, turned out to hold only
Playwright fixtures (`test-*@example.com`) — no real signups — so there is
nothing to carry across. The import script that an earlier draft of this
runbook described was never merged to `main` and does not exist. See the
comment above `/.data/` in `.gitignore`.

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

### The nightly backup

`.github/workflows/db-backup.yml` runs at 09:17 UTC every night, and whenever
somebody presses **Run workflow** on it. It:

1. asks the server for its version and uses the matching `postgres:<major>`
   image, because `pg_dump` refuses a server newer than itself and Neon's major
   version is not recorded anywhere in this repository;
2. dumps over the **unpooled** connection string, custom format, compressed.
   **`pg_dump` must not go through the pooler**: it takes its snapshot inside
   one session, and PgBouncer in transaction mode hands each statement to a
   different one. A host containing `-pooler` is refused before anything
   connects;
3. refuses a dump under 4 KB, lists the archive with `pg_restore`, and refuses
   one that has no data for `_migration` or `waitlist_signup` — exit 0 is not
   proof of a backup;
4. encrypts it with `gpg --symmetric` (AES-256), decrypts it again and compares
   the result with the original;
5. runs a separate guard that reads the first bytes of every file about to be
   uploaded and **refuses anything that is not a gpg-encrypted file**;
6. uploads it as a workflow artifact with `retention-days: 30`.

It never prints the connection string, and an error from `pg_dump` is printed
with the host and any URL removed.

**This repository is public** (`gh repo view --json visibility` said `PUBLIC` on
2026-09-18). Its Actions logs are readable by anyone, and its artifacts can be
downloaded by anyone signed in to GitHub. So the encrypted file should be
thought of as published, and the passphrase as the only thing protecting the
names and addresses inside it. That is why step 5 exists, why the passphrase
must be 32 characters or more, and why it must never be reused from anywhere
else. Making the repository private would take the files off public download;
that is the owner's call.

Thirty days is a request. A repository's own retention limit wins when it is
lower; this one's was 90 days when checked on 2026-09-18:

```
gh api repos/RickDaug/guard-theory/actions/permissions/artifact-and-log-retention
```

Three things that will stop it, none of them silently:

- **A failure emails** whoever last edited the workflow's schedule. A run that
  fails says why on its summary page, in one line.
- **GitHub disables scheduled workflows after 60 days without a commit** to the
  repository, and emails first. Push anything, or press *Enable workflow*.
- **It only runs from the default branch.** Nothing is scheduled until the PR
  carrying it is merged.

The shell is tested without a database or a network —
`tests/unit/backup-ci.test.ts` puts a stand-in for `docker` on PATH and runs the
rest for real, refusals included. The workflow itself has **not** been run: that
first happens at merge time, below.

### Setting the two secrets

GitHub repository secrets, not Vercel variables. Done once, at merge time, by
the owner or the assistant. Neither command prints a value.

```
# 1. The UNPOOLED connection string, piped straight from Neon — never pasted,
#    never echoed. (`vercel env pull` returns it empty; neonctl does not.)
npx neonctl connection-string --project-id cold-resonance-51949822 | gh secret set BACKUP_DATABASE_URL

# 2. The passphrase: 32 random bytes. It is written to a file first because the
#    owner has to keep a copy — GitHub will never show it again.
node -e "process.stdout.write(require('crypto').randomBytes(32).toString('base64url'))" > backup-passphrase.txt
gh secret set BACKUP_PASSPHRASE < backup-passphrase.txt
```

Then **put the contents of `backup-passphrase.txt` in the owner's password
manager and delete the file.** It is the one secret on this project that cannot
simply be regenerated: rotate it and every earlier backup still needs the old
one. `neonctl connection-string` gives the direct host unless `--pooled` is
passed; the workflow refuses the pooled one if that ever changes.

Check the names, then take one by hand and watch it:

```
gh secret list
gh workflow run db-backup.yml
gh run watch "$(gh run list --workflow db-backup.yml --limit 1 --json databaseId --jq '.[0].databaseId')"
```

### Getting one back out

`pg_restore` has to be the same major version as the file or newer; the version
that wrote it is in the file's name (`…-pg17.pgc.gpg`). Restore into a **scratch
Neon branch**, never into production first.

```
# 1. Download the newest. Artifacts are named guard-theory-db-<run id>.
run=$(gh run list --workflow db-backup.yml --status success --limit 1 --json databaseId --jq '.[0].databaseId')
gh run download "$run" --dir restore && cd restore/guard-theory-db-*

# 2. It is the file that was uploaded.
sha256sum -c *.sha256

# 3. Decrypt. gpg asks for the passphrase; it is not put on the command line.
gpg --output dump.pgc --decrypt guard-theory-*.pgc.gpg

# 4. A scratch branch off production, and its direct connection string.
npx neonctl branches create --project-id cold-resonance-51949822 --name restore-drill
SCRATCH=$(npx neonctl connection-string restore-drill --project-id cold-resonance-51949822)

# 5. The branch is a copy of production, so empty it first — otherwise this
#    proves only that Neon can branch. Then schema and rows, both from the file.
psql "$SCRATCH" -c 'drop schema public cascade; create schema public;'
pg_restore --no-owner --no-privileges --exit-on-error --dbname "$SCRATCH" dump.pgc

# 6. Look at it.
psql "$SCRATCH" -c 'select count(*) from waitlist_signup' -c 'select max(name) from _migration'

# 7. Tidy up. The decrypted dump is customer data on a laptop until this runs.
npx neonctl branches delete restore-drill --project-id cold-resonance-51949822
cd ../.. && rm -rf restore
```

Check `echo "$SCRATCH"` names the scratch branch's host before step 5 — that
`drop schema` is the one destructive line here.

For a real restore the target is production's unpooled string instead of
`$SCRATCH`, after the drill above has succeeded against the same file, and with
the site in maintenance so nothing writes underneath it.

### The quarterly restore drill

First week of January, April, July and October, and once before the first real
order. Twenty minutes. A backup nobody has restored is a belief, not a backup.

1. Actions → **Database backup**: the recent nightly runs are green. If the
   workflow says *disabled*, enable it and find out when it stopped.
2. Do *Getting one back out*, steps 1–6, against the newest artifact **using the
   passphrase from the password manager** — not from anywhere else. This is the
   step that finds a lost passphrase while there is still time to set a new one.
3. Compare the counts in step 6 with production's in the portal. Last night's
   figures, not today's.
4. Step 7. Then add a line below.

| Date | Artifact | Restored into | Counts matched | By |
|---|---|---|---|---|
| — | — | — | — | not yet run |

### Or take one yourself

```
npm run db:backup                 # writes to ./backups, gitignored
```

Uses `pg_dump` when it is on PATH, and writes a JSON export of every row when it
is not — rather than not backing up, which is the failure this whole section is
about. Either is a complete backup, because `migrations/` is in git: **schema
from source, rows from the backup file.** This one is **not encrypted** and
nothing prunes `./backups`; take it before a risky migration, and do not leave
it on the laptop.

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

From a nightly artifact: *Getting one back out*, above. From a manual
`npm run db:backup` file:

```
npm run db:migrate:production                                 # schema, from git
pg_restore --no-owner --dbname "$DATABASE_URL_UNPOOLED" <file> # rows
```

For a JSON backup, replay the rows per table after migrating.

### Rehearse it before it matters

Do the restore drill above **before Phase 2 puts money through this database**,
and every quarter after.

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
and run it again.

**`npm run db:migrate` refuses, naming a host.** It is not a local database.
If that host is the one you meant, use `npm run db:migrate:production`. If you
meant a local one, export **both** `DATABASE_URL` and `DATABASE_URL_UNPOOLED`.

**`npm run db:migrate` says a migration has changed since it was applied.** Someone
edited a file that has already run. Revert the edit and write a new migration.
The run stops at that file; nothing after it is applied until it is resolved.

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
