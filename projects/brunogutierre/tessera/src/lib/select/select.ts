import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
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
  signal,
  viewChild,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { uniqueId } from '../core/id';
import { TES_DROPDOWN_POSITIONS } from '../core/overlay';
import { TesFormField } from '../form-field/form-field';
import { TesIcon } from '../icon/icon';

/** One choice in a select, listbox or autocomplete. */
export interface TesOption<V = string> {
  value: V;
  label: string;
  disabled?: boolean;
}

/** `V` for a single select, `readonly V[]` with `multiple`, `null` when nothing is chosen. */
export type TesSelectValue<V> = V | readonly V[] | null;

/**
 * A select-only combobox: a button-like field that opens a list of options.
 *
 * ```html
 * <tes-form-field label="Country">
 *   <tes-select [options]="countries" [formField]="address.country" placeholder="Choose a country" />
 * </tes-form-field>
 * <tes-select [options]="tags" multiple [(value)]="selectedTags" aria-label="Tags" />
 * ```
 *
 * It is a Signal Forms `FormValueControl`, so `[formField]`, `[formControl]` and `[(ngModel)]` all
 * bind it without a value accessor. Keyboard and ARIA come from `@angular/aria` (combobox with a
 * listbox popup, active descendant focus, typeahead); the list is an inline CDK popover.
 */
@Component({
  selector: 'tes-select',
  imports: [
    TesIcon,
    Combobox,
    ComboboxPopup,
    ComboboxWidget,
    Listbox,
    Option,
    CdkConnectedOverlay,
    CdkOverlayOrigin,
  ],
  templateUrl: './select.html',
  styleUrl: './select.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tes-select' },
})
export class TesSelect<V = string> implements FormValueControl<TesSelectValue<V>> {
  protected readonly field = inject(TesFormField, { optional: true });

  /** Accessible name when the select is not inside a `tes-form-field`. */
  readonly label = input<string>();
  readonly options = input.required<readonly TesOption<V>[]>();
  readonly value = model<TesSelectValue<V>>(null);
  readonly placeholder = input('');
  /** Allows several values; `value` is then an array and the list stays open while choosing. */
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Emits when the control loses focus, so forms can mark it as touched. */
  readonly touch = output();

  protected readonly id = uniqueId('tes-select');
  private readonly trigger = viewChild.required('origin', { read: ElementRef });
  protected readonly positions = TES_DROPDOWN_POSITIONS;
  protected readonly expanded = signal(false);

  /**
   * The selection as the list expects it: an array of values that exist among the options. Values
   * that match no option (such as the '' many form models start with) count as no selection.
   */
  protected readonly selected = computed<V[]>(() => {
    const value = this.value();
    if (value === null) return [];
    const values = this.multiple() ? (value as readonly V[]) : [value as V];
    const known = new Set(this.options().map((o) => o.value));
    return values.filter((v) => known.has(v));
  });

  protected readonly displayText = computed(() => {
    const chosen = new Set(this.selected());
    return this.options()
      .filter((o) => chosen.has(o.value))
      .map((o) => o.label)
      .join(', ');
  });

  protected readonly isInvalid = computed(() => this.invalid() || !!this.field?.invalid());
  protected readonly describedBy = computed(() => {
    const ids = this.field?.describedBy() ?? [];
    return ids.length > 0 ? ids.join(' ') : null;
  });

  constructor() {
    this.field?.controlId.set(this.id);
    this.field?.control.set(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement);
    this.field?.controlRequiredOverride.set(() => this.required());
    this.field?.focusControl.set(() => {
      (this.trigger().nativeElement as HTMLElement).focus();
    });
  }

  protected onSelectionChange(values: readonly V[]): void {
    if (this.multiple()) {
      this.value.set(values);
      return;
    }
    this.value.set(values.at(-1) ?? null);
    this.expanded.set(false);
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    const host = (event.currentTarget as HTMLElement | null)?.closest('tes-select');
    if (!next || !host?.contains(next)) this.touch.emit();
  }
}
