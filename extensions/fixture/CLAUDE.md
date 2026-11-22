# CLAUDE.md - extensions/fixture of agentage/examples

A three-part extension (`pages`, `api`, `app`) that agentage/e2e runs its gate
against. The human guide is [README.md](README.md). Keep this folder small: it is test input, not a
starting point. The extension template is `template/` of agentage/kit.

## Where facts live

- What each part serves, its scope and answers: `README.md` "What it serves".
- Routes, scopes, status codes, body limits: `openapi.json` (generated; never edit by hand).
- Run it locally, ports, tokens: `README.md` "Quick start".
- CI jobs and the `MIN_EXECUTED` floor: the repo root `.github/workflows/ci.yml`. Test coverage floor: `vitest.config.ts`.
- Release rules and refusals: `README.md` "Release", the repo root `.github/workflows/release.yml`.
- The manifest and its parts: the `agentage` block of `package.json`.
- Where a release runs: `README.md` "Deploy".
- The target design (the extension model, the app host, the app shell): the north star in the agentage product vault, `projects/architecture/`. Do not copy it into this repo.

Read the file named here before you read `src/`.

## Layout

- `src/pages` serves `/`: one static page with the id, version and commit (`src/pages/index.ts`).
- `src/api/index.ts` declares the routes: `echo`, `ping` and `installations/{target}`.
- `src/app/index.tsx` is the app page for the shell: the nav row is `agentage.app` in `package.json`.
- `src/manifest.test.ts` proves the manifest names exactly the part folders that exist, that a part
  imports only its own folder and `src/lib/`, and that `openapi.json` exists exactly when `src/api`
  exists.
- `openapi.json` is a committed contract. After a route change run `npm run build`,
  `npx agentage extension check --write`, then `npm run format`.
- No `ui`, `mcp`, `worker`, `cli` or `store` part: no widget test, no MCP contract file.

## Rules

- A part exports `create(ctx)` only. Never use `listen()`, the `process` global, a token check or
  an absolute agentage URL in `src/`. `agentage extension check` enforces this.
- Each part has its tests beside it. `npm run verify` before every push; CI also runs
  `agentage extension check`, then `up --docker` and the gate (`fixture gate docker`).
- `MIN_EXECUTED` of `fixture` in the root `ci.yml` is the fewest tests the gate must run. Do not lower it to hide a
  skipped gate.
- A merge that changes this folder is its release (`agentage extension release --changed`). The
  package is `"private": true`, so the release never publishes to npm. A released version keeps its
  images and records; a fix is a new version.
- `@agentage/cli` and the kit are caret ranges in `package.json` (`^0.69.0`, `^0.21.0`); Dependabot raises them in a
  weekly group PR.
