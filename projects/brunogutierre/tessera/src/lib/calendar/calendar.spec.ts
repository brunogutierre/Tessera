import { ChangeDetectionStrategy, Component, LOCALE_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { userEvent } from 'vitest/browser';
import { loadTesseraStyles } from '../../test-utils/styles';
import { TesCalendar } from './calendar';

@Component({
  imports: [TesCalendar],
  template: `
    <tes-calendar
      [(value)]="value"
      [min]="min()"
      [max]="max()"
      today="2026-11-12"
      (picked)="picks.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly value = signal<string | null>('2026-11-10');
  readonly min = signal<string | null>(null);
  readonly max = signal<string | null>(null);
  readonly picks: string[] = [];
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const day = (iso: string) => el.querySelector<HTMLButtonElement>(`[data-date="${iso}"]`)!;
  const title = () => el.querySelector('.title')!.textContent.trim();
  const press = async (keys: string) => {
    await userEvent.keyboard(keys);
    await fixture.whenStable();
  };
  return { fixture, host: fixture.componentInstance, el, day, title, press };
}

beforeAll(loadTesseraStyles);

describe('TesCalendar', () => {
  it('shows the month of the value as a named grid with one tab stop', async () => {
    const { el, day, title } = await render();
    expect(title()).toBe('November 2026');
    const grid = el.querySelector('[role="grid"]')!;
    expect(document.getElementById(grid.getAttribute('aria-labelledby')!)!.textContent).toContain(
      'November 2026',
    );
    expect([...el.querySelectorAll('th')].map((th) => th.textContent.trim())[0]).toBe('Sun');
    expect(el.querySelector('th')!.getAttribute('abbr')).toBe('Sunday');
    expect(el.querySelectorAll('.day')).toHaveLength(30);
    expect(el.querySelectorAll('.day[tabindex="0"]')).toHaveLength(1);
    expect(day('2026-11-10').tabIndex).toBe(0);
    expect(day('2026-11-10').getAttribute('aria-label')).toBe('Tuesday, November 10, 2026');
    expect(day('2026-11-10').closest('td')!.getAttribute('aria-selected')).toBe('true');
    expect(day('2026-11-12').getAttribute('aria-current')).toBe('date');
  });

  it('moves by day, week, week edge, month and year with the keyboard', async () => {
    const { day, title, press } = await render();
    day('2026-11-10').focus();
    await press('{ArrowRight}');
    expect(document.activeElement).toBe(day('2026-11-11'));
    await press('{ArrowDown}');
    expect(document.activeElement).toBe(day('2026-11-18'));
    await press('{Home}');
    expect(document.activeElement).toBe(day('2026-11-15'));
    await press('{End}');
    expect(document.activeElement).toBe(day('2026-11-21'));
    await press('{ArrowUp}{ArrowLeft}');
    expect(document.activeElement).toBe(day('2026-11-13'));
    await press('{PageDown}');
    expect(title()).toBe('December 2026');
    expect(document.activeElement).toBe(day('2026-12-13'));
    await press('{Shift>}{PageUp}{/Shift}');
    expect(title()).toBe('December 2025');
    await press('{PageUp}');
    expect(document.activeElement).toBe(day('2025-11-13'));
  });

  it('crosses month boundaries with the arrow keys', async () => {
    const { day, title, press, host, fixture } = await render();
    host.value.set('2026-11-30');
    await fixture.whenStable();
    day('2026-11-30').focus();
    await press('{ArrowRight}');
    expect(title()).toBe('December 2026');
    expect(document.activeElement).toBe(day('2026-12-01'));
  });

  it('picks with a click or Enter and reports every pick', async () => {
    const { day, host, press, fixture } = await render();
    await userEvent.click(day('2026-11-20'));
    await fixture.whenStable();
    expect(host.value()).toBe('2026-11-20');
    // Focus follows the move after the grid re-renders, so each key gets its own tick.
    await press('{ArrowRight}');
    await press('{Enter}');
    expect(host.value()).toBe('2026-11-21');
    await press('{Enter}');
    expect(host.picks).toEqual(['2026-11-20', '2026-11-21', '2026-11-21']);
  });

  it('changes month with the header buttons without moving the selection', async () => {
    const { el, title, host, fixture } = await render();
    el.querySelector<HTMLElement>('[aria-label="Next month"]')!.click();
    await fixture.whenStable();
    expect(title()).toBe('December 2026');
    expect(host.value()).toBe('2026-11-10');
    el.querySelector<HTMLElement>('[aria-label="Previous month"]')!.click();
    el.querySelector<HTMLElement>('[aria-label="Previous month"]')!.click();
    await fixture.whenStable();
    expect(title()).toBe('October 2026');
  });

  it('disables days outside min and max and stops keyboard moves at the limits', async () => {
    const { day, host, fixture, press } = await render();
    host.min.set('2026-11-05');
    host.max.set('2026-11-11');
    await fixture.whenStable();
    expect(day('2026-11-04').disabled).toBe(true);
    expect(day('2026-11-12').disabled).toBe(true);
    expect(day('2026-11-05').disabled).toBe(false);
    day('2026-11-10').focus();
    await press('{ArrowRight}{ArrowRight}{ArrowRight}');
    expect(document.activeElement).toBe(day('2026-11-11'));
  });

  it('flips the horizontal arrows in right-to-left layouts', async () => {
    document.documentElement.dir = 'rtl';
    try {
      const { day, press } = await render();
      day('2026-11-10').focus();
      await press('{ArrowLeft}');
      expect(document.activeElement).toBe(day('2026-11-11'));
    } finally {
      document.documentElement.dir = '';
    }
  });

  it('uses the locale for names and the first day of the week', async () => {
    registerLocaleData(localeFr);
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }] });
    const { el, title } = await render();
    expect(title()).toBe('novembre 2026');
    expect(el.querySelector('th')!.getAttribute('abbr')).toBe('lundi');
  });
});
