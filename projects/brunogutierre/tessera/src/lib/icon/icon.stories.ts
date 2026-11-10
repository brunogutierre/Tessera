import type { Meta, StoryObj } from '@storybook/angular-vite';
import { TesIcon } from './icon';
import { TES_ICONS } from './icons';

const NAMES = Object.keys(TES_ICONS);

const meta: Meta<TesIcon> = {
  title: 'Components/Icon',
  component: TesIcon,
  argTypes: { name: { control: 'select', options: NAMES } },
  args: { name: 'circle-check' },
  parameters: {
    docs: {
      description: {
        component:
          'Inline SVG icons adapted from Lucide (ISC). Decorative by default; pass `label` when the icon alone ' +
          'carries meaning. Size follows the font size, or `--tes-icon-size`.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesIcon>;

export const Playground: Story = {};

export const Labelled: Story = {
  args: { name: 'triangle-alert', label: 'Warning' },
};

export const Gallery: Story = {
  render: () => ({
    props: { names: NAMES },
    template: `
      <div class="sb-grid" style="--tes-icon-size: 1.5rem">
        @for (name of names; track name) {
          <div class="sb-row"><tes-icon [name]="name" /><code>{{ name }}</code></div>
        }
      </div>`,
  }),
};
