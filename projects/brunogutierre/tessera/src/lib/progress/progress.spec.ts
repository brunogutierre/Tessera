import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { contrast, toRgba } from '../../test-utils/color';
import { loadTesseraStyles } from '../../test-utils/styles';
import { TES_THEMES } from '../core/tokens';
import { TesProgress } from './progress';
import type { TesProgressTone } from './progress';

@Component({
  imports: [TesProgress],
  template: `
    <div style="inline-size: 300px">
      <tes-progress label="Upload" [value]="value()" [max]="max()" [tone]="tone()" showValue />
    </div>
    <tes-progress class="static" aria-label="Sync" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly value = signal<number | null>(30);
  readonly max = signal(120);
  readonly tone = signal<TesProgressTone>('primary');
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  return {
    fixture,
    host: fixture.componentInstance,
    progress: el.querySelector('tes-progress')!,
    el,
  };
}

beforeAll(loadTesseraStyles);

describe('TesProgress', () => {
  it('exposes value, range and a percentage text', async () => {
    const { progress } = await render();
    expect(progress.getAttribute('role')).toBe('progressbar');
    expect(progress.getAttribute('aria-label')).toBe('Upload');
    expect(progress.getAttribute('aria-valuemin')).toBe('0');
    expect(progress.getAttribute('aria-valuemax')).toBe('120');
    expect(progress.getAttribute('aria-valuenow')).toBe('30');
    expect(progress.getAttribute('aria-valuetext')).toBe('25%');
    expect(progress.querySelector('.value')!.textContent).toBe('25%');
  });

  it('fills the track proportionally and clamps out-of-range values', async () => {
    const { fixture, host, progress } = await render();
    const bar = () => progress.querySelector<HTMLElement>('.bar')!.style.inlineSize;
    expect(bar()).toBe('25%');
    host.value.set(500);
    await fixture.whenStable();
    expect(bar()).toBe('100%');
    expect(progress.getAttribute('aria-valuenow')).toBe('120');
    host.value.set(-5);
    await fixture.whenStable();
    expect(bar()).toBe('0%');
  });

  it('is indeterminate without a value', async () => {
    const { fixture, host, progress, el } = await render();
    host.value.set(null);
    await fixture.whenStable();
    expect(progress.hasAttribute('aria-valuenow')).toBe(false);
    expect(progress.hasAttribute('aria-valuetext')).toBe(false);
    expect(progress.hasAttribute('data-indeterminate')).toBe(true);
    expect(progress.querySelector('.value')).toBeNull();
    expect(el.querySelector('.static')!.getAttribute('aria-label')).toBe('Sync');
  });

  it('handles a zero max', async () => {
    const { fixture, host, progress } = await render();
    host.max.set(0);
    await fixture.whenStable();
    expect(progress.getAttribute('aria-valuetext')).toBe('0%');
  });

  it.each(TES_THEMES)('keeps every tone at 3:1 against the track in %s', async (theme) => {
    const { fixture, host, progress } = await render();
    for (const mode of ['light', 'dark']) {
      progress.setAttribute('data-tes-theme', theme);
      progress.setAttribute('data-tes-mode', mode);
      for (const tone of ['primary', 'success', 'warning', 'danger'] as const) {
        host.tone.set(tone);
        await fixture.whenStable();
        const fill = toRgba(getComputedStyle(progress.querySelector('.bar')!).backgroundColor);
        const track = toRgba(getComputedStyle(progress.querySelector('.track')!).backgroundColor);
        expect(contrast(fill, track), `${theme} ${mode} ${tone}`).toBeGreaterThanOrEqual(3);
      }
    }
  });
});
