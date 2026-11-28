# CLAUDE.md - agentage/examples

Public repo. Example extensions, one folder each under `extensions/`. The human guide is
[README.md](README.md). Each folder has its own `README.md` and `CLAUDE.md`: read the folder's
before you change it.

## Where facts live

- The extensions and the layout: `README.md` "What is in this repo".
- What CI runs per extension, the `MIN_EXECUTED` floors, the one required job `ci-required`:
  `.github/workflows/ci.yml`.
- The release by merge, holds, the npm state: `docs/release.md`; proof `.github/workflows/release.yml`.
- The target design: the north star in the agentage product vault, `projects/architecture/`. Do not
  copy it into this repo.

## Rules

- No npm workspaces and no root `package.json`: each extension folder is a whole package with its own
  `package-lock.json` (the image build installs it). Run every npm and `agentage` command inside
  the folder.
- Never bump a version and never push a tag: a merge to master releases each changed folder with a
  date version `YYYY.MDD.N` and the tag `<id>@<version>`. A released version never changes.
- A new extension folder needs a `MIN_EXECUTED` floor in `ci.yml` and a row in agentage/e2e.
- `.github/release-hold` keeps a folder out of the release; each line names its reason. Remove the
  line only when that reason is gone.
- Merge a pull request that moves files with "rebase", so `git log --follow` keeps the history.
- Commands, in the extension folder: `npm ci`, `npm run verify`, `npx agentage extension check`, one test with `npx vitest run <file>`. Never run `extension create` without `--no-install`.
- Never publish, tag or dispatch the release by hand, and never commit a secret.
- UI (an `app`, `ui` or `pages` part) is built from `@agentage/components`. Look in the catalog
  first: <https://components.next.agentage.io>. Compose from its components and pattern pages
  before you write local UI. Fix a missing or wrong component with a pull request in
  `agentage/components`, not with a local copy, and say the gap in the reply. Do not use
  `@agentage/design-system` in new work. A prototype or an HTML draft uses the same tokens and
  scale. Scale, props and names: the `CLAUDE.md` of `agentage/components`.
