// Fails when the parts table in extending.mdx and the component templates disagree, so the public
// styling API cannot change without the docs (and a breaking-change note) changing too.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = 'projects/brunogutierre/tessera/src';
const doc = readFileSync(join(root, 'docs/extending.mdx'), 'utf8');
const names = (cell) => [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1]).sort();

const documented = new Map();
for (const line of doc.split('\n')) {
  const cells = line.split('|').map((c) => c.trim());
  const dir = /^`([a-z-]+)`$/.exec(cells[1] ?? '')?.[1];
  if (dir && cells.length === 6) documented.set(dir, names(cells[4]));
}

const errors = [];
for (const dir of readdirSync(join(root, 'lib'), { withFileTypes: true })) {
  if (!dir.isDirectory() || dir.name === 'core') continue;
  const source = readdirSync(join(root, 'lib', dir.name))
    .filter((f) => f.endsWith('.html') || (f.endsWith('.ts') && !/\.(spec|stories)\.ts$/.test(f)))
    .map((f) => readFileSync(join(root, 'lib', dir.name, f), 'utf8'))
    .join('\n');
  const parts = [...new Set([...source.matchAll(/data-tes-part="([^"]+)"/g)].map((m) => m[1]))];
  const expected = documented.get(dir.name);
  if (!expected) errors.push(`${dir.name}: missing from the parts table`);
  else if (parts.sort().join() !== expected.join())
    errors.push(`${dir.name}: templates have [${parts}], docs list [${expected}]`);
}

if (errors.length) {
  console.error(`Styling parts out of sync:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`Styling parts match the docs (${documented.size} components).`);
