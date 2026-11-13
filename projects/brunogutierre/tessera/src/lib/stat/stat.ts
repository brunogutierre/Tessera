import {
  ChangeDetectionStrategy,
  Component,
  LOCALE_ID,
  computed,
  inject,
  input,
} from '@angular/core';
import { TES_LABELS } from '../core/labels';
import { TesIcon } from '../icon/icon';

export type TesStatTrend = 'up' | 'down' | 'flat';

/**
 * A key figure with an optional change.
 *
 * ```html
 * <tes-stat label="Revenue" value="$1.24M" [delta]="0.125" deltaLabel="vs last month" />
 * <tes-stat label="Churn" value="2.1%" [delta]="-0.004" positive="down" />
 * ```
 *
 * `delta` is a ratio (0.125 → "+12.5%"), formatted for the app's locale. `positive` says which
 * direction is good, which picks the color; the direction itself is also spoken ("increase").
 */
@Component({
  selector: 'tes-stat',
  imports: [TesIcon],
  template: `
    <span class="label" data-tes-part="label">{{ label() }}</span>
    <span class="value" data-tes-part="value">{{ value() }}</span>
    @if (delta() !== undefined) {
      <span
        class="delta"
        data-tes-part="delta"
        [attr.data-trend]="trend()"
        [attr.data-good]="good()"
      >
        @if (trend() !== 'flat') {
          <tes-icon [name]="trend() === 'up' ? 'trending-up' : 'trending-down'" />
        }
        {{ deltaText() }}
        @if (directionText(); as text) {
          <span class="tes-visually-hidden"> {{ text }}</span>
        }
        @if (deltaLabel(); as context) {
          <span class="context" data-tes-part="context"> {{ context }}</span>
        }
      </span>
    }
  `,
  styleUrl: './stat.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tes-stat' },
})
export class TesStat {
  readonly #labels = inject(TES_LABELS);
  readonly #format = new Intl.NumberFormat(inject(LOCALE_ID), {
    style: 'percent',
    maximumFractionDigits: 1,
    signDisplay: 'exceptZero',
  });

  readonly label = input.required<string>();
  /** The figure, already formatted by the app (currency, units, compact notation). */
  readonly value = input.required<string>();
  /** Change as a ratio: 0.125 is +12.5%. */
  readonly delta = input<number>();
  /** Context for the change, such as "vs last month". */
  readonly deltaLabel = input<string>();
  /** Which direction is good news; costs and churn are `down`. */
  readonly positive = input<'up' | 'down'>('up');

  protected readonly trend = computed<TesStatTrend>(() => {
    const delta = this.delta() ?? 0;
    return delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  });
  protected readonly good = computed(() => {
    const trend = this.trend();
    return trend === 'flat' ? null : String(trend === this.positive());
  });
  protected readonly deltaText = computed(() => this.#format.format(this.delta() ?? 0));
  protected readonly directionText = computed(() => {
    const trend = this.trend();
    return trend === 'flat' ? null : trend === 'up' ? this.#labels.increase : this.#labels.decrease;
  });
}
