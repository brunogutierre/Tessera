import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { TesProgress } from './progress';

const meta: Meta<TesProgress> = {
  title: 'Components/Progress',
  component: TesProgress,
  argTypes: {
    tone: { control: 'inline-radio', options: ['primary', 'success', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    value: { control: { type: 'range', min: 0, max: 100 } },
  },
  args: {
    label: 'Uploading statements',
    value: 64,
    max: 100,
    tone: 'primary',
    size: 'md',
    showValue: true,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Progress bar with `role="progressbar"`, value range and a localized percentage. Without a value it is ' +
          'indeterminate (a sliding bar, or a pulse with reduced motion).',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesProgress>;

export const Playground: Story = {
  play: async ({ canvas }) => {
    const bar = canvas.getByRole('progressbar', { name: 'Uploading statements' });
    await expect(bar).toHaveAttribute('aria-valuenow', '64');
    await expect(bar).toHaveAttribute('aria-valuetext', '64%');
  },
};

export const Indeterminate: Story = { args: { value: undefined, label: 'Preparing report' } };

export const Tones: Story = {
  render: () => ({
    template: `
      <div class="sb-stack" style="max-inline-size: 28rem">
        <tes-progress label="Storage used" [value]="42" showValue />
        <tes-progress label="Goal reached" tone="success" [value]="100" showValue />
        <tes-progress label="Budget used" tone="warning" [value]="86" showValue />
        <tes-progress label="Quota used" tone="danger" [value]="97" showValue size="sm" />
      </div>`,
  }),
};
