// Runs the story tests once per theme and mode, one after the other: six parallel Vite servers
// and browsers need more memory than a laptop or a CI runner comfortably has.
// Usage: node scripts/test-stories.mjs [theme-mode ...] [-- vitest args]
import { spawnSync } from 'node:child_process';

const ALL = ['enterprise', 'fintech', 'care'].flatMap((t) => [`${t}-light`, `${t}-dark`]);
const separator = process.argv.indexOf('--');
const selected = process.argv.slice(2, separator === -1 ? undefined : separator);
const vitestArgs = separator === -1 ? [] : process.argv.slice(separator + 1);
const combos = selected.length > 0 ? selected : ALL;

const failed = combos.filter((combo) => {
  const [theme, mode] = combo.split('-');
  console.log(`\n▶ Stories: ${combo}`);
  const result = spawnSync(
    'node_modules/.bin/vitest',
    ['run', '--config', 'vitest.storybook.config.mts', ...vitestArgs],
    { stdio: 'inherit', env: { ...process.env, TES_THEME: theme, TES_MODE: mode } },
  );
  return result.status !== 0;
});

if (failed.length > 0) {
  console.error(`\n✖ Story tests failed for: ${failed.join(', ')}`);
  process.exit(1);
}
console.log(`\n✔ Story tests passed for: ${combos.join(', ')}`);
