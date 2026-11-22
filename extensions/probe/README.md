# probe

The probe is an agentage extension with one of every part kind: pages, ui, api, mcp, worker, store, cli and app. It shows the shape that every extension copies, and it proves the kit on each release.

## Quick start

You need Node 22 or newer, npm 10 or newer and git. Run the commands in this folder.

```bash
npm ci
npm run verify
npx agentage extension check      # PASS probe <version> conforms (6 rules)
```

Use `npx agentage` here: the lock file pins the cli version.

## Parts

Each part is one folder that does one job and exports `create(ctx)`. The ui part exports a `widgets` map and the app part a root component.

| Part   | Source                  | Serves                                                                                |
| ------ | ----------------------- | ------------------------------------------------------------------------------------- |
| pages  | `src/pages`             | `/`: `probe {version} · {commit}`                                                     |
| ui     | `src/ui`                | `/ui/{version}/probe.js`, `harness.html`                                              |
| api    | `src/api`               | `GET /api/probe/echo`, `GET /api/probe/ticks`, `POST /api/probe/emit`, `openapi.json` |
| mcp    | `src/mcp`               | `POST /mcp`: tool `probe__echo`                                                       |
| worker | `src/worker`            | job `tick`, one row in `ticks` per minute                                             |
| store  | `migrations/`, `seeds/` | postgres                                                                              |
| cli    | `src/cli`               | `agentage ping [msg]`                                                                 |
| app    | `src/app`               | the shell page `/probe`                                                               |

Details of each part: [docs/parts.md](docs/parts.md).

## Checks

```bash
npm run verify                     # type-check, lint, format, tests with coverage, build
npx agentage extension check       # the kit's six rules
npx agentage extension up --docker # needs Docker; each part's /health is asserted
npm run test:e2e                   # needs Chromium: npx playwright install chromium
```

`up` starts the whole extension on ports 4280 and 4281, and `npx agentage extension down` removes it. Details: [docs/develop.md](docs/develop.md). The shared end-to-end gate lives in a private repo, so only maintainers run it.

## Release

A merge to master that changes this folder releases it, with the version `YYYY.MDD.N` and the tag `probe@<version>`. See the [repo README](../../README.md#how-a-change-is-released). A change to this README, to `CLAUDE.md` or to `docs/` releases nothing.

## More

- [CLAUDE.md](CLAUDE.md): the rules for an agent that changes this folder.
- [agentage/kit](https://github.com/agentage/kit): the kit `@agentage/extension` that runs each part.

MIT. See [LICENSE](LICENSE).
