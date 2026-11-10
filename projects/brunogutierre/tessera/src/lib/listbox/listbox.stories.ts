import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import type { TesOption } from '../select/select';
import { TesListbox } from './listbox';

const COLUMNS: TesOption[] = [
  { value: 'date', label: 'Date' },
  { value: 'customer', label: 'Customer' },
  { value: 'amount', label: 'Amount' },
  { value: 'currency', label: 'Currency', disabled: true },
  { value: 'status', label: 'Status' },
];

const meta: Meta<TesListbox> = {
  title: 'Components/Listbox',
  component: TesListbox,
  args: { label: 'Visible columns', options: COLUMNS, multiple: true },
  render: (args) => ({
    props: { ...args, value: ['date', 'amount'] },
    template: `<tes-listbox [label]="label" [options]="options" [multiple]="multiple" [(value)]="value" style="max-inline-size: 16rem" />`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'Always-visible list over `@angular/aria/listbox`: one tab stop, arrows, Home/End and typeahead. Single ' +
          'selection follows focus; with `multiple`, Space or Enter toggles. Selected options show a check mark ' +
          'and a tinted background, never color alone.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesListbox>;

export const Multiple: Story = {
  play: async ({ canvas, userEvent }) => {
    const status = canvas.getByRole('option', { name: 'Status' });
    await userEvent.click(status);
    await expect(status).toHaveAttribute('aria-selected', 'true');
  },
};

export const Single: Story = {
  args: { label: 'Sort by', multiple: false },
  render: (args) => ({
    props: { ...args, value: 'date' },
    template: `<tes-listbox [label]="label" [options]="options" [(value)]="value" style="max-inline-size: 16rem" />`,
  }),
};
