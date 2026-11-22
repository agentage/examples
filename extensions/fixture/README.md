# fixture

A small agentage extension with three parts (folders that each do one job), `pages`, `api` and `app`. The agentage e2e tests use
it as test input. It is for maintainers of the extension platform. It is not a starting point:
to start an extension, use [agentage/extension-template](https://github.com/agentage/extension-template).

## Quick start

Needs Node 22 or newer, npm 10 or newer, Docker and git. Nothing needs a sign-in. Run every command in
this folder, `extensions/fixture` of agentage/examples.

```bash
npm ci
npm run build
npx agentage extension up              # on the daemon, 127.0.0.1:4243: the api and app parts, reload on save (pages need --docker)
curl -s "127.0.0.1:4243/api/fixture/echo?msg=hi"
npx agentage extension down
# npx agentage extension up --docker   # the release images (api and pages); ports 4280 and 4281 must be free
```

Use `npx agentage` inside this folder: its lockfile pins that version.

## What it serves

| Part  | Source                                 | Serves                                                                                                                                   |
| ----- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| pages | [`src/pages`](src/pages)               | `/`: a static page with the id, version and commit                                                                                       |
| api   | [`src/api/index.ts`](src/api/index.ts) | `GET /api/fixture/echo?msg=` (scope `fixture:read`), `GET /api/fixture/ping` and `GET /api/fixture/installations/{target}` (both public) |
| app   | [`src/app`](src/app/index.tsx)         | the shell page `/fixture`: nav row Fixture, one Note input kept in `useAppState('note')`                                                 |

- `ping` answers `{"success":true,"data":{"msg":"pong","pings":null}}`: this extension has no store.
- `installations/{target}` accepts only `fixture.<env>` (no estate host uses that name today).
  It answers an installation document that deploys the probe extension at
  `https://probe.<env>`. Any other target answers 404 `NOT_FOUND`.
- `openapi.json` lists every route. A test, `src/manifest.test.ts`, checks that the file exists
  only when `src/api` exists.

## Verify

```bash
npm run verify                    # type-check, lint, format, tests with coverage, build
npx agentage extension check      # PASS fixture <version> conforms
```

CI then runs `up --docker` and `npm run e2e -- fixture gate docker` in an agentage/e2e checkout.

## Release

A merge to master that changes this folder releases it with a date version `YYYY.MDD.N` and the
tag `fixture@<version>`: see the [repo README](../../README.md#release). The package is private:
the release pushes the images, attaches the records `agentage-container.json` and
`agentage-extension.json` to the GitHub release and publishes nothing to npm. Releases made before
the move are `v*` tags of agentage/extension-fixture.

## Deploy

A release deploys nothing. One file runs the fixture on `next`, the staging estate, and it follows
the newest release: the cloud extension opens a pull request that changes the version.

- The `fixture` row in `test/installation.json` of agentage/apphosts (`"track": "latest"`): the `test` app host, served at `https://test.next.agentage.io`.

## Documentation

- [CLAUDE.md](CLAUDE.md): the layout and the rules for an agent that changes this folder.

## License

MIT, see [LICENSE](LICENSE).
