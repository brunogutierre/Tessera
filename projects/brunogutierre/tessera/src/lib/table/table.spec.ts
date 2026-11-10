import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { loadTesseraStyles } from '../../test-utils/styles';
import { TesSortHeader, TesTable, tesSortRows } from './table';
import type { TesSort } from './table';

interface Invoice {
  id: string;
  customer: string;
  amount: number;
}

const ROWS: Invoice[] = [
  { id: 'INV-10', customer: 'Globex', amount: 980 },
  { id: 'INV-2', customer: 'acme', amount: 12480 },
  { id: 'INV-1', customer: 'Initech', amount: 3100 },
];

@Component({
  imports: [TesTable, TesSortHeader],
  template: `
    <table tes-table [(sort)]="sort">
      <caption>
        Open invoices
      </caption>
      <thead>
        <tr>
          <th tes-sort-header="id">Invoice</th>
          <th tes-sort-header="customer">Customer</th>
          <th tes-sort-header="amount" data-type="number">Amount</th>
        </tr>
      </thead>
      <tbody>
        @for (row of rows(); track row.id) {
          <tr>
            <td>{{ row.id }}</td>
            <td>{{ row.customer }}</td>
            <td data-type="number">{{ row.amount }}</td>
          </tr>
        }
      </tbody>
    </table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly sort = signal<TesSort | null>(null);
  readonly rows = computed(() => tesSortRows(ROWS, this.sort()));
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const column = (i: number) =>
    [...el.querySelectorAll('tbody tr')].map((r) => r.children[i]!.textContent.trim());
  const header = (name: string) =>
    [...el.querySelectorAll<HTMLElement>('th')].find((th) => th.textContent.includes(name))!;
  return { fixture, host: fixture.componentInstance, el, column, header };
}

beforeAll(loadTesseraStyles);

describe('tesSortRows', () => {
  it('compares strings with locale rules and numbers numerically', () => {
    expect(tesSortRows(ROWS, { active: 'id', direction: 'asc' }).map((r) => r.id)).toEqual([
      'INV-1',
      'INV-2',
      'INV-10',
    ]);
    expect(
      tesSortRows(ROWS, { active: 'customer', direction: 'asc' }).map((r) => r.customer),
    ).toEqual(['acme', 'Globex', 'Initech']);
    expect(tesSortRows(ROWS, { active: 'amount', direction: 'desc' }).map((r) => r.amount)).toEqual(
      [12480, 3100, 980],
    );
    expect(tesSortRows(ROWS, null)).toEqual(ROWS);
  });

  it('puts missing values last and compares dates', () => {
    const rows = [{ d: new Date(2026, 1, 1) }, { d: null }, { d: new Date(2025, 1, 1) }];
    const sorted = tesSortRows(rows, { active: 'd', direction: 'asc' });
    expect(sorted.map((r) => r.d?.getFullYear() ?? null)).toEqual([2025, 2026, null]);
  });
});

describe('TesTable', () => {
  it('sorts by a column with its header button, ascending then descending', async () => {
    const { el, fixture, column, header, host } = await render();
    expect(header('Amount').hasAttribute('aria-sort')).toBe(false);
    await userEvent.click(header('Amount').querySelector('button')!);
    await fixture.whenStable();
    expect(host.sort()).toEqual({ active: 'amount', direction: 'asc' });
    expect(header('Amount').getAttribute('aria-sort')).toBe('ascending');
    expect(column(2)).toEqual(['980', '3100', '12480']);

    await userEvent.click(header('Amount').querySelector('button')!);
    await fixture.whenStable();
    expect(header('Amount').getAttribute('aria-sort')).toBe('descending');
    expect(column(2)).toEqual(['12480', '3100', '980']);
    expect(el.querySelector('th[data-sorted]')).toBe(header('Amount'));
  });

  it('says the sort state in the header button name', async () => {
    const { fixture, header } = await render();
    const button = header('Customer').querySelector('button')!;
    await userEvent.click(button);
    await fixture.whenStable();
    expect(button.textContent.replace(/\s+/g, ' ').trim()).toBe('Customer, sorted ascending');
    expect(header('Customer').getAttribute('scope')).toBe('col');
  });

  it('aligns number cells to the end', async () => {
    const { el } = await render();
    const cell = el.querySelector('td[data-type="number"]')!;
    expect(getComputedStyle(cell).textAlign).toBe('end');
  });
});
