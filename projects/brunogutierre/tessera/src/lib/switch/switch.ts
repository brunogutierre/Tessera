import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * A native checkbox presented and announced as an on/off switch (`role="switch"`). Use it for
 * settings that apply immediately; use a checkbox for choices that are submitted with a form.
 *
 * ```html
 * <label tes-choice><input type="checkbox" tes-switch [(ngModel)]="alerts" /> Price alerts</label>
 * ```
 */
@Component({
  selector: 'input[type=checkbox][tes-switch]',
  template: '',
  styleUrl: './switch.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tes-switch', role: 'switch' },
})
export class TesSwitch {}
