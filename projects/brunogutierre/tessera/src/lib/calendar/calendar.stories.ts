import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { TesCalendar } from './calendar';

const meta: Meta<TesCalendar> = {
  title: 'Components/Calendar',
  component: TesCalendar,
  // A fixed "today" keeps the story (and its screenshot) the same on any day.
  args: { value: '2026-11-10', today: '2026-11-12' },
  render: (args) => ({
    props: args,
    template: `<tes-calendar [(value)]="value" [today]="today" [min]="min" [max]="max" />`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'Month grid to pick one ISO date (`YYYY-MM-DD`). APG date grid keyboard: arrows move by day and week ' +
          '(flipped in RTL), Home/End go to the week edges, Page Up/Down change the month, with Shift the year. ' +
          'Names and the first day of the week come from `LOCALE_ID`. Today has an outline, the selection a fill.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesCalendar>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Friday, November 20, 2026' }));
    await expect(canvas.getByRole('gridcell', { selected: true })).toHaveTextContent('20');
  },
};

export const WithLimits: Story = { args: { min: '2026-11-05', max: '2026-11-25' } };

export const RightToLeft: Story = { globals: { dir: 'rtl' } };
