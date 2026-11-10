import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { TesTag } from './tag';

const meta: Meta<TesTag> = {
  title: 'Components/Tag',
  component: TesTag,
  args: { removable: false, disabled: false },
  render: (args) => ({
    props: args,
    template: `<tes-tag [removable]="removable" [disabled]="disabled">Invoices</tes-tag>`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'Keyword or filter chip. When `removable`, the remove button is named from the tag text ' +
          '("Remove Invoices") through `TES_LABELS.remove` and emits `removed`.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesTag>;

export const Playground: Story = {};

export const RemovableFilters: Story = {
  render: () => ({
    props: {
      filters: ['Status: Overdue', 'Region: EMEA', 'Amount > 10,000'],
      remove(this: { filters: string[] }, filter: string) {
        this.filters = this.filters.filter((f) => f !== filter);
      },
    },
    template: `
      <div class="sb-row">
        @for (filter of filters; track filter) {
          <tes-tag removable (removed)="remove(filter)">{{ filter }}</tes-tag>
        }
      </div>`,
  }),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Region: EMEA' }));
    await expect(canvas.queryByText('Region: EMEA')).toBeNull();
    await expect(canvas.getAllByRole('button')).toHaveLength(2);
  },
};

export const Disabled: Story = {
  args: { removable: true, disabled: true },
};
