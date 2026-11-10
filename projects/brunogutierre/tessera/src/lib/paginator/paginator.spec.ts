import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { provideTessera } from '../core/theme';
import { TesPaginator } from './paginator';

@Component({
  imports: [TesPaginator],
  template: `<tes-paginator [length]="length()" [(pageIndex)]="page" [(pageSize)]="size" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly length = signal(87);
  readonly page = signal(0);
  readonly size = signal(10);
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const button = (name: string) =>
    el.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`)!;
  const inactive = (name: string) => button(name).getAttribute('aria-disabled') === 'true';
  const range = () => el.querySelector('[role="status"]')!.textContent.trim();
  return { fixture, host: fixture.componentInstance, el, button, range, inactive };
}

describe('TesPaginator', () => {
  it('is a named navigation showing the visible range', async () => {
    const { el, range, inactive } = await render();
    expect(el.querySelector('nav')!.getAttribute('aria-label')).toBe('Pagination');
    expect(range()).toBe('1–10 of 87');
    expect(inactive('First page')).toBe(true);
    expect(inactive('Previous page')).toBe(true);
  });

  it('moves between pages and disables the ends', async () => {
    const { fixture, host, button, range, inactive } = await render();
    button('Next page').click();
    await fixture.whenStable();
    expect(host.page()).toBe(1);
    expect(range()).toBe('11–20 of 87');
    button('Last page').click();
    await fixture.whenStable();
    expect(host.page()).toBe(8);
    expect(range()).toBe('81–87 of 87');
    expect(inactive('Next page')).toBe(true);
    // The pressed button becomes unavailable but keeps focus.
    button('Last page').focus();
    button('Last page').click();
    await fixture.whenStable();
    expect(document.activeElement).toBe(button('Last page'));
    button('First page').click();
    await fixture.whenStable();
    expect(host.page()).toBe(0);
  });

  it('clamps the page when the list shrinks', async () => {
    const { fixture, host, range, inactive } = await render();
    host.page.set(8);
    host.length.set(25);
    await fixture.whenStable();
    expect(range()).toBe('21–25 of 25');
    expect(inactive('Next page')).toBe(true);
  });

  it('keeps the first visible item when the page size changes', async () => {
    const { fixture, host, el, range } = await render();
    host.page.set(3);
    await fixture.whenStable();
    expect(range()).toBe('31–40 of 87');
    const select = el.querySelector<HTMLElement>('[role="combobox"]')!;
    expect(select.getAttribute('aria-label')).toBe('Items per page');
    await userEvent.click(select);
    await fixture.whenStable();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const option = [...el.querySelectorAll<HTMLElement>('[role="option"]')].find(
      (o) => o.textContent.trim() === '25',
    )!;
    await userEvent.click(option);
    await fixture.whenStable();
    expect(host.size()).toBe(25);
    expect(host.page()).toBe(1);
    expect(range()).toBe('26–50 of 87');
  });

  it('handles an empty list and translated labels', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideTessera({
          labels: { pageRange: (f, l, t) => `${String(f)}–${String(l)} de ${String(t)}` },
        }),
      ],
    });
    const { fixture, host, range, inactive } = await render();
    host.length.set(0);
    await fixture.whenStable();
    expect(range()).toBe('0–0 de 0');
    expect(inactive('Next page')).toBe(true);
  });
});
