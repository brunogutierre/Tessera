import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
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
    <legend class="legend">{{ legend() }}</legend>
    @if (hint()) {
      <p class="hint" [id]="hintId">{{ hint() }}</p>
    }
    <div class="options"><ng-content /></div>
    @if (error()) {
      <p class="error" [id]="errorId"><tes-icon name="circle-alert" />{{ error() }}</p>
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
  protected readonly describedBy = computed(
    () =>
      [this.hint() ? this.hintId : null, this.error() ? this.errorId : null]
        .filter(Boolean)
        .join(' ') || null,
  );
}
