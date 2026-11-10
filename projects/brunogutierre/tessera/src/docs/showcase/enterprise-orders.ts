import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TesBadge } from '../../lib/badge/badge';
import type { TesTone } from '../../lib/badge/badge';
import { TesBreadcrumbs } from '../../lib/breadcrumbs/breadcrumbs';
import { TesButton } from '../../lib/button/button';
import { TesCard } from '../../lib/card/card';
import { TesCheckbox } from '../../lib/checkbox/checkbox';
import { TesFormField } from '../../lib/form-field/form-field';
import { TesIcon } from '../../lib/icon/icon';
import { TesInput } from '../../lib/input/input';
import { TesMenu } from '../../lib/menu/menu';
import type { TesMenuEntry } from '../../lib/menu/menu';
import { TesPaginator } from '../../lib/paginator/paginator';
import { TesSelect } from '../../lib/select/select';
import type { TesOption } from '../../lib/select/select';
import { TesStat } from '../../lib/stat/stat';
import { TesSortHeader, TesTable, tesSortRows } from '../../lib/table/table';
import type { TesSort } from '../../lib/table/table';
import { TesTag } from '../../lib/tag/tag';
import { TesToaster } from '../../lib/toast/toast';
import { TesToolbar, TesToolbarItem } from '../../lib/toolbar/toolbar';

type Status = 'Draft' | 'Approved' | 'Shipped' | 'On hold';

interface Order {
  id: string;
  supplier: string;
  warehouse: string;
  date: string;
  lines: number;
  total: number;
  status: Status;
}

const TONE: Record<Status, TesTone> = {
  Draft: 'neutral',
  Approved: 'primary',
  Shipped: 'success',
  'On hold': 'warning',
};

const SUPPLIERS = ['Northwind Traders', 'Contoso Ltd', 'Fabrikam', 'Tailspin Toys', 'Litware Inc'];
const WAREHOUSES = ['São Paulo DC', 'Curitiba DC', 'Recife DC'];
const STATUSES: Status[] = ['Draft', 'Approved', 'Shipped', 'On hold'];

const ORDERS: Order[] = Array.from({ length: 37 }, (_, i) => ({
  id: `PO-${String(48120 + i)}`,
  supplier: SUPPLIERS[i % SUPPLIERS.length] ?? '',
  warehouse: WAREHOUSES[i % WAREHOUSES.length] ?? '',
  date: `2026-11-${String((i % 28) + 1).padStart(2, '0')}`,
  lines: ((i * 7) % 23) + 1,
  total: Math.round(((i * 104729) % 9_000_000) / 100) / 10 + 120,
  status: STATUSES[(i * 3) % STATUSES.length] ?? 'Draft',
}));

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** Enterprise showcase: a dense purchase-order back office. */
@Component({
  selector: 'tes-showcase-enterprise',
  imports: [
    TesBadge,
    TesBreadcrumbs,
    TesButton,
    TesCard,
    TesCheckbox,
    TesFormField,
    TesIcon,
    TesInput,
    TesMenu,
    TesPaginator,
    TesSelect,
    TesStat,
    TesSortHeader,
    TesTable,
    TesTag,
    TesToolbar,
    TesToolbarItem,
  ],
  templateUrl: './enterprise-orders.html',
  styleUrl: './showcase.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnterpriseOrders {
  readonly #toaster = inject(TesToaster);
  protected readonly money = money;
  protected readonly tone = TONE;
  protected readonly statusOptions: TesOption<Status>[] = STATUSES.map((s) => ({
    value: s,
    label: s,
  }));
  protected readonly warehouseOptions: TesOption[] = WAREHOUSES.map((w) => ({
    value: w,
    label: w,
  }));
  protected readonly rowActions: TesMenuEntry[] = [
    { value: 'open', label: 'Open order', icon: 'file' },
    { value: 'duplicate', label: 'Duplicate', icon: 'plus' },
    'separator',
    { value: 'cancel', label: 'Cancel order', icon: 'trash-2', danger: true },
  ];

  protected readonly query = signal('');
  protected readonly statuses = signal<readonly Status[]>(['Approved', 'On hold']);
  protected readonly warehouse = signal<string | null>(null);
  protected readonly sort = signal<TesSort | null>({ active: 'date', direction: 'desc' });
  protected readonly selected = signal<ReadonlySet<string>>(new Set());
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);

  protected readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    const statuses = new Set(this.statuses());
    const warehouse = this.warehouse();
    return ORDERS.filter(
      (o) =>
        (statuses.size === 0 || statuses.has(o.status)) &&
        (!warehouse || o.warehouse === warehouse) &&
        (!query || `${o.id} ${o.supplier}`.toLowerCase().includes(query)),
    );
  });
  protected readonly rows = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return tesSortRows(this.filtered(), this.sort()).slice(start, start + this.pageSize());
  });
  protected readonly openValue = computed(() =>
    this.filtered().reduce((sum, o) => sum + (o.status === 'Shipped' ? 0 : o.total), 0),
  );

  protected setStatuses(value: unknown): void {
    this.statuses.set(Array.isArray(value) ? (value as Status[]) : []);
    this.pageIndex.set(0);
  }

  protected removeStatus(status: Status): void {
    this.statuses.update((list) => list.filter((s) => s !== status));
  }

  protected toggle(id: string): void {
    this.selected.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  protected approveSelected(): void {
    const count = this.selected().size;
    this.#toaster.show({
      message: `${String(count)} order${count === 1 ? '' : 's'} approved.`,
      tone: 'success',
      action: { label: 'Undo', run: () => undefined },
    });
    this.selected.set(new Set());
  }

  protected rowAction(action: string, order: Order): void {
    this.#toaster.show({
      message: `${action === 'cancel' ? 'Cancelled' : 'Updated'} ${order.id}.`,
    });
  }
}
