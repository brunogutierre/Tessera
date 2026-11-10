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
  // Pre-bundle every entry point stories import, so Vite never discovers one mid-run and reloads.
  optimizeDeps: {
    include: [
      '@angular/forms',
      '@angular/forms/signals',
      '@angular/cdk/a11y',
      '@angular/cdk/bidi',
      '@angular/cdk/overlay',
      '@angular/cdk/portal',
      '@angular/cdk/dialog',
      '@angular/aria/menu',
      '@angular/aria/listbox',
      '@angular/aria/combobox',
      '@angular/aria/tabs',
      '@angular/aria/accordion',
      '@angular/aria/toolbar',
      '@angular/aria/tree',
      '@angular/aria/grid',
      'storybook/test',
    ],
  },
  test: {
    name: `${theme}-${mode}`,
    // One story file at a time: parallel iframes crash Chromium on machines short of memory.
    fileParallelism: false,
    browser: {
      enabled: true,
      headless: true,
      // Reduced motion: axe never measures colors halfway through a transition or an enter animation.
      provider: playwright({ contextOptions: { reducedMotion: 'reduce' } }),
      instances: [{ browser: 'chromium' }],
    },
  },
});
