import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterEveryRender,
  inject,
} from '@angular/core';

/**
 * Styles a native range input. Value, `min`, `max`, `step`, keyboard and form binding stay native.
 *
 * ```html
 * <label for="risk">Risk tolerance</label>
 * <input id="risk" type="range" tes-slider min="0" max="10" [(ngModel)]="risk" />
 * <!-- Signal Forms: declare min(p.risk, 0) and max(p.risk, 10) in the schema instead -->
 * <input type="range" tes-slider aria-label="Risk" [formField]="profile.risk" />
 * ```
 *
 * The filled part of the track follows the value, including values set by a form.
 */
@Component({
  selector: 'input[type=range][tes-slider]',
  template: '',
  styleUrl: './slider.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tes-slider',
    '(input)': 'syncFill()',
  },
})
export class TesSlider {
  readonly #input = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;

  constructor() {
    // Forms write `value` without an input event; re-read it after each render.
    afterEveryRender({
      write: () => {
        this.syncFill();
      },
    });
  }

  protected syncFill(): void {
    const { min, max, valueAsNumber } = this.#input;
    const low = min === '' ? 0 : Number(min);
    const high = max === '' ? 100 : Number(max);
    const ratio = high > low ? (valueAsNumber - low) / (high - low) : 0;
    this.#input.style.setProperty('--_fill', `${String(Math.min(Math.max(ratio, 0), 1) * 100)}%`);
  }
}
