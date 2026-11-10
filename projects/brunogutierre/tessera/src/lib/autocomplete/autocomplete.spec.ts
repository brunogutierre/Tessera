import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { userEvent } from 'vitest/browser';
import { resolveColor, toRgba } from '../../test-utils/color';
import { loadTesseraStyles } from '../../test-utils/styles';
import { provideTessera } from '../core/theme';
import { TesFormField } from '../form-field/form-field';
import type { TesOption } from '../select/select';
import { TesAutocomplete, containsFilter } from './autocomplete';

const CITIES: TesOption[] = [
  { value: 'sp', label: 'São Paulo' },
  { value: 'rj', label: 'Rio de Janeiro' },
  { value: 'bh', label: 'Belo Horizonte' },
  { value: 'po', label: 'Porto Alegre' },
  { value: 'pr', label: 'Porto', disabled: true },
];

@Component({
  imports: [TesAutocomplete, TesFormField, FormField],
  template: `
    <tes-form-field label="Destination" hint="Where the trip ends">
      <tes-autocomplete [options]="cities" placeholder="Start typing" [formField]="trip.city" />
    </tes-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly cities = CITIES;
  readonly model = signal<{ city: string | null }>({ city: null });
  readonly trip = form(this.model, (p) => {
    required(p.city);
  });
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const settle = async () => {
    await fixture.whenStable();
    await new Promise((resolve) => requestAnimationFrame(resolve));
  };
  return {
    fixture,
    host: fixture.componentInstance,
    el,
    settle,
    input: el.querySelector('input')!,
    options: () => [...el.querySelectorAll<HTMLElement>('[role="option"]')],
  };
}

beforeAll(loadTesseraStyles);

describe('containsFilter', () => {
  it('ignores case, accents and surrounding spaces', () => {
    const option = { value: 'sp', label: 'São Paulo' };
    expect(containsFilter(option, '  sao pau ')).toBe(true);
    expect(containsFilter(option, 'PAULO')).toBe(true);
    expect(containsFilter(option, 'rio')).toBe(false);
  });
});

describe('TesAutocomplete', () => {
  it('is a native, labelled, required text combobox', async () => {
    const { input, el } = await render();
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.labels?.[0]?.textContent).toContain('Destination');
    expect(input.getAttribute('aria-describedby')).toBe(el.querySelector('.hint')!.id);
    expect(input.required).toBe(true);
    expect(input.placeholder).toBe('Start typing');
  });

  it('filters suggestions as you type and chooses one with the keyboard', async () => {
    const { input, options, host, settle } = await render();
    await userEvent.click(input);
    await userEvent.keyboard('porto');
    await settle();
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(options().map((o) => o.textContent.trim())).toEqual(['Porto Alegre', 'Porto']);

    await userEvent.keyboard('{ArrowDown}');
    await settle();
    expect(input.getAttribute('aria-activedescendant')).toBe(options()[0]!.id);
    await userEvent.keyboard('{Enter}');
    await settle();
    expect(host.model().city).toBe('po');
    expect(input.value).toBe('Porto Alegre');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(input);
  });

  it('clears the value when the text no longer matches the choice', async () => {
    const { input, host, fixture, settle } = await render();
    host.model.set({ city: 'bh' });
    await fixture.whenStable();
    expect(input.value).toBe('Belo Horizonte');
    await userEvent.click(input);
    await userEvent.keyboard('{Backspace}');
    await settle();
    expect(host.model().city).toBeNull();
  });

  it('tells when nothing matches, in the configured language', async () => {
    TestBed.configureTestingModule({
      providers: [provideTessera({ labels: { noResults: 'Nenhum resultado' } })],
    });
    const { input, el, options, settle } = await render();
    await userEvent.click(input);
    await userEvent.keyboard('xyz');
    await settle();
    expect(options()).toHaveLength(0);
    expect(el.querySelector('[role="status"]')!.textContent.trim()).toBe('Nenhum resultado');
  });

  it('marks the form field as touched on blur', async () => {
    const { input, host, settle } = await render();
    input.focus();
    await userEvent.tab();
    await settle();
    expect(host.trip.city().touched()).toBe(true);
  });
});

@Component({
  imports: [TesAutocomplete, ReactiveFormsModule],
  template: `<tes-autocomplete label="City" [options]="cities" [formControl]="city" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ReactiveHost {
  readonly cities = CITIES;
  readonly city = new FormControl<string | null>('rj');
}

describe('TesAutocomplete with Reactive Forms', () => {
  it('shows the bound value and writes the chosen one back', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('input')!;
    expect(input.value).toBe('Rio de Janeiro');
    await userEvent.fill(input, 'belo');
    await fixture.whenStable();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await userEvent.click(el.querySelector<HTMLElement>('[role="option"]')!);
    await fixture.whenStable();
    expect(fixture.componentInstance.city.value).toBe('bh');
    expect(document.activeElement).toBe(input);
  });

  it('is really disabled and styled as disabled, not read-only', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.componentInstance.city.disable();
    await fixture.whenStable();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input')!;
    expect(input.disabled).toBe(true);
    // Aria also marks a disabled editable combobox read-only; the disabled style must win.
    expect(toRgba(getComputedStyle(input).backgroundColor)).toEqual(
      resolveColor('--tes-color-neutral-subtle', input),
    );
  });
});
