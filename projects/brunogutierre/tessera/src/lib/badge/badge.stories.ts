import { moduleMetadata } from '@storybook/angular-vite';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { TesIcon } from '../icon/icon';
import { TesBadge } from './badge';

const TONES = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'];

const meta: Meta<TesBadge> = {
  title: 'Components/Badge',
  component: TesBadge,
  decorators: [moduleMetadata({ imports: [TesIcon] })],
  argTypes: {
    tone: { control: 'select', options: TONES },
    variant: { control: 'inline-radio', options: ['subtle', 'solid'] },
  },
  args: { tone: 'success', variant: 'subtle' },
  render: (args) => ({
    props: args,
    template: `<tes-badge [tone]="tone" [variant]="variant">Paid</tes-badge>`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'Short status or count label. Six tones, subtle or solid. The text always states the status, ' +
          'so meaning never depends on color alone.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesBadge>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => ({
    props: { tones: TONES },
    template: `
      <div class="sb-stack">
        <div class="sb-row">
          @for (tone of tones; track tone) { <tes-badge [tone]="tone">{{ tone }}</tes-badge> }
        </div>
        <div class="sb-row">
          @for (tone of tones; track tone) { <tes-badge [tone]="tone" variant="solid">{{ tone }}</tes-badge> }
        </div>
      </div>`,
  }),
};

export const WithIcon: Story = {
  render: () => ({
    template: `
      <div class="sb-row">
        <tes-badge tone="success"><tes-icon name="circle-check" />Approved</tes-badge>
        <tes-badge tone="warning"><tes-icon name="clock" />Pending review</tes-badge>
        <tes-badge tone="danger"><tes-icon name="circle-x" />Rejected</tes-badge>
      </div>`,
  }),
};

export const Count: Story = {
  render: () => ({
    template: `<p class="sb-row">Unread messages <tes-badge tone="primary" variant="solid">12</tes-badge></p>`,
  }),
};
