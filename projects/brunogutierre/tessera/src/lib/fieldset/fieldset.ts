import {
  ChangeDetectionStrategy,
  Component,
  HostAttributeToken,
  computed,
  inject,
  input,
} from '@angular/core';
import { uniqueId } from '../core/id';
import { TesIcon } from '../icon/icon';

/**
 * Groups related controls (a radio group, a set of checkboxes) under a legend, with an optional
 * hint and error that describe the whole group.
 *
 * ```html
 * <fieldset tes-fieldset legend="Delivery" [error]="deliveryError()">
 *   <label tes-choice><input type="radio" tes-radio name="delivery" value="standard" /> Standard</label>
 *   <label tes-choice><input type="radio" tes-radio name="delivery" value="express" /> Express</label>
 * </fieldset>
 * ```
 */
@Component({
  selector: 'fieldset[tes-fieldset]',
  imports: [TesIcon],
  template: `
    <legend class="legend" data-tes-part="legend">{{ legend() }}</legend>
    @if (hint()) {
      <p class="hint" data-tes-part="hint" [id]="hintId">{{ hint() }}</p>
    }
    <div class="options" data-tes-part="options"><ng-content /></div>
    @if (error()) {
      <p class="error" data-tes-part="error" [id]="errorId">
        <tes-icon name="circle-alert" />{{ error() }}
      </p>
    }
  `,
  styleUrl: './fieldset.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tes-fieldset',
    '[attr.data-orientation]': 'orientation()',
    '[attr.aria-describedby]': 'describedBy()',
  },
})
export class TesFieldset {
  readonly legend = input.required<string>();
  readonly hint = input<string>();
  readonly error = input<string | null>();
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');

  protected readonly hintId = uniqueId('tes-hint');
  protected readonly errorId = uniqueId('tes-error');
  readonly #staticDescribedBy = inject(new HostAttributeToken('aria-describedby'), {
    optional: true,
  });
  /** The app's own descriptions first, then the hint and the error. */
  protected readonly describedBy = computed(() => {
    const ids = [
      this.#staticDescribedBy,
      this.hint() ? this.hintId : null,
      this.error() ? this.errorId : null,
    ].filter(Boolean);
    return ids.length > 0 ? ids.join(' ') : null;
  });
}
