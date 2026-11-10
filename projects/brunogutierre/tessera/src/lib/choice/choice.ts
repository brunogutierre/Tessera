import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * A label that wraps a checkbox, radio or switch with its text. The whole label is the click
 * target, and it dims when the control inside is disabled.
 *
 * ```html
 * <label tes-choice><input type="checkbox" tes-checkbox /> Remember this device</label>
 * ```
 */
@Component({
  selector: 'label[tes-choice]',
  template: '<ng-content />',
  styleUrl: './choice.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tes-choice' },
})
export class TesChoice {}
