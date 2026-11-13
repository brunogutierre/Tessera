import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { uniqueId } from '../core/id';
import { TES_LABELS } from '../core/labels';
import { TesIcon } from '../icon/icon';

/**
 * Label, hint and error for one form control. The control registers itself, so the label's `for`
 * and the control's `aria-describedby` / `aria-invalid` are wired without ids in the template.
 *
 * ```html
 * <tes-form-field label="Email" hint="We only use it for receipts" [error]="emailError()">
 *   <input tes-input type="email" required [formField]="checkout.email" />
 * </tes-form-field>
 * ```
 *
 * Works with any form system (Signal Forms, Reactive Forms, ngModel): the app decides when an
 * error is shown by passing its message, and the control turns invalid while it is set.
 */
@Component({
  selector: 'tes-form-field',
  imports: [TesIcon],
  template: `
    <label class="label" data-tes-part="label" [id]="labelId" [attr.for]="controlId()">
      {{ label() }}
      @if (controlRequired()) {
        <span class="marker" data-tes-part="marker" aria-hidden="true">*</span>
      } @else if (optional()) {
        <span class="marker optional" data-tes-part="marker"> ({{ labels.optional }})</span>
      }
    </label>
    <ng-content />
    @if (hint()) {
      <p class="hint" data-tes-part="hint" [id]="hintId">{{ hint() }}</p>
    }
    @if (error()) {
      <p class="error" data-tes-part="error" [id]="errorId">
        <tes-icon name="circle-alert" />{{ error() }}
      </p>
    }
  `,
  styleUrl: './form-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tes-form-field', '(click)': 'focusCustomControl($event)' },
})
export class TesFormField {
  protected readonly labels = inject(TES_LABELS);

  readonly label = input.required<string>();
  readonly hint = input<string>();
  /** Error message; while set, the control is `aria-invalid` and described by it. */
  readonly error = input<string | null>();
  /** Marks the field as optional in the label (required fields get an asterisk instead). */
  readonly optional = input(false, { transform: booleanAttribute });

  readonly labelId = uniqueId('tes-label');
  readonly hintId = uniqueId('tes-hint');
  readonly errorId = uniqueId('tes-error');

  /** Set by the projected control. */
  readonly controlId = signal<string | null>(null);
  readonly control = signal<HTMLElement | null>(null);
  /** Controls report `required` (as a signal-reading function); custom ones also how to focus. */
  readonly controlRequiredOverride = signal<(() => boolean) | null>(null);
  readonly focusControl = signal<(() => void) | null>(null);

  readonly invalid = computed(() => !!this.error());
  /** Ids the control must add to its `aria-describedby`: hint first, then the error. */
  readonly describedBy = computed(() =>
    [this.hint() ? this.hintId : null, this.error() ? this.errorId : null].filter(
      (id): id is string => id !== null,
    ),
  );

  /** Reported by the control, so its `required` (or the form's required rule) is the only source. */
  protected controlRequired(): boolean {
    return this.controlRequiredOverride()?.() ?? false;
  }

  /** A `<label for>` only focuses native controls; custom ones are focused on a label click. */
  protected focusCustomControl(event: Event): void {
    const focus = this.focusControl();
    const onLabel = (event.target as Element | null)?.closest('.label');
    if (focus && onLabel) {
      event.preventDefault();
      focus();
    }
  }
}
