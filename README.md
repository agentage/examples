# examples

Example agentage extensions, one folder each under `extensions/`. A merge to master is the release.

| Folder                                     | Id        | What                                                             |
| ------------------------------------------ | --------- | ---------------------------------------------------------------- |
| [`extensions/probe`](extensions/probe)     | `probe`   | one of every part kind: the shape every extension copies         |
| [`extensions/fixture`](extensions/fixture) | `fixture` | three parts (`pages`, `api`, `app`): test input for the e2e gate |

To start your own extension, run `npx @agentage/cli@latest extension create <id>`.

## Layout

- Each folder is a whole extension package: its own `package.json`, `package-lock.json`, configs
  and tests. There are no npm workspaces: the image build installs the folder's own lockfile, and
  the kit versions can differ per folder.
- Work inside a folder: `cd extensions/<name> && npm ci && npm run verify`. Each README says how to
  run it.

## Verify

`.github/workflows/ci.yml` tests each extension folder a change touches; a change outside
`extensions/` tests all of them. Per extension: `npm run verify`, `agentage extension check`,
`agentage extension up --docker`, `npm run test:e2e` and the gate of agentage/e2e (private, so only
maintainers run it). The job `ci-required` is green when every one passed.

## Release

A merge to master runs `.github/workflows/release.yml`: `agentage extension release --changed`.
Each extension whose folder differs from its last `<id>@*` tag gets:

1. a date version `YYYY.MDD.N` (the UTC year, month times 100 plus day, the count that day), written
   in the CI copy only: nothing is bumped by hand;
2. the tag `<id>@<version>` on the merge commit;
3. its images `ghcr.io/agentage/<id>-<part>` and `ghcr.io/agentage/<id>`, and the records
   `agentage-extension.json` and `agentage-container.json` on the GitHub release;
4. npm with provenance, unless the package is `"private": true`.

A folder named in `.github/release-hold` is not released: the run prints one `AMBER` line with the
reason. Details and the current holds: [docs/release.md](docs/release.md).

## License

MIT. See [LICENSE](LICENSE).
