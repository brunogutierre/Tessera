import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { storybookAngularVitest } from '@storybook/angular-vite/vitest';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const theme = process.env['TES_THEME'] ?? 'enterprise';
const mode = process.env['TES_MODE'] ?? 'light';

/**
 * Runs every story as a browser test: it must render, its play function must pass and axe must
 * report no WCAG violations. `scripts/test-stories.mjs` runs it once per theme and mode
 * (TES_THEME, TES_MODE); `__TES_GLOBALS__` sets the initial toolbar globals in preview.ts.
 *
 * Kept out of `vitest.config.*` on purpose so `ng test` never loads it.
 */
export default defineConfig({
  plugins: [
    storybookAngularVitest({ zoneless: true, tsConfig: '.storybook/tsconfig.json' }),
    storybookTest({ configDir: path.join(dirname, '.storybook') }),
  ],
  define: { __TES_GLOBALS__: JSON.stringify({ theme, mode }) },
  test: {
    name: `${theme}-${mode}`,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({}),
      instances: [{ browser: 'chromium' }],
    },
  },
});
