import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, form, max, min } from '@angular/forms/signals';
import { userEvent } from 'vitest/browser';
import { TesSlider } from './slider';

@Component({
  imports: [TesSlider, FormField],
  template: `
    <label for="risk">Risk</label>
    <input id="risk" type="range" tes-slider [formField]="profile.risk" />
    <input type="range" tes-slider aria-label="Unbounded" value="25" class="defaults" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly model = signal({ risk: 5 });
  // With Signal Forms, min and max come from the schema; [formField] sets them on the input.
  readonly profile = form(this.model, (p) => {
    min(p.risk, 0);
    max(p.risk, 10);
  });
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  return { fixture, host: fixture.componentInstance, el, slider: el.querySelector('input')! };
}

const fill = (input: HTMLInputElement) => input.style.getPropertyValue('--_fill');

describe('TesSlider', () => {
  it('fills the track up to the value', async () => {
    const { slider, el } = await render();
    expect(fill(slider)).toBe('50%');
    expect(fill(el.querySelector<HTMLInputElement>('.defaults')!)).toBe('25%');
  });

  it('follows keyboard input and updates the form', async () => {
    const { slider, host } = await render();
    slider.focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(host.model().risk).toBe(7);
    expect(fill(slider)).toBe('70%');
  });

  it('follows values set by the form, which fire no input event', async () => {
    const { slider, host, fixture } = await render();
    host.model.set({ risk: 1 });
    await fixture.whenStable();
    expect(slider.valueAsNumber).toBe(1);
    expect(fill(slider)).toBe('10%');
  });

  it('handles an empty range', async () => {
    const { el } = await render();
    const input = el.querySelector<HTMLInputElement>('.defaults')!;
    input.min = '5';
    input.max = '5';
    input.dispatchEvent(new Event('input'));
    expect(fill(input)).toBe('0%');
  });
});
