import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { TesBadge } from '../badge/badge';
import { TesCheckbox } from '../checkbox/checkbox';
import type { TesTone } from '../badge/badge';
import { TesPaginator } from '../paginator/paginator';
import { TesSortHeader, TesTable, tesSortRows } from './table';
import type { TesSort } from './table';

interface Invoice {
  id: string;
  customer: string;
  due: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

const STATUS_TONE: Record<Invoice['status'], TesTone> = {
  Paid: 'success',
  Pending: 'warning',
  Overdue: 'danger',
};

const CUSTOMERS = [
  'Acme Corp',
  'Globex',
  'Initech',
  'Umbrella',
  'Stark Industries',
  'Wayne Enterprises',
];
const INVOICES: Invoice[] = Array.from({ length: 23 }, (_, i) => ({
  id: `INV-2026-${String(184 + i).padStart(4, '0')}`,
  customer: CUSTOMERS[i % CUSTOMERS.length] ?? 'Acme Corp',
  due: `2026-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`,
  amount: Math.round(((i * 7919) % 20000) + 250) + 0.5,
  status: (['Paid', 'Pending', 'Overdue'] as const)[i % 3] ?? 'Paid',
}));

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

@Component({
  selector: 'tes-docs-invoice-table',
  imports: [TesTable, TesSortHeader, TesBadge, TesPaginator, TesCheckbox],
  template: `
    <table tes-table [(sort)]="sort" [striped]="striped">
      <caption>
        Invoices
      </caption>
      <thead>
        <tr>
          <th scope="col"><span class="tes-visually-hidden">Select</span></th>
          <th tes-sort-header="id">Invoice</th>
          <th tes-sort-header="customer">Customer</th>
          <th tes-sort-header="due">Due</th>
          <th scope="col">Status</th>
          <th tes-sort-header="amount" data-type="number">Amount</th>
        </tr>
      </thead>
      <tbody>
        @for (row of page(); track row.id) {
          <tr [attr.data-selected]="selected().has(row.id) || null">
            <td>
              <input
                type="checkbox"
                tes-checkbox
                [checked]="selected().has(row.id)"
                (change)="toggle(row.id)"
                [attr.aria-label]="'Select ' + row.id"
              />
            </td>
            <th scope="row" style="font-weight: var(--tes-weight-medium)">{{ row.id }}</th>
            <td>{{ row.customer }}</td>
            <td>{{ row.due }}</td>
            <td>
              <tes-badge [tone]="tones[row.status]">{{ row.status }}</tes-badge>
            </td>
            <td data-type="number">{{ money.format(row.amount) }}</td>
          </tr>
        }
      </tbody>
    </table>
    <tes-paginator
      style="margin-block-start: var(--tes-space-3)"
      [length]="rows.length"
      [(pageIndex)]="pageIndex"
      [(pageSize)]="pageSize"
      [pageSizes]="[5, 10, 25]"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class InvoiceTable {
  protected readonly rows = INVOICES;
  protected readonly tones = STATUS_TONE;
  protected readonly money = money;
  protected readonly striped = false;
  protected readonly sort = signal<TesSort | null>({ active: 'due', direction: 'asc' });
  protected readonly selected = signal<ReadonlySet<string>>(new Set(['INV-2026-0185']));
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(5);
  protected toggle(id: string): void {
    this.selected.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  protected readonly page = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return tesSortRows(this.rows, this.sort()).slice(start, start + this.pageSize());
  });
}

const meta: Meta<TesTable> = {
  title: 'Components/Table',
  component: TesTable,
  subcomponents: { TesSortHeader, TesPaginator },
  render: () => ({
    moduleMetadata: { imports: [InvoiceTable] },
    template: '<tes-docs-invoice-table />',
  }),
  parameters: {
    docs: {
      description: {
        component:
          '`table[tes-table]` styles a native table and holds its sort state (`[(sort)]`); `th[tes-sort-header]` makes ' +
          'a column sortable with a button and `aria-sort`. `tesSortRows(rows, sort)` sorts with locale rules. ' +
          'Cells with `data-type="number"` align to the end with tabular figures. `tes-paginator` pages the rows.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesTable>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const amount = canvas.getByRole('button', { name: /Amount/ });
    await userEvent.click(amount);
    await expect(canvas.getByRole('columnheader', { name: /Amount/ })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('6–10 of 23');
  },
};
