import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { loadTesseraStyles } from '../../test-utils/styles';
import { TesAccordion, TesAccordionItem } from './accordion';

@Component({
  imports: [TesAccordion, TesAccordionItem],
  template: `
    <tes-accordion [multiple]="multi()">
      <tes-accordion-item heading="Shipping" level="2">Ships in 2 days.</tes-accordion-item>
      <tes-accordion-item heading="Returns" [(expanded)]="returnsOpen"
        >30-day returns.</tes-accordion-item
      >
      <tes-accordion-item heading="Warranty" disabled>Not available.</tes-accordion-item>
    </tes-accordion>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly multi = signal(false);
  readonly returnsOpen = signal(true);
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  return {
    fixture,
    host: fixture.componentInstance,
    el,
    triggers: () => [...el.querySelectorAll<HTMLButtonElement>('.trigger')],
    regions: () => [...el.querySelectorAll<HTMLElement>('[role="region"]')],
  };
}

beforeAll(loadTesseraStyles);

describe('TesAccordion', () => {
  it('renders headings with buttons that control named regions', async () => {
    const { el, triggers, regions } = await render();
    const headings = [...el.querySelectorAll('[role="heading"]')];
    expect(headings.map((h) => h.getAttribute('aria-level'))).toEqual(['2', '3', '3']);
    expect(triggers()[1]!.getAttribute('aria-expanded')).toBe('true');
    expect(triggers()[1]!.getAttribute('aria-controls')).toBe(regions()[1]!.id);
    expect(regions()[1]!.getAttribute('aria-labelledby')).toBe(triggers()[1]!.id);
  });

  it('renders content only while expanded', async () => {
    const { el, regions } = await render();
    expect(el.textContent).toContain('30-day returns.');
    expect(el.textContent).not.toContain('Ships in 2 days.');
    expect(getComputedStyle(regions()[0]!).display).toBe('none');
  });

  it('closes the others when one opens, unless multi', async () => {
    const { triggers, host, fixture } = await render();
    await userEvent.click(triggers()[0]!);
    await fixture.whenStable();
    expect(triggers()[0]!.getAttribute('aria-expanded')).toBe('true');
    expect(host.returnsOpen()).toBe(false);

    host.multi.set(true);
    await fixture.whenStable();
    await userEvent.click(triggers()[1]!);
    await fixture.whenStable();
    expect(triggers()[0]!.getAttribute('aria-expanded')).toBe('true');
    expect(triggers()[1]!.getAttribute('aria-expanded')).toBe('true');
  });

  it('keeps one section open by default, also with one-way bindings', async () => {
    @Component({
      imports: [TesAccordion, TesAccordionItem],
      template: `
        <tes-accordion>
          <tes-accordion-item heading="A" [expanded]="true">a</tes-accordion-item>
          <tes-accordion-item heading="B">b</tes-accordion-item>
        </tes-accordion>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class OneWay {}
    const fixture = TestBed.createComponent(OneWay);
    await fixture.whenStable();
    const buttons = [...(fixture.nativeElement as HTMLElement).querySelectorAll('.trigger')];
    await userEvent.click(buttons[1]!);
    await fixture.whenStable();
    expect(buttons.map((b) => b.getAttribute('aria-expanded'))).toEqual(['false', 'true']);
  });

  it('moves between headers with the arrow keys and toggles with Enter', async () => {
    const { triggers, fixture } = await render();
    triggers()[0]!.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(triggers()[1]);
    await userEvent.keyboard('{Enter}');
    await fixture.whenStable();
    expect(triggers()[1]!.getAttribute('aria-expanded')).toBe('false');
    expect(triggers()[2]!.getAttribute('aria-disabled')).toBe('true');
  });
});
