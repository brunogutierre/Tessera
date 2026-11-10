import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { userEvent } from 'vitest/browser';
import { loadTesseraStyles } from '../../test-utils/styles';
import { TesFormField } from '../form-field/form-field';
import { TesSelect } from './select';
import type { TesOption } from './select';

const COUNTRIES: TesOption[] = [
  { value: 'br', label: 'Brazil' },
  { value: 'ca', label: 'Canada' },
  { value: 'cl', label: 'Chile', disabled: true },
  { value: 'pt', label: 'Portugal' },
];

@Component({
  imports: [TesSelect, TesFormField, FormField],
  template: `
    <tes-form-field label="Country" hint="Where the company is registered" [error]="error()">
      <tes-select
        [options]="countries"
        placeholder="Choose a country"
        [formField]="address.country"
      />
    </tes-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SignalHost {
  readonly countries = COUNTRIES;
  readonly error = signal<string | null>(null);
  readonly model = signal<{ country: string | null }>({ country: '' });
  readonly address = form(this.model, (p) => {
    required(p.country);
  });
}

async function render<T>(type: new () => T) {
  const fixture = TestBed.createComponent(type);
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
    trigger: el.querySelector<HTMLElement>('[role="combobox"]')!,
    options: () => [...el.querySelectorAll<HTMLElement>('[role="option"]')],
  };
}

beforeAll(loadTesseraStyles);

describe('TesSelect', () => {
  it('is a labelled, described, required combobox showing its placeholder', async () => {
    const { trigger, el } = await render(SignalHost);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-labelledby')).toBe(el.querySelector('label')!.id);
    expect(trigger.getAttribute('aria-describedby')).toBe(el.querySelector('.hint')!.id);
    expect(trigger.getAttribute('aria-required')).toBe('true');
    expect(el.querySelector('.marker')).not.toBeNull();
    expect(trigger.textContent.trim()).toBe('Choose a country');
  });

  it('opens on click, chooses an option, closes and updates the form', async () => {
    const { trigger, options, host, settle } = await render(SignalHost);
    await userEvent.click(trigger);
    await settle();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(options().map((o) => o.textContent.trim())).toEqual([
      'Brazil',
      'Canada',
      'Chile',
      'Portugal',
    ]);
    await userEvent.click(options()[1]!);
    await settle();
    expect(host.model().country).toBe('ca');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.textContent.trim()).toBe('Canada');
    // A click on an option does not move focus off the combobox.
    expect(document.activeElement).toBe(trigger);
  });

  it('leaves and closes on Tab while open', async () => {
    const { trigger, el, settle } = await render(SignalHost);
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await settle();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelector('[role="listbox"]')!.getAttribute('tabindex')).toBe('-1');
    await userEvent.tab();
    await settle();
    await new Promise((resolve) => setTimeout(resolve, 20));
    await settle();
    expect(el.contains(document.activeElement)).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('works with the keyboard and skips disabled options', async () => {
    const { trigger, options, host, settle } = await render(SignalHost);
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await settle();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    // Aria relays keys to the popup through a signal, so give each key its own tick.
    await userEvent.keyboard('{ArrowDown}');
    await settle();
    await userEvent.keyboard('{ArrowDown}');
    await settle();
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute('aria-activedescendant')).toBe(options()[3]!.id);
    expect(options()[2]!.getAttribute('aria-disabled')).toBe('true');
    await userEvent.keyboard('{Enter}');
    await settle();
    expect(host.model().country).toBe('pt');
    expect(document.activeElement).toBe(trigger);
  });

  it('turns invalid with the field error and marks the form field as touched on blur', async () => {
    const { trigger, host, fixture, settle } = await render(SignalHost);
    host.error.set('Choose a country');
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-invalid')).toBe('true');
    trigger.focus();
    await userEvent.tab();
    await settle();
    expect(host.address.country().touched()).toBe(true);
  });

  it('focuses the trigger when the label is clicked', async () => {
    const { trigger, el } = await render(SignalHost);
    await userEvent.click(el.querySelector('label')!);
    expect(document.activeElement).toBe(trigger);
  });
});

@Component({
  imports: [TesSelect, ReactiveFormsModule, FormsModule],
  template: `
    <tes-select label="Region" [options]="regions" [formControl]="region" />
    <tes-select label="Tags" class="tags" [options]="regions" multiple [(ngModel)]="tags" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class InteropHost {
  readonly regions: TesOption[] = [
    { value: 'emea', label: 'EMEA' },
    { value: 'apac', label: 'APAC' },
    { value: 'amer', label: 'Americas' },
  ];
  readonly region = new FormControl<string | null>('apac');
  tags: readonly string[] = ['emea'];
}

describe('TesSelect forms interop', () => {
  it('binds Reactive Forms without a value accessor', async () => {
    const { el, host, settle, fixture } = await render(InteropHost);
    const trigger = el.querySelector<HTMLElement>('[role="combobox"]')!;
    expect(trigger.getAttribute('aria-label')).toBe('Region');
    expect(trigger.textContent.trim()).toBe('APAC');
    host.region.setValue('amer');
    await fixture.whenStable();
    expect(trigger.textContent.trim()).toBe('Americas');
    await userEvent.click(trigger);
    await settle();
    await userEvent.click(el.querySelectorAll<HTMLElement>('[role="option"]')[0]!);
    await settle();
    expect(host.region.value).toBe('emea');
  });

  it('chooses several values with ngModel and stays open', async () => {
    const { el, host, settle } = await render(InteropHost);
    const trigger = el.querySelectorAll<HTMLElement>('[role="combobox"]')[1]!;
    await userEvent.click(trigger);
    await settle();
    const listbox = el.querySelector('[role="listbox"]')!;
    expect(listbox.getAttribute('aria-multiselectable')).toBe('true');
    await userEvent.click(el.querySelectorAll<HTMLElement>('[role="option"]')[2]!);
    await settle();
    expect(host.tags).toEqual(['emea', 'amer']);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.textContent.trim()).toBe('EMEA, Americas');
  });
});
