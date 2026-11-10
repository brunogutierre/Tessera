import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { storybookAngularVitest } from '@storybook/angular-vite/vitest';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Runs every story as a browser test: it must render, its play function must pass and axe must
 * report no WCAG violations. Kept out of `vitest.config.*` on purpose so `ng test` never loads it.
 */
export default defineConfig({
  plugins: [
    storybookAngularVitest({ zoneless: true, tsConfig: '.storybook/tsconfig.json' }),
    storybookTest({ configDir: path.join(dirname, '.storybook') }),
  ],
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({}),
      instances: [{ browser: 'chromium' }],
    },
  },
});
