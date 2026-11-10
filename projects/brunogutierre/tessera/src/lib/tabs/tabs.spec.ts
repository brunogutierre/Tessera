import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { loadTesseraStyles } from '../../test-utils/styles';
import { TesTabPanel, TesTabs } from './tabs';

@Component({
  imports: [TesTabs, TesTabPanel],
  template: `
    <tes-tabs label="Account" [(selected)]="selected">
      <tes-tab-panel value="overview" label="Overview"><p>Balance: $1,204</p></tes-tab-panel>
      <tes-tab-panel value="invoices" label="Invoices"
        ><input aria-label="Search invoices"
      /></tes-tab-panel>
      <tes-tab-panel value="audit" label="Audit log" disabled><p>Restricted</p></tes-tab-panel>
      <tes-tab-panel value="settings" label="Settings"><p>Preferences</p></tes-tab-panel>
    </tes-tabs>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly selected = signal<string | undefined>('overview');
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  return {
    fixture,
    host: fixture.componentInstance,
    el,
    tabs: () => [...el.querySelectorAll<HTMLElement>('[role="tab"]')],
    panels: () => [...el.querySelectorAll<HTMLElement>('[role="tabpanel"]')],
  };
}

beforeAll(loadTesseraStyles);

describe('TesTabs', () => {
  it('builds a named tab list from the panels and links tabs to panels', async () => {
    const { el, tabs, panels } = await render();
    expect(el.querySelector('[role="tablist"]')!.getAttribute('aria-label')).toBe('Account');
    expect(tabs().map((t) => t.textContent.trim())).toEqual([
      'Overview',
      'Invoices',
      'Audit log',
      'Settings',
    ]);
    expect(tabs()[0]!.getAttribute('aria-selected')).toBe('true');
    expect(tabs()[0]!.getAttribute('aria-controls')).toBe(panels()[0]!.id);
    expect(panels()[0]!.getAttribute('aria-labelledby')).toBe(tabs()[0]!.id);
  });

  it('selects the first enabled panel when nothing is selected', async () => {
    const { host, fixture, tabs } = await render();
    host.selected.set(undefined);
    await fixture.whenStable();
    expect(host.selected()).toBe('overview');
    expect(tabs()[0]!.getAttribute('aria-selected')).toBe('true');
  });

  it('shows only the selected panel; hidden ones are inert and not displayed', async () => {
    const { panels } = await render();
    expect(panels()[0]!.hasAttribute('inert')).toBe(false);
    expect(panels()[1]!.hasAttribute('inert')).toBe(true);
    expect(getComputedStyle(panels()[1]!).display).toBe('none');
  });

  it('moves and selects with the arrow keys, skipping nothing but not selecting disabled tabs', async () => {
    const { tabs, host, fixture } = await render();
    tabs()[0]!.focus();
    await userEvent.keyboard('{ArrowRight}');
    await fixture.whenStable();
    expect(document.activeElement).toBe(tabs()[1]);
    expect(host.selected()).toBe('invoices');
    await userEvent.keyboard('{End}');
    await fixture.whenStable();
    expect(host.selected()).toBe('settings');
    expect(tabs()[2]!.getAttribute('aria-disabled')).toBe('true');
  });

  it('selects from outside and keeps panel content alive', async () => {
    const { host, fixture, panels, el } = await render();
    host.selected.set('invoices');
    await fixture.whenStable();
    expect(panels()[1]!.hasAttribute('inert')).toBe(false);
    const input = el.querySelector('input')!;
    input.value = 'INV-0184';
    host.selected.set('overview');
    await fixture.whenStable();
    host.selected.set('invoices');
    await fixture.whenStable();
    expect(el.querySelector('input')!.value).toBe('INV-0184');
  });
});
