import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { TES_LABELS } from '../core/labels';

export type TesSpinnerSize = 'sm' | 'md' | 'lg';

/**
 * An indeterminate loading indicator (`role="progressbar"` without a value).
 *
 * ```html
 * <tes-spinner />                      <!-- announced as "Loading" -->
 * <tes-spinner label="Saving order" />
 * <tes-spinner decorative />           <!-- hidden: the context already says it is busy -->
 * ```
 */
@Component({
  selector: 'tes-spinner',
  template: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle class="track" data-tes-part="track" cx="12" cy="12" r="9.5" />
    <circle class="arc" data-tes-part="arc" cx="12" cy="12" r="9.5" />
  </svg>`,
  styleUrl: './spinner.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tes-spinner',
    '[attr.data-size]': 'size()',
    '[attr.role]': 'decorative() ? null : "progressbar"',
    '[attr.aria-label]': 'decorative() ? null : accessibleName()',
    '[attr.aria-hidden]': 'decorative() ? "true" : null',
  },
})
export class TesSpinner {
  readonly #labels = inject(TES_LABELS);

  readonly size = input<TesSpinnerSize>('md');
  /** Accessible name; defaults to the `loading` label. */
  readonly label = input<string>();
  /** Hides the spinner from assistive technology when the context already conveys busy state. */
  readonly decorative = input(false, { transform: booleanAttribute });

  protected readonly accessibleName = computed(() => this.label() ?? this.#labels.loading);
}
