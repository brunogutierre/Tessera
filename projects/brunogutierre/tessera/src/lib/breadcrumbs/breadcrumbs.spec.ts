import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { resolveColor, toRgba } from '../../test-utils/color';
import { loadTesseraStyles } from '../../test-utils/styles';
import { TesBreadcrumbs } from './breadcrumbs';

@Component({
  imports: [TesBreadcrumbs],
  template: `
    <tes-breadcrumbs>
      <li><a href="#home">Home</a></li>
      <li><a href="#invoices">Invoices</a></li>
      <li aria-current="page">INV-2026-0184</li>
    </tes-breadcrumbs>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {}

@Component({
  imports: [TesBreadcrumbs],
  template: `<tes-breadcrumbs
    ><li><a href="#home">Home</a></li></tes-breadcrumbs
  >`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class NoCurrent {}

beforeAll(loadTesseraStyles);

describe('TesBreadcrumbs', () => {
  it('renders a named navigation landmark with an ordered list', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const nav = el.querySelector('nav')!;
    expect(nav.getAttribute('aria-label')).toBe('Breadcrumb');
    expect([...nav.querySelectorAll('ol > li')].map((li) => li.textContent.trim())).toEqual([
      'Home',
      'Invoices',
      'INV-2026-0184',
    ]);
  });

  it('styles projected links, separators and the current page', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const link = el.querySelector('a')!;
    expect(toRgba(getComputedStyle(link).color)).toEqual(resolveColor('--tes-color-primary', link));
    expect(getComputedStyle(link).textDecorationLine).toBe('underline');
    const items = el.querySelectorAll('li');
    expect(getComputedStyle(items[0]!, '::before').content).toBe('none');
    expect(getComputedStyle(items[1]!, '::before').content).toContain('/');
    const current = el.querySelector<HTMLElement>('[aria-current]')!;
    expect(toRgba(getComputedStyle(current).color)).toEqual(
      resolveColor('--tes-color-text', current),
    );
  });

  it('warns in dev mode when no item is the current page', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(NoCurrent);
    await fixture.whenStable();
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});
