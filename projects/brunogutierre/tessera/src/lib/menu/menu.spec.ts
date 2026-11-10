import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { resolveColor, toRgba } from '../../test-utils/color';
import { loadTesseraStyles } from '../../test-utils/styles';
import { TesThemeScope } from '../core/theme-scope';
import { TesMenu } from './menu';
import type { TesMenuEntry } from './menu';

@Component({
  imports: [TesMenu, TesThemeScope],
  template: `
    <section tesTheme="care" tesMode="dark">
      <tes-menu label="Actions" [items]="items" (selected)="chosen.set($event)" />
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly items: TesMenuEntry[] = [
    { value: 'edit', label: 'Edit', icon: 'pencil' },
    { value: 'download', label: 'Download' },
    { value: 'archive', label: 'Archive', disabled: true },
    'separator',
    { value: 'delete', label: 'Delete', icon: 'trash-2', danger: true },
  ];
  readonly chosen = signal<string | null>(null);
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const button = el.querySelector('button')!;
  const menu = () => el.querySelector<HTMLElement>('[role="menu"]');
  const items = () => [...el.querySelectorAll<HTMLElement>('[role="menuitem"]')];
  const settle = async () => {
    await fixture.whenStable();
    await new Promise((resolve) => requestAnimationFrame(resolve));
  };
  return { fixture, host: fixture.componentInstance, el, button, menu, items, settle };
}

beforeAll(loadTesseraStyles);

describe('TesMenu', () => {
  it('is a closed menu button at first', async () => {
    const { button, menu } = await render();
    expect(button.getAttribute('aria-haspopup')).toBe('true'); // equivalent to "menu"
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(menu()).toBeNull();
  });

  it('opens on click with focus on the first item', async () => {
    const { button, menu, items, settle } = await render();
    await userEvent.click(button);
    await settle();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(menu()).not.toBeNull();
    expect(button.getAttribute('aria-controls')).toBe(menu()!.id);
    expect(items().map((i) => i.textContent.trim())).toEqual([
      'Edit',
      'Download',
      'Archive',
      'Delete',
    ]);
    expect(document.activeElement).toBe(items()[0]);
  });

  it('moves with the arrow keys, selects with Enter and returns focus to the button', async () => {
    const { button, host, menu, settle } = await render();
    button.focus();
    await userEvent.keyboard('{Enter}');
    await settle();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement?.textContent.trim()).toBe('Download');
    await userEvent.keyboard('{Enter}');
    await settle();
    expect(host.chosen()).toBe('download');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(button);
    expect(menu()?.getAttribute('data-visible') ?? 'false').toBe('false');
  });

  it('closes on Escape without choosing', async () => {
    const { button, host, settle } = await render();
    await userEvent.click(button);
    await settle();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(host.chosen()).toBeNull();
    expect(document.activeElement).toBe(button);
  });

  it('marks disabled and destructive items and keeps the scoped theme in the panel', async () => {
    const { button, items, el, settle } = await render();
    await userEvent.click(button);
    await settle();
    const archive = items()[2]!;
    expect(archive.getAttribute('aria-disabled')).toBe('true');
    const remove = items()[3]!;
    expect(toRgba(getComputedStyle(remove).color)).toEqual(
      resolveColor('--tes-color-danger-text', remove),
    );
    const panel = el.querySelector<HTMLElement>('.panel')!;
    const careDarkPanel = resolveColor('--tes-color-surface-raised', el.querySelector('section')!);
    expect(toRgba(getComputedStyle(panel).backgroundColor)).toEqual(careDarkPanel);
    expect(el.querySelector('[role="separator"]')).not.toBeNull();
  });
});
