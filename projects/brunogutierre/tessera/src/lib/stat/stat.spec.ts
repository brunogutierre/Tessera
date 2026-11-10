import { ChangeDetectionStrategy, Component, LOCALE_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { resolveColor, toRgba } from '../../test-utils/color';
import { loadTesseraStyles } from '../../test-utils/styles';
import { TesStat } from './stat';

@Component({
  imports: [TesStat],
  template: `
    <tes-stat
      label="Revenue"
      value="$1.24M"
      [delta]="delta()"
      [positive]="positive()"
      deltaLabel="vs last month"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly delta = signal<number | undefined>(0.125);
  readonly positive = signal<'up' | 'down'>('up');
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const stat = (fixture.nativeElement as HTMLElement).querySelector('tes-stat')!;
  const text = () => (stat as HTMLElement).innerText.replace(/\s+/g, ' ').trim();
  return { fixture, host: fixture.componentInstance, stat, text };
}

beforeAll(loadTesseraStyles);

describe('TesStat', () => {
  it('reads label, value, signed change, direction and context', async () => {
    const { text } = await render();
    expect(text()).toBe('Revenue $1.24M +12.5% increase vs last month');
  });

  it('colors the change by whether its direction is good', async () => {
    const { fixture, host, stat } = await render();
    const delta = () => stat.querySelector<HTMLElement>('.delta')!;
    const color = () => toRgba(getComputedStyle(delta()).color);
    expect(color()).toEqual(resolveColor('--tes-color-success-text', delta()));

    host.positive.set('down');
    await fixture.whenStable();
    expect(color()).toEqual(resolveColor('--tes-color-danger-text', delta()));

    host.delta.set(-0.004);
    await fixture.whenStable();
    expect(delta().dataset['trend']).toBe('down');
    expect(color()).toEqual(resolveColor('--tes-color-success-text', delta()));
  });

  it('shows no sign, icon or direction for zero, and nothing without a delta', async () => {
    const { fixture, host, stat, text } = await render();
    host.delta.set(0);
    await fixture.whenStable();
    expect(text()).toBe('Revenue $1.24M 0% vs last month');
    expect(stat.querySelector('tes-icon')).toBeNull();

    host.delta.set(undefined);
    await fixture.whenStable();
    expect(stat.querySelector('.delta')).toBeNull();
  });

  it('formats the change for the app locale', async () => {
    registerLocaleData(localePt);
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }] });
    const { text } = await render();
    expect(text()).toContain('+12,5%');
  });
});
