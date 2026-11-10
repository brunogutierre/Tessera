import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { resolveColor, toRgba } from '../../test-utils/color';
import { loadTesseraStyles } from '../../test-utils/styles';
import { TesCard } from './card';
import type { TesCardVariant } from './card';

@Component({
  imports: [TesCard],
  template: `
    <tes-card class="full" [variant]="variant()">
      <h3 tesCardHeader>Revenue</h3>
      <p>1,234</p>
      <div tesCardFooter><a href="#more">Details</a></div>
    </tes-card>
    <article tes-card class="bare"><p>Only a body</p></article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly variant = signal<TesCardVariant>('outlined');
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  return { fixture, host: fixture.componentInstance, el };
}

beforeAll(loadTesseraStyles);

describe('TesCard', () => {
  it('projects header, body and footer into their regions', async () => {
    const { el } = await render();
    const card = el.querySelector('.full')!;
    expect(card.querySelector('.header h3')!.textContent).toBe('Revenue');
    expect(card.querySelector('.body p')!.textContent).toBe('1,234');
    expect(card.querySelector('.footer a')).not.toBeNull();
  });

  it('collapses empty header and footer regions', async () => {
    const { el } = await render();
    const bare = el.querySelector('.bare')!;
    expect(bare.tagName).toBe('ARTICLE');
    expect(getComputedStyle(bare.querySelector('.header')!).display).toBe('none');
    expect(getComputedStyle(bare.querySelector('.footer')!).display).toBe('none');
  });

  it('switches surface by variant', async () => {
    const { el, fixture, host } = await render();
    const card = el.querySelector<HTMLElement>('.full')!;
    const bg = () => toRgba(getComputedStyle(card).backgroundColor);
    expect(bg()).toEqual(resolveColor('--tes-color-surface', card));

    host.variant.set('elevated');
    await fixture.whenStable();
    expect(bg()).toEqual(resolveColor('--tes-color-surface-raised', card));
    expect(getComputedStyle(card).boxShadow).not.toBe('none');

    host.variant.set('filled');
    await fixture.whenStable();
    expect(bg()).toEqual(resolveColor('--tes-color-neutral-subtle', card));
  });
});
