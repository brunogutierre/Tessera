import {
  ChangeDetectionStrategy,
  Component,
  HostAttributeToken,
  LOCALE_ID,
  booleanAttribute,
  computed,
  inject,
  input,
  numberAttribute,
} from '@angular/core';

export type TesProgressTone = 'primary' | 'success' | 'warning' | 'danger';
export type TesProgressSize = 'sm' | 'md';

/**
 * A progress bar (`role="progressbar"`). Leave `value` unset for an indeterminate bar.
 *
 * ```html
 * <tes-progress label="Upload" [value]="uploaded" [max]="total" showValue />
 * <tes-progress label="Preparing report" />
 * ```
 *
 * Name it with `label`, or with `aria-labelledby` pointing at a visible label.
 */
@Component({
  selector: 'tes-progress',
  template: `
    <div class="track" data-tes-part="track">
      <div
        class="bar"
        data-tes-part="bar"
        [style.inline-size.%]="indeterminate() ? null : percent()"
      ></div>
    </div>
    @if (showValue() && !indeterminate()) {
      <span class="value" data-tes-part="value" aria-hidden="true">{{ valueText() }}</span>
    }
  `,
  styleUrl: './progress.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tes-progress',
    role: 'progressbar',
    '[attr.data-tone]': 'tone()',
    '[attr.data-size]': 'size()',
    '[attr.data-indeterminate]': 'indeterminate() || null',
    '[attr.aria-label]': 'label() ?? staticLabel',
    'aria-valuemin': '0',
    '[attr.aria-valuemax]': 'max()',
    '[attr.aria-valuenow]': 'indeterminate() ? null : clamped()',
    '[attr.aria-valuetext]': 'indeterminate() ? null : valueText()',
  },
})
export class TesProgress {
  readonly #percentFormat = new Intl.NumberFormat(inject(LOCALE_ID), {
    style: 'percent',
    maximumFractionDigits: 0,
  });

  /** Current value from 0 to `max`; `undefined` or `null` makes the bar indeterminate. */
  readonly value = input<number | null | undefined>(undefined);
  readonly max = input(100, { transform: numberAttribute });
  readonly label = input<string>();
  readonly tone = input<TesProgressTone>('primary');
  readonly size = input<TesProgressSize>('md');
  /** Shows the percentage next to the bar. */
  readonly showValue = input(false, { transform: booleanAttribute });

  protected readonly staticLabel = inject(new HostAttributeToken('aria-label'), { optional: true });
  protected readonly indeterminate = computed(() => {
    const value = this.value();
    return value === null || value === undefined || Number.isNaN(value);
  });
  protected readonly clamped = computed(() =>
    Math.min(Math.max(this.value() ?? 0, 0), Math.max(this.max(), 0)),
  );
  protected readonly percent = computed(() =>
    this.max() > 0 ? (this.clamped() / this.max()) * 100 : 0,
  );
  protected readonly valueText = computed(() => this.#percentFormat.format(this.percent() / 100));
}
