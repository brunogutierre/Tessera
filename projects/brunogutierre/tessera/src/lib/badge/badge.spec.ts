import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { contrast, resolveColor, toRgba } from '../../test-utils/color';
import { loadTesseraStyles } from '../../test-utils/styles';
import { TesBadge } from './badge';
import type { TesBadgeVariant, TesTone } from './badge';

@Component({
  imports: [TesBadge],
  template: `<tes-badge [tone]="tone()" [variant]="variant()">Paid</tes-badge>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly tone = signal<TesTone>('neutral');
  readonly variant = signal<TesBadgeVariant>('subtle');
}

const TONES: TesTone[] = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'];

beforeAll(loadTesseraStyles);

describe('TesBadge', () => {
  it('reflects tone and variant', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const badge = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('tes-badge')!;
    expect(badge.dataset['tone']).toBe('neutral');
    expect(badge.dataset['variant']).toBe('subtle');
    expect(badge.textContent).toBe('Paid');
  });

  it.each(['subtle', 'solid'] as const)(
    'keeps text readable (4.5:1) for every tone, %s',
    async (variant) => {
      const fixture = TestBed.createComponent(Host);
      fixture.componentInstance.variant.set(variant);
      await fixture.whenStable();
      const badge = (fixture.nativeElement as HTMLElement).querySelector('tes-badge')!;
      for (const tone of TONES) {
        fixture.componentInstance.tone.set(tone);
        await fixture.whenStable();
        const style = getComputedStyle(badge);
        const ratio = contrast(toRgba(style.color), toRgba(style.backgroundColor));
        expect(ratio, `${tone} ${variant}`).toBeGreaterThanOrEqual(4.5);
      }
    },
  );

  it('uses the status tokens', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.tone.set('danger');
    fixture.componentInstance.variant.set('solid');
    await fixture.whenStable();
    const badge = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('tes-badge')!;
    expect(toRgba(getComputedStyle(badge).backgroundColor)).toEqual(
      resolveColor('--tes-color-danger', badge),
    );
  });
});
