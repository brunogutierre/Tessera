import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { resolveColor, toRgba } from '../../test-utils/color';
import { movePointerAway } from '../../test-utils/pointer';
import { loadTesseraStyles } from '../../test-utils/styles';
import { TesIcon } from '../icon/icon';
import { TesButton } from './button';
import type { TesButtonVariant } from './button';

@Component({
  imports: [TesButton, TesIcon],
  template: `
    <button tes-button [variant]="variant()" [loading]="loading()" (click)="clicks = clicks + 1">
      Save
    </button>
    <button tes-button iconOnly class="unnamed"><tes-icon name="x" /></button>
    <button tes-button disabled class="disabled">Off</button>
    <a tes-button href="#top">Link</a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly variant = signal<TesButtonVariant>('primary');
  readonly loading = signal(false);
  clicks = 0;
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  return {
    fixture,
    host: fixture.componentInstance,
    button: el.querySelector<HTMLButtonElement>('button')!,
    el,
  };
}

const bg = (el: Element) => toRgba(getComputedStyle(el).backgroundColor);

beforeAll(loadTesseraStyles);
beforeEach(movePointerAway);
afterEach(() => {
  document.getElementById('consumer-css')?.remove();
});

describe('TesButton', () => {
  it('reflects variant and size on the native element', async () => {
    const { button, el } = await render();
    expect(button.dataset['variant']).toBe('primary');
    expect(button.dataset['size']).toBe('md');
    expect(button.classList).toContain('tes-button');
    expect(el.querySelector('a')!.getAttribute('href')).toBe('#top');
  });

  it('paints variants from semantic tokens (component styles live in a cascade layer)', async () => {
    const { button, fixture, host } = await render();
    expect(bg(button)).toEqual(resolveColor('--tes-color-primary', button));
    host.variant.set('danger');
    await fixture.whenStable();
    expect(bg(button)).toEqual(resolveColor('--tes-color-danger', button));
  });

  it('lets unlayered consumer CSS win regardless of specificity', async () => {
    const { button } = await render();
    const style = document.createElement('style');
    style.id = 'consumer-css';
    style.textContent = `.tes-button { background-color: rgb(1, 2, 3); --tes-button-radius: 0px; }`;
    document.head.append(style);
    expect(getComputedStyle(button).backgroundColor).toBe('rgb(1, 2, 3)');
    expect(getComputedStyle(button).borderTopLeftRadius).toBe('0px');
  });

  it('shows a focus ring on keyboard focus', async () => {
    const { button } = await render();
    await userEvent.tab();
    expect(document.activeElement).toBe(button);
    expect(getComputedStyle(button).outlineStyle).toBe('solid');
    expect(toRgba(getComputedStyle(button).outlineColor)).toEqual(
      resolveColor('--tes-color-focus', button),
    );
  });

  it('blocks clicks while loading but stays focusable', async () => {
    const { button, fixture, host } = await render();
    button.click();
    expect(host.clicks).toBe(1);

    host.loading.set(true);
    await fixture.whenStable();
    button.click();
    expect(host.clicks).toBe(1);
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.disabled).toBe(false);
    expect(button.querySelector('tes-spinner')!.getAttribute('aria-hidden')).toBe('true');
    expect(getComputedStyle(button.querySelector('.label')!).opacity).toBe('0');

    host.loading.set(false);
    await fixture.whenStable();
    button.click();
    expect(host.clicks).toBe(2);
    expect(button.hasAttribute('aria-disabled')).toBe(false);
  });

  it('keeps an aria-disabled written by the consumer', async () => {
    @Component({
      imports: [TesButton],
      template: `<button tes-button aria-disabled="true" [loading]="loading()">Pay</button>`,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class Static {
      readonly loading = signal(true);
    }
    const fixture = TestBed.createComponent(Static);
    await fixture.whenStable();
    fixture.componentInstance.loading.set(false);
    await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button')!;
    expect(button.getAttribute('aria-disabled')).toBe('true');
  });

  it('uses disabled tokens for natively disabled buttons', async () => {
    const { el } = await render();
    const disabled = el.querySelector<HTMLElement>('.disabled')!;
    expect(bg(disabled)).toEqual(resolveColor('--tes-color-neutral-subtle', disabled));
    expect(toRgba(getComputedStyle(disabled).color)).toEqual(
      resolveColor('--tes-color-text-disabled', disabled),
    );
  });

  it('warns in dev mode when an icon-only button has no accessible name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { el } = await render();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[1]).toBe(el.querySelector('.unnamed'));
    warn.mockRestore();
  });

  it('keeps a square, 24px minimum target for icon-only small buttons', async () => {
    @Component({
      imports: [TesButton, TesIcon],
      template: `<button tes-button iconOnly size="sm" aria-label="Close">
        <tes-icon name="x" />
      </button>`,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class Small {}
    const fixture = TestBed.createComponent(Small);
    await fixture.whenStable();
    const rect = (fixture.nativeElement as HTMLElement)
      .querySelector('button')!
      .getBoundingClientRect();
    expect(rect.width).toBe(rect.height);
    expect(rect.height).toBeGreaterThanOrEqual(24);
  });
});
