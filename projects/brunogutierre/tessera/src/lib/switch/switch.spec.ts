import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { userEvent } from 'vitest/browser';
import { contrast, resolveColor, toRgba } from '../../test-utils/color';
import { loadTesseraStyles } from '../../test-utils/styles';
import { TesChoice } from '../choice/choice';
import { TesSwitch } from './switch';

@Component({
  imports: [TesSwitch, TesChoice, FormsModule],
  template: `
    <label tes-choice
      ><input type="checkbox" tes-switch name="alerts" [(ngModel)]="alerts" /> Price alerts</label
    >
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  alerts = false;
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const input = (fixture.nativeElement as HTMLElement).querySelector('input')!;
  return { fixture, host: fixture.componentInstance, input };
}

beforeAll(loadTesseraStyles);

describe('TesSwitch', () => {
  it('is announced as a switch and toggles an ngModel', async () => {
    const { input, host } = await render();
    expect(input.getAttribute('role')).toBe('switch');
    input.focus();
    await userEvent.keyboard(' ');
    expect(host.alerts).toBe(true);
  });

  it('moves the knob to the end and fills the track when on', async () => {
    const { input } = await render();
    const off = getComputedStyle(input).backgroundPositionX;
    await userEvent.click(input);
    const on = getComputedStyle(input);
    expect(on.backgroundPositionX).not.toBe(off);
    expect(toRgba(on.backgroundColor)).toEqual(resolveColor('--tes-color-primary', input));
  });

  it('mirrors the knob in right-to-left layouts', async () => {
    const { input } = await render();
    const ltr = getComputedStyle(input).backgroundPositionX;
    input.closest('label')!.dir = 'rtl';
    expect(getComputedStyle(input).backgroundPositionX).not.toBe(ltr);
  });

  it('keeps the off knob visible against its track (3:1)', async () => {
    const { input } = await render();
    const knob = resolveColor('--tes-color-text-muted', input);
    const track = toRgba(getComputedStyle(input).backgroundColor);
    expect(contrast(knob, track)).toBeGreaterThanOrEqual(3);
  });

  it('takes its knob images from the component tokens', async () => {
    const { input } = await render();
    const knob = () => getComputedStyle(input).backgroundImage;
    expect(knob()).toContain('radial-gradient');
    input.style.setProperty('--tes-switch-knob', 'linear-gradient(red, red)');
    expect(knob()).toContain('rgb(255, 0, 0)');
    input.click();
    expect(knob()).toContain('rgb(255, 0, 0)'); // the checked knob falls back to the unchecked one
    input.style.setProperty('--tes-switch-knob-checked', 'linear-gradient(blue, blue)');
    expect(knob()).toContain('rgb(0, 0, 255)');
  });
});
