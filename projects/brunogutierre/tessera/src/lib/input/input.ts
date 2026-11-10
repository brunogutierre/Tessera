import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostAttributeToken,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { uniqueId } from '../core/id';
import { TesFormField } from '../form-field/form-field';

export type TesInputSize = 'sm' | 'md' | 'lg';

/**
 * Styles a native `<input>` or `<textarea>`. Value, `required`, `disabled` and validation stay
 * native, so every form system binds it directly:
 *
 * ```html
 * <input tes-input [formField]="profile.name" />      <!-- Signal Forms -->
 * <input tes-input formControlName="name" />          <!-- Reactive Forms -->
 * <textarea tes-input [(ngModel)]="notes"></textarea> <!-- template-driven -->
 * ```
 *
 * Inside a `tes-form-field` it gets its id, description and invalid state from the field; ids and
 * ARIA attributes written by the app are kept and merged.
 */
@Component({
  selector: 'input[tes-input], textarea[tes-input]',
  template: '',
  styleUrl: './input.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tes-input',
    '[id]': 'id',
    '[attr.data-size]': 'size()',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-invalid]': 'field?.invalid() || invalid() || staticInvalid',
  },
})
export class TesInput {
  protected readonly field = inject(TesFormField, { optional: true });
  readonly #staticDescribedBy = inject(new HostAttributeToken('aria-describedby'), {
    optional: true,
  });
  protected readonly staticInvalid = inject(new HostAttributeToken('aria-invalid'), {
    optional: true,
  });

  readonly size = input<TesInputSize>('md');
  /** Marks the control invalid when it is not inside a `tes-form-field` (or in addition to it). */
  readonly invalid = input(false, { transform: booleanAttribute });

  /** The control's id: the one written in the template, or a generated one. */
  readonly id = inject(new HostAttributeToken('id'), { optional: true }) ?? uniqueId('tes-input');

  protected readonly describedBy = computed(() => {
    const ids = [this.#staticDescribedBy, ...(this.field?.describedBy() ?? [])].filter(Boolean);
    return ids.length > 0 ? ids.join(' ') : null;
  });

  /** Mirrors the native `required` attribute, which forms may toggle at any time. */
  readonly #required = signal(false);

  constructor() {
    const element = inject<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(ElementRef);
    const destroyRef = inject(DestroyRef);
    this.field?.controlId.set(this.id);
    this.field?.control.set(element.nativeElement);
    this.field?.controlRequiredOverride.set(() => this.#required());

    // Browser only: observe the attribute instead of reading the DOM while rendering.
    afterNextRender(() => {
      const control = element.nativeElement;
      this.#required.set(control.required);
      const observer = new MutationObserver(() => {
        this.#required.set(control.required);
      });
      observer.observe(control, { attributes: true, attributeFilter: ['required'] });
      destroyRef.onDestroy(() => {
        observer.disconnect();
      });
    });
  }
}
