import { z } from 'zod';
import { fail, type ApiContext, type Store } from '@agentage/extension';

const countPings = async (store: Store) => {
  const { rows } = await store.query<{ n: number }>('select count(*)::int as n from pings');
  const [{ n }] = rows as [{ n: number }]; // count(*) answers one row
  return n;
};

const layout = z.object({
  kind: z.literal('column'),
  children: z.array(
    z.object({ kind: z.literal('widget'), extension: z.string(), name: z.string() })
  ),
});
const installation = z.object({
  target: z.string(),
  deployments: z.array(z.object({ id: z.string(), url: z.string() })),
  routes: z.record(z.string(), layout),
});

// fixture.X runs probe's echo widget from probe.X; root serves this document from 2.1 on.
const installationOf = (target: string): z.input<typeof installation> => {
  const env = /^fixture\.([a-z0-9.-]+)$/.exec(target)?.[1];
  if (!env) throw fail('NOT_FOUND', `no installation for ${target}`);
  return {
    target,
    deployments: [{ id: 'probe', url: `https://probe.${env}` }],
    routes: {
      '/': { kind: 'column', children: [{ kind: 'widget', extension: 'probe', name: 'echo' }] },
    },
  };
};

// Mounted at /api/fixture; openapi.json is generated from these routes.
export function create({ route, store, extension }: ApiContext) {
  const input = z.object({ msg: z.string().min(1).max(200) });
  const output = z.object({ msg: z.string(), caller: z.string() });
  route('get', '/echo', { summary: 'Echo msg', input, output }, (req) => ({
    msg: req.input.msg,
    caller: req.caller?.sub ?? 'local',
  }));
  const pong = z.object({ msg: z.string(), pings: z.int().nullable() });
  route('get', '/ping', { summary: 'Answer pong', scope: 'public', output: pong }, async () => ({
    msg: 'pong',
    pings: extension.store ? await countPings(store) : null,
  }));
  const spec = { summary: 'The installation document of a target', scope: 'public' as const };
  route('get', '/installations/{target}', { ...spec, output: installation }, ({ params }) =>
    installationOf(params.target)
  );
}
