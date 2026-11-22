# Parts

Each part of the probe, its source, what it serves, and its scopes and limits. A scope is the
permission a token must carry: `probe:read` or `probe:write`. The full contracts are
[`openapi.json`](../openapi.json) for the api part and [`probe.mcpc.json`](../probe.mcpc.json) for
the mcp part.

The kit is the library [`@agentage/extension`](https://github.com/agentage/platform). It owns the servers, ports,
`/health` and discovery. It also owns the response format, the store connection, the scheduler and
the command line.

## pages

Source: [`src/pages`](../src/pages/index.ts).

- `/` shows `probe {version} · {commit}`.

## ui

Source: [`src/ui`](../src/ui/index.ts). The widget is `<probe-echo>`, written in React on
`@agentage/widget`.

- `/ui/{version}/probe.js` serves the widget bundle.
- `harness.html` is a test page for the widget.

## app

Source: [`src/app`](../src/app/index.tsx). One root component for the shell, built by the
kit into `dist/app` (`agentage-extension app`, the last step of `npm run build`). It imports only
`react`, `@agentage/extension/app` and `@agentage/components` components by subpath: no `fetch(`, no
`localStorage`, no stylesheet import.

- The nav row: `agentage.app` in `package.json`, title `Probe`, icon `radar`, order 10.
- Ping calls `useAppHost().api('/echo?msg=hi')` (the `X-Agentage-App: probe` header) and shows
  `pong hi`; Notify sends one notice; Details opens the aside, where its `Region` shows
  `probe details`; the Draft input keeps its value in `useAppState('draft')`.
- `npm run build` leaves `src/app` out of `tsc`; `extension up` builds it on each save and reloads
  only the app.

## api

Source: [`src/api`](../src/api/index.ts).

- `GET /api/probe/echo?msg=` needs `probe:read`. `msg` is 1 to 200 characters. The setting `echo.prefix` (default empty) is put before `msg` with one space: prefix `hey` and `msg=hi` answer `hey hi`.
- `GET /api/probe/ticks?limit=&cursor=` returns ticks, newest first. The default limit is 50. A limit
  above 200 is clamped to 200.
- `GET /api/probe/ticks` needs no token.
- `POST /api/probe/emit` needs `probe:write`. With `exit`, the part answers 202 and then stops
  cleanly. The estate starts it again. Local `up` does not, so call it last.
- `emit` also accepts `fail`. It throws after the log, span and event rows are written. The
  answer is 500 with the error code `INTERNAL`.
- `openapi.json` describes these routes.

## mcp

Source: [`src/mcp`](../src/mcp/index.ts).

- `POST /mcp` serves the tool `probe_echo`. It needs `probe:read`.
- `msg` is up to 200 characters. The tool answers `pong <msg>`.
- The tool list is in [`probe.mcpc.json`](../probe.mcpc.json).

## worker

Source: [`src/worker`](../src/worker/index.ts).

- The job `tick` runs every minute. Each run writes one row in `ticks`.

## store

Source: [`migrations/`](../migrations), [`seeds/`](../seeds).

- The store is postgres.
- The api image's `node dist/store/migrate.js` applies the migrations and seeds.

## cli

Source: [`src/cli`](../src/cli/index.ts).

- `agentage ping [msg]` prints `pong`. With a message it prints `pong <msg>`.
