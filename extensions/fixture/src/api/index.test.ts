import {
  createTestContext,
  ok,
  startTestServer,
  type PartContext,
  type Store,
} from '@agentage/extension';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { create } from './index.js';

const ctx = createTestContext();
const { store } = ctx.extension;
let server: Awaited<ReturnType<typeof startTestServer>>;
// The store boots (WASM, migrations, seed) on first use: here, not inside a test's 5 s.
beforeAll(async () => {
  if (store) await ctx.store.query('select 1');
  server = await startTestServer({ create, ctx });
}, 30_000);
afterAll(async () => {
  await server.close();
  await ctx.close();
});

describe('GET /api/fixture/echo', () => {
  it('echoes msg and names the caller', async () => {
    const res = await server.fetch('/api/fixture/echo?msg=hi');
    expect(await res.json()).toEqual(ok({ msg: 'hi', caller: 'usr_test' }));
  });

  it.each([
    ['empty', ''],
    ['over 200 characters', 'x'.repeat(201)],
  ])('refuses a msg %s', async (_name, msg) => {
    expect((await server.fetch(`/api/fixture/echo?msg=${msg}`)).status).toBe(400);
  });
});

const ping = async (ctx: PartContext) => {
  const one = await startTestServer({ create, ctx });
  const body: unknown = await (await one.fetch('/api/fixture/ping')).json();
  await one.close();
  return body;
};

describe('GET /api/fixture/ping', () => {
  it('counts the rows of pings when the manifest keeps the store', async () => {
    const counted = { query: async () => ({ rows: [{ n: 3 }] }) } as Store;
    const ctx = createTestContext({ extension: { store: 'postgres' } });
    const body = await ping({ ...ctx, store: counted });
    expect(body).toEqual(ok({ msg: 'pong', pings: 3 }));
  });

  it('answers pings null without a store', async () => {
    const body = await ping(createTestContext({ store: false }));
    expect(body).toEqual(ok({ msg: 'pong', pings: null }));
  });

  it.runIf(store)('counts the seeded row: the migration and the seed ran', async () => {
    const res = await server.fetch('/api/fixture/ping');
    expect(await res.json()).toEqual(ok({ msg: 'pong', pings: 1 }));
  });
});

describe('GET /api/fixture/installations/{target}', () => {
  it('names probe of the same environment and its echo widget in a column', async () => {
    const res = await server.fetch('/api/fixture/installations/fixture.next.agentage.io');
    expect(await res.json()).toEqual(
      ok({
        target: 'fixture.next.agentage.io',
        deployments: [{ id: 'probe', url: 'https://probe.next.agentage.io' }],
        routes: {
          '/': { kind: 'column', children: [{ kind: 'widget', extension: 'probe', name: 'echo' }] },
        },
      })
    );
  });

  it('answers NOT_FOUND for a target that is not a fixture host', async () => {
    const res = await server.fetch('/api/fixture/installations/localhost:4280');
    expect(res.status).toBe(404);
  });
});
