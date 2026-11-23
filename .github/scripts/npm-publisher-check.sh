#!/usr/bin/env bash
# Asks npm whether this workflow is the trusted publisher of each public package: `npm-publisher-check.sh <folder>...`.
set -euo pipefail

id_token() {
  curl -fsS -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" \
    "$ACTIONS_ID_TOKEN_REQUEST_URL&audience=npm:registry.npmjs.org" | jq -r .value
}

bad=0
for dir in "$@"; do
  [ -f "$dir/package.json" ] || continue
  [ "$(jq -r '.private // false' "$dir/package.json")" = "true" ] && continue
  name=$(jq -r .name "$dir/package.json")
  url="https://registry.npmjs.org/-/npm/v1/oidc/token/exchange/package/$(jq -rn --arg n "$name" '$n|@uri')"
  status=$(curl -sS -o /dev/null -w '%{http_code}' -X POST -H "Authorization: Bearer $(id_token)" "$url")
  if [ "$status" = "201" ] || [ "$status" = "200" ]; then
    echo "PASS $name: npm takes this workflow as its publisher"
  else
    echo "FAIL $name: npm answered $status: set the trusted publisher of $name to $GITHUB_REPOSITORY and $(basename "${GITHUB_WORKFLOW_REF%@*}")"
    echo "::error title=npm publisher of $name::npm answered $status. No tag was made."
    bad=1
  fi
done
exit "$bad"
