import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { TES_LABELS } from '../core/labels';
import { TES_DROPDOWN_POSITIONS } from '../core/overlay';
import { TesInput } from '../input/input';
import type { TesOption } from '../select/select';

/** Decides whether an option matches what was typed. */
export type TesOptionFilter<V> = (option: TesOption<V>, query: string) => boolean;

/** Case- and accent-insensitive "contains" on the label. */
export const containsFilter: TesOptionFilter<unknown> = (option, query) => {
  const normalize = (text: string): string =>
    text
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLocaleLowerCase();
  return normalize(option.label).includes(normalize(query.trim()));
};

/**
 * A text field that suggests options as you type (editable combobox with a list popup).
 *
 * ```html
 * <tes-form-field label="Destination city">
 *   <tes-autocomplete [options]="cities" [formField]="trip.city" placeholder="Start typing" />
 * </tes-form-field>
 * ```
 *
 * `value` is the chosen option's value (or `null` while the text matches no choice). The field is
 * a real `<input tes-input>`, so the form field labels and describes it natively. Keyboard and ARIA
 * come from `@angular/aria` (arrows move through suggestions with active descendant focus, Enter
 * chooses, Escape closes).
 */
@Component({
  selector: 'tes-autocomplete',
  imports: [
    TesInput,
    Combobox,
    ComboboxPopup,
    ComboboxWidget,
    Listbox,
    Option,
    CdkConnectedOverlay,
    CdkOverlayOrigin,
  ],
  templateUrl: './autocomplete.html',
  styleUrl: './autocomplete.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tes-autocomplete' },
})
export class TesAutocomplete<V = string> implements FormValueControl<V | null> {
  protected readonly labels = inject(TES_LABELS);

  readonly options = input.required<readonly TesOption<V>[]>();
  readonly value = model<V | null>(null);
  readonly placeholder = input('');
  readonly filter = input<TesOptionFilter<V>>(containsFilter);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touch = output();

  protected readonly positions = TES_DROPDOWN_POSITIONS;
  protected readonly expanded = signal(false);

  /** The label of the chosen option; resets the text whenever the value changes from outside. */
  readonly #chosenLabel = computed(
    () => this.options().find((o) => o.value === this.value())?.label ?? '',
  );
  /** Set while this component clears the value because the text stopped matching. */
  #clearedByTyping = false;
  /**
   * What is typed in the field. It follows the chosen option's label when the value changes from
   * outside (a form reset, a patch), but keeps the user's text when typing cleared the value.
   */
  protected readonly query = linkedSignal<string, string>({
    source: () => this.#chosenLabel(),
    computation: (label, previous) => {
      if (this.#clearedByTyping && previous) {
        this.#clearedByTyping = false;
        return previous.value;
      }
      return label;
    },
  });

  protected readonly suggestions = computed(() => {
    const query = this.query();
    if (query === this.#chosenLabel()) return this.options();
    const matches = this.filter();
    return this.options().filter((o) => matches(o, query));
  });
  protected readonly selected = computed<V[]>(() => {
    const value = this.value();
    return value === null ? [] : [value];
  });

  constructor() {
    // Typing something that is no longer the chosen option's label clears the choice.
    effect(() => {
      const query = this.query();
      if (this.value() !== null && query !== this.#chosenLabel()) {
        this.#clearedByTyping = true;
        this.value.set(null);
      }
    });
  }

  protected onSelectionChange(values: readonly V[]): void {
    const value = values.at(-1) ?? null;
    this.value.set(value);
    this.query.set(this.options().find((o) => o.value === value)?.label ?? '');
    this.expanded.set(false);
  }
}
