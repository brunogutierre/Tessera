import { moduleMetadata } from '@storybook/angular-vite';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { TesButton } from '../button/button';
import { TesIcon } from '../icon/icon';
import { TesToolbar, TesToolbarItem, TesToolbarSeparator } from './toolbar';

const meta: Meta<TesToolbar> = {
  title: 'Components/Toolbar',
  component: TesToolbar,
  subcomponents: { TesToolbarItem, TesToolbarSeparator },
  decorators: [
    moduleMetadata({ imports: [TesToolbarItem, TesToolbarSeparator, TesButton, TesIcon] }),
  ],
  render: () => ({
    template: `
      <tes-toolbar aria-label="Invoice actions" style="inline-size: fit-content">
        <button tes-button tesToolbarItem variant="ghost"><tes-icon name="check" />Approve</button>
        <button tes-button tesToolbarItem variant="ghost"><tes-icon name="x" />Reject</button>
        <tes-toolbar-separator />
        <button tes-button tesToolbarItem variant="ghost" iconOnly aria-label="Download"><tes-icon name="download" /></button>
        <button tes-button tesToolbarItem variant="ghost" iconOnly aria-label="Delete" [disabled]="true"><tes-icon name="trash-2" /></button>
      </tes-toolbar>`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'Toolbar over `@angular/aria/toolbar`: a single tab stop; arrows (flipped in RTL), Home and End move ' +
          'between items marked `tesToolbarItem`. Disable items through that directive so the toolbar knows. ' +
          'Always give it an `aria-label`.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesToolbar>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    canvas.getByRole('button', { name: 'Approve' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('button', { name: 'Reject' })).toHaveFocus();
  },
};

export const RightToLeft: Story = { globals: { dir: 'rtl' } };
