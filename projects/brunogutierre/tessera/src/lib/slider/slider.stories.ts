import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { TesSlider } from './slider';

const meta: Meta<TesSlider> = {
  title: 'Components/Slider',
  component: TesSlider,
  render: () => ({
    props: { risk: 6 },
    template: `
      <div class="sb-stack" style="max-inline-size: 24rem">
        <label for="risk">Risk tolerance: {{ risk }} of 10</label>
        <input id="risk" type="range" tes-slider min="0" max="10" [value]="risk" (input)="risk = $any($event.target).valueAsNumber" />
        <label for="volume">Disabled</label>
        <input id="volume" type="range" tes-slider value="30" disabled />
      </div>`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'Native range input (`input[type=range][tes-slider]`). The filled track follows the value, including values ' +
          'written by a form. With Signal Forms, declare `min()` and `max()` in the schema instead of attributes.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesSlider>;

export const Default: Story = {
  play: async ({ canvas }) => {
    // Simulated keyboard events do not move a native range; real keys are covered by unit tests.
    const slider = canvas.getByRole<HTMLInputElement>('slider', { name: /Risk tolerance/ });
    slider.value = '7';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    await expect(slider.style.getPropertyValue('--_fill')).toBe('70%');
    await expect(await canvas.findByText('Risk tolerance: 7 of 10')).toBeVisible();
  },
};

export const RightToLeft: Story = { globals: { dir: 'rtl' } };
