import { moduleMetadata } from '@storybook/angular-vite';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { TesBadge } from '../badge/badge';
import { TesButton } from '../button/button';
import { TesCard } from './card';

const meta: Meta<TesCard> = {
  title: 'Components/Card',
  component: TesCard,
  decorators: [moduleMetadata({ imports: [TesButton, TesBadge] })],
  argTypes: { variant: { control: 'inline-radio', options: ['outlined', 'elevated', 'filled'] } },
  args: { variant: 'outlined' },
  render: (args) => ({
    props: args,
    template: `
      <tes-card [variant]="variant" style="max-inline-size: 22rem">
        <h3 tesCardHeader style="margin: 0; font-size: inherit">Invoice INV-2026-0184</h3>
        <p style="margin: 0">Acme Corp · due 30 Nov 2026</p>
        <p style="margin: 0; font-size: var(--tes-text-2xl); font-weight: var(--tes-weight-semibold)">$12,480.00</p>
        <div tesCardFooter class="sb-row" style="inline-size: 100%">
          <tes-badge tone="warning">Pending</tes-badge>
          <span style="flex: 1"></span>
          <button tes-button variant="ghost" size="sm">View</button>
          <button tes-button variant="primary" size="sm">Approve</button>
        </div>
      </tes-card>`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'Groups related content. Mark the optional header and footer with `tesCardHeader` and `tesCardFooter`; ' +
          'empty regions collapse. Use `article[tes-card]` or `section[tes-card]` for semantics.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesCard>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => ({
    template: `
      <div class="sb-grid">
        <tes-card variant="outlined"><strong>Outlined</strong><p>Default. Border on surface.</p></tes-card>
        <tes-card variant="elevated"><strong>Elevated</strong><p>Raised surface with shadow.</p></tes-card>
        <tes-card variant="filled"><strong>Filled</strong><p>Sunken surface, no border.</p></tes-card>
      </div>`,
  }),
};
