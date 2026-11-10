import { LiveAnnouncer } from '@angular/cdk/a11y';
import { TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { TesToaster } from './toast';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const toasts = () => [...document.querySelectorAll<HTMLElement>('.toast')];

async function settle(): Promise<void> {
  TestBed.tick();
  await wait(20);
}

afterEach(() => {
  const toaster = TestBed.inject(TesToaster);
  for (const toast of toaster.toasts()) toaster.dismiss(toast.id);
  TestBed.tick();
});

describe('TesToaster', () => {
  it('shows toasts in a named region and announces them by tone', async () => {
    const announce = vi.spyOn(TestBed.inject(LiveAnnouncer), 'announce');
    const toaster = TestBed.inject(TesToaster);
    toaster.show({ message: 'Invoice sent', tone: 'success' });
    toaster.show({ message: 'Transfer failed', tone: 'danger' });
    await settle();
    const region = document.querySelector('section[aria-label="Notifications"]')!;
    expect(region).not.toBeNull();
    expect(
      toasts().map((t) => t.querySelector('.message')!.textContent.replace(/\s+/g, ' ').trim()),
    ).toEqual(['Success: Invoice sent', 'Error: Transfer failed']);
    expect(announce).toHaveBeenCalledWith('Success: Invoice sent', 'polite');
    expect(announce).toHaveBeenCalledWith('Error: Transfer failed', 'assertive');
  });

  it('disappears after its duration and can be dismissed earlier', async () => {
    const toaster = TestBed.inject(TesToaster);
    toaster.show({ message: 'Saved', duration: 80 });
    const sticky = toaster.show({ message: 'Sticky', duration: 0 });
    await settle();
    expect(toasts()).toHaveLength(2);
    await wait(150);
    await settle();
    expect(toasts().map((t) => t.textContent)).toEqual([expect.stringContaining('Sticky')]);
    sticky.dismiss();
    await settle();
    expect(toasts()).toHaveLength(0);
  });

  it('pauses every countdown while the pointer is on the stack', async () => {
    const toaster = TestBed.inject(TesToaster);
    toaster.show({ message: 'Paused', duration: 400 });
    await settle();
    await userEvent.hover(toasts()[0]!);
    await wait(600);
    await settle();
    expect(toasts()).toHaveLength(1);
    await userEvent.unhover(toasts()[0]!);
    await wait(600);
    await settle();
    expect(toasts()).toHaveLength(0);
  });

  it('runs its action, then closes, and never times out while it has one', async () => {
    const undo = vi.fn();
    const toaster = TestBed.inject(TesToaster);
    toaster.show({
      message: 'Invoice archived',
      duration: 50,
      action: { label: 'Undo', run: undo },
    });
    await settle();
    await wait(100);
    await settle();
    expect(toasts()).toHaveLength(1);
    const button = [...toasts()[0]!.querySelectorAll('button')].find(
      (b) => b.textContent.trim() === 'Undo',
    )!;
    button.click();
    await settle();
    expect(undo).toHaveBeenCalledOnce();
    expect(toasts()).toHaveLength(0);
  });

  it('has a named dismiss button on every toast', async () => {
    TestBed.inject(TesToaster).show({ message: 'Hello', duration: 0 });
    await settle();
    const dismiss = toasts()[0]!.querySelector<HTMLElement>('[aria-label="Dismiss"]')!;
    dismiss.click();
    await settle();
    expect(toasts()).toHaveLength(0);
  });
});
