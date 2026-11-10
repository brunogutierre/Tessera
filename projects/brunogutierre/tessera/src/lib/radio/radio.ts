import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Styles a native radio button. Group radios by `name` inside a `fieldset[tes-fieldset]`; the
 * browser provides arrow-key navigation and a single tab stop.
 *
 * ```html
 * <fieldset tes-fieldset legend="Delivery">
 *   <label tes-choice><input type="radio" tes-radio name="delivery" value="standard" /> Standard</label>
 *   <label tes-choice><input type="radio" tes-radio name="delivery" value="express" /> Express</label>
 * </fieldset>
 * ```
 */
@Component({
  selector: 'input[type=radio][tes-radio]',
  template: '',
  styleUrl: './radio.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tes-radio' },
})
export class TesRadio {}
