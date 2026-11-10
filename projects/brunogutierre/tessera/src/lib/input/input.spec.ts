import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { userEvent } from 'vitest/browser';
import { resolveColor, toRgba } from '../../test-utils/color';
import { loadTesseraStyles } from '../../test-utils/styles';
import { TesFormField } from '../form-field/form-field';
import { TesInput } from './input';

@Component({
  imports: [TesFormField, TesInput],
  template: `
    <tes-form-field label="Email" [hint]="hint()" [error]="error()">
      <input tes-input type="email" required />
    </tes-form-field>
    <tes-form-field label="Notes" optional>
      <textarea tes-input id="notes" aria-describedby="notes-help"></textarea>
    </tes-form-field>
    <p id="notes-help">Visible to the whole team.</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Wiring {
  readonly hint = signal<string | undefined>('Used for receipts');
  readonly error = signal<string | null>(null);
}

async function render<T>(type: new () => T) {
  const fixture = TestBed.createComponent(type);
  await fixture.whenStable();
  return { fixture, el: fixture.nativeElement as HTMLElement, host: fixture.componentInstance };
}

beforeAll(loadTesseraStyles);

describe('TesFormField + TesInput', () => {
  it('labels the control and describes it with the hint', async () => {
    const { el } = await render(Wiring);
    const input = el.querySelector('input')!;
    const label = el.querySelector('label')!;
    expect(input.id).toMatch(/^tes-input-\d+$/);
    expect(label.htmlFor).toBe(input.id);
    expect(input.labels?.[0]).toBe(label);
    const hint = el.querySelector('.hint')!;
    expect(input.getAttribute('aria-describedby')).toBe(hint.id);
    expect(input.hasAttribute('aria-invalid')).toBe(false);
  });

  it('marks required controls with a hidden asterisk and optional ones in words', async () => {
    const { el } = await render(Wiring);
    const [email, notes] = [...el.querySelectorAll('label')];
    expect(email!.querySelector('.marker')!.getAttribute('aria-hidden')).toBe('true');
    expect(notes!.textContent.replace(/\s+/g, ' ').trim()).toBe('Notes (optional)');
  });

  it('turns the control invalid and describes it with the error while one is set', async () => {
    const { el, fixture, host } = await render(Wiring);
    host.error.set('Enter a valid email address');
    await fixture.whenStable();
    const input = el.querySelector('input')!;
    const error = el.querySelector('.error')!;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(
      `${el.querySelector('.hint')!.id} ${error.id}`,
    );
    expect(toRgba(getComputedStyle(input).borderColor)).toEqual(
      resolveColor('--tes-color-danger', input),
    );

    host.error.set(null);
    host.hint.set(undefined);
    await fixture.whenStable();
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(input.hasAttribute('aria-describedby')).toBe(false);
  });

  it("keeps the app's own id and descriptions", async () => {
    const { el } = await render(Wiring);
    const textarea = el.querySelector('textarea')!;
    expect(textarea.id).toBe('notes');
    expect(el.querySelectorAll('label')[1]!.htmlFor).toBe('notes');
    expect(textarea.getAttribute('aria-describedby')).toBe('notes-help');
  });

  it('meets the control border contrast and keyboard focus ring', async () => {
    const { el } = await render(Wiring);
    const input = el.querySelector('input')!;
    expect(toRgba(getComputedStyle(input).borderColor)).toEqual(
      resolveColor('--tes-color-border-strong', input),
    );
    await userEvent.click(input);
    expect(getComputedStyle(input).outlineStyle).toBe('solid');
  });

  it('works without a form field', async () => {
    @Component({
      imports: [TesInput],
      template: `<input tes-input aria-label="Search" aria-invalid="true" />`,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class Bare {}
    const { el } = await render(Bare);
    const input = el.querySelector('input')!;
    expect(input.id).toMatch(/^tes-input-\d+$/);
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});

@Component({
  imports: [TesFormField, TesInput, FormField],
  template: `
    <tes-form-field label="Name">
      <input tes-input [formField]="profile.name" />
    </tes-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SignalForm {
  readonly model = signal({ name: 'Ana' });
  readonly profile = form(this.model, (p) => {
    required(p.name);
  });
}

@Component({
  imports: [TesFormField, TesInput, ReactiveFormsModule],
  template: `
    <tes-form-field label="Name"><input tes-input required [formControl]="name" /></tes-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Reactive {
  readonly name = new FormControl('Ana', {
    nonNullable: true,
    validators: [(control) => Validators.required(control)],
  });
}

@Component({
  imports: [TesFormField, TesInput, FormsModule],
  template: `
    <tes-form-field label="Name"><input tes-input name="name" [(ngModel)]="name" /></tes-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TemplateDriven {
  name = 'Ana';
}

describe('forms interop', () => {
  it('binds Signal Forms through [formField], including the required rule', async () => {
    const { el, fixture, host } = await render(SignalForm);
    const input = el.querySelector('input')!;
    expect(input.value).toBe('Ana');
    expect(el.querySelector('.marker')).not.toBeNull();

    await userEvent.fill(input, 'Bruno');
    expect(host.model().name).toBe('Bruno');

    host.model.set({ name: '' });
    await fixture.whenStable();
    expect(input.value).toBe('');
    expect(host.profile.name().invalid()).toBe(true);
  });

  it('binds Reactive Forms through formControl', async () => {
    const { el, fixture, host } = await render(Reactive);
    const input = el.querySelector('input')!;
    expect(input.value).toBe('Ana');
    await userEvent.fill(input, 'Bruno');
    expect(host.name.value).toBe('Bruno');
    host.name.setValue('Carla');
    await fixture.whenStable();
    expect(input.value).toBe('Carla');
  });

  it('binds template-driven forms through ngModel', async () => {
    const { el, fixture, host } = await render(TemplateDriven);
    const input = el.querySelector('input')!;
    await fixture.whenStable();
    expect(input.value).toBe('Ana');
    await userEvent.fill(input, 'Bruno');
    expect(host.name).toBe('Bruno');
  });
});
