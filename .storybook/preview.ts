// Fonts are a Storybook concern only: the package ships none and its tokens fall back to system
// stacks. Loading them locally (not from a CDN) also keeps visual tests deterministic.
import '@fontsource-variable/ibm-plex-sans';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import '@fontsource-variable/nunito';
import '../projects/brunogutierre/tessera/styles/tessera.css';
import './storybook.css';

import { applicationConfig } from '@storybook/angular-vite';
import type { Decorator, Preview } from '@storybook/angular-vite';
import { provideTessera } from '../projects/brunogutierre/tessera/src/public-api';

/** Set by the story test runner (vitest.storybook.config.mts) to test each theme and mode. */
declare const __TES_GLOBALS__: { theme: string; mode: string } | undefined;
const testGlobals = typeof __TES_GLOBALS__ === 'undefined' ? undefined : __TES_GLOBALS__;

/**
 * Mirrors the toolbar globals onto <html>, exactly like a static `data-tes-*` attribute in an
 * app's index.html. `TesseraTheme` reads them at startup, so stories and the service agree.
 */
const withTessera: Decorator = (story, context) => {
  const root = document.documentElement;
  const { theme, mode, dir } = context.globals as Record<string, string>;
  root.dataset['tesTheme'] = theme ?? 'enterprise';
  root.dataset['tesMode'] = mode ?? 'light';
  root.dir = dir ?? 'ltr';
  return story();
};

const preview: Preview = {
  decorators: [withTessera, applicationConfig({ providers: [provideTessera()] })],
  globalTypes: {
    theme: {
      description: 'Tessera theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        dynamicTitle: true,
        items: [
          { value: 'enterprise', title: 'Enterprise' },
          { value: 'fintech', title: 'Fintech' },
          { value: 'care', title: 'Care' },
        ],
      },
    },
    mode: {
      description: 'Color mode',
      toolbar: {
        title: 'Mode',
        icon: 'mirror',
        dynamicTitle: true,
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'system', title: 'System', icon: 'browser' },
        ],
      },
    },
    dir: {
      description: 'Text direction',
      toolbar: {
        title: 'Direction',
        icon: 'transfer',
        dynamicTitle: true,
        items: [
          { value: 'ltr', title: 'Left to right' },
          { value: 'rtl', title: 'Right to left' },
        ],
      },
    },
  },
  initialGlobals: { theme: 'enterprise', mode: 'light', dir: 'ltr', ...testGlobals },
  parameters: {
    layout: 'padded',
    controls: { expanded: true, sort: 'requiredFirst' },
    a11y: {
      // Violations fail the story tests in CI, not just the panel.
      test: 'error',
      options: {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
      },
    },
    backgrounds: { disable: true },
    options: {
      storySort: {
        order: ['Introduction', 'Foundations', 'Components', 'Showcase'],
      },
    },
  },
  tags: ['autodocs'],
};

export default preview;
