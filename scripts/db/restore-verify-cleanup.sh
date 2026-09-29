#!/usr/bin/env bash
#
# Deletes the restore check's scratch branches. Run by
# .github/workflows/db-restore-check.yml twice: before the check, to clear what
# an earlier run left behind, and after it, always, whatever happened.
#
#   NEON_API_KEY, NEON_PROJECT_ID
#   RESTORE_BRANCH_ID   Optional: this run's branch, which must be deleted.
#                       Every other restore-check/* branch goes too.
#
# It deletes a branch only if its name starts with "restore-check/" AND Neon
# says it is not the default. Nothing else in the project is ever touched —
# not preview/*, not main — whatever id it is handed.
#
# Each branch also carries an expires_at a few hours out, so Neon removes it
# even if this never runs. This is the belt; that is the braces.

set -euo pipefail

fail() {
  echo "::error::restore-check cleanup: $1" >&2
  exit 1
}

NEON_API="${NEON_API_BASE:-https://console.neon.tech/api/v2}"

[ -n "${NEON_API_KEY:-}" ] || fail "the NEON_API_KEY secret is not set."
[ -n "${NEON_PROJECT_ID:-}" ] || fail "the NEON_PROJECT_ID variable is not set."
command -v jq >/dev/null || fail "jq is not installed."

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

targets="$(jq -r '.branches[] | select((.default | not) and (.name | startswith("restore-check/"))) | .id' "$out")"

if [ -n "${RESTORE_BRANCH_ID:-}" ]; then
  mine="$(jq -r --arg id "$RESTORE_BRANCH_ID" '.branches[] | select(.id == $id) | "\(.default) \(.name)"' "$out")"
  case "$mine" in
    "") echo "restore-check cleanup: this run's branch is already gone." ;;
    "false restore-check/"*) ;;
    *) fail "was handed branch ${RESTORE_BRANCH_ID}, which is not a restore-check branch. Deleting nothing." ;;
  esac
fi

if [ -z "$targets" ]; then
  echo "restore-check cleanup: no restore-check branches to delete."
  exit 0
fi

failed=0
for id in $targets; do
  # A branch whose compute is still starting refuses deletion for a moment.
  deleted=""
  for _ in $(seq 1 "${CLEANUP_TRIES:-12}"); do
    status="$(call DELETE "/branches/${id}")"
    case "$status" in
      200 | 202 | 204 | 404) deleted=1; break ;;
    esac
    sleep "${CLEANUP_WAIT:-10}"
  done
  if [ -n "$deleted" ]; then
    echo "restore-check cleanup: deleted branch ${id}"
  else
    echo "::warning::restore-check cleanup: could not delete branch ${id} (Neon answered ${status}). Its expires_at will remove it."
    failed=1
  fi
done

exit "$failed"
