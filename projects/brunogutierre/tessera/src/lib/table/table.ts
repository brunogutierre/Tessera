import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
} from '@angular/core';
import { TES_LABELS } from '../core/labels';
import { TesIcon } from '../icon/icon';

export type TesSortDirection = 'asc' | 'desc';

/** The active sort of a `table[tes-table]`: a column key and a direction. */
export interface TesSort {
  active: string;
  direction: TesSortDirection;
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

function toText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return value.toString();
  }
  return JSON.stringify(value);
}

/**
 * Returns a sorted copy of `rows`. Strings compare with locale rules ("item 2" before "item 10"),
 * numbers and dates numerically; `null` and `undefined` go last.
 */
export function tesSortRows<T>(
  rows: readonly T[],
  sort: TesSort | null,
  value: (row: T, key: string) => unknown = (row, key) => (row as Record<string, unknown>)[key],
): T[] {
  if (!sort) return [...rows];
  const factor = sort.direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const x = value(a, sort.active);
    const y = value(b, sort.active);
    if (x === y) return 0;
    if (x === null || x === undefined) return 1;
    if (y === null || y === undefined) return -1;
    if (typeof x === 'number' && typeof y === 'number') return (x - y) * factor;
    if (x instanceof Date && y instanceof Date) return (x.getTime() - y.getTime()) * factor;
    return collator.compare(toText(x), toText(y)) * factor;
  });
}

/**
 * Styles a native data table and holds its sort state. The table stays plain HTML, so `@for`,
 * captions, `scope`, row headers and selection markup are the app's own.
 *
 * ```html
 * <table tes-table [(sort)]="sort">
 *   <caption>Open invoices</caption>
 *   <thead><tr><th tes-sort-header="customer">Customer</th><th tes-sort-header="amount" data-type="number">Amount</th></tr></thead>
 *   <tbody>@for (row of rows(); track row.id) { <tr><td>{{ row.customer }}</td><td data-type="number">{{ row.amount }}</td></tr> }</tbody>
 * </table>
 * ```
 *
 * Cells with `data-type="number"` align to the end with tabular figures. Styles reach the app's
 * cells, so the table is not view-encapsulated; every selector is scoped under `.tes-table`.
 */
@Component({
  selector: 'table[tes-table]',
  template: '<ng-content />',
  styleUrl: './table.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tes-table',
    '[attr.data-sticky]': 'stickyHeader() || null',
    '[attr.data-striped]': 'striped() || null',
  },
})
export class TesTable {
  readonly sort = model<TesSort | null>(null);
  /** Keeps the header row visible while the table's scroll container scrolls. */
  readonly stickyHeader = input(false, { transform: booleanAttribute });
  readonly striped = input(false, { transform: booleanAttribute });

  /** Sorts by `key`: ascending first, then toggling direction. */
  toggle(key: string): void {
    const current = this.sort();
    this.sort.set({
      active: key,
      direction: current?.active === key && current.direction === 'asc' ? 'desc' : 'asc',
    });
  }
}

/**
 * Makes a column header sortable: a button inside the `th`, with `aria-sort` on the header when
 * the table is sorted by this column.
 */
@Component({
  selector: 'th[tes-sort-header]',
  imports: [TesIcon],
  template: `
    <button
      type="button"
      class="tes-sort-button"
      data-tes-part="sort-button"
      (click)="table.toggle(column())"
    >
      <ng-content />
      <tes-icon class="tes-sort-icon" data-tes-part="sort-icon" [name]="icon()" />
      @if (stateLabel(); as state) {
        <span class="tes-visually-hidden">, {{ state }}</span>
      }
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    scope: 'col',
    '[attr.aria-sort]': 'ariaSort()',
    '[attr.data-sorted]': 'direction() ?? null',
  },
})
export class TesSortHeader {
  protected readonly table = inject(TesTable);
  readonly #labels = inject(TES_LABELS);

  /** The column key this header sorts by: `<th tes-sort-header="amount">`. */
  readonly column = input.required<string>({ alias: 'tes-sort-header' });

  protected readonly direction = computed(() => {
    const sort = this.table.sort();
    return sort?.active === this.column() ? sort.direction : null;
  });
  protected readonly ariaSort = computed(() => {
    const direction = this.direction();
    return direction === null ? null : direction === 'asc' ? 'ascending' : 'descending';
  });
  protected readonly icon = computed(() => {
    const direction = this.direction();
    return direction === null ? 'arrow-up-down' : direction === 'asc' ? 'arrow-up' : 'arrow-down';
  });
  protected readonly stateLabel = computed(() => {
    const direction = this.direction();
    if (direction === null) return null;
    return direction === 'asc' ? this.#labels.sortAscending : this.#labels.sortDescending;
  });
}
