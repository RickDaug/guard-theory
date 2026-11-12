#!/usr/bin/env bash
#
# Deletes Neon `preview/<git branch>` database branches that nothing needs any
# more. Run on a schedule by .github/workflows/neon-preview-cleanup.yml.
#
# Every preview branch is a copy-on-write fork of production: real customer
# names, addresses, phone numbers and emails (docs/database-runbook.md §2a).
# The pull-request-closed job removes one when its pull request closes. It
# never sees a git branch that was pushed and deleted without a pull request,
# or one whose close event it missed, and those copies used to live for ever.
#
#   NEON_API_KEY, NEON_PROJECT_ID
#   LIVE_BRANCHES_FILE   git branches that exist, one name per line
#   OPEN_PR_FILE         head branches of this repository's OPEN pull requests
#   CLOSED_PR_FILE       head branches of this repository's CLOSED pull requests
#   DEFAULT_GIT_BRANCH   must appear in LIVE_BRANCHES_FILE (default: main), or
#                        the list is treated as broken and nothing is deleted
#   SWEEP_MAX_AGE_DAYS   a branch with no pull request at all is deleted after
#                        this many days (default 14). A later push makes a
#                        fresh fork on its next preview.
#
# A Neon branch is deleted only if its name starts with "preview/" AND Neon
# says it is not the default. Then, for preview/<b>:
#
#   <b> is not a live git branch            delete: the git branch is gone
#   <b> has an open pull request            keep
#   <b> had a pull request, all closed      delete: the pull request closed
#   <b> never had one, older than the cap   delete: stale
#   otherwise                               keep
#
# THIS REPOSITORY IS PUBLIC. Nothing is printed but branch names and what
# happened to them; the key only ever travels as a header.

set -euo pipefail

fail() {
  echo "::error::preview sweep: $1" >&2
  exit 1
}

NEON_API="${NEON_API_BASE:-https://console.neon.tech/api/v2}"
DEFAULT_GIT_BRANCH="${DEFAULT_GIT_BRANCH:-main}"
MAX_AGE_DAYS="${SWEEP_MAX_AGE_DAYS:-14}"

[ -n "${NEON_API_KEY:-}" ] || fail "the NEON_API_KEY secret is not set."
[ -n "${NEON_PROJECT_ID:-}" ] || fail "the NEON_PROJECT_ID variable is not set."
command -v jq >/dev/null || fail "jq is not installed."
for f in LIVE_BRANCHES_FILE OPEN_PR_FILE CLOSED_PR_FILE; do
  [ -r "${!f:-}" ] || fail "${f} is not a readable file."
done

# An empty or truncated branch list would read as "every git branch is gone"
# and delete every preview. The default branch always exists; if it is not in
# the list, the list is wrong.
grep -qxF -- "$DEFAULT_GIT_BRANCH" "$LIVE_BRANCHES_FILE" ||
  fail "the git branch list does not contain ${DEFAULT_GIT_BRANCH}; refusing to trust it. Deleting nothing."

out="$(mktemp)"
trap 'rm -f "$out"' EXIT

# Prints the HTTP status; the body is left in $out.
call() {
  curl -sS -X "$1" -o "$out" -w '%{http_code}' \
    -H "Authorization: Bearer ${NEON_API_KEY}" -H "Accept: application/json" \
    "${NEON_API}/projects/${NEON_PROJECT_ID}$2" || echo "000"
}

status="$(call GET /branches)"
[ "$status" = "200" ] || fail "could not list branches (Neon answered ${status})."

# id <TAB> name <TAB> age in whole days (-1 when Neon's timestamp does not parse,
# which is never old enough to delete).
candidates="$(jq -r '
  .branches[]
  | select((.default | not) and (.name | startswith("preview/")))
  | [ .id, .name,
      ((try ((now - (.created_at | sub("\\.[0-9]+"; "") | fromdateiso8601)) / 86400 | floor)) // -1)
    ]
  | @tsv' "$out")"

if [ -z "$candidates" ]; then
  echo "preview sweep: no preview branches."
  exit 0
fi

listed() { grep -qxF -- "$1" "$2"; }

failed=0
while IFS=$'\t' read -r id name age; do
  [ -n "$id" ] || continue
  git_branch="${name#preview/}"
  reason=""

  if ! listed "$git_branch" "$LIVE_BRANCHES_FILE"; then
    reason="the git branch is gone"
  elif listed "$git_branch" "$OPEN_PR_FILE"; then
    reason=""
  elif listed "$git_branch" "$CLOSED_PR_FILE"; then
    reason="its pull request is closed"
  elif [ "$age" -ge "$MAX_AGE_DAYS" ]; then
    reason="no pull request, ${age} days old"
  fi

  if [ -z "$reason" ]; then
    echo "preview sweep: kept ${name}."
    continue
  fi

  status="$(call DELETE "/branches/${id}")"
  case "$status" in
    200 | 202 | 204 | 404) echo "preview sweep: deleted ${name} (${reason})." ;;
    *)
      echo "::warning::preview sweep: could not delete ${name} (Neon answered ${status})."
      failed=1
      ;;
  esac
done <<<"$candidates"

exit "$failed"
