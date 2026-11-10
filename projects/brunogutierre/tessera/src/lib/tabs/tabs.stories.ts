import { moduleMetadata } from '@storybook/angular-vite';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { TesStat } from '../stat/stat';
import { TesTabPanel, TesTabs } from './tabs';

const meta: Meta<TesTabs> = {
  title: 'Components/Tabs',
  component: TesTabs,
  subcomponents: { TesTabPanel },
  decorators: [moduleMetadata({ imports: [TesTabPanel, TesStat] })],
  render: () => ({
    template: `
      <tes-tabs label="Patient record">
        <tes-tab-panel value="summary" label="Summary">
          <div class="sb-row" style="gap: var(--tes-space-8)">
            <tes-stat label="Next visit" value="12 Dec" />
            <tes-stat label="Open prescriptions" value="3" />
          </div>
        </tes-tab-panel>
        <tes-tab-panel value="history" label="History"><p>Annual check-up, 4 March 2026.</p></tes-tab-panel>
        <tes-tab-panel value="billing" label="Billing" disabled><p>Restricted to the billing team.</p></tes-tab-panel>
        <tes-tab-panel value="documents" label="Documents"><p>2 signed consent forms.</p></tes-tab-panel>
      </tes-tabs>`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'Tabs over `@angular/aria/tabs`: tabs are built from the `tes-tab-panel` labels; one tab stop, arrow keys ' +
          '(flipped in RTL), Home and End, selection follows focus. Hidden panels are `inert` and not displayed, ' +
          'but stay rendered, so their state survives a switch.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesTabs>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    canvas.getByRole('tab', { name: 'Summary' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'History' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(await canvas.findByRole('tabpanel', { name: 'History' })).toBeVisible();
  },
};

export const RightToLeft: Story = { globals: { dir: 'rtl' } };
