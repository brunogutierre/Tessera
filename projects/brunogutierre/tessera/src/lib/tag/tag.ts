import {
  ChangeDetectionStrategy,
  Component,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { ElementRef } from '@angular/core';
import { TES_LABELS } from '../core/labels';
import { TesIcon } from '../icon/icon';

/**
 * A keyword or filter chip, optionally removable.
 *
 * ```html
 * <tes-tag>Invoices</tes-tag>
 * <tes-tag removable (removed)="drop(filter)">{{ filter }}</tes-tag>
 * ```
 *
 * The remove button is named from the tag text through `TES_LABELS.remove` ("Remove Invoices").
 */
@Component({
  selector: 'tes-tag',
  imports: [TesIcon],
  template: `
    <span class="label" data-tes-part="label" #label><ng-content /></span>
    @if (removable()) {
      <button
        type="button"
        class="remove"
        data-tes-part="remove"
        [attr.aria-label]="removeLabel()"
        [disabled]="disabled()"
        (click)="removed.emit()"
      >
        <tes-icon name="x" />
      </button>
    }
  `,
  styleUrl: './tag.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tes-tag',
    '[attr.data-disabled]': 'disabled() || null',
  },
})
export class TesTag {
  readonly #labels = inject(TES_LABELS);
  readonly #text = signal('');
  // Signal queries cannot use ES private fields.
  private readonly label = viewChild.required<ElementRef<HTMLElement>>('label');

  /** Shows a remove button that emits `removed`. */
  readonly removable = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly removed = output();

  protected readonly removeLabel = computed(() => this.#labels.remove(this.#text()));

  constructor() {
    // Projected text is only known after render; keep the button name in sync with it.
    afterRenderEffect({
      read: () => {
        this.#text.set(this.label().nativeElement.textContent.trim());
      },
    });
  }
}
