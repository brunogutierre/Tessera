import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';
import { CareBooking } from './care-booking';
import { EnterpriseOrders } from './enterprise-orders';
import { FintechPortfolio } from './fintech-portfolio';

/**
 * Whole screens built only from Tessera components, one per theme. Each story pins its theme;
 * the toolbar's mode (and the story test runner's) still switches light and dark.
 */
const meta: Meta = {
  title: 'Showcase',
  tags: ['!autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

export const EnterpriseBackOffice: Story = {
  name: 'Enterprise · Purchase orders',
  globals: { theme: 'enterprise' },
  render: () => ({
    moduleMetadata: { imports: [EnterpriseOrders] },
    template: '<tes-showcase-enterprise />',
  }),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /^Total/ }));
    await expect(canvas.getByRole('columnheader', { name: /Total/ })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Status: On hold' }));
    await expect(canvas.queryByText('Status: On hold')).toBeNull();
  },
};

export const FintechDashboard: Story = {
  name: 'Fintech · Portfolio',
  globals: { theme: 'fintech' },
  render: () => ({
    moduleMetadata: { imports: [FintechPortfolio] },
    template: '<tes-showcase-fintech />',
  }),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('tab', { name: 'Activity' }));
    await expect(await canvas.findByRole('tabpanel', { name: 'Activity' })).toBeVisible();
  },
};

export const CareAppointment: Story = {
  name: 'Care · Book an appointment',
  globals: { theme: 'care' },
  render: () => ({ moduleMetadata: { imports: [CareBooking] }, template: '<tes-showcase-care />' }),
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Request appointment' }));
    const specialty = canvas.getByRole('combobox', { name: /Specialty/ });
    await expect(specialty).toHaveAttribute('aria-invalid', 'true');
    await expect(specialty).toHaveAccessibleDescription('Choose a specialty');
    await expect(within(canvasElement).getByText('Please accept the privacy notice')).toBeVisible();
  },
};
