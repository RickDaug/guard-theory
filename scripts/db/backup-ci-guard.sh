#!/usr/bin/env bash
#
# The last thing between a dump and a public download link.
#
# scripts/db/backup-ci.sh only ever writes an encrypted file. This does not take
# its word for it: it is a separate step, it looks at the bytes, and the upload
# does not happen unless it passes. The repository is public, so an artifact is
# downloadable by anyone signed in to GitHub — a plaintext dump uploaded once is
# customers' names and addresses published, and deleting it afterwards does not
# unpublish them.
#
#   backup-ci-guard.sh <directory about to be uploaded>

set -euo pipefail

dir="${1:?usage: backup-ci-guard.sh <directory>}"

refuse() {
  echo "::error::backup: REFUSING TO UPLOAD — $1" >&2
  # Whatever it was, it does not stay where an upload step could find it.
  rm -rf "$dir"
  exit 1
}

[ -d "$dir" ] || { echo "::error::backup: nothing to upload; $dir does not exist." >&2; exit 1; }

encrypted=0

for file in "$dir"/* "$dir"/.[!.]*; do
  [ -e "$file" ] || continue
  [ -f "$file" ] || refuse "$(basename "$file") is not a regular file."

  case "$file" in
    *.gpg) ;;
    *.gpg.sha256) continue ;;
    *) refuse "$(basename "$file") is not a .gpg file." ;;
  esac

  # pg_dump's custom format opens with the five bytes "PGDMP".
  if [ "$(head -c 5 "$file")" = "PGDMP" ]; then
    refuse "$(basename "$file") is a plaintext pg_dump archive with a .gpg name."
  fi

  # An OpenPGP symmetrically encrypted message opens with a Symmetric-Key
  # Encrypted Session Key packet: tag 3, which is 0x8c in the old packet format
  # and 0xc3 in the new one. Anything else is not what gpg --symmetric writes.
  first="$(head -c 1 "$file" | od -An -tx1 | tr -d '[:space:]')"

  case "$first" in
    8c | c3) encrypted=$((encrypted + 1)) ;;
    *) refuse "$(basename "$file") does not begin like a gpg --symmetric file (first byte 0x${first})." ;;
  esac
done

[ "$encrypted" -ge 1 ] || refuse "there is no encrypted file in $dir."

echo "backup: ${encrypted} encrypted file(s), nothing else. Clear to upload."
