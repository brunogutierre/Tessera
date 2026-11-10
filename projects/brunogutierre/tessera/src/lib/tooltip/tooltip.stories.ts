import { moduleMetadata } from '@storybook/angular-vite';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { TesButton } from '../button/button';
import { TesIcon } from '../icon/icon';
import { TesTooltip } from './tooltip';

const meta: Meta<TesTooltip> = {
  title: 'Components/Tooltip',
  component: TesTooltip,
  decorators: [moduleMetadata({ imports: [TesButton, TesIcon] })],
  render: () => ({
    template: `
      <div class="sb-row" style="padding: 3rem 4rem">
        <button tes-button iconOnly variant="outline" aria-label="Export" tesTooltip="Export as CSV"><tes-icon name="download" /></button>
        <button tes-button iconOnly variant="outline" aria-label="Filter" tesTooltip="Filter by status, region and amount"><tes-icon name="filter" /></button>
        <button tes-button variant="ghost" tesTooltip="Sum of settled transactions, in USD">Net volume</button>
      </div>`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          "Short description on hover and keyboard focus (`[tesTooltip]`). The text is always the host's " +
          'accessible description; Escape dismisses it, and the pointer can move onto it (WCAG 1.4.13). Never ' +
          'put essential or interactive content in a tooltip.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesTooltip>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Export' });
    await expect(button).toHaveAccessibleDescription('Export as CSV');
  },
};

export const OnFocus: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Export' })).toHaveFocus();
  },
};
