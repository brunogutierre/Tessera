import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTessera } from '../core/theme';
import { TesSpinner } from './spinner';

@Component({
  imports: [TesSpinner],
  template: `<tes-spinner [label]="label()" [decorative]="decorative()" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly label = signal<string | undefined>(undefined);
  readonly decorative = signal(false);
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const spinner = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('tes-spinner')!;
  return { fixture, host: fixture.componentInstance, spinner };
}

describe('TesSpinner', () => {
  it('is an indeterminate progressbar named by the loading label', async () => {
    const { spinner } = await render();
    expect(spinner.getAttribute('role')).toBe('progressbar');
    expect(spinner.hasAttribute('aria-valuenow')).toBe(false);
    expect(spinner.getAttribute('aria-label')).toBe('Loading');
    expect(spinner.dataset['size']).toBe('md');
  });

  it('uses the translated label and a custom label', async () => {
    TestBed.configureTestingModule({
      providers: [provideTessera({ labels: { loading: 'Carregando' } })],
    });
    const { fixture, host, spinner } = await render();
    expect(spinner.getAttribute('aria-label')).toBe('Carregando');
    host.label.set('Saving order');
    await fixture.whenStable();
    expect(spinner.getAttribute('aria-label')).toBe('Saving order');
  });

  it('can be hidden from assistive technology', async () => {
    const { fixture, host, spinner } = await render();
    host.decorative.set(true);
    await fixture.whenStable();
    expect(spinner.getAttribute('aria-hidden')).toBe('true');
    expect(spinner.hasAttribute('role')).toBe(false);
    expect(spinner.hasAttribute('aria-label')).toBe(false);
  });
});
