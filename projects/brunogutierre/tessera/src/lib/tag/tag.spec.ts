import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { provideTessera } from '../core/theme';
import { TesTag } from './tag';

@Component({
  imports: [TesTag],
  template: `
    @for (tag of tags(); track tag) {
      <tes-tag [removable]="removable()" [disabled]="disabled()" (removed)="remove(tag)">{{
        tag
      }}</tes-tag>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly tags = signal(['Invoices', 'Overdue']);
  readonly removable = signal(true);
  readonly disabled = signal(false);
  remove(tag: string): void {
    this.tags.update((tags) => tags.filter((t) => t !== tag));
  }
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  return { fixture, host: fixture.componentInstance, el };
}

describe('TesTag', () => {
  it('names the remove button after the tag text', async () => {
    const { el } = await render();
    const buttons = [...el.querySelectorAll('button')];
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual([
      'Remove Invoices',
      'Remove Overdue',
    ]);
    expect(buttons[0]!.type).toBe('button');
  });

  it('emits removed on click and with the keyboard', async () => {
    const { el, fixture } = await render();
    el.querySelector('button')!.click();
    await fixture.whenStable();
    expect(el.textContent).not.toContain('Invoices');

    el.querySelector('button')!.focus();
    await userEvent.keyboard('{Enter}');
    await fixture.whenStable();
    expect(el.querySelectorAll('tes-tag')).toHaveLength(0);
  });

  it('follows the translated label and text changes', async () => {
    TestBed.configureTestingModule({
      providers: [provideTessera({ labels: { remove: (item) => `Remover ${item}` } })],
    });
    const { el, fixture, host } = await render();
    host.tags.set(['Atrasadas']);
    await fixture.whenStable();
    expect(el.querySelector('button')!.getAttribute('aria-label')).toBe('Remover Atrasadas');
  });

  it('has no remove button unless removable, and disables it when disabled', async () => {
    const { el, fixture, host } = await render();
    host.disabled.set(true);
    await fixture.whenStable();
    expect(el.querySelector('button')!.disabled).toBe(true);
    expect(el.querySelector('tes-tag')!.hasAttribute('data-disabled')).toBe(true);

    host.removable.set(false);
    await fixture.whenStable();
    expect(el.querySelector('button')).toBeNull();
  });
});
