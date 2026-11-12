import { Directionality } from '@angular/cdk/bidi';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  LOCALE_ID,
  afterRenderEffect,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  output,
} from '@angular/core';
import { TesButton } from '../button/button';
import {
  addDays,
  addMonths,
  firstDayOfWeek,
  formatDate,
  monthWeeks,
  todayIso,
  weekday,
} from '../core/date';
import type { TesIsoDate } from '../core/date';
import { uniqueId } from '../core/id';
import { TES_LABELS } from '../core/labels';
import { TesIcon } from '../icon/icon';

interface Day {
  iso: TesIsoDate;
  number: number;
  /** Full date, the button's accessible name: "Tuesday, November 10, 2026". */
  label: string;
  disabled: boolean;
}

/**
 * A month grid to pick one date (`YYYY-MM-DD`).
 *
 * ```html
 * <tes-calendar [(value)]="date" min="2026-01-01" />
 * ```
 *
 * Keyboard follows the APG date grid: the arrow keys move by day and week (flipped in RTL), Home and
 * End go to the start and end of the week, Page Up and Page Down change the month, with Shift the
 * year; Enter or Space picks. One day holds the tab stop. Month names, weekday names and the first
 * day of the week come from `LOCALE_ID`.
 *
 * The keyboard is implemented here, not with `@angular/aria/grid`: a calendar's moves cross month
 * boundaries and re-render the grid, which a generic grid's cell navigation does not model.
 */
@Component({
  selector: 'tes-calendar',
  imports: [TesButton, TesIcon],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tes-calendar', '(keydown)': 'onKeydown($event)' },
})
export class TesCalendar {
  protected readonly labels = inject(TES_LABELS);
  readonly #locale = inject(LOCALE_ID);
  readonly #direction = inject(Directionality);
  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  #focusAfterRender = false;

  readonly value = model<TesIsoDate | null>(null);
  /** Earliest and latest selectable dates. */
  readonly min = input<TesIsoDate | null>();
  readonly max = input<TesIsoDate | null>();
  /** The date marked as today; defaults to the current date. */
  readonly today = input<TesIsoDate>(todayIso());
  /** Emits on every pick, also when the picked date is already the value. */
  readonly picked = output<TesIsoDate>();

  protected readonly headingId = uniqueId('tes-calendar-title');
  /** The day that holds the tab stop; its month is the one shown. */
  protected readonly active = linkedSignal(() => this.#clamp(this.value() ?? this.today()));
  protected readonly title = computed(() =>
    formatDate(this.active(), this.#locale, { month: 'long', year: 'numeric' }),
  );
  protected readonly weekdays = computed(() => {
    const first = firstDayOfWeek(this.#locale);
    const sunday = '2024-01-07';
    return Array.from({ length: 7 }, (_, i) => {
      const day = addDays(sunday, first + i);
      return {
        short: formatDate(day, this.#locale, { weekday: 'short' }),
        long: formatDate(day, this.#locale, { weekday: 'long' }),
      };
    });
  });
  protected readonly weeks = computed<(Day | null)[][]>(() =>
    monthWeeks(this.active().slice(0, 7), firstDayOfWeek(this.#locale)).map((week) =>
      week.map((iso) =>
        iso === null
          ? null
          : {
              iso,
              number: Number(iso.slice(8)),
              label: formatDate(iso, this.#locale, { dateStyle: 'full' }),
              disabled: this.#outOfRange(iso),
            },
      ),
    ),
  );

  constructor() {
    // After a keyboard move re-rendered the grid (maybe another month), focus the active day.
    afterRenderEffect(() => {
      this.active();
      if (this.#focusAfterRender) {
        this.#focusAfterRender = false;
        this.focus();
      }
    });
  }

  /** Moves keyboard focus to the day that holds the tab stop. */
  focus(): void {
    this.#host.querySelector<HTMLElement>(`[data-date="${this.active()}"]`)?.focus();
  }

  protected showMonth(delta: number): void {
    this.active.set(this.#clamp(addMonths(this.active(), delta)));
  }

  protected pick(iso: TesIsoDate): void {
    this.active.set(iso);
    this.value.set(iso);
    this.picked.emit(iso);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!(event.target as HTMLElement).classList.contains('day')) return;
    const next = this.#move(event);
    if (next === null) return;
    event.preventDefault();
    const clamped = this.#clamp(next);
    if (clamped === this.active()) return;
    this.#focusAfterRender = true;
    this.active.set(clamped);
  }

  #move(event: KeyboardEvent): TesIsoDate | null {
    const active = this.active();
    const forward = this.#direction.value === 'rtl' ? -1 : 1;
    const column = (weekday(active) - firstDayOfWeek(this.#locale) + 7) % 7;
    switch (event.key) {
      case 'ArrowRight':
        return addDays(active, forward);
      case 'ArrowLeft':
        return addDays(active, -forward);
      case 'ArrowDown':
        return addDays(active, 7);
      case 'ArrowUp':
        return addDays(active, -7);
      case 'Home':
        return addDays(active, -column);
      case 'End':
        return addDays(active, 6 - column);
      case 'PageDown':
        return addMonths(active, event.shiftKey ? 12 : 1);
      case 'PageUp':
        return addMonths(active, event.shiftKey ? -12 : -1);
      default:
        return null;
    }
  }

  #outOfRange(iso: TesIsoDate): boolean {
    const min = this.min();
    const max = this.max();
    return (!!min && iso < min) || (!!max && iso > max);
  }

  #clamp(iso: TesIsoDate): TesIsoDate {
    const min = this.min();
    const max = this.max();
    if (min && iso < min) return min;
    if (max && iso > max) return max;
    return iso;
  }
}
