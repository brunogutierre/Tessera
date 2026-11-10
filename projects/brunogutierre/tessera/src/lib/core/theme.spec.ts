import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DEFAULT_LABELS, TES_LABELS } from './labels';
import { TesseraTheme, provideTessera } from './theme';
import { TesThemeScope } from './theme-scope';
import type { TesMode, TesThemeName } from './tokens';

const html = document.documentElement;

function fakeMatchMedia(matches: boolean) {
  let listener: ((event: MediaQueryListEvent) => void) | undefined;
  const query = {
    matches,
    addEventListener: vi.fn((_: string, fn: typeof listener) => (listener = fn)),
    removeEventListener: vi.fn(),
  };
  vi.spyOn(window, 'matchMedia').mockReturnValue(query as unknown as MediaQueryList);
  return {
    query,
    change: (dark: boolean) => listener?.({ matches: dark } as MediaQueryListEvent),
  };
}

function theme(): TesseraTheme {
  const service = TestBed.inject(TesseraTheme);
  TestBed.tick();
  return service;
}

afterEach(() => {
  html.removeAttribute('data-tes-theme');
  html.removeAttribute('data-tes-mode');
  vi.restoreAllMocks();
});

describe('TesseraTheme', () => {
  it('defaults to Enterprise following the system mode and writes both attributes', () => {
    const t = theme();
    expect(t.theme()).toBe('enterprise');
    expect(t.mode()).toBe('system');
    expect(html.dataset['tesTheme']).toBe('enterprise');
    expect(html.dataset['tesMode']).toBe('system');
  });

  it('starts from the attributes already on <html> (static markup, no flash)', () => {
    html.dataset['tesTheme'] = 'care';
    html.dataset['tesMode'] = 'dark';
    const t = theme();
    expect(t.theme()).toBe('care');
    expect(t.mode()).toBe('dark');
  });

  it('ignores unknown attribute values', () => {
    html.dataset['tesTheme'] = 'neon';
    html.dataset['tesMode'] = 'sepia';
    const t = theme();
    expect(t.theme()).toBe('enterprise');
    expect(t.mode()).toBe('system');
  });

  it('prefers the provided config over the markup', () => {
    html.dataset['tesTheme'] = 'care';
    TestBed.configureTestingModule({
      providers: [provideTessera({ theme: 'fintech', mode: 'light' })],
    });
    const t = theme();
    expect(t.theme()).toBe('fintech');
    expect(t.resolvedMode()).toBe('light');
  });

  it('updates the attributes when the signals change', () => {
    const t = theme();
    t.theme.set('fintech');
    t.mode.set('dark');
    TestBed.tick();
    expect(html.dataset['tesTheme']).toBe('fintech');
    expect(html.dataset['tesMode']).toBe('dark');
  });

  it('resolves system mode through prefers-color-scheme and follows changes', () => {
    const media = fakeMatchMedia(true);
    const t = theme();
    expect(t.resolvedMode()).toBe('dark');
    media.change(false);
    expect(t.resolvedMode()).toBe('light');
    t.mode.set('dark');
    expect(t.resolvedMode()).toBe('dark');
  });

  it('stops listening when the injector is destroyed', () => {
    const media = fakeMatchMedia(false);
    theme();
    TestBed.resetTestingModule();
    expect(media.query.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('applies the theme at startup when provided, without being injected', () => {
    TestBed.configureTestingModule({ providers: [provideTessera({ theme: 'care' })] });
    TestBed.inject(TES_LABELS); // creates the environment injector and runs its initializers
    TestBed.tick();
    expect(html.dataset['tesTheme']).toBe('care');
  });
});

describe('labels', () => {
  it('defaults to English', () => {
    expect(TestBed.inject(TES_LABELS)).toBe(DEFAULT_LABELS);
    expect(DEFAULT_LABELS.pageRange(11, 20, 87)).toBe('11–20 of 87');
    expect(DEFAULT_LABELS.pageRange(0, 0, 0)).toBe('0 of 0');
    expect(DEFAULT_LABELS.remove('Urgent')).toBe('Remove Urgent');
  });

  it('merges overrides with the defaults', () => {
    TestBed.configureTestingModule({
      providers: [provideTessera({ labels: { close: 'Fechar' } })],
    });
    const labels = TestBed.inject(TES_LABELS);
    expect(labels.close).toBe('Fechar');
    expect(labels.loading).toBe('Loading');
  });
});

@Component({
  imports: [TesThemeScope],
  template: `<section [tesTheme]="theme()" [tesMode]="mode()"></section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly theme = signal<TesThemeName>('fintech');
  readonly mode = signal<TesMode | undefined>(undefined);
}

describe('TesThemeScope', () => {
  it('sets the theme on its host and the mode only when given', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const section = (fixture.nativeElement as HTMLElement).querySelector('section')!;
    expect(section.dataset['tesTheme']).toBe('fintech');
    expect(section.hasAttribute('data-tes-mode')).toBe(false);

    fixture.componentInstance.theme.set('care');
    fixture.componentInstance.mode.set('dark');
    await fixture.whenStable();
    expect(section.dataset['tesTheme']).toBe('care');
    expect(section.dataset['tesMode']).toBe('dark');
  });
});
