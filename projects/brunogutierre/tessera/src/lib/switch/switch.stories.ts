import { moduleMetadata } from '@storybook/angular-vite';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { TesChoice } from '../choice/choice';
import { TesSwitch } from './switch';

const meta: Meta<TesSwitch> = {
  title: 'Components/Switch',
  component: TesSwitch,
  decorators: [moduleMetadata({ imports: [TesChoice] })],
  render: () => ({
    template: `
      <div class="sb-stack">
        <label tes-choice><input type="checkbox" tes-switch checked /> Price alerts</label>
        <label tes-choice><input type="checkbox" tes-switch /> Two-factor login</label>
        <label tes-choice><input type="checkbox" tes-switch disabled /> Beta features (admins only)</label>
      </div>`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'A native checkbox announced as a switch (`role="switch"`). Use it for settings that apply at once; use a ' +
          'checkbox for choices submitted with a form. The knob starts on the inline-start side, so it mirrors in RTL.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesSwitch>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('switch', { name: 'Two-factor login' });
    await userEvent.click(toggle);
    await expect(toggle).toBeChecked();
  },
};

export const RightToLeft: Story = { globals: { dir: 'rtl' } };
