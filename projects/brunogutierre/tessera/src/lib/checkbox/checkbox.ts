import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Styles a native checkbox. `checked`, `indeterminate`, `disabled` and validation stay native, so
 * any form system binds it directly:
 *
 * ```html
 * <label tes-choice><input type="checkbox" tes-checkbox [formField]="prefs.newsletter" /> Newsletter</label>
 * ```
 *
 * The check mark is cut out of the filled box with a CSS mask, so it always shows the surface
 * behind it: light on light themes, dark on dark ones, with no image per theme.
 */
@Component({
  selector: 'input[type=checkbox][tes-checkbox]',
  template: '',
  styleUrl: './checkbox.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tes-checkbox' },
})
export class TesCheckbox {}
