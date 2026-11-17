// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { createTestRecord, TestHost, type TestRecord } from '@agentage/extension/app/test-host';
import App from './app/index.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
});

const mount = async (record: TestRecord, reply?: (c: { path: string }) => unknown) => {
  const el = document.body.appendChild(document.createElement('div'));
  root = createRoot(el);
  const user = { id: 'u1', email: 'lab@example.test' };
  const scopes = ['probe:read', 'probe:write'];
  await act(async () =>
    root?.render(
      <TestHost id="probe" user={user} scopes={scopes} record={record} reply={reply}>
        <App />
      </TestHost>
    )
  );
  return el;
};

const button = (name: string): HTMLButtonElement => {
  const found = [...document.querySelectorAll('button')].find((b) => b.textContent === name);
  if (!found) throw new Error(`no button ${name}`);
  return found;
};

describe('the probe app part (S1.2.2 rows 2 to 6)', () => {
  it('renders the heading, the user and the scopes', async () => {
    const el = await mount(createTestRecord());
    expect(el.querySelector('h1')?.textContent).toBe('Probe');
    expect(el.textContent).toContain('User lab@example.test');
    expect(el.textContent).toContain('Scopes probe:read,probe:write');
  });

  it('Ping calls its own api with its id and shows the answer', async () => {
    const record = createTestRecord();
    const el = await mount(record, () => ({ msg: 'hi' }));
    await act(async () => button('Ping').click());
    expect(record.calls[0]).toMatchObject({ id: 'probe', path: '/echo?msg=hi', method: 'GET' });
    expect(record.calls[0]?.headers['x-agentage-app']).toBe('probe');
    expect(el.textContent).toContain('pong hi');
  });

  it('Notify gives one notice, Details opens the aside, the draft is kept in state', async () => {
    const record = createTestRecord();
    const el = await mount(record);
    await act(async () => button('Notify').click());
    await act(async () => button('Details').click());
    expect(record.notices).toEqual([{ text: 'Notified', kind: 'info' }]);
    expect(record.aside).toBe('details');
    expect(document.body.textContent).toContain('probe details');
    expect(el.querySelector('label')?.textContent).toBe('Draft');
  });
});
