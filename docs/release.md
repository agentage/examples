# Release by merge

`.github/workflows/release.yml` runs on each push to master, in the concurrency group `release`
(one run at a time, none cancelled). It runs the cli pinned there, `@agentage/cli@0.74.0`, with
`agentage extension release --changed`. The cli reference (`docs/reference.md` of agentage/cli,
"extension release") has every step and refusal.

- Changed means a file in the folder differs from the last `<id>@*` tag, or there is no such tag,
  or that tag has no record. A change to a root file (a workflow, this file) releases nothing.
- Each changed extension is tried; one that fails does not stop the others. The run ends with one
  table (`released`, `failed`, `refused`, `unchanged`) and is red when any failed.
- A released version never changes. A fix is a new merge, so a new `N`.
- Preview what a merge would release, from a clone whose `origin/master` holds the commit:
  `GITHUB_REPOSITORY=agentage/examples npx -y @agentage/cli@0.74.0 extension release --changed --dry-run`.

## Holds

`.github/release-hold` names the folders a merge must not release yet, one line each: the folder
name, then the reason. A line with a name and no reason fails the run (`FAIL release-hold: line N names <id> without a reason`); `#` lines and blank lines are fine. The release step drops a held folder from its checkout and prints
`AMBER <name>: not released: <reason>`. Remove the line to release the folder with the next merge.

- No folder is held today: the file holds comments only.

## npm

- The release publishes `@agentage/extension-probe` to npm by trusted publishing (publisher: this repository, workflow `release.yml`), before it writes the release record. A date version on npm cannot be removed.
- `fixture` is a private package for good: it is never on npm.
