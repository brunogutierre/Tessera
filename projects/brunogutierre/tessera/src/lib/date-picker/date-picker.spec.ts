import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { userEvent } from 'vitest/browser';
import { loadTesseraStyles } from '../../test-utils/styles';
import { TesFormField } from '../form-field/form-field';
import { TesDatePicker } from './date-picker';

@Component({
  imports: [TesDatePicker, TesFormField, FormField],
  template: `
    <tes-form-field label="Due date" hint="Within 2026">
      <tes-date-picker [formField]="invoice.due" />
    </tes-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly model = signal<{ due: string | null }>({ due: '2026-11-10' });
  readonly invoice = form(this.model, (p) => {
    required(p.due);
  });
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const settle = async () => {
    await fixture.whenStable();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await fixture.whenStable();
  };
  return {
    fixture,
    host: fixture.componentInstance,
    el,
    settle,
    input: el.querySelector('input')!,
    toggle: el.querySelector<HTMLButtonElement>('.toggle')!,
    dialog: () => el.querySelector<HTMLElement>('[role="dialog"]'),
    day: (iso: string) => el.querySelector<HTMLButtonElement>(`[data-date="${iso}"]`)!,
  };
}

beforeAll(loadTesseraStyles);

describe('TesDatePicker', () => {
  it('shows the value in the locale format in a labelled, described, required field', async () => {
    const { input, toggle, el } = await render();
    expect(input.value).toBe('11/10/2026');
    expect(input.placeholder).toBe('mm/dd/yyyy');
    expect(input.labels?.[0]?.textContent).toContain('Due date');
    expect(input.getAttribute('aria-describedby')).toBe(el.querySelector('.hint')!.id);
    expect(input.required).toBe(true);
    expect(toggle.getAttribute('aria-label')).toBe('Choose date, November 10, 2026');
    expect(toggle.getAttribute('aria-haspopup')).toBe('dialog');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('accepts a typed date and normalizes it', async () => {
    const { input, host, settle } = await render();
    await userEvent.fill(input, '3/7/26');
    await userEvent.tab();
    await settle();
    expect(host.model().due).toBe('2026-03-07');
    expect(input.value).toBe('03/07/2026');
    expect(input.hasAttribute('aria-invalid')).toBe(false);
  });

  it('rejects text that is not a date, keeping it for correction', async () => {
    const { input, host, settle } = await render();
    await userEvent.fill(input, '02/31/2026');
    await userEvent.tab();
    await settle();
    expect(host.model().due).toBeNull();
    expect(input.value).toBe('02/31/2026');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('opens a dialog with focus on the selected day, picks and returns focus', async () => {
    const { toggle, dialog, day, host, input, settle } = await render();
    await userEvent.click(toggle);
    await settle();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(dialog()!.getAttribute('aria-label')).toBe('Choose date');
    expect(dialog()!.getAttribute('aria-modal')).toBe('true');
    expect(document.activeElement).toBe(day('2026-11-10'));

    await userEvent.keyboard('{ArrowDown}');
    await settle();
    await userEvent.keyboard('{Enter}');
    await settle();
    expect(host.model().due).toBe('2026-11-17');
    expect(input.value).toBe('11/17/2026');
    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(toggle);
  });

  it('closes with Escape or an outside click without changing the value', async () => {
    const { toggle, dialog, host, settle, el } = await render();
    await userEvent.click(toggle);
    await settle();
    await userEvent.keyboard('{Escape}');
    await settle();
    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(toggle);

    await userEvent.click(toggle);
    await settle();
    expect(dialog()).not.toBeNull();
    await userEvent.click(el.querySelector('label')!);
    await settle();
    expect(dialog()).toBeNull();
    expect(host.model().due).toBe('2026-11-10');
  });

  it('follows the form value and marks the field as touched on blur', async () => {
    const { input, host, fixture, settle } = await render();
    host.model.set({ due: '2026-01-02' });
    await fixture.whenStable();
    expect(input.value).toBe('01/02/2026');
    input.focus();
    await userEvent.tab();
    await userEvent.tab();
    await settle();
    expect(host.invoice.due().touched()).toBe(true);
  });
});

@Component({
  imports: [TesDatePicker, ReactiveFormsModule],
  template: `<tes-date-picker
    label="Start"
    [formControl]="start"
    min="2026-01-01"
    max="2026-12-31"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ReactiveHost {
  readonly start = new FormControl<string | null>('2026-05-04');
}

describe('TesDatePicker with Reactive Forms', () => {
  it('binds the value, the name and the disabled state', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector('input')!;
    expect(input.getAttribute('aria-label')).toBe('Start');
    expect(input.value).toBe('05/04/2026');
    await userEvent.fill(input, '6/1/2026');
    await userEvent.tab();
    await fixture.whenStable();
    expect(fixture.componentInstance.start.value).toBe('2026-06-01');

    // Clearing the field is not an error.
    await userEvent.fill(input, '');
    await userEvent.tab();
    await fixture.whenStable();
    expect(fixture.componentInstance.start.value).toBeNull();
    expect(input.hasAttribute('aria-invalid')).toBe(false);

    // Out of range: rejected when typed.
    await userEvent.fill(input, '1/15/2027');
    await userEvent.tab();
    await fixture.whenStable();
    expect(fixture.componentInstance.start.value).toBeNull();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    await userEvent.fill(input, '12/30/2026');
    await userEvent.tab();
    await userEvent.click(el.querySelector<HTMLElement>('.toggle')!);
    await fixture.whenStable();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    el.querySelector<HTMLElement>('[aria-label="Next month"]')!.click();
    await fixture.whenStable();
    expect(el.querySelector('.title')!.textContent.trim()).toBe('December 2026');
    await userEvent.keyboard('{Escape}');
    await fixture.whenStable();

    fixture.componentInstance.start.disable();
    await fixture.whenStable();
    expect(input.disabled).toBe(true);
    expect(el.querySelector<HTMLButtonElement>('.toggle')!.disabled).toBe(true);
  });
});
