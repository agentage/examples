import { type PagesContext } from '@agentage/extension';

const page = ({ id, version, commit }: PagesContext['extension']) =>
  [
    '<!doctype html>',
    `<html lang="en"><head><meta charset="utf-8"><title>${id}</title>`,
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<style>body{font:16px/1.5 system-ui,sans-serif;margin:2rem}</style></head>',
    `<body><main><h1>${id}</h1><p>${id} ${version} · <code>${commit}</code></p></main></body></html>`,
  ].join('\n');

// The pages part: one static page with the id, version and commit; no script.
export function create(ctx: PagesContext) {
  return { '/': page(ctx.extension) };
}
