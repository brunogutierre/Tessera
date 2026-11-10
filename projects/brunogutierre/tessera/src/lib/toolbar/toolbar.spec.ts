import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { TesButton } from '../button/button';
import { TesToolbar, TesToolbarItem, TesToolbarSeparator } from './toolbar';

@Component({
  imports: [TesToolbar, TesToolbarItem, TesToolbarSeparator, TesButton],
  template: `
    <button type="button" class="before">Before</button>
    <tes-toolbar aria-label="Invoice actions">
      <button tes-button tesToolbarItem>Approve</button>
      <button tes-button tesToolbarItem [disabled]="true">Reject</button>
      <tes-toolbar-separator />
      <button tes-button tesToolbarItem>Print</button>
    </tes-toolbar>
    <button type="button" class="after">After</button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const items = [...el.querySelectorAll<HTMLButtonElement>('tes-toolbar button')];
  return { fixture, el, items };
}

describe('TesToolbar', () => {
  it('is a named toolbar with a vertical separator', async () => {
    const { el } = await render();
    const toolbar = el.querySelector('tes-toolbar')!;
    expect(toolbar.getAttribute('role')).toBe('toolbar');
    expect(toolbar.getAttribute('aria-label')).toBe('Invoice actions');
    const separator = el.querySelector('tes-toolbar-separator')!;
    expect(separator.getAttribute('role')).toBe('separator');
    expect(separator.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('has one tab stop and moves between items with the arrow keys', async () => {
    const { el, items } = await render();
    el.querySelector<HTMLElement>('.before')!.focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(items[0]);
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(items[1]);
    expect(items[1]!.getAttribute('aria-disabled')).toBe('true');
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(items[2]);
    await userEvent.tab();
    expect(document.activeElement).toBe(el.querySelector('.after'));
  });
});
