import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TesAlert } from '../../lib/alert/alert';
import { TesAutocomplete } from '../../lib/autocomplete/autocomplete';
import { TesBadge } from '../../lib/badge/badge';
import { TesButton } from '../../lib/button/button';
import { TesCard } from '../../lib/card/card';
import { TesFormField } from '../../lib/form-field/form-field';
import { TesIcon } from '../../lib/icon/icon';
import { TesInput } from '../../lib/input/input';
import { TesProgress } from '../../lib/progress/progress';
import type { TesOption } from '../../lib/select/select';
import { TesStat } from '../../lib/stat/stat';
import { TesSortHeader, TesTable, tesSortRows } from '../../lib/table/table';
import type { TesSort } from '../../lib/table/table';
import { TesTabPanel, TesTabs } from '../../lib/tabs/tabs';
import { TesToaster } from '../../lib/toast/toast';
import { TesTooltip } from '../../lib/tooltip/tooltip';

interface Holding {
  ticker: string;
  name: string;
  quantity: number;
  price: number;
  change: number;
}

const HOLDINGS: Holding[] = [
  { ticker: 'NVDA', name: 'NVIDIA', quantity: 120, price: 182.4, change: 0.031 },
  { ticker: 'MSFT', name: 'Microsoft', quantity: 85, price: 498.1, change: -0.006 },
  { ticker: 'PETR4', name: 'Petrobras', quantity: 2400, price: 7.12, change: 0.014 },
  { ticker: 'VALE3', name: 'Vale', quantity: 1800, price: 11.95, change: -0.022 },
  { ticker: 'ITUB4', name: 'Itaú Unibanco', quantity: 3100, price: 6.48, change: 0.004 },
  { ticker: 'TSLA', name: 'Tesla', quantity: 40, price: 412.3, change: -0.047 },
];

const ACTIVITY = [
  { date: '2026-11-09', description: 'Bought 20 NVDA', amount: -3648.0 },
  { date: '2026-11-07', description: 'Dividend ITUB4', amount: 211.4 },
  { date: '2026-11-05', description: 'Sold 10 TSLA', amount: 4123.0 },
  { date: '2026-11-01', description: 'Deposit', amount: 10000.0 },
];

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const percent = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
});

/** Fintech showcase: a dark, data-dense portfolio dashboard. */
@Component({
  selector: 'tes-showcase-fintech',
  imports: [
    TesAlert,
    TesAutocomplete,
    TesBadge,
    TesButton,
    TesCard,
    TesFormField,
    TesIcon,
    TesInput,
    TesProgress,
    TesStat,
    TesSortHeader,
    TesTable,
    TesTabPanel,
    TesTabs,
    TesTooltip,
  ],
  templateUrl: './fintech-portfolio.html',
  styleUrl: './showcase.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FintechPortfolio {
  readonly #toaster = inject(TesToaster);
  protected readonly usd = usd;
  protected readonly percent = percent;
  protected readonly activity = ACTIVITY;
  protected readonly instruments: TesOption[] = HOLDINGS.map((h) => ({
    value: h.ticker,
    label: `${h.ticker} · ${h.name}`,
  }));

  protected readonly sort = signal<TesSort | null>({ active: 'value', direction: 'desc' });
  protected readonly tab = signal<string | undefined>('holdings');
  protected readonly instrument = signal<string | null>(null);
  protected readonly alertVisible = signal(true);

  protected readonly holdings = computed(() =>
    tesSortRows(
      HOLDINGS.map((h) => ({ ...h, value: h.quantity * h.price })),
      this.sort(),
    ),
  );
  protected readonly total = computed(() => this.holdings().reduce((sum, h) => sum + h.value, 0));
  protected readonly allocation = computed(() =>
    this.holdings().map((h) => ({ ticker: h.ticker, share: (h.value / this.total()) * 100 })),
  );

  protected placeOrder(): void {
    const ticker = this.instrument();
    this.#toaster.show({
      message: ticker ? `Market order for ${ticker} sent.` : 'Choose an instrument first.',
      tone: ticker ? 'success' : 'warning',
    });
  }
}
