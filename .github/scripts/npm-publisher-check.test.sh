#!/usr/bin/env bash
# Tests for npm-publisher-check.sh with a stub curl on PATH; run from the repo root.
set -euo pipefail
script=$PWD/.github/scripts/npm-publisher-check.sh
dir=$(mktemp -d)
trap 'rm -rf "$dir"' EXIT
fail() { echo "FAIL test: $1"; exit 1; }

mkdir "$dir/bin" "$dir/pub" "$dir/priv"
cat > "$dir/bin/curl" <<'STUB'
#!/usr/bin/env bash
echo "$*" >> "$STUB_LOG"
case " $* " in
  *" -w "*) printf '%s' "$STUB_STATUS" ;;
  *) echo '{"value":"tok"}' ;;
esac
STUB
chmod +x "$dir/bin/curl"
echo '{"name":"@o/pub"}' > "$dir/pub/package.json"
echo '{"name":"@o/priv","private":true}' > "$dir/priv/package.json"

export PATH="$dir/bin:$PATH" STUB_LOG="$dir/log"
export ACTIONS_ID_TOKEN_REQUEST_TOKEN=t ACTIONS_ID_TOKEN_REQUEST_URL=https://x.test/?a=b
export GITHUB_REPOSITORY=o/r GITHUB_WORKFLOW_REF=o/r/.github/workflows/release.yml@refs/heads/master
run() { STUB_STATUS=$1 "$script" "${@:2}" 2>&1; }

for ok in 200 201; do
  out=$(run "$ok" "$dir/pub") || fail "$ok must pass"
  [ "$out" = "PASS @o/pub: npm takes this workflow as its publisher" ] || fail "pass line for $ok, got: $out"
done

if out=$(run 403 "$dir/pub"); then fail "403 must fail"; fi
want="FAIL @o/pub: npm answered 403: set the trusted publisher of @o/pub to o/r and release.yml"
[ "$(echo "$out" | head -1)" = "$want" ] || fail "403 message is exact, got: $out"

: > "$dir/log"
out=$(run 403 "$dir/priv") || fail "a private package is skipped"
[ -z "$out" ] && [ ! -s "$dir/log" ] || fail "a private package makes no call"

: > "$dir/log"
run 201 "$dir/pub" >/dev/null
[ "$(grep -c -e '--max-time 20' "$dir/log")" = 2 ] || fail "both curl calls carry --max-time 20"
echo "PASS npm-publisher-check tests"
