import { CdkTrapFocus } from '@angular/cdk/a11y';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  LOCALE_ID,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import { TesButton } from '../button/button';
import { TesCalendar } from '../calendar/calendar';
import { datePattern, formatDate, parseDate } from '../core/date';
import type { TesIsoDate } from '../core/date';
import { TES_LABELS } from '../core/labels';
import { TES_DROPDOWN_POSITIONS } from '../core/overlay';
import { TesFormField } from '../form-field/form-field';
import { TesIcon } from '../icon/icon';
import { TesInput } from '../input/input';

/**
 * A date field: type the date in the locale's numeric format, or pick it from a calendar.
 *
 * ```html
 * <tes-form-field label="Due date">
 *   <tes-date-picker [formField]="invoice.due" />
 * </tes-form-field>
 * <tes-date-picker label="Start" [(value)]="start" min="2026-01-01" max="2026-12-31" />
 * ```
 *
 * `value` is an ISO date (`YYYY-MM-DD`) or `null`, so it has no time zone and serializes as is.
 * The calendar opens in a dialog popover with focus on the selected day (APG date picker dialog);
 * Escape closes it and focus returns to the calendar button. Text that is not a date, or is out
 * of range, marks the field invalid and clears the value. A Signal Forms `FormValueControl`.
 */
@Component({
  selector: 'tes-date-picker',
  imports: [
    TesInput,
    TesButton,
    TesIcon,
    TesCalendar,
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    CdkTrapFocus,
  ],
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tes-date-picker',
    '(keydown.escape)': 'onEscape($event)',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class TesDatePicker implements FormValueControl<TesIsoDate | null> {
  protected readonly labels = inject(TES_LABELS);
  protected readonly field = inject(TesFormField, { optional: true });
  readonly #locale = inject(LOCALE_ID);
  readonly #injector = inject(Injector);
  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly value = model<TesIsoDate | null>(null);
  /** Accessible name when the date picker is not inside a `tes-form-field`. */
  readonly label = input<string>();
  /** Earliest and latest dates that can be typed or picked. */
  readonly min = input<TesIsoDate | undefined>();
  readonly max = input<TesIsoDate | undefined>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly touch = output();

  protected readonly positions = TES_DROPDOWN_POSITIONS;
  /** The locale's numeric pattern, shown as the placeholder. */
  protected readonly formatHint = datePattern(this.#locale);
  protected readonly open = signal(false);
  /** The typed text is not a date in range. */
  protected readonly rejected = signal(false);
  /** What the field shows; follows the value when it changes from outside. */
  protected readonly text = linkedSignal(() => {
    const value = this.value();
    return value ? formatDate(value, this.#locale) : '';
  });
  protected readonly toggleLabel = computed(() => {
    const value = this.value();
    if (!value) return this.labels.chooseDate;
    return `${this.labels.chooseDate}, ${formatDate(value, this.#locale, { dateStyle: 'long' })}`;
  });

  private readonly toggle = viewChild.required('toggle', { read: ElementRef });
  private readonly calendar = viewChild(TesCalendar);

  /** Reads what was typed when the field changes (on Enter or blur). */
  protected commit(event: Event): void {
    const typed = (event.target as HTMLInputElement).value;
    const parsed = typed.trim() === '' ? null : parseDate(typed, this.#locale);
    const accepted = parsed !== null && !this.#outOfRange(parsed);
    this.value.set(accepted ? parsed : null);
    this.rejected.set(typed.trim() !== '' && !accepted);
    // Set after the value: normalizes an accepted date, keeps rejected text for correction.
    this.text.set(accepted ? formatDate(parsed, this.#locale) : typed);
  }

  protected pick(date: TesIsoDate): void {
    this.value.set(date);
    this.rejected.set(false);
    this.close();
  }

  protected toggleOpen(): void {
    this.open.update((open) => !open);
  }

  /** The dialog starts with focus on the selected (or current) day. */
  protected onAttach(): void {
    afterNextRender(() => this.calendar()?.focus(), { injector: this.#injector });
  }

  protected onOutsideClick(event: MouseEvent): void {
    // A click on the calendar button is handled by the button itself.
    if (!this.#host.contains(event.target as Node)) this.open.set(false);
  }

  protected onEscape(event: Event): void {
    if (!this.open()) return;
    event.stopPropagation();
    this.close();
  }

  protected onFocusOut(event: FocusEvent): void {
    if (!this.#host.contains(event.relatedTarget as Node | null)) this.touch.emit();
  }

  /** Closes the calendar and returns focus to its button. */
  protected close(): void {
    this.open.set(false);
    (this.toggle().nativeElement as HTMLElement).focus();
  }

  #outOfRange(date: TesIsoDate): boolean {
    const min = this.min();
    const max = this.max();
    return (!!min && date < min) || (!!max && date > max);
  }
}
