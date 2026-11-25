import { useAppState } from '@agentage/extension/app';
import { Input } from '@agentage/components/input';
import { Label } from '@agentage/components/label';

// The fixture app: one input kept by the shell through state('note'), so it survives a page switch.
export default function App() {
  const [note, setNote] = useAppState('note', '');
  return (
    <section className="flex max-w-xl flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold">Fixture</h1>
      <div className="flex flex-col gap-2">
        <Label htmlFor="fixture-note">Note</Label>
        <Input id="fixture-note" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
    </section>
  );
}
