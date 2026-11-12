/**
 * Calendar dates as ISO strings (`YYYY-MM-DD`), like `<input type="date">`. A plain date has no
 * time and no time zone, so all math runs in UTC and a date never shifts by a day.
 */
export type TesIsoDate = string;

const DAY = 86_400_000;

function pad(value: number, length = 2): string {
  return String(value).padStart(length, '0');
}

function toUtc(iso: TesIsoDate): Date {
  const [year = 0, month = 1, day = 1] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function fromUtc(date: Date): TesIsoDate {
  return `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/** Builds an ISO date, or `null` when the parts are not a real date (31 February). */
export function isoDate(year: number, month: number, day: number): TesIsoDate | null {
  if (!Number.isInteger(year) || year < 1 || year > 9999) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCFullYear(year); // Date.UTC maps years 0–99 to 1900–1999
  const valid = date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return valid ? fromUtc(date) : null;
}

export function isIsoDate(value: unknown): value is TesIsoDate {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return !!match && isoDate(Number(match[1]), Number(match[2]), Number(match[3])) === value;
}

/** Today in the user's time zone. */
export function todayIso(): TesIsoDate {
  const now = new Date();
  return `${pad(now.getFullYear(), 4)}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function addDays(iso: TesIsoDate, days: number): TesIsoDate {
  return fromUtc(new Date(toUtc(iso).getTime() + days * DAY));
}

/** Moves by whole months, keeping the day when it exists (31 Jan + 1 month = 28 or 29 Feb). */
export function addMonths(iso: TesIsoDate, months: number): TesIsoDate {
  const date = toUtc(iso);
  const first = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0));
  first.setUTCDate(Math.min(date.getUTCDate(), lastDay.getUTCDate()));
  return fromUtc(first);
}

/** Day of the week, 0 (Sunday) to 6 (Saturday). */
export function weekday(iso: TesIsoDate): number {
  return toUtc(iso).getUTCDay();
}

/** First day of the week for a locale, 0 (Sunday) to 6 (Saturday). Monday when unknown. */
export function firstDayOfWeek(locale: string): number {
  interface WeekInfo {
    firstDay?: number;
  }
  const info = new Intl.Locale(locale) as Intl.Locale & {
    getWeekInfo?: () => WeekInfo;
    weekInfo?: WeekInfo;
  };
  const firstDay = (info.getWeekInfo?.() ?? info.weekInfo)?.firstDay ?? 1; // 1 = Monday … 7 = Sunday
  return firstDay % 7;
}

/** The weeks of a month as rows of seven cells; days outside the month are `null`. */
export function monthWeeks(month: string, firstDay: number): (TesIsoDate | null)[][] {
  const first = `${month}-01`;
  const days = toUtc(addDays(addMonths(first, 1), -1)).getUTCDate();
  const offset = (weekday(first) - firstDay + 7) % 7;
  const cells: (TesIsoDate | null)[] = Array.from({ length: 42 }, (_, i) =>
    i >= offset && i < offset + days ? addDays(first, i - offset) : null,
  );
  return Array.from({ length: 6 }, (_, row) => cells.slice(row * 7, row * 7 + 7));
}

export function formatDate(
  iso: TesIsoDate,
  locale: string,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' },
): string {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(toUtc(iso));
}

type DatePart = 'day' | 'month' | 'year';

function dateParts(locale: string): Intl.DateTimeFormatPart[] {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).formatToParts(toUtc('2000-11-22'));
}

/** The numeric date pattern of a locale, such as `mm/dd/yyyy` or `dd/mm/yyyy`. */
export function datePattern(locale: string): string {
  const names: Record<string, string> = { day: 'dd', month: 'mm', year: 'yyyy' };
  return dateParts(locale)
    .map((part) => names[part.type] ?? part.value)
    .join('');
}

/**
 * Parses what a person typed: the locale's numeric order with any separator ("11/22/2026",
 * "22.11.26"), or ISO. Returns `null` for anything that is not a real date.
 */
export function parseDate(text: string, locale: string): TesIsoDate | null {
  const trimmed = text.trim();
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);
  if (iso) return isoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  const numbers = trimmed.split(/\D+/).filter(Boolean).map(Number);
  if (numbers.length !== 3) return null;
  const order = dateParts(locale)
    .map((part) => part.type)
    .filter((type): type is DatePart => type === 'day' || type === 'month' || type === 'year');
  const value: Record<DatePart, number> = { day: 0, month: 0, year: 0 };
  order.forEach((part, index) => (value[part] = numbers[index] ?? 0));
  return isoDate(value.year < 100 ? value.year + 2000 : value.year, value.month, value.day);
}
