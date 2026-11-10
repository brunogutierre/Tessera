import { defineConfig } from '@playwright/test';

/**
 * Visual regression of the built Storybook (`npm run build-storybook` first).
 *
 * Baselines are only comparable when rendered by the same browser build and system fonts, so tests
 * run inside the official Playwright image, locally (`npm run test:visual:container`) and in CI.
 */
export default defineConfig({
  testDir: '.',
  testMatch: '*.visual.ts',
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  fullyParallel: true,
  workers: 2,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: '../playwright-report' }]],
  outputDir: '../test-results',
  use: {
    baseURL: 'http://127.0.0.1:6108',
    reducedMotion: 'reduce',
    deviceScaleFactor: 1,
  },
  expect: {
    // A tight per-pixel threshold: a design system must notice a subtle surface color change.
    // Rendering in one container image leaves no noise to tolerate.
    toHaveScreenshot: {
      threshold: 0.02,
      maxDiffPixelRatio: 0.001,
      animations: 'disabled',
      caret: 'hide',
    },
  },
  webServer: {
    command: 'node visual/serve.mjs storybook-static 6108',
    url: 'http://127.0.0.1:6108/index.json',
    reuseExistingServer: !process.env['CI'],
    cwd: '..',
  },
});
