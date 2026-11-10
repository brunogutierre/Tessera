import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { TesTree } from './tree';
import type { TesTreeNode } from './tree';

const ORG: TesTreeNode[] = [
  {
    value: 'ops',
    label: 'Operations',
    icon: 'folder',
    expanded: true,
    children: [
      { value: 'ops-ap', label: 'Accounts payable', icon: 'file' },
      { value: 'ops-ar', label: 'Accounts receivable', icon: 'file' },
      {
        value: 'ops-treasury',
        label: 'Treasury',
        icon: 'folder',
        children: [
          { value: 'ops-fx', label: 'FX hedging', icon: 'file' },
          { value: 'ops-cash', label: 'Cash pooling', icon: 'file', disabled: true },
        ],
      },
    ],
  },
  {
    value: 'people',
    label: 'People',
    icon: 'folder',
    children: [
      { value: 'people-payroll', label: 'Payroll', icon: 'file' },
      { value: 'people-benefits', label: 'Benefits', icon: 'heart' },
    ],
  },
  { value: 'policies', label: 'Policies', icon: 'file' },
];

const meta: Meta<TesTree> = {
  title: 'Components/Tree',
  component: TesTree,
  args: { label: 'Cost centers', nodes: ORG, multiple: false },
  render: (args) => ({
    props: { ...args, value: ['ops-ar'] },
    template: `<tes-tree [label]="label" [nodes]="nodes" [multiple]="multiple" [(value)]="value" style="max-inline-size: 22rem" />`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'Hierarchical list over `@angular/aria/tree`, built from `TesTreeNode` data: Up/Down move, Right ' +
          'expands or enters, Left collapses or goes to the parent (flipped in RTL), Home, End and typeahead; ' +
          'Enter or Space selects. Selected rows show a start bar plus a tinted background.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesTree>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const people = canvas.getByRole('treeitem', { name: 'People' });
    await userEvent.click(people);
    await expect(people).toHaveAttribute('aria-selected', 'true');
  },
};

export const Multiple: Story = { args: { multiple: true } };

export const RightToLeft: Story = { globals: { dir: 'rtl' } };
