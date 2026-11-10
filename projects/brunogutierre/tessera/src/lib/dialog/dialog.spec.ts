import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { userEvent } from 'vitest/browser';
import { resolveColor, toRgba } from '../../test-utils/color';
import { loadTesseraStyles } from '../../test-utils/styles';
import { TesButton } from '../button/button';
import { TesDialog, TesDialogLayout } from './dialog';
import type { TesDialogOptions } from './dialog';

@Component({
  imports: [TesDialogLayout, TesButton],
  template: `
    <tes-dialog heading="Delete invoice?">
      <p>{{ data }} will be removed.</p>
      <div tesDialogFooter>
        <button tes-button class="cancel" (click)="ref.close(false)">Cancel</button>
        <button tes-button variant="danger" (click)="ref.close(true)">Delete</button>
      </div>
    </tes-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Confirm {
  protected readonly data = inject<string>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<boolean>>(DialogRef);
}

async function open(options: TesDialogOptions<string> = {}) {
  const opener = document.createElement('button');
  opener.textContent = 'Open';
  document.body.append(opener);
  opener.focus();
  const ref = TestBed.inject(TesDialog).open<boolean, string, Confirm>(Confirm, {
    data: 'INV-0184',
    ...options,
  });
  await new Promise((resolve) => setTimeout(resolve, 50));
  const container = document.querySelector<HTMLElement>('[role="dialog"], [role="alertdialog"]')!;
  return { ref, container, opener };
}

beforeAll(loadTesseraStyles);
afterEach(() => {
  document.querySelectorAll('body > button').forEach((b) => {
    b.remove();
  });
});

describe('TesDialog', () => {
  it('opens a modal dialog named by its heading, with focus inside', async () => {
    const { container, ref } = await open();
    expect(container.getAttribute('aria-modal')).toBe('true');
    const title = document.getElementById(container.getAttribute('aria-labelledby')!)!;
    expect(title.tagName).toBe('H2');
    expect(title.textContent).toBe('Delete invoice?');
    expect(container.contains(document.activeElement)).toBe(true);
    expect(container.textContent).toContain('INV-0184 will be removed.');
    ref.close();
  });

  it('returns the result and gives focus back to the opener', async () => {
    const { ref, opener } = await open();
    const result = firstValueFrom(ref.closed);
    await userEvent.click(document.querySelector<HTMLElement>('.cancel')!);
    expect(await result).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(document.activeElement).toBe(opener);
  });

  it('closes with Escape and with the named close button', async () => {
    const first = await open();
    await userEvent.keyboard('{Escape}');
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(first.container.isConnected).toBe(false);

    const second = await open();
    const close = second.container.querySelector<HTMLElement>('[aria-label="Close"]')!;
    const closed = firstValueFrom(second.ref.closed);
    await userEvent.click(close);
    expect(await closed).toBeUndefined();
  });

  it('keeps an alertdialog open on Escape and has no close button', async () => {
    const { container, ref } = await open({ role: 'alertdialog' });
    expect(container.getAttribute('role')).toBe('alertdialog');
    expect(container.querySelector('[aria-label="Close"]')).toBeNull();
    await userEvent.keyboard('{Escape}');
    expect(container.isConnected).toBe(true);
    ref.close();
  });

  it('paints the raised surface and sizes itself, or fills the height as a drawer', async () => {
    const modal = await open({ size: 'sm' });
    const layout = modal.container.querySelector<HTMLElement>('tes-dialog')!;
    expect(toRgba(getComputedStyle(layout).backgroundColor)).toEqual(
      resolveColor('--tes-color-surface-raised', layout),
    );
    // 24rem, or the viewport minus a 1rem margin on each side when narrower.
    expect(layout.getBoundingClientRect().width).toBe(Math.min(384, window.innerWidth - 32));
    modal.ref.close();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const drawer = await open({ drawer: true });
    const panel = drawer.container.querySelector<HTMLElement>('tes-dialog')!;
    const rect = panel.getBoundingClientRect();
    expect(Math.round(rect.right)).toBe(window.innerWidth);
    expect(Math.round(rect.height)).toBe(window.innerHeight);
    drawer.ref.close();
  });
});
