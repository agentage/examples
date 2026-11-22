#!/usr/bin/env bash
# Usage: release-hold.sh <hold-file> <extension-id>; prints the hold reason, or nothing when not held.
set -euo pipefail
file=$1
id=$2
awk -v n="$id" '
  /^[[:space:]]*(#|$)/ { next }
  NF < 2 { printf "FAIL release-hold: line %d names %s without a reason\n", NR, $1 > "/dev/stderr"; bad = 1; exit }
  $1 == n && !why { $1 = ""; sub(/^[[:space:]]+/, ""); why = $0 }
  END { if (bad) exit 1; if (why) print why }
' "$file"
