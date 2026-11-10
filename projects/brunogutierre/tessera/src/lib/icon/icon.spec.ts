import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TesIcon } from './icon';
import { TES_ICONS } from './icons';
import type { TesIconName } from './icons';

@Component({
  imports: [TesIcon],
  template: `<tes-icon [name]="name()" [label]="label()" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly name = signal<TesIconName>('check');
  readonly label = signal<string | undefined>(undefined);
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const icon = (fixture.nativeElement as HTMLElement).querySelector('tes-icon')!;
  return { fixture, host: fixture.componentInstance, icon };
}

describe('TesIcon', () => {
  it('draws the paths of the named icon', async () => {
    const { fixture, host, icon } = await render();
    expect(icon.querySelectorAll('path')).toHaveLength(TES_ICONS.check.length);
    host.name.set('trash-2');
    await fixture.whenStable();
    const drawn = [...icon.querySelectorAll('path')].map((p) => p.getAttribute('d'));
    expect(drawn).toEqual(TES_ICONS['trash-2']);
  });

  it('is decorative unless labelled', async () => {
    const { fixture, host, icon } = await render();
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(icon.hasAttribute('role')).toBe(false);

    host.label.set('Done');
    await fixture.whenStable();
    expect(icon.getAttribute('role')).toBe('img');
    expect(icon.getAttribute('aria-label')).toBe('Done');
    expect(icon.hasAttribute('aria-hidden')).toBe(false);
  });

  it('mirrors horizontal arrows in right-to-left layouts', async () => {
    const { fixture, host, icon } = await render();
    expect(icon.hasAttribute('data-directional')).toBe(false);
    host.name.set('chevron-right');
    await fixture.whenStable();
    expect(icon.hasAttribute('data-directional')).toBe(true);

    (fixture.nativeElement as HTMLElement).dir = 'rtl';
    expect(getComputedStyle(icon.querySelector('svg')!).transform).toBe(
      'matrix(-1, 0, 0, 1, 0, 0)',
    );
  });

  it('draws every icon in the set on the 24px grid', () => {
    for (const paths of Object.values(TES_ICONS)) {
      expect(paths.length).toBeGreaterThan(0);
      for (const d of paths) expect(d).toMatch(/^[Mm][\d.\s-]/);
    }
  });
});
