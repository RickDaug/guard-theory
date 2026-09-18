#!/usr/bin/env bash
#
# The scheduled backup. Run by .github/workflows/db-backup.yml, nightly.
#
#   BACKUP_DATABASE_URL   Neon's UNPOOLED connection string. pg_dump takes a
#                         snapshot inside one session; PgBouncer in transaction
#                         mode hands each statement to a different one. A
#                         `-pooler` host is refused here rather than discovered
#                         as a strange dump later.
#   BACKUP_PASSPHRASE     What the dump is encrypted with before it leaves this
#                         machine. The dump holds customers' names and
#                         addresses, and the repository is PUBLIC, so the
#                         encrypted file is downloadable by anyone signed in to
#                         GitHub. The passphrase is the whole of the protection.
#   BACKUP_OUT_DIR        Where the encrypted file goes. Nothing else is ever
#                         written there.
#
# WHAT IT WILL NOT DO
#
# Print the URL, or any part of it. Leave a plaintext dump behind. Hand over a
# file it has not decrypted again and compared. Call a dump good because
# pg_dump exited 0 — it lists the archive and looks for the tables.
#
# pg_dump refuses a server newer than itself, and Neon's major version is not
# written down anywhere in this repository, so the server is asked and the
# matching `postgres:<major>-alpine` image does the dump. psql talks to any
# server version; pg_dump does not.
#
# `docker` is the only thing here that touches the network, which is what
# makes the rest testable: tests/unit/backup-ci.test.ts puts a stand-in for it
# on PATH and runs everything else for real.

set -euo pipefail
umask 077

fail() {
  # ::error:: is what makes the line show on the run's summary page.
  echo "::error::backup: $1" >&2
  exit 1
}

MIN_PASSPHRASE_CHARS=32
# A custom-format archive of this schema with no rows at all is already larger
# than this. Anything smaller is a header and an apology.
MIN_DUMP_BYTES="${BACKUP_MIN_DUMP_BYTES:-4096}"
PROBE_IMAGE="postgres:17-alpine"

[ -n "${BACKUP_DATABASE_URL:-}" ] || fail "the BACKUP_DATABASE_URL secret is not set. See docs/database-runbook.md."
[ -n "${BACKUP_PASSPHRASE:-}" ] || fail "the BACKUP_PASSPHRASE secret is not set. An unencrypted dump is never uploaded, so there is nothing to do."
[ "${#BACKUP_PASSPHRASE}" -ge "$MIN_PASSPHRASE_CHARS" ] ||
  fail "BACKUP_PASSPHRASE is shorter than ${MIN_PASSPHRASE_CHARS} characters. The encrypted file is public; generate a real one."
[ -n "${BACKUP_OUT_DIR:-}" ] || fail "BACKUP_OUT_DIR is not set."

case "$BACKUP_DATABASE_URL" in
  postgres://* | postgresql://*) ;;
  *) fail "BACKUP_DATABASE_URL is not a postgres:// URL." ;;
esac

# The host, and only to look at it. Never echoed.
host="${BACKUP_DATABASE_URL#*://}"
host="${host#*@}"
host="${host%%[/?]*}"

case "$host" in
  *-pooler*) fail "BACKUP_DATABASE_URL is the POOLED host. pg_dump must not go through the pooler; use the unpooled string." ;;
esac

work="$(mktemp -d)"
plain="$work/dump.pgc"

cleanup() {
  # shred where it exists; rm either way. The runner is thrown away afterwards,
  # and this does not rely on that.
  if [ -f "$plain" ]; then
    shred -u "$plain" 2>/dev/null || rm -f "$plain"
  fi
  rm -rf "$work"
}
trap cleanup EXIT

# libpq's messages name the host, and this log is public. What went wrong is
# still worth knowing, so it is printed with the host and any URL taken out.
redacted() {
  # The URL goes first: once the host inside it is replaced it no longer ends
  # where it should, and the password is in the part before the host.
  sed -E -e 's#postgres(ql)?://[^[:space:]"]*#[url]#g' "$1" |
    sed -e "s|${host}|[host]|g" -e "s|${host%%:*}|[host]|g" |
    tail -n 20 >&2 || true
}

# The secret reaches the container as an environment variable and is expanded
# inside it, so it is never an argument on this machine's process list.
in_postgres() {
  local image="$1"
  shift
  docker run --quiet --rm -i -e BACKUP_DATABASE_URL "$image" sh -c "$*"
}

echo "backup: asking the server for its version"

version_num="$(in_postgres "$PROBE_IMAGE" 'psql "$BACKUP_DATABASE_URL" -X -A -t -v ON_ERROR_STOP=1 -c "show server_version_num"' 2>"$work/psql.err" | tr -d '[:space:]')" || {
  redacted "$work/psql.err"
  fail "could not connect to the database."
}

case "$version_num" in
  '' | *[!0-9]*) fail "the server did not report a version number." ;;
esac

major=$((version_num / 10000))

if [ "$major" -lt 14 ] || [ "$major" -gt 30 ]; then
  fail "the server reports major version ${major}, which is not believable."
fi

echo "backup: server is Postgres ${major}; dumping with postgres:${major}-alpine"

in_postgres "postgres:${major}-alpine" \
  'pg_dump --dbname="$BACKUP_DATABASE_URL" --format=custom --compress=9 --no-owner --no-privileges' \
  >"$plain" 2>"$work/pg_dump.err" || {
  redacted "$work/pg_dump.err"
  fail "pg_dump failed."
}

bytes="$(wc -c <"$plain" | tr -d '[:space:]')"

[ "$bytes" -ge "$MIN_DUMP_BYTES" ] ||
  fail "the dump is ${bytes} bytes, under the ${MIN_DUMP_BYTES}-byte floor. That is not a database."

# Exit 0 and a plausible size still do not make an archive. List it.
toc="$(docker run --quiet --rm -i "postgres:${major}-alpine" pg_restore --list <"$plain")" ||
  fail "pg_restore could not read the archive that pg_dump just wrote."

tables="$(printf '%s\n' "$toc" | grep -c ' TABLE DATA ' || true)"

[ "$tables" -ge 1 ] || fail "the archive lists no table data at all."

for required in _migration waitlist_signup; do
  printf '%s\n' "$toc" | grep -q " TABLE DATA public ${required} " ||
    fail "the archive has no data entry for \"${required}\". This is not the production database, or not all of it."
done

echo "backup: archive is ${bytes} bytes with ${tables} tables"

stamp="$(date -u +%Y-%m-%dT%H%MZ)"
mkdir -p "$BACKUP_OUT_DIR"
encrypted="$BACKUP_OUT_DIR/guard-theory-${stamp}-pg${major}.pgc.gpg"

# The passphrase goes in on a file descriptor, not as an argument.
gpg --batch --yes --quiet --pinentry-mode loopback --passphrase-fd 3 \
  --symmetric --cipher-algo AES256 --s2k-digest-algo SHA512 --s2k-count 65011712 \
  --compress-algo none --output "$encrypted" "$plain" 3<<<"$BACKUP_PASSPHRASE" ||
  fail "gpg could not encrypt the dump."

# A backup nobody can decrypt is the same as none. Prove it, now, while the
# original is still here to compare against.
want="$(sha256sum <"$plain" | cut -d' ' -f1)"
got="$(gpg --batch --quiet --pinentry-mode loopback --passphrase-fd 3 --decrypt "$encrypted" 3<<<"$BACKUP_PASSPHRASE" | sha256sum | cut -d' ' -f1)" ||
  fail "the encrypted file did not decrypt."

[ "$want" = "$got" ] || fail "the encrypted file decrypts to something other than the dump."

# The checksum is of the ENCRYPTED file, so it can be public.
(cd "$BACKUP_OUT_DIR" && sha256sum "$(basename "$encrypted")" >"$(basename "$encrypted").sha256")

echo "backup: encrypted, decrypted again and compared. Ready to upload."
