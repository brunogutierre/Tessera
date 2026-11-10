import { moduleMetadata } from '@storybook/angular-vite';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { TesFormField } from '../form-field/form-field';
import { TesSelect } from './select';
import type { TesOption } from './select';

const SPECIALTIES: TesOption[] = [
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'neurology', label: 'Neurology', disabled: true },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'orthopedics', label: 'Orthopedics' },
];

const meta: Meta<TesSelect> = {
  title: 'Components/Select',
  component: TesSelect,
  decorators: [moduleMetadata({ imports: [TesFormField] })],
  args: {
    options: SPECIALTIES,
    placeholder: 'Choose a specialty',
    multiple: false,
    disabled: false,
  },
  render: (args) => ({
    props: { ...args, value: null },
    template: `
      <tes-form-field label="Specialty" hint="Neurology has no openings this month." style="max-inline-size: 20rem">
        <tes-select [options]="options" [placeholder]="placeholder" [multiple]="multiple" [disabled]="disabled" [(value)]="value" />
      </tes-form-field>`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'Select-only combobox over `@angular/aria` (combobox + listbox popup with active descendant focus and ' +
          'typeahead) in an inline CDK popover. A Signal Forms `FormValueControl`: `[formField]`, `[formControl]` ' +
          'and `[(ngModel)]` bind it without a value accessor. Inside `tes-form-field` it is labelled, described ' +
          'and marked invalid automatically.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesSelect>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const combobox = canvas.getByRole('combobox', { name: 'Specialty' });
    await userEvent.click(combobox);
    const listbox = await canvas.findByRole('listbox');
    await expect(listbox).toBeVisible();
    await userEvent.click(canvas.getByRole('option', { name: 'Pediatrics' }));
    await expect(combobox).toHaveTextContent('Pediatrics');
    await expect(combobox).toHaveAttribute('aria-expanded', 'false');
  },
};

export const Multiple: Story = { args: { multiple: true, placeholder: 'Choose specialties' } };

export const Disabled: Story = { args: { disabled: true } };

export const Open: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox', { name: 'Specialty' }));
    await expect(await canvas.findByRole('listbox')).toBeVisible();
  },
};
