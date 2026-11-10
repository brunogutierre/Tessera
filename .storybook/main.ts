import type { StorybookConfig } from '@storybook/angular-vite';

const config: StorybookConfig = {
  stories: [
    '../projects/brunogutierre/tessera/src/**/*.mdx',
    '../projects/brunogutierre/tessera/src/**/*.stories.ts',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: {
    name: '@storybook/angular-vite',
    options: { tsconfig: '.storybook/tsconfig.json' },
  },
  core: { disableTelemetry: true },
};

export default config;
