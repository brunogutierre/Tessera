import { moduleMetadata } from '@storybook/angular-vite';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { TesChoice } from '../choice/choice';
import { TesFieldset } from '../fieldset/fieldset';
import { TesRadio } from './radio';

const meta: Meta<TesFieldset> = {
  title: 'Components/Radio',
  component: TesFieldset,
  subcomponents: { TesRadio, TesChoice },
  decorators: [moduleMetadata({ imports: [TesRadio, TesChoice] })],
  argTypes: { orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] } },
  args: {
    legend: 'Appointment type',
    hint: 'Video visits need a camera and a quiet room.',
    error: '',
    orientation: 'vertical',
  },
  render: (args) => ({
    props: args,
    template: `
      <fieldset tes-fieldset [legend]="legend" [hint]="hint" [error]="error" [orientation]="orientation">
        <label tes-choice><input type="radio" tes-radio name="visit" value="clinic" checked /> In the clinic</label>
        <label tes-choice><input type="radio" tes-radio name="visit" value="video" /> Video visit</label>
        <label tes-choice><input type="radio" tes-radio name="visit" value="phone" /> Phone call</label>
        <label tes-choice><input type="radio" tes-radio name="visit" value="home" disabled /> Home visit (unavailable)</label>
      </fieldset>`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'Native radios (`input[type=radio][tes-radio]`) grouped by `name` in `fieldset[tes-fieldset]`, which renders ' +
          'the legend, hint and error and describes the group with them. Arrow keys and the single tab stop come ' +
          'from the browser.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesFieldset>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const group = canvas.getByRole('group', { name: 'Appointment type' });
    await expect(group).toHaveAccessibleDescription('Video visits need a camera and a quiet room.');
    canvas.getByRole('radio', { name: 'In the clinic' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('radio', { name: 'Video visit' })).toBeChecked();
  },
};

export const Horizontal: Story = { args: { orientation: 'horizontal', hint: '' } };

export const WithError: Story = { args: { error: 'Choose how you want to meet the doctor' } };

export const RightToLeft: Story = { globals: { dir: 'rtl' } };
