import { moduleMetadata } from '@storybook/angular-vite';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { TesChoice } from '../choice/choice';
import { TesFieldset } from '../fieldset/fieldset';
import { TesCheckbox } from './checkbox';

const meta: Meta<TesCheckbox> = {
  title: 'Components/Checkbox',
  component: TesCheckbox,
  subcomponents: { TesChoice, TesFieldset },
  decorators: [moduleMetadata({ imports: [TesChoice, TesFieldset] })],
  render: () => ({
    template: `<label tes-choice><input type="checkbox" tes-checkbox /> Email me a copy of each invoice</label>`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'Native checkbox (`input[type=checkbox][tes-checkbox]`) inside `label[tes-choice]`. Checked, indeterminate, ' +
          'disabled and form binding stay native. The mark is cut out of the filled box with a CSS mask, so it shows ' +
          'the surface behind it in every theme and mode.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesCheckbox>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const box = canvas.getByRole('checkbox', { name: 'Email me a copy of each invoice' });
    await userEvent.click(canvas.getByText('Email me a copy of each invoice'));
    await expect(box).toBeChecked();
  },
};

export const States: Story = {
  render: () => ({
    props: { mixed: true },
    template: `
      <div class="sb-stack">
        <label tes-choice><input type="checkbox" tes-checkbox /> Unchecked</label>
        <label tes-choice><input type="checkbox" tes-checkbox checked /> Checked</label>
        <label tes-choice><input type="checkbox" tes-checkbox [indeterminate]="mixed" /> Indeterminate</label>
        <label tes-choice><input type="checkbox" tes-checkbox aria-invalid="true" /> Invalid</label>
        <label tes-choice><input type="checkbox" tes-checkbox disabled /> Disabled</label>
        <label tes-choice><input type="checkbox" tes-checkbox disabled checked /> Disabled and checked</label>
      </div>`,
  }),
};

export const Group: Story = {
  render: () => ({
    template: `
      <fieldset tes-fieldset legend="Notify me about" hint="You can change this later in Settings.">
        <label tes-choice><input type="checkbox" tes-checkbox checked /> Large transfers</label>
        <label tes-choice><input type="checkbox" tes-checkbox /> Failed payments</label>
        <label tes-choice><input type="checkbox" tes-checkbox /> Monthly statements</label>
      </fieldset>`,
  }),
};
