import { moduleMetadata } from '@storybook/angular-vite';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { TesCard } from '../card/card';
import { TesStat } from './stat';

const meta: Meta<TesStat> = {
  title: 'Components/Stat',
  component: TesStat,
  decorators: [moduleMetadata({ imports: [TesCard] })],
  argTypes: {
    positive: { control: 'inline-radio', options: ['up', 'down'] },
    delta: { control: { type: 'number', step: 0.01 } },
  },
  args: {
    label: 'Revenue',
    value: '$1.24M',
    delta: 0.125,
    deltaLabel: 'vs last month',
    positive: 'up',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Key figure with an optional change. `delta` is a ratio formatted for the locale; `positive` says ' +
          'which direction is good (it picks the color), and the direction is also spoken ("increase").',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesStat>;

export const Playground: Story = {};

export const Dashboard: Story = {
  render: () => ({
    template: `
      <div class="sb-grid">
        <tes-card><tes-stat label="Revenue" value="$1.24M" [delta]="0.125" deltaLabel="vs last month" /></tes-card>
        <tes-card><tes-stat label="Operating costs" value="$412K" [delta]="0.031" positive="down" deltaLabel="vs last month" /></tes-card>
        <tes-card><tes-stat label="Churn" value="2.1%" [delta]="-0.004" positive="down" deltaLabel="vs last month" /></tes-card>
        <tes-card><tes-stat label="Active accounts" value="18,204" [delta]="0" deltaLabel="vs last month" /></tes-card>
      </div>`,
  }),
};
