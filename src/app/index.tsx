import { useState } from 'react';
import { Region, useAppHost, useAppShell, useAppState } from '@agentage/extension/app';
import { Button } from '@agentage/design-system/button';
import { Input } from '@agentage/design-system/input';
import { Label } from '@agentage/design-system/label';

interface Echo {
  msg: string;
}

const usePing = (api: <T>(path: string) => Promise<T>) => {
  const [pong, setPong] = useState('');
  const ping = async () => {
    try {
      setPong(`pong ${(await api<Echo>('/echo?msg=hi')).msg}`);
    } catch (err) {
      setPong(String((err as { code?: string }).code ?? err));
    }
  };
  return [pong, ping] as const;
};

// The probe app: one of each hook and a Region, through @agentage/extension/app only (S1.2.2 row 11).
export default function App() {
  const { api, user, scopes } = useAppHost();
  const { notify, openAside } = useAppShell();
  const [draft, setDraft] = useAppState('draft', '');
  const [pong, ping] = usePing(api);
  return (
    <section className="flex max-w-xl flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold">Probe</h1>
      <p>User {user?.name ?? user?.email ?? 'none'}</p>
      <p>Scopes {scopes.join(',')}</p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="probe-draft">Draft</Label>
        <Input id="probe-draft" value={draft} onChange={(e) => setDraft(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button onClick={() => void ping()}>Ping</Button>
        <Button variant="secondary" onClick={() => notify({ text: 'Notified', kind: 'info' })}>
          Notify
        </Button>
        <Button variant="outline" onClick={() => openAside('details')}>
          Details
        </Button>
      </div>
      <p aria-live="polite" className="min-h-6">
        {pong}
      </p>
      <Region name="aside">
        <p className="p-4">probe details</p>
      </Region>
    </section>
  );
}
