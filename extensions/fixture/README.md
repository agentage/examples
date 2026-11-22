# fixture

The fixture is an agentage extension with three parts: `pages`, `api` and `app`. It is the test extension of the release loop and of the e2e tests. It is not a starting point: to learn the shape, read the [probe](../probe).

## Quick start

You need Node 22 or newer, npm 10 or newer and git. Run the commands in this folder.

```bash
npm ci
npm run verify
npx agentage extension check      # PASS fixture <version> conforms (6 rules)
```

Use `npx agentage` here: the lock file pins the cli version.

## Parts

| Part  | Source                                 | Serves                                                                                                                     |
| ----- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| pages | [`src/pages`](src/pages)               | `/`: a static page with the id, version and commit                                                                         |
| api   | [`src/api/index.ts`](src/api/index.ts) | `GET /api/fixture/echo?msg=` (scope `fixture:read`), `GET /api/fixture/ping` and `GET /api/fixture/installations/{target}` |
| app   | [`src/app`](src/app/index.tsx)         | the shell page `/fixture`: one Note input                                                                                  |

`openapi.json` lists every route. It is generated: never edit it by hand.

## Checks

```bash
npm run verify                    # type-check, lint, format, tests with coverage, build
npx agentage extension check      # the kit's six rules
```

CI then runs `agentage extension up --docker` and the e2e gate. The gate lives in a private repo.

## Release

A merge to master that changes this folder releases it, with the version `YYYY.MDD.N` and the tag `fixture@<version>`. See the [repo README](../../README.md#how-a-change-is-released). The package is private, so nothing goes to npm. A change to this README or to `CLAUDE.md` releases nothing.

## More

- [CLAUDE.md](CLAUDE.md): the layout and the rules for an agent that changes this folder.

MIT. See [LICENSE](LICENSE).
