import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { userEvent } from 'vitest/browser';
import { resolveColor, toRgba } from '../../test-utils/color';
import { loadTesseraStyles } from '../../test-utils/styles';
import { TesChoice } from '../choice/choice';
import { TesFieldset } from '../fieldset/fieldset';
import { TesRadio } from './radio';

@Component({
  imports: [TesRadio, TesChoice, TesFieldset, ReactiveFormsModule],
  template: `
    <fieldset
      tes-fieldset
      legend="Delivery"
      [hint]="hint()"
      [error]="error()"
      [orientation]="orientation()"
    >
      @for (option of options; track option) {
        <label tes-choice>
          <input type="radio" tes-radio name="delivery" [value]="option" [formControl]="delivery" />
          {{ option }}
        </label>
      }
    </fieldset>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly options = ['standard', 'express', 'pickup'];
  readonly delivery = new FormControl('standard', { nonNullable: true });
  readonly hint = signal<string | undefined>('Express ships the same day.');
  readonly error = signal<string | null>(null);
  readonly orientation = signal<'vertical' | 'horizontal'>('vertical');
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  return {
    fixture,
    host: fixture.componentInstance,
    fieldset: el.querySelector('fieldset')!,
    radios: [...el.querySelectorAll('input')],
  };
}

beforeAll(loadTesseraStyles);

describe('TesRadio + TesFieldset', () => {
  it('names the group with a legend and describes it with the hint and error', async () => {
    const { fieldset, fixture, host } = await render();
    expect(fieldset.querySelector('legend')!.textContent).toBe('Delivery');
    const hintId = fieldset.querySelector('.hint')!.id;
    expect(fieldset.getAttribute('aria-describedby')).toBe(hintId);

    host.error.set('Choose a delivery option');
    await fixture.whenStable();
    expect(fieldset.getAttribute('aria-describedby')).toBe(
      `${hintId} ${fieldset.querySelector('.error')!.id}`,
    );

    host.hint.set(undefined);
    host.error.set(null);
    await fixture.whenStable();
    expect(fieldset.hasAttribute('aria-describedby')).toBe(false);
  });

  it('moves the selection with arrow keys and updates the form control', async () => {
    const { radios, host } = await render();
    expect(radios[0]!.checked).toBe(true);
    radios[0]!.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(radios[1]);
    expect(host.delivery.value).toBe('express');
  });

  it('draws the checked state as a thick primary ring', async () => {
    const { radios } = await render();
    const style = getComputedStyle(radios[0]!);
    expect(toRgba(style.borderTopColor)).toEqual(resolveColor('--tes-color-primary', radios[0]!));
    expect(parseFloat(style.borderTopWidth)).toBeGreaterThan(4);
  });

  it('lays options out in a row when horizontal', async () => {
    const { fieldset, fixture, host } = await render();
    host.orientation.set('horizontal');
    await fixture.whenStable();
    expect(getComputedStyle(fieldset.querySelector('.options')!).flexDirection).toBe('row');
  });
});
