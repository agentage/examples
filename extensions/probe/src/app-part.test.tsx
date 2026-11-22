// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import axe from 'axe-core';
import { createStateStore, type StateStore } from '@agentage/extension/app';
import { createTestRecord, TestHost, type TestRecord } from '@agentage/extension/app/test-host';
import App from './app/index.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
});

const mount = async (
  record: TestRecord,
  reply?: (c: { path: string }) => unknown,
  store?: StateStore
) => {
  const el = document.body.appendChild(document.createElement('div'));
  root = createRoot(el);
  const user = { id: 'u1', email: 'lab@example.test' };
  const scopes = ['probe:read', 'probe:write'];
  await act(async () =>
    root?.render(
      <TestHost id="probe" user={user} scopes={scopes} record={record} reply={reply} store={store}>
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

  it('Notify gives one notice, Details opens the aside, the Draft input has its label', async () => {
    const record = createTestRecord();
    const el = await mount(record);
    await act(async () => button('Notify').click());
    await act(async () => button('Details').click());
    expect(record.notices).toEqual([{ text: 'Notified', kind: 'info' }]);
    expect(record.aside).toBe('details');
    expect(document.body.textContent).toContain('probe details');
    expect(el.querySelector('label')?.textContent).toBe('Draft');
  });

  it('Ping shows the error code when the api fails, and the status line keeps its height', async () => {
    const el = await mount(createTestRecord(), () => {
      throw Object.assign(new Error('x'), { code: 'forbidden' });
    });
    await act(async () => button('Ping').click());
    const live = el.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toContain('forbidden');
    expect(live?.className).toContain('min-h-6');
  });

  it('the draft is kept in useAppState across a remount (a live reload)', async () => {
    const store = createStateStore();
    const el = await mount(createTestRecord(), undefined, store);
    const input = el.querySelector('input') as HTMLInputElement;
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    await act(async () => {
      setValue?.call(input, 'abc');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    act(() => root?.unmount());
    document.body.innerHTML = '';
    const again = await mount(createTestRecord(), undefined, store);
    expect((again.querySelector('input') as HTMLInputElement).value).toBe('abc');
  });
});

describe('the probe app page: a11y and keyboard', () => {
  it('axe finds no violation (colour contrast is the shell, checked in a browser)', async () => {
    const el = await mount(createTestRecord());
    const result = await axe.run(el, { rules: { 'color-contrast': { enabled: false } } });
    expect(result.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });

  it('one h1; the controls are native, named and in tab order: Draft, Ping, Notify, Details', async () => {
    const el = await mount(createTestRecord());
    expect(el.querySelectorAll('h1')).toHaveLength(1);
    const controls = [...el.querySelectorAll<HTMLElement>('input, button')];
    expect(controls.map((c) => c.tabIndex)).toEqual([0, 0, 0, 0]);
    const name = (c: HTMLElement) =>
      c.textContent || el.querySelector(`label[for="${c.id}"]`)?.textContent;
    expect(controls.map(name)).toEqual(['Draft', 'Ping', 'Notify', 'Details']);
    controls[1]?.focus();
    expect(document.activeElement).toBe(controls[1]);
  });
});
