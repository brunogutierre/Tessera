import {
  addDays,
  addMonths,
  datePattern,
  firstDayOfWeek,
  formatDate,
  isIsoDate,
  isoDate,
  monthWeeks,
  parseDate,
  todayIso,
  weekday,
} from './date';

describe('date utilities', () => {
  it('builds and validates real dates only', () => {
    expect(isoDate(2026, 2, 28)).toBe('2026-02-28');
    expect(isoDate(2026, 2, 31)).toBeNull();
    expect(isoDate(2026, 13, 1)).toBeNull();
    expect(isoDate(50, 1, 1)).toBe('0050-01-01');
    expect(isIsoDate('2024-02-29')).toBe(true);
    expect(isIsoDate('2026-02-29')).toBe(false);
    expect(isIsoDate('10/11/2026')).toBe(false);
    expect(isIsoDate(null)).toBe(false);
    expect(isIsoDate(todayIso())).toBe(true);
  });

  it('moves by days and months without drifting', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2024-01-31', 1)).toBe('2024-02-29');
    expect(addMonths('2026-11-10', 12)).toBe('2027-11-10');
    expect(addMonths('2026-01-15', -1)).toBe('2025-12-15');
    expect(weekday('2026-11-10')).toBe(2); // Tuesday
  });

  it('lays out a month in six weeks from the locale first day', () => {
    expect(firstDayOfWeek('en-US')).toBe(0);
    expect(firstDayOfWeek('fr-FR')).toBe(1);
    const weeks = monthWeeks('2026-11', 0); // 1 Nov 2026 is a Sunday
    expect(weeks).toHaveLength(6);
    expect(weeks[0]?.[0]).toBe('2026-11-01');
    expect(weeks[4]?.[1]).toBe('2026-11-30');
    expect(weeks[5]?.every((day) => day === null)).toBe(true);
    expect(monthWeeks('2026-11', 1)[0]?.[6]).toBe('2026-11-01');
  });

  it('formats and parses in the locale order', () => {
    expect(formatDate('2026-11-22', 'en-US')).toBe('11/22/2026');
    expect(formatDate('2026-11-22', 'pt-BR')).toBe('22/11/2026');
    expect(datePattern('en-US')).toBe('mm/dd/yyyy');
    expect(datePattern('de-DE')).toBe('dd.mm.yyyy');
    expect(parseDate('11/22/2026', 'en-US')).toBe('2026-11-22');
    expect(parseDate('22/11/2026', 'pt-BR')).toBe('2026-11-22');
    expect(parseDate(' 22.11.26 ', 'de-DE')).toBe('2026-11-22');
    expect(parseDate('2026-11-22', 'pt-BR')).toBe('2026-11-22');
    expect(parseDate('31/02/2026', 'pt-BR')).toBeNull();
    expect(parseDate('tomorrow', 'en-US')).toBeNull();
    expect(parseDate('11/22', 'en-US')).toBeNull();
  });
});
