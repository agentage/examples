import { useAppState } from '@agentage/extension/app';
import { Input } from '@agentage/components/input';
import { Label } from '@agentage/components/label';
import { PageHeader } from '@agentage/components/page-header';

// The fixture app: one input kept by the shell through state('note'), so it survives a page switch.
export default function App() {
  const [note, setNote] = useAppState('note', '');
  return (
    <section className="flex max-w-xl flex-col gap-4 p-6">
      <PageHeader variant="detail" title="Fixture" className="pt-0" />
      <div className="flex flex-col gap-2">
        <Label htmlFor="fixture-note">Note</Label>
        <Input id="fixture-note" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
    </section>
  );
}
