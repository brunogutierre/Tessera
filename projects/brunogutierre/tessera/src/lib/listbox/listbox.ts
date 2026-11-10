import { Listbox, Option } from '@angular/aria/listbox';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { uniqueId } from '../core/id';
import { TesFormField } from '../form-field/form-field';
import { TesIcon } from '../icon/icon';
import type { TesOption, TesSelectValue } from '../select/select';

/**
 * An always-visible list to pick one or several options from.
 *
 * ```html
 * <tes-listbox label="Visible columns" [options]="columns" multiple [(value)]="visible" />
 * ```
 *
 * One tab stop; arrow keys, Home/End and typeahead move; with a single selection the choice follows
 * focus, with `multiple` Space or Enter toggles. A Signal Forms `FormValueControl`, like
 * `tes-select`. Keyboard and ARIA come from `@angular/aria/listbox`.
 */
@Component({
  selector: 'tes-listbox',
  imports: [Listbox, Option, TesIcon],
  template: `
    <div
      ngListbox
      #list
      class="list"
      [id]="id"
      [multi]="multiple()"
      [selectionMode]="multiple() ? 'explicit' : 'follow'"
      [disabled]="disabled()"
      [value]="selected()"
      (valueChange)="onSelectionChange($event)"
      [attr.aria-label]="field ? null : label()"
      [attr.aria-labelledby]="field ? field.labelId : null"
      [attr.aria-describedby]="describedBy()"
      [attr.aria-invalid]="isInvalid() || null"
      [attr.aria-required]="required() || null"
      (focusout)="onFocusOut($event)"
    >
      @for (option of options(); track option.value) {
        <div
          ngOption
          class="option"
          [value]="option.value"
          [label]="option.label"
          [disabled]="!!option.disabled"
        >
          <tes-icon name="check" class="check" />
          <span>{{ option.label }}</span>
        </div>
      }
    </div>
  `,
  styleUrl: './listbox.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tes-listbox' },
})
export class TesListbox<V = string> implements FormValueControl<TesSelectValue<V>> {
  protected readonly field = inject(TesFormField, { optional: true });

  /** Accessible name when the listbox is not inside a `tes-form-field`. */
  readonly label = input<string>();
  readonly options = input.required<readonly TesOption<V>[]>();
  readonly value = model<TesSelectValue<V>>(null);
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touch = output();

  protected readonly id = uniqueId('tes-listbox');
  protected readonly selected = computed<V[]>(() => {
    const value = this.value();
    if (value === null) return [];
    const values = this.multiple() ? (value as readonly V[]) : [value as V];
    const known = new Set(this.options().map((o) => o.value));
    return values.filter((v) => known.has(v));
  });
  protected readonly isInvalid = computed(() => this.invalid() || !!this.field?.invalid());
  protected readonly describedBy = computed(() => {
    const ids = this.field?.describedBy() ?? [];
    return ids.length > 0 ? ids.join(' ') : null;
  });

  private readonly list = viewChild.required('list', { read: ElementRef });

  constructor() {
    this.field?.controlId.set(this.id);
    this.field?.controlRequiredOverride.set(() => this.required());
    this.field?.focusControl.set(() => {
      (this.list().nativeElement as HTMLElement).focus();
    });
  }

  /** Touched once focus leaves the whole list, not when it moves between options. */
  protected onFocusOut(event: FocusEvent): void {
    const list = event.currentTarget as HTMLElement;
    if (!list.contains(event.relatedTarget as Node | null)) this.touch.emit();
  }

  protected onSelectionChange(values: readonly V[]): void {
    this.value.set(this.multiple() ? values : (values.at(-1) ?? null));
  }
}
