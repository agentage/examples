// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { createStateStore } from '@agentage/extension/app';
import { createTestRecord, TestHost } from '@agentage/extension/app/test-host';
import App from './app/index.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
afterEach(() => {
  act(() => root?.unmount());
  document.body.innerHTML = '';
});

const mount = async (store: ReturnType<typeof createStateStore>) => {
  const el = document.body.appendChild(document.createElement('div'));
  root = createRoot(el);
  await act(async () =>
    root?.render(
      <TestHost id="fixture" user={null} scopes={[]} record={createTestRecord()} store={store}>
        <App />
      </TestHost>
    )
  );
  return el;
};

const type = async (input: HTMLInputElement, text: string) => {
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  await act(async () => {
    set?.call(input, text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
};

describe('the fixture app part (S1.2.2 row 9)', () => {
  it('renders the heading and the Note input', async () => {
    const el = await mount(createStateStore());
    expect(el.querySelector('h1')?.textContent).toBe('Fixture');
    expect(el.querySelector('label')?.textContent).toBe('Note');
    expect(el.querySelector('input')?.value).toBe('');
  });

  it('the typed note is kept by the shell store across a remount', async () => {
    const store = createStateStore();
    const first = await mount(store);
    await type(first.querySelector('input') as HTMLInputElement, 'kept');
    act(() => root?.unmount());
    const second = await mount(store);
    expect(second.querySelector('input')?.value).toBe('kept');
  });
});
