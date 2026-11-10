import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

interface IndexEntry {
  id: string;
  title: string;
  type: 'story' | 'docs';
}

const index = JSON.parse(
  readFileSync(resolve(__dirname, '../storybook-static/index.json'), 'utf8'),
) as { entries: Record<string, IndexEntry> };
const stories = Object.values(index.entries).filter((entry) => entry.type === 'story');

/** The first story of each component: its playground or default state. */
const firstPerTitle = new Map<string, IndexEntry>();
for (const story of stories) {
  if (story.title !== 'Showcase' && !firstPerTitle.has(story.title)) {
    firstPerTitle.set(story.title, story);
  }
}
const showcases = stories.filter((story) => story.title === 'Showcase');

/** Stories whose play function opens an overlay, so open panels are covered too. */
const OPEN_OVERLAYS = ['components-select--open', 'components-menu--open'];
for (const id of OPEN_OVERLAYS) {
  const story = stories.find((entry) => entry.id === id);
  if (story) firstPerTitle.set(`${story.title} (open)`, story);
}

/** Waits until the story rendered, fonts loaded and its play function had time to finish. */
async function settle(page: Page): Promise<void> {
  await page.waitForFunction(
    () => (document.querySelector('#storybook-root')?.childElementCount ?? 0) > 0,
  );
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
}

// Every component in the light Enterprise theme and in the dark-first Fintech theme.
for (const [theme, mode] of [
  ['enterprise', 'light'],
  ['fintech', 'dark'],
] as const) {
  test.describe(`${theme} ${mode}`, () => {
    for (const story of firstPerTitle.values()) {
      test(story.id, async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 768 });
        await page.goto(
          `/iframe.html?id=${story.id}&viewMode=story&globals=theme:${theme};mode:${mode}`,
        );
        await settle(page);
        await expect(page).toHaveScreenshot(`${theme}-${mode}/${story.id}.png`);
      });
    }
  });
}

// MDX documentation pages: they render Markdown (tables need remark-gfm), not components.
const DOC_PAGES = ['introduction--docs', 'foundations-theming--docs'];
test.describe('docs', () => {
  for (const id of DOC_PAGES) {
    test(id, async ({ page }) => {
      await page.setViewportSize({ width: 1100, height: 900 });
      await page.goto(`/iframe.html?id=${id}&viewMode=docs&globals=theme:enterprise;mode:light`);
      await page.waitForSelector('#storybook-docs table');
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot(`docs/${id}.png`, { fullPage: true });
    });
  }
});

// Whole screens: each showcase pins its theme; check both modes.
for (const mode of ['light', 'dark'] as const) {
  test.describe(`showcase ${mode}`, () => {
    for (const story of showcases) {
      test(story.id, async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 900 });
        await page.goto(`/iframe.html?id=${story.id}&viewMode=story&globals=mode:${mode}`);
        await settle(page);
        await expect(page).toHaveScreenshot(`showcase-${mode}/${story.id}.png`, { fullPage: true });
      });
    }
  });
}
