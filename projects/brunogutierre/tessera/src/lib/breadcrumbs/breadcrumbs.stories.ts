import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { TesBreadcrumbs } from './breadcrumbs';

const meta: Meta<TesBreadcrumbs> = {
  title: 'Components/Breadcrumbs',
  component: TesBreadcrumbs,
  render: () => ({
    template: `
      <tes-breadcrumbs>
        <li><a href="#home">Home</a></li>
        <li><a href="#billing">Billing</a></li>
        <li><a href="#invoices">Invoices</a></li>
        <li aria-current="page">INV-2026-0184</li>
      </tes-breadcrumbs>`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'Path to the current page as `nav > ol`, named "Breadcrumb". Write the items as `<li>` with any links ' +
          '(`href`, `routerLink`) and mark the current page with `aria-current="page"`.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesBreadcrumbs>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const nav = canvas.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(nav).toBeVisible();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(4);
    await expect(canvas.getAllByRole('link')).toHaveLength(3);
  },
};

export const RightToLeft: Story = { globals: { dir: 'rtl' } };
