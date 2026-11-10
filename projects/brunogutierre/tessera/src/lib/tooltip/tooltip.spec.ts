import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { resolveColor, toRgba } from '../../test-utils/color';
import { loadTesseraStyles } from '../../test-utils/styles';
import { TesThemeScope } from '../core/theme-scope';
import { TesTooltip } from './tooltip';

@Component({
  imports: [TesTooltip, TesThemeScope],
  template: `
    <section tesTheme="fintech" tesMode="dark" style="padding: 48px">
      <button type="button" [tesTooltip]="text()" tesTooltipDelay="0">Export</button>
    </section>
    <button type="button" class="other">Other</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly text = signal('Export as CSV');
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const button = el.querySelector('button')!;
  const panel = () => el.querySelector<HTMLElement>('tes-tooltip-panel');
  const wait = (ms = 30) => new Promise((resolve) => setTimeout(resolve, ms));
  return { fixture, host: fixture.componentInstance, el, button, panel, wait };
}

beforeAll(loadTesseraStyles);

describe('TesTooltip', () => {
  it('describes its host even while hidden', async () => {
    const { button, panel } = await render();
    const ids = button.getAttribute('aria-describedby')!;
    expect(document.getElementById(ids)!.textContent).toBe('Export as CSV');
    expect(panel()).toBeNull();
  });

  it('shows on keyboard focus and hides on blur', async () => {
    const { panel } = await render();
    await userEvent.tab();
    expect(panel()!.textContent).toBe('Export as CSV');
    expect(panel()!.getAttribute('aria-hidden')).toBe('true');
    await userEvent.tab();
    expect(panel()).toBeNull();
  });

  it('shows on hover after the delay, stays while the pointer is on it, and hides after', async () => {
    const { button, panel, wait } = await render();
    await userEvent.hover(button);
    await wait();
    expect(panel()).not.toBeNull();
    await userEvent.hover(panel()!);
    await wait(150);
    expect(panel()).not.toBeNull();
    await userEvent.unhover(panel()!);
    await wait(150);
    expect(panel()).toBeNull();
  });

  it('is dismissed with Escape without moving focus', async () => {
    const { button, panel } = await render();
    await userEvent.tab();
    expect(panel()).not.toBeNull();
    await userEvent.keyboard('{Escape}');
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(button);
  });

  it('renders inline, so it keeps the scoped theme, in inverse colors', async () => {
    const { panel, el } = await render();
    await userEvent.tab();
    const section = el.querySelector('section')!;
    expect(section.contains(panel())).toBe(true);
    expect(toRgba(getComputedStyle(panel()!).backgroundColor)).toEqual(
      resolveColor('--tes-color-text', section),
    );
  });

  it('updates the description and the visible text when the input changes', async () => {
    const { button, panel, fixture, host } = await render();
    await userEvent.tab();
    host.text.set('Export as PDF');
    await fixture.whenStable();
    expect(panel()!.textContent).toBe('Export as PDF');
    const id = button.getAttribute('aria-describedby')!;
    expect(document.getElementById(id)!.textContent).toBe('Export as PDF');
  });
});
