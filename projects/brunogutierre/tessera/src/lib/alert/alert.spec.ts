import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { contrast, toRgba } from '../../test-utils/color';
import { loadTesseraStyles } from '../../test-utils/styles';
import { provideTessera } from '../core/theme';
import { TesAlert } from './alert';
import type { TesAlertLive, TesAlertTone } from './alert';

@Component({
  imports: [TesAlert],
  template: `
    <tes-alert
      [tone]="tone()"
      [heading]="heading()"
      [live]="live()"
      [dismissible]="dismissible()"
      (dismissed)="dismissals = dismissals + 1"
      >Invoice INV-0184 was due on 30 Nov.</tes-alert
    >
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly tone = signal<TesAlertTone>('warning');
  readonly heading = signal<string | undefined>('Payment overdue');
  readonly live = signal<TesAlertLive>('off');
  readonly dismissible = signal(false);
  dismissals = 0;
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const alert = (fixture.nativeElement as HTMLElement).querySelector('tes-alert')!;
  return { fixture, host: fixture.componentInstance, alert };
}

beforeAll(loadTesseraStyles);

describe('TesAlert', () => {
  it('speaks the tone before the heading and body', async () => {
    const { alert } = await render();
    expect(alert.textContent.replace(/\s+/g, ' ').trim()).toBe(
      'Warning: Payment overdue Invoice INV-0184 was due on 30 Nov.',
    );
    expect(alert.querySelector('tes-icon')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('speaks the tone even without a heading, in the configured language', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideTessera({
          labels: {
            tones: { info: 'Informação', success: 'Sucesso', warning: 'Atenção', danger: 'Erro' },
          },
        }),
      ],
    });
    const { alert, fixture, host } = await render();
    host.heading.set(undefined);
    host.tone.set('danger');
    await fixture.whenStable();
    expect(alert.textContent.trim().startsWith('Erro:')).toBe(true);
  });

  it('is a live region only when asked', async () => {
    const { alert, fixture, host } = await render();
    expect(alert.hasAttribute('role')).toBe(false);
    host.live.set('polite');
    await fixture.whenStable();
    expect(alert.getAttribute('role')).toBe('status');
    host.live.set('assertive');
    await fixture.whenStable();
    expect(alert.getAttribute('role')).toBe('alert');
  });

  it('emits dismissed from a named dismiss button', async () => {
    const { alert, fixture, host } = await render();
    expect(alert.querySelector('button')).toBeNull();
    host.dismissible.set(true);
    await fixture.whenStable();
    const button = alert.querySelector('button')!;
    expect(button.getAttribute('aria-label')).toBe('Dismiss');
    button.click();
    expect(host.dismissals).toBe(1);
  });

  it.each(['info', 'success', 'warning', 'danger'] as const)(
    'keeps body text readable on the %s background',
    async (tone) => {
      const { alert, fixture, host } = await render();
      host.tone.set(tone);
      await fixture.whenStable();
      const style = getComputedStyle(alert);
      expect(contrast(toRgba(style.color), toRgba(style.backgroundColor))).toBeGreaterThanOrEqual(
        4.5,
      );
    },
  );
});
