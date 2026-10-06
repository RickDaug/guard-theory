#!/usr/bin/env bash
#
# The weekly restore check. Run by .github/workflows/db-restore-check.yml.
#
# Takes the newest nightly backup, decrypts it, restores it into a NEW, EMPTY
# database on a scratch Neon branch made for the purpose, and checks that what
# came back is what went in: the same tables, and in every table the same
# number of rows the archive carries. A backup nobody has restored is a belief,
# not a backup.
#
# Why a new database and not the branch's own: a Neon branch is a copy of its
# parent, data and all, so its neondb already holds every schema the dump
# creates. Restoring over it proves only that Neon can branch — and Neon's own
# schemas (neon_auth) make the restore fail outright on "schema already
# exists" (run 37399557664, 2026-10-05). An empty database is what a real
# disaster restore starts from, so that is what this restores into.
#
#   RESTORE_IN_DIR        The downloaded artifact: one guard-theory-*.pgc.gpg
#                         and its .sha256.
#   BACKUP_PASSPHRASE     What the nightly job encrypted it with.
#   NEON_API_KEY          Sent only as a header.
#   NEON_PROJECT_ID
#   RESTORE_BRANCH_NAME   Must start with "restore-check/". Anything else is
#                         refused before the API is called.
#   RESTORE_STATE_FILE    Where the new branch's id is written the moment it
#                         exists, so the cleanup step can delete it even if
#                         this script dies. Optional; GITHUB_ENV is used too.
#   RESTORE_MIGRATIONS_DIR  Optional. migrations/, to bound _migration's count.
#   RESTORE_MAX_AGE_HOURS   Optional, default 72. An older backup means the
#                         nightly job has stopped, which is its own failure.
#   NEON_BRANCH_LIMIT     Optional, default 10 (Neon Free).
#
# WHAT IT WILL NOT DO
#
# Touch the project's default branch. The scratch branch is checked four ways
# before anything destructive runs on it: the name it was asked for, the id is
# not the default's, Neon says it is not the default, and its host is not any
# host of the default's. Print a connection string, a host, or a row: the
# string is masked the moment it is known, and all that is ever printed is
# counts. The repository is PUBLIC and so is this log.
#
# `curl` and `docker` are the only things here that touch the network, which
# is what makes the rest testable: tests/unit/restore-verify-ci.test.ts puts
# stand-ins for both on PATH and runs everything else for real.

# The single-quoted commands are expanded inside the container, on purpose.
# shellcheck disable=SC2016

set -euo pipefail
# One collation for every sort and comm below. got-tables is also re-sorted on
# its own: rows sorted as "name|count" are not in name order ("a|5" vs "a_b|3").
export LC_ALL=C
umask 077

fail() {
  echo "::error::restore-check: $1" >&2
  exit 1
}

MIN_PASSPHRASE_CHARS=32
MAX_AGE_HOURS="${RESTORE_MAX_AGE_HOURS:-72}"
BRANCH_LIMIT="${NEON_BRANCH_LIMIT:-10}"
# Neon deletes the branch itself after this, if every other cleanup has failed.
EXPIRES_IN_HOURS=4
NEON_API="${NEON_API_BASE:-https://console.neon.tech/api/v2}"
# Created on the scratch branch, restored into, deleted with the branch.
RESTORE_DATABASE="restore_check"
# Schemas Neon creates and manages itself. Not the app's (nothing in src/ or
# migrations/ touches them), not in backups taken since backup-ci.sh started
# excluding them, and skipped here so the 30 days of backups taken before that
# still restore. Keep in step with NEON_MANAGED_SCHEMAS in backup-ci.sh.
NEON_MANAGED_SCHEMAS=(neon_auth)

[ -n "${RESTORE_IN_DIR:-}" ] || fail "RESTORE_IN_DIR is not set."
[ -n "${BACKUP_PASSPHRASE:-}" ] || fail "the BACKUP_PASSPHRASE secret is not set."
[ "${#BACKUP_PASSPHRASE}" -ge "$MIN_PASSPHRASE_CHARS" ] ||
  fail "BACKUP_PASSPHRASE is shorter than ${MIN_PASSPHRASE_CHARS} characters, so it is not the one the backups use."
[ -n "${NEON_API_KEY:-}" ] || fail "the NEON_API_KEY secret is not set."
[ -n "${NEON_PROJECT_ID:-}" ] || fail "the NEON_PROJECT_ID variable is not set."
[ -n "${RESTORE_BRANCH_NAME:-}" ] || fail "RESTORE_BRANCH_NAME is not set."

case "$RESTORE_BRANCH_NAME" in
  restore-check/?*) ;;
  *) fail "the scratch branch must be named restore-check/<something>; refusing \"${RESTORE_BRANCH_NAME}\"." ;;
esac

command -v jq >/dev/null || fail "jq is not installed."

work="$(mktemp -d)"
plain="$work/dump.pgc"

cleanup() {
  if [ -f "$plain" ]; then
    shred -u "$plain" 2>/dev/null || rm -f "$plain"
  fi
  rm -rf "$work"
}
trap cleanup EXIT

# ---------------------------------------------------------------------------
# 1. The file: exactly one, the one that was uploaded, recent, and decryptable.

shopt -s nullglob
encrypted_files=("$RESTORE_IN_DIR"/guard-theory-*.pgc.gpg)
shopt -u nullglob

[ "${#encrypted_files[@]}" -eq 1 ] ||
  fail "expected one guard-theory-*.pgc.gpg in the artifact, found ${#encrypted_files[@]}."

encrypted="${encrypted_files[0]}"
name="$(basename "$encrypted")"

[ -f "$encrypted.sha256" ] || fail "${name} has no .sha256 beside it."
(cd "$RESTORE_IN_DIR" && sha256sum --check --status "${name}.sha256") ||
  fail "${name} does not match its checksum. It is not the file that was uploaded."

# guard-theory-2026-09-28T0917Z-pg17.pgc.gpg
if [[ "$name" =~ ^guard-theory-([0-9]{4}-[0-9]{2}-[0-9]{2})T([0-9]{2})([0-9]{2})Z-pg([0-9]+)\.pgc\.gpg$ ]]; then
  taken="$(date -u -d "${BASH_REMATCH[1]} ${BASH_REMATCH[2]}:${BASH_REMATCH[3]}" +%s)"
  major="${BASH_REMATCH[4]}"
else
  fail "${name} is not named the way the nightly job names its files."
fi

if [ "$major" -lt 14 ] || [ "$major" -gt 30 ]; then
  fail "the file says it was written by Postgres ${major}, which is not believable."
fi

age_hours=$((($(date -u +%s) - taken) / 3600))
[ "$age_hours" -le "$MAX_AGE_HOURS" ] ||
  fail "the newest backup is ${age_hours} hours old (limit ${MAX_AGE_HOURS}). The nightly job has stopped; see Actions -> Database backup."

echo "restore-check: newest backup is ${age_hours} hours old, written by Postgres ${major}"

gpg --batch --quiet --pinentry-mode loopback --passphrase-fd 3 \
  --output "$plain" --decrypt "$encrypted" 3<<<"$BACKUP_PASSPHRASE" 2>/dev/null ||
  fail "the backup did not decrypt with BACKUP_PASSPHRASE. If the passphrase was rotated, every earlier backup needs the old one."

[ "$(head -c 5 "$plain")" = "PGDMP" ] || fail "the decrypted file is not a pg_dump archive."

IMAGE="postgres:${major}-alpine"

# ---------------------------------------------------------------------------
# 2. The manifest: what the archive says it holds, read from the archive alone.

toc="$(docker run --quiet --rm -i "$IMAGE" pg_restore --list <"$plain")" ||
  fail "pg_restore could not read the archive."

# "215; 1259 16401 TABLE public waitlist_signup neondb_owner"
printf '%s\n' "$toc" | awk '$4 == "TABLE" && $5 == "public" { print $6 }' | sort >"$work/want-tables"

# Rows per table, counted from the COPY blocks as they stream past. COPY's text
# format escapes newlines inside values, so one line is one row. This goes
# through a pipe and awk and nowhere else; no row is written down or printed.
docker run --quiet --rm -i "$IMAGE" pg_restore --data-only --file=- <"$plain" 2>"$work/manifest.err" |
  awk '
    /^COPY / {
      t = $2
      sub(/^public\./, "", t)
      gsub(/"/, "", t)
      n = 0
      inside = 1
      next
    }
    inside && $0 == "\\." { print t "|" n; inside = 0; next }
    inside { n++ }
  ' | sort >"$work/want-rows" || fail "pg_restore could not read the archive's data."

want_tables="$(wc -l <"$work/want-tables" | tr -d '[:space:]')"
[ "$want_tables" -ge 1 ] || fail "the archive lists no tables at all."

for required in _migration waitlist_signup; do
  grep -qx "$required" "$work/want-tables" ||
    fail "the archive has no \"${required}\" table. This is not the production database."
done

schemas="$(printf '%s
' "$toc" | awk '$4 == "TABLE" && $5 != "DATA" { print $5 }' | sort -u | tr '
' ' ')"
echo "restore-check: the archive lists ${want_tables} tables in public; it has tables in: ${schemas% }"

# ---------------------------------------------------------------------------
# 3. The scratch branch.

# The body goes to a file and the status to stdout, so a failure can say what
# Neon said without the key ever being anywhere but a header.
api() {
  local method="$1" path="$2" body="${3:-}" status
  # Bounded, so a Neon API that stops answering fails this step by name
  # instead of holding the job until its timeout.
  local args=(-sS --connect-timeout 15 --max-time 60 -X "$method" -o "$work/api.out" -w '%{http_code}'
    -H "Authorization: Bearer ${NEON_API_KEY}" -H "Accept: application/json")
  if [ -n "$body" ]; then
    args+=(-H "Content-Type: application/json" --data "$body")
  fi
  status="$(curl "${args[@]}" "${NEON_API}${path}")" || fail "could not reach the Neon API (${method} ${path%%\?*})."
  case "$status" in
    2??) cat "$work/api.out" ;;
    *)
      fail "Neon answered ${status} to ${method} ${path%%\?*}: $(jq -r '.message // "no message"' "$work/api.out" 2>/dev/null || echo "unreadable reply")"
      ;;
  esac
}

project="/projects/${NEON_PROJECT_ID}"

branches="$(api GET "${project}/branches")"
default_id="$(jq -r '[.branches[] | select(.default == true)][0].id // empty' <<<"$branches")"
[ -n "$default_id" ] || fail "Neon reports no default branch for the project."

jq -e --arg n "$RESTORE_BRANCH_NAME" '[.branches[] | select(.name == $n)] | length == 0' <<<"$branches" >/dev/null ||
  fail "a branch named ${RESTORE_BRANCH_NAME} already exists. Refusing to reuse it."

in_use="$(jq '.branches | length' <<<"$branches")"
if [ "$in_use" -ge "$BRANCH_LIMIT" ]; then
  stale="$(jq '[.branches[] | select(.name | startswith("preview/"))] | length' <<<"$branches")"
  fail "no free Neon branch: ${in_use} of ${BRANCH_LIMIT} are in use (${stale} of them preview/*). Delete stale preview branches and run this again; see docs/database-runbook.md."
fi

# Every host the default branch answers on. The scratch branch must be none of them.
endpoints="$(api GET "${project}/endpoints")"
jq -r --arg b "$default_id" '.endpoints[] | select(.branch_id == $b) | .host' <<<"$endpoints" >"$work/default-hosts"

expires_at="$(date -u -d "+${EXPIRES_IN_HOURS} hours" +%Y-%m-%dT%H:%M:%SZ)"
request="$(jq -nc --arg name "$RESTORE_BRANCH_NAME" --arg parent "$default_id" --arg exp "$expires_at" \
  '{branch: {name: $name, parent_id: $parent, expires_at: $exp}, endpoints: [{type: "read_write"}]}')"

created="$(api POST "${project}/branches" "$request")"

branch_id="$(jq -r '.branch.id // empty' <<<"$created")"
[ -n "$branch_id" ] || fail "Neon did not return the new branch's id."

# Recorded before anything else can fail, so the cleanup step can find it.
if [ -n "${RESTORE_STATE_FILE:-}" ]; then
  echo "$branch_id" >"$RESTORE_STATE_FILE"
fi
if [ -n "${GITHUB_ENV:-}" ]; then
  echo "RESTORE_BRANCH_ID=${branch_id}" >>"$GITHUB_ENV"
fi

uri="$(jq -r '.connection_uris[0].connection_uri // empty' <<<"$created")"
[ -n "$uri" ] || fail "Neon did not return a connection string for the new branch."

# Masked before it could be printed, in every form a log line might carry.
host="${uri#*://}"
userinfo="${host%%@*}"
host="${host#*@}"
host="${host%%[/?]*}"
password="${userinfo#*:}"
echo "::add-mask::${uri}"
[ -n "$password" ] && [ "$password" != "$userinfo" ] && echo "::add-mask::${password}"
echo "::add-mask::${host}"

# The four checks. Any one failing stops everything before the first write.
[ "$branch_id" != "$default_id" ] || fail "the new branch has the default branch's id. Stopping."
jq -e '.branch.default == false' <<<"$created" >/dev/null || fail "Neon says the new branch is the default. Stopping."
jq -e --arg n "$RESTORE_BRANCH_NAME" '.branch.name == $n' <<<"$created" >/dev/null ||
  fail "the new branch is not named ${RESTORE_BRANCH_NAME}. Stopping."
jq -e --arg h "$host" '[.endpoints[]?.host] | index($h) != null' <<<"$created" >/dev/null ||
  fail "the connection string is not for the new branch's endpoint. Stopping."
if grep -qxF "$host" "$work/default-hosts"; then
  fail "the connection string points at the default branch. Stopping."
fi

echo "restore-check: made ${RESTORE_BRANCH_NAME}, off the default branch, expiring ${expires_at}"

# ---------------------------------------------------------------------------
# 4. Restore into it.

# The string reaches the container as an environment variable and is expanded
# inside it, never an argument on this machine's process list.
in_db() {
  local url="$1"
  shift
  RESTORE_URL="$url" docker run --quiet --rm -i -e RESTORE_URL -e SQL "$IMAGE" sh -c "$1"
}

redacted() {
  sed -E -e 's#postgres(ql)?://[^[:space:]"]*#[url]#g' "$1" |
    sed -e "s|${host}|[host]|g" |
    tail -n 20 >&2 || true
}

# A new compute takes a moment to answer.
ready=""
for _ in $(seq 1 "${RESTORE_CONNECT_TRIES:-24}"); do
  if SQL="select 1" in_db "$uri" 'psql "$RESTORE_URL" -X -A -t -q -c "$SQL"' >/dev/null 2>"$work/psql.err" </dev/null; then
    ready=1
    break
  fi
  sleep "${RESTORE_CONNECT_WAIT:-5}"
done
[ -n "$ready" ] || { redacted "$work/psql.err"; fail "the scratch branch never accepted a connection."; }

# A new database on the scratch branch: nothing in it but what template1 has,
# which is what a restore after a disaster starts from. The branch's own
# database, a copy of production, is not written to at all.
SQL="create database ${RESTORE_DATABASE}" \
  in_db "$uri" 'psql "$RESTORE_URL" -X -q -v ON_ERROR_STOP=1 -c "$SQL"' \
  >/dev/null 2>"$work/psql.err" </dev/null || {
  redacted "$work/psql.err"
  fail "could not create an empty database on the scratch branch."
}

# The same connection string with only the database name changed:
# postgresql://user:pass@host/neondb?sslmode=require -> .../restore_check?sslmode=require
uri_path="${uri%%\?*}"
uri_query="${uri#"$uri_path"}"
uri_base="${uri_path%/*}"
if [ -z "${uri_path##*/}" ] || [ "${uri_base#*://}" = "$uri_base" ] || [ "${uri_base#*@}" != "$host" ]; then
  fail "could not find the database name in the scratch branch's connection string."
fi
restore_uri="${uri_base}/${RESTORE_DATABASE}${uri_query}"
echo "::add-mask::${restore_uri}"

# Prove it is empty: not a single table outside the system catalogs.
present="$(SQL="select count(*) from information_schema.tables where table_schema not in ('pg_catalog', 'information_schema')" \
  in_db "$restore_uri" 'psql "$RESTORE_URL" -X -A -t -q -v ON_ERROR_STOP=1 -c "$SQL"' \
  2>"$work/psql.err" </dev/null | tr -d '[:space:]')" || {
  redacted "$work/psql.err"
  fail "could not look inside the new database."
}
[ "$present" = "0" ] || fail "the new database is not empty (${present:-no answer} tables). Stopping."

# Schema and rows, both from the file.
exclude=""
for schema in "${NEON_MANAGED_SCHEMAS[@]}"; do
  exclude="${exclude} --exclude-schema=${schema}"
done

in_db "$restore_uri" "pg_restore --no-owner --no-privileges --exit-on-error${exclude} --dbname=\"\$RESTORE_URL\"" \
  <"$plain" >/dev/null 2>"$work/pg_restore.err" || {
  redacted "$work/pg_restore.err"
  fail "pg_restore failed. The backup does not restore."
}

echo "restore-check: restored into an empty database"

# ---------------------------------------------------------------------------
# 5. What came back.

count_sql="select table_name || '|' || (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from public.%I', table_name), false, true, '')))[1]::text from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by 1"

SQL="$count_sql" in_db "$restore_uri" 'psql "$RESTORE_URL" -X -A -t -q -v ON_ERROR_STOP=1 -c "$SQL"' \
  </dev/null 2>"$work/psql.err" | sort >"$work/got-rows" || {
  redacted "$work/psql.err"
  fail "could not count the restored tables."
}

cut -d'|' -f1 "$work/got-rows" | sort >"$work/got-tables"
got_tables="$(wc -l <"$work/got-tables" | tr -d '[:space:]')"

if ! cmp -s "$work/want-tables" "$work/got-tables"; then
  missing="$(comm -23 "$work/want-tables" "$work/got-tables" | tr '\n' ' ')"
  extra="$(comm -13 "$work/want-tables" "$work/got-tables" | tr '\n' ' ')"
  fail "the restored tables differ from the archive's. Missing: ${missing:-none}. Unexpected: ${extra:-none}."
fi

# A table with no COPY block in the archive should have come back empty.
mismatched=""
while IFS='|' read -r table got; do
  want="$(awk -F'|' -v t="$table" '$1 == t { print $2 }' "$work/want-rows")"
  case "$got" in '' | *[!0-9]*) fail "table ${table} did not report a count." ;; esac
  [ "${want:-0}" = "$got" ] || mismatched="${mismatched}${table} "
done <"$work/got-rows"

[ -z "$mismatched" ] || fail "row counts differ from the archive for: ${mismatched}"

migrations="$(awk -F'|' '$1 == "_migration" { print $2 }' "$work/got-rows")"
[ "${migrations:-0}" -ge 1 ] || fail "_migration is empty. The schema did not come from the migrations."

if [ -n "${RESTORE_MIGRATIONS_DIR:-}" ]; then
  shopt -s nullglob
  files=("$RESTORE_MIGRATIONS_DIR"/*.sql)
  shopt -u nullglob
  [ "$migrations" -le "${#files[@]}" ] ||
    fail "_migration records ${migrations} migrations but the repository has ${#files[@]}."
fi

total="$(awk -F'|' '{ s += $2 } END { print s + 0 }' "$work/got-rows")"

echo "restore-check: ${got_tables} tables restored, every row count matches the archive (${total} rows in all), ${migrations} migrations recorded"

if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  {
    echo "### Restore check passed"
    echo
    echo "| Backup age | Postgres | Tables | Rows | Migrations |"
    echo "|---|---|---|---|---|"
    echo "| ${age_hours} h | ${major} | ${got_tables} | ${total} | ${migrations} |"
  } >>"$GITHUB_STEP_SUMMARY"
fi
