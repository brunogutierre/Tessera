import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { TesSpinner } from './spinner';

const meta: Meta<TesSpinner> = {
  title: 'Components/Spinner',
  component: TesSpinner,
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  args: { size: 'md', decorative: false },
  parameters: {
    docs: {
      description: {
        component:
          'Indeterminate loading indicator (`role="progressbar"`). Named "Loading" by default (from `TES_LABELS`). ' +
          'With reduced motion it pulses instead of spinning.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesSpinner>;

export const Playground: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('progressbar', { name: 'Loading' })).toBeVisible();
  },
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="sb-row">
        <tes-spinner size="sm" label="Loading small" />
        <tes-spinner label="Loading medium" />
        <tes-spinner size="lg" label="Loading large" />
      </div>`,
  }),
};

export const InContext: Story = {
  render: () => ({
    template: `<p class="sb-row"><tes-spinner size="sm" decorative />Syncing 1,204 transactions…</p>`,
  }),
};
