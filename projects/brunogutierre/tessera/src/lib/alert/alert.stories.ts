import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect, fn } from 'storybook/test';
import { TesAlert } from './alert';

type Args = TesAlert & { onDismiss: () => void };

const meta: Meta<Args> = {
  title: 'Components/Alert',
  component: TesAlert,
  argTypes: {
    tone: { control: 'inline-radio', options: ['info', 'success', 'warning', 'danger'] },
    live: { control: 'inline-radio', options: ['off', 'polite', 'assertive'] },
    onDismiss: { table: { disable: true } },
  },
  args: {
    tone: 'warning',
    heading: 'Payment overdue',
    live: 'off',
    dismissible: false,
    onDismiss: fn(),
  },
  render: (args) => ({
    props: args,
    template: `
      <tes-alert [tone]="tone" [heading]="heading" [live]="live" [dismissible]="dismissible" (dismissed)="onDismiss()">
        Invoice INV-2026-0184 for Acme Corp was due on 30 November.
      </tes-alert>`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'Inline message. The tone is spoken first ("Warning: …") from `TES_LABELS.tones`. Set `live` only for ' +
          'alerts that appear in response to an action. Dismissing emits `dismissed`; removing it is up to the app.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<Args>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => ({
    template: `
      <div class="sb-stack">
        <tes-alert tone="info" heading="Scheduled maintenance">The portal is unavailable on Sunday, 02:00–04:00 UTC.</tes-alert>
        <tes-alert tone="success" heading="Payment received">$12,480.00 from Acme Corp was applied to INV-2026-0184.</tes-alert>
        <tes-alert tone="warning" heading="Payment overdue">Invoice INV-2026-0184 was due on 30 November.</tes-alert>
        <tes-alert tone="danger" heading="Transfer failed">The receiving bank rejected the account number.</tes-alert>
      </div>`,
  }),
};

export const WithoutHeading: Story = {
  args: { heading: undefined, tone: 'info' },
};

export const Dismissible: Story = {
  args: { dismissible: true, tone: 'success', heading: 'Changes saved', live: 'polite' },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent('Success: Changes saved');
    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss' }));
    await expect(args.onDismiss).toHaveBeenCalledOnce();
  },
};
