import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostAttributeToken,
  computed,
  inject,
  input,
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
    '[attr.aria-invalid]': 'field?.invalid() || staticInvalid',
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

  /** The control's id: the one written in the template, or a generated one. */
  readonly id = inject(new HostAttributeToken('id'), { optional: true }) ?? uniqueId('tes-input');

  protected readonly describedBy = computed(() => {
    const ids = [this.#staticDescribedBy, ...(this.field?.describedBy() ?? [])].filter(Boolean);
    return ids.length > 0 ? ids.join(' ') : null;
  });

  constructor() {
    const element = inject<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(ElementRef);
    this.field?.controlId.set(this.id);
    this.field?.control.set(element.nativeElement);
  }
}
