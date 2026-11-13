import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, form } from '@angular/forms/signals';
import { userEvent } from 'vitest/browser';
import { resolveColor, toRgba } from '../../test-utils/color';
import { loadTesseraStyles } from '../../test-utils/styles';
import { TesChoice } from '../choice/choice';
import { TesCheckbox } from './checkbox';

@Component({
  imports: [TesCheckbox, TesChoice, FormField],
  template: `
    <label tes-choice
      ><input type="checkbox" tes-checkbox [formField]="prefs.terms" /> Accept terms</label
    >
    <label tes-choice class="off"><input type="checkbox" tes-checkbox disabled /> Locked</label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly model = signal({ terms: false });
  readonly prefs = form(this.model);
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  return { fixture, host: fixture.componentInstance, el, box: el.querySelector('input')! };
}

beforeAll(loadTesseraStyles);

describe('TesCheckbox + TesChoice', () => {
  it('stays a native, labelled checkbox bound to Signal Forms', async () => {
    const { box, host, fixture } = await render();
    expect(box.type).toBe('checkbox');
    expect(box.labels?.[0]?.textContent.trim()).toBe('Accept terms');

    await userEvent.click(box.labels![0]!);
    expect(host.model().terms).toBe(true);

    host.model.set({ terms: false });
    await fixture.whenStable();
    expect(box.checked).toBe(false);

    box.focus();
    await userEvent.keyboard(' ');
    expect(host.model().terms).toBe(true);
  });

  it('fills with the primary color when checked and cuts the mark out', async () => {
    const { box, fixture, host } = await render();
    const style = () => getComputedStyle(box);
    expect(toRgba(style().borderColor)).toEqual(resolveColor('--tes-color-border-strong', box));
    expect(style().maskImage).toBe('none');

    host.model.set({ terms: true });
    await fixture.whenStable();
    expect(toRgba(style().backgroundColor)).toEqual(resolveColor('--tes-color-primary', box));
    expect(style().maskImage).toContain('data:image/svg+xml');

    box.indeterminate = true;
    expect(style().maskImage).toContain('M6 12h12');
  });

  it('keeps the focus ring visible around a checked box', async () => {
    const { box, fixture, host } = await render();
    host.model.set({ terms: true });
    await fixture.whenStable();
    await userEvent.tab();
    expect(document.activeElement).toBe(box);
    expect(getComputedStyle(box).outlineStyle).toBe('solid');
    expect(getComputedStyle(box).maskClip).toContain('no-clip');
  });

  it('dims the label of a disabled control with readable text', async () => {
    const { el } = await render();
    const label = el.querySelector<HTMLElement>('.off')!;
    expect(toRgba(getComputedStyle(label).color)).toEqual(
      resolveColor('--tes-color-text-muted', label),
    );
    expect(getComputedStyle(label).cursor).toBe('not-allowed');
  });

  it('takes its marks from the component tokens', async () => {
    const { box, fixture, host } = await render();
    box.style.setProperty(
      '--tes-checkbox-mark',
      'url("data:image/svg+xml,%3Csvg%20id=%27star%27/%3E")',
    );
    box.style.setProperty('--tes-checkbox-mark-indeterminate', 'linear-gradient(red, red)');
    host.model.set({ terms: true });
    await fixture.whenStable();
    expect(getComputedStyle(box).maskImage).toContain('star');
    box.indeterminate = true;
    expect(getComputedStyle(box).maskImage).toContain('linear-gradient');
  });
});
