import type { StorybookConfig } from '@storybook/angular-vite';
import remarkGfm from 'remark-gfm';

const config: StorybookConfig = {
  stories: [
    '../projects/brunogutierre/tessera/src/**/*.mdx',
    '../projects/brunogutierre/tessera/src/**/*.stories.ts',
  ],
  addons: [
    {
      name: '@storybook/addon-docs',
      // MDX supports GitHub-flavored Markdown (tables, task lists) only through remark-gfm.
      options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } },
    },
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/angular-vite',
    options: { tsconfig: '.storybook/tsconfig.json' },
  },
  core: { disableTelemetry: true },
};

export default config;
