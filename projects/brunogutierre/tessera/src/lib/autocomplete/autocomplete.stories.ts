import { moduleMetadata } from '@storybook/angular-vite';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { TesFormField } from '../form-field/form-field';
import type { TesOption } from '../select/select';
import { TesAutocomplete } from './autocomplete';

const TICKERS: TesOption[] = [
  { value: 'AAPL', label: 'AAPL · Apple' },
  { value: 'MSFT', label: 'MSFT · Microsoft' },
  { value: 'NVDA', label: 'NVDA · NVIDIA' },
  { value: 'PETR4', label: 'PETR4 · Petrobras' },
  { value: 'VALE3', label: 'VALE3 · Vale' },
  { value: 'ITUB4', label: 'ITUB4 · Itaú Unibanco' },
  { value: 'TSLA', label: 'TSLA · Tesla', disabled: true },
];

const meta: Meta<TesAutocomplete> = {
  title: 'Components/Autocomplete',
  component: TesAutocomplete,
  decorators: [moduleMetadata({ imports: [TesFormField] })],
  args: { options: TICKERS, placeholder: 'Ticker or company', disabled: false },
  render: (args) => ({
    props: { ...args, value: null },
    template: `
      <tes-form-field label="Instrument" hint="Trading for TSLA is halted." style="max-inline-size: 22rem">
        <tes-autocomplete [options]="options" [placeholder]="placeholder" [disabled]="disabled" [(value)]="value" />
      </tes-form-field>`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'Editable combobox: a real `<input tes-input>` that suggests options as you type (case- and ' +
          'accent-insensitive by default; pass `filter` to change it). `value` is the chosen option, or `null` ' +
          'while the text matches no choice. Keyboard and ARIA from `@angular/aria`; a Signal Forms ' +
          '`FormValueControl`.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesAutocomplete>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('combobox', { name: 'Instrument' });
    await userEvent.type(input, 'vale');
    const option = await canvas.findByRole('option', { name: 'VALE3 · Vale' });
    await userEvent.click(option);
    await expect(input).toHaveValue('VALE3 · Vale');
  },
};

export const NoResults: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole('combobox', { name: 'Instrument' }), 'zzz');
    await expect(await canvas.findByRole('status')).toHaveTextContent('No results');
  },
};

export const Disabled: Story = { args: { disabled: true } };
