import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { loadTesseraStyles } from '../../test-utils/styles';
import { TesFormField } from '../form-field/form-field';
import type { TesOption } from '../select/select';
import { TesListbox } from './listbox';

const COLUMNS: TesOption[] = [
  { value: 'date', label: 'Date' },
  { value: 'customer', label: 'Customer' },
  { value: 'amount', label: 'Amount', disabled: true },
  { value: 'status', label: 'Status' },
];

@Component({
  imports: [TesListbox, TesFormField],
  template: `
    <tes-listbox class="single" label="Sort by" [options]="columns" [(value)]="sort" />
    <tes-form-field label="Visible columns" hint="Pick at least one">
      <tes-listbox class="multi" [options]="columns" multiple [(value)]="visible" />
    </tes-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly columns = COLUMNS;
  readonly sort = signal<string | readonly string[] | null>('date');
  readonly visible = signal<string | readonly string[] | null>(['date']);
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const list = (cls: string) => el.querySelector<HTMLElement>(`.${cls} [role="listbox"]`)!;
  const options = (cls: string) => [...el.querySelectorAll<HTMLElement>(`.${cls} [role="option"]`)];
  const settle = () => fixture.whenStable();
  return { fixture, host: fixture.componentInstance, el, list, options, settle };
}

beforeAll(loadTesseraStyles);

describe('TesListbox', () => {
  it('names the list by its label or by the form field', async () => {
    const { list, el } = await render();
    expect(list('single').getAttribute('aria-label')).toBe('Sort by');
    expect(list('multi').getAttribute('aria-labelledby')).toBe(el.querySelector('label')!.id);
    expect(list('multi').getAttribute('aria-describedby')).toBe(el.querySelector('.hint')!.id);
    expect(list('multi').getAttribute('aria-multiselectable')).toBe('true');
  });

  it('lets a single selection follow focus with the arrow keys', async () => {
    const { options, host, settle } = await render();
    options('single')[0]!.focus();
    await userEvent.keyboard('{ArrowDown}');
    await settle();
    expect(host.sort()).toBe('customer');
    expect(options('single')[1]!.getAttribute('aria-selected')).toBe('true');
  });

  it('toggles values in a multiple selection', async () => {
    const { options, host, settle } = await render();
    await userEvent.click(options('multi')[3]!);
    await settle();
    expect(host.visible()).toEqual(['date', 'status']);
    await userEvent.click(options('multi')[0]!);
    await settle();
    expect(host.visible()).toEqual(['status']);
  });

  it('cannot select disabled options', async () => {
    const { options, host, settle } = await render();
    expect(options('multi')[2]!.getAttribute('aria-disabled')).toBe('true');
    // Playwright refuses to click aria-disabled elements, so dispatch the click directly.
    options('multi')[2]!.click();
    await settle();
    expect(host.visible()).toEqual(['date']);
  });
});
