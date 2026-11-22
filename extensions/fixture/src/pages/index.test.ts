import { createTestContext } from '@agentage/extension';
import { describe, expect, it } from 'vitest';
import { create } from './index.js';

describe('pages', () => {
  it('serves one static page at / with the id, version and commit, and no script', () => {
    const ctx = createTestContext();
    const site = create(ctx);
    expect(Object.keys(site)).toEqual(['/']);
    const { id, version, commit } = ctx.extension;
    expect(site['/']).toContain(`${id} ${version} · <code>${commit}</code>`);
    expect(site['/']).not.toContain('<script');
  });
});
