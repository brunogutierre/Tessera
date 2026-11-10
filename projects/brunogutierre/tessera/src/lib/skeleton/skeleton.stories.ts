import { moduleMetadata } from '@storybook/angular-vite';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { TesCard } from '../card/card';
import { TesSkeleton } from './skeleton';

const meta: Meta<TesSkeleton> = {
  title: 'Components/Skeleton',
  component: TesSkeleton,
  decorators: [moduleMetadata({ imports: [TesCard] })],
  argTypes: { shape: { control: 'inline-radio', options: ['text', 'rect', 'circle'] } },
  args: { shape: 'text', lines: 3 },
  parameters: {
    docs: {
      description: {
        component:
          'Loading placeholder, always `aria-hidden`. Put `aria-busy="true"` on the region that is loading. ' +
          'The shimmer stops with reduced motion.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesSkeleton>;

export const Playground: Story = {};

export const CardPlaceholder: Story = {
  render: () => ({
    template: `
      <section tes-card style="max-inline-size: 22rem" aria-busy="true" aria-label="Loading patient">
        <div class="sb-row" style="flex-wrap: nowrap">
          <tes-skeleton shape="circle" width="3rem" />
          <tes-skeleton lines="2" />
        </div>
        <tes-skeleton shape="rect" height="7rem" style="margin-block-start: var(--tes-space-4)" />
      </section>`,
  }),
};
