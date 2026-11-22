# probe

The probe is a small agentage extension that has one of every part kind: pages, ui, api, mcp, worker, store, cli and app. A part does one job. Extension authors use it
as proof that the shape works. Maintainers test with it. To start your own
extension, run `npx @agentage/cli@latest extension create <id>` or copy
[agentage/extension-template](https://github.com/agentage/extension-template).

## Quick start

### Use its command

You need the agentage command line, installed globally. You do not need a clone, Docker or a
sign-in.

```bash
npm install -g @agentage/cli
agentage extension install probe    # installs @agentage/extension-probe from npm
agentage ping                       # prints pong
```

### Run it from a clone

You need Node 22 or newer, npm 10 or newer, Docker and git. Nothing needs a sign-in.

```bash
git clone https://github.com/agentage/examples && cd examples/extensions/probe
npm ci                                   # installs the cli pinned in the lockfile
npx agentage extension up --docker       # last line: ready    <n> parts healthy    <n> s
# open http://localhost:4280/ui/<version>/harness.html (version from package.json), click ping
curl -s localhost:4280/.well-known/agentage-extension.json
T=$(npx agentage extension token --scope probe:read)   # from the dev issuer on localhost:4281
curl -s -H "Authorization: Bearer $T" "localhost:4280/api/probe/echo?msg=hi"
npx agentage extension install .         # linked: the working copy
npx agentage ping                        # pong
npx agentage extension down              # removes the containers, network and volume
```

Use `npx agentage` inside the clone. A global `agentage` can be older than the pinned one and lack
`extension up --docker`.

Five parts run as containers: pages, ui, api, mcp and worker. `store` is postgres. `cli` runs on
your machine. The `app` part runs in the shell of the daemon: `npx agentage extension up` (no
Docker) builds it and reloads it on each save.

More: [docs/develop.md](docs/develop.md#run-it-from-a-clone)

## What it serves

A part is one unit of the extension that does one job. Most are `src/` folders; the store is `migrations/` and `seeds/`. Each part exports only `create(ctx)`.
The ui part exports a `widgets` map instead, and the app part a default root component. The kit,
[`@agentage/extension`](https://github.com/agentage/platform), runs each part and builds one image
each for pages, ui, api, mcp and worker, so this repo has no Dockerfile or compose file.

| Part   | Serves                                                                                |
| ------ | ------------------------------------------------------------------------------------- |
| pages  | `/`: `probe {version} · {commit}`                                                     |
| ui     | `/ui/{version}/probe.js`, `harness.html`                                              |
| api    | `GET /api/probe/echo`, `GET /api/probe/ticks`, `POST /api/probe/emit`, `openapi.json` |
| mcp    | `POST /mcp`: tool `probe__echo`                                                       |
| worker | job `tick`, one row in `ticks` per minute                                             |
| store  | postgres                                                                              |
| cli    | `agentage ping [msg]`                                                                 |
| app    | the shell page `/probe`: nav row Probe (`radar`), Ping, Notify, Details, the draft    |

More: [docs/parts.md](docs/parts.md), with what the kit owns.

## Verify

What CI runs, in order:

```bash
npm run verify                    # type-check, lint, format, tests with coverage, build
npx agentage extension check      # six rules; PASS probe <version> conforms
npx agentage extension up --docker # each part's /health body is asserted
npx playwright install chromium   # once; a bare Linux also needs --with-deps
npm run test:e2e                  # smoke and the widget tests
```

CI then runs the gate of agentage/e2e against the same `up`. That repository is private, so only
maintainers run the gate.

More: [docs/develop.md](docs/develop.md#verify)

## Release

A merge to master that changes this folder releases it: the root `.github/workflows/release.yml`
runs `agentage extension release --changed` (see the [repo README](../../README.md#release)). It
gives the probe a date version `YYYY.MDD.N` and the tag `probe@<version>`, builds and pushes
`ghcr.io/agentage/probe-{pages,ui,api,mcp,worker}:{version}` and the one image that an app host
runs, and attaches two records to the GitHub release: `agentage-extension.json` (the five part
images by digest) and `agentage-container.json` (the one image). Nothing is bumped by hand: the
version is written in the CI copy only. Releases up to 0.9.3 are `v*` tags.

For now `package.json` has `"private": true`, so a release does not publish
`@agentage/extension-probe` to npm; see [docs/release.md](../../docs/release.md).

A released version never changes: `agentage extension release` refuses a tag moved to another
commit. Ship a fix as a new merge.

## Deploy

A release deploys nothing. One file runs the probe on `next`, the staging estate:

- The `probe` row in `test/installation.json` of agentage/apphosts is an exact version on the `test`
  app host, served at `https://test.next.agentage.io`. A change of that row deploys the app host.

The agentage/apphosts repository is private.

## Documentation

- [docs/parts.md](docs/parts.md): each part's routes, scopes and limits.
- [docs/develop.md](docs/develop.md): what `up` does; the e2e gate.
- [CLAUDE.md](CLAUDE.md): the rules for an agent that changes this repo.

## License

MIT. See [LICENSE](LICENSE).
