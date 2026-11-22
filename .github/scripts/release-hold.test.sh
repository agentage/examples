#!/usr/bin/env bash
# Tests for release-hold.sh; run from the repo root.
set -euo pipefail
script=.github/scripts/release-hold.sh
dir=$(mktemp -d)
trap 'rm -rf "$dir"' EXIT
fail() { echo "FAIL test: $1"; exit 1; }

printf '# a comment\n\n   \nfixture its images are not writable\n  # indented comment\n' > "$dir/ok"
[ "$($script "$dir/ok" fixture)" = "its images are not writable" ] || fail "reason is printed"
[ -z "$($script "$dir/ok" probe)" ] || fail "an extension not named is not held"

printf '# c\nfixture\n' > "$dir/bare"
if err=$($script "$dir/bare" probe 2>&1); then fail "a line without a reason must fail"; fi
[ "$err" = "FAIL release-hold: line 2 names fixture without a reason" ] || fail "message is exact, got: $err"

printf 'fixture   \t\n' > "$dir/blank-reason"
$script "$dir/blank-reason" fixture >/dev/null 2>&1 && fail "a name with only spaces must fail"

printf 'a why one\nb\n' > "$dir/other"
$script "$dir/other" a >/dev/null 2>&1 && fail "a bad line fails for every id"

[ "$($script .github/release-hold fixture | wc -l)" -le 1 ] || fail "the real hold file parses"
echo "PASS release-hold tests"
