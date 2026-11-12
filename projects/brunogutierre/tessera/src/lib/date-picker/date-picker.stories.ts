import { moduleMetadata } from '@storybook/angular-vite';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { TesFormField } from '../form-field/form-field';
import { TesDatePicker } from './date-picker';

const meta: Meta<TesDatePicker> = {
  title: 'Components/Date picker',
  component: TesDatePicker,
  decorators: [moduleMetadata({ imports: [TesFormField] })],
  args: { value: '2026-11-10', disabled: false },
  render: (args) => ({
    props: args,
    template: `
      <tes-form-field label="Due date" hint="Type it or pick it from the calendar." style="max-inline-size: 16rem">
        <tes-date-picker [(value)]="value" [min]="min" [max]="max" [disabled]="disabled" />
      </tes-form-field>`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'Date field with a calendar dialog (APG date picker dialog). Type the date in the locale format, or ' +
          'open the calendar: focus starts on the selected day, Escape closes, focus returns to the button. ' +
          '`value` is an ISO date (`YYYY-MM-DD`) or `null`; a Signal Forms `FormValueControl`.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesDatePicker>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: /Due date/ });
    await userEvent.clear(input);
    await userEvent.type(input, '12/24/2026');
    await userEvent.tab();
    await expect(
      await canvas.findByRole('button', { name: 'Choose date, December 24, 2026' }),
    ).toBeVisible();
  },
};

export const Open: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Choose date/ }));
    await expect(await canvas.findByRole('dialog', { name: 'Choose date' })).toBeVisible();
  },
};

export const Disabled: Story = { args: { disabled: true } };
