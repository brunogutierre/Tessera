import { DOCUMENT } from '@angular/common';
import {
  DestroyRef,
  Injectable,
  InjectionToken,
  computed,
  effect,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  signal,
} from '@angular/core';
import type { EnvironmentProviders, Signal, WritableSignal } from '@angular/core';
import { DEFAULT_LABELS, TES_LABELS } from './labels';
import type { TesLabels } from './labels';
import { TES_MODES, TES_THEMES } from './tokens';
import type { TesMode, TesThemeName } from './tokens';

export interface TesseraConfig {
  /** Initial theme. Defaults to the `data-tes-theme` already on `<html>`, then `enterprise`. */
  theme?: TesThemeName;
  /** Initial mode. Defaults to the `data-tes-mode` already on `<html>`, then `system`. */
  mode?: TesMode;
  /** Overrides for the built-in strings. */
  labels?: Partial<TesLabels>;
}

export const TES_CONFIG = new InjectionToken<TesseraConfig>('TES_CONFIG', {
  providedIn: 'root',
  factory: () => ({}),
});

function isOneOf<T extends string>(values: readonly T[], value: string | null): value is T {
  return value !== null && (values as readonly string[]).includes(value);
}

/**
 * The page-level theme and mode. Writing `theme` or `mode` updates the `data-tes-theme` and
 * `data-tes-mode` attributes on `<html>`, and the CSS tokens follow. Use the `tesTheme` directive
 * for a subtree with a different theme.
 */
@Injectable({ providedIn: 'root' })
export class TesseraTheme {
  readonly #root = inject(DOCUMENT).documentElement;
  readonly #config = inject(TES_CONFIG);
  readonly #prefersDark = signal(false);

  readonly theme: WritableSignal<TesThemeName> = signal(
    this.#config.theme ?? this.#initial(TES_THEMES, 'data-tes-theme') ?? 'enterprise',
  );
  readonly mode: WritableSignal<TesMode> = signal(
    this.#config.mode ?? this.#initial(TES_MODES, 'data-tes-mode') ?? 'system',
  );

  /** The mode actually shown: `system` resolved through `prefers-color-scheme`. */
  readonly resolvedMode: Signal<'light' | 'dark'> = computed(() => {
    const mode = this.mode();
    if (mode !== 'system') return mode;
    return this.#prefersDark() ? 'dark' : 'light';
  });

  constructor() {
    this.#watchSystemPreference();
    effect(() => {
      this.#root.setAttribute('data-tes-theme', this.theme());
      this.#root.setAttribute('data-tes-mode', this.mode());
    });
  }

  #initial<T extends string>(values: readonly T[], attribute: string): T | undefined {
    const value = this.#root.getAttribute(attribute);
    return isOneOf(values, value) ? value : undefined;
  }

  #watchSystemPreference(): void {
    const view = this.#root.ownerDocument.defaultView;
    if (!view?.matchMedia) return; // server rendering
    const query = view.matchMedia('(prefers-color-scheme: dark)');
    this.#prefersDark.set(query.matches);
    const update = (event: MediaQueryListEvent): void => {
      this.#prefersDark.set(event.matches);
    };
    query.addEventListener('change', update);
    inject(DestroyRef).onDestroy(() => {
      query.removeEventListener('change', update);
    });
  }
}

/**
 * Sets up Tessera for an application: initial theme and mode, and label overrides.
 *
 * ```ts
 * bootstrapApplication(App, { providers: [provideTessera({ theme: 'fintech', mode: 'dark' })] });
 * ```
 */
export function provideTessera(config: TesseraConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: TES_CONFIG, useValue: config },
    { provide: TES_LABELS, useValue: { ...DEFAULT_LABELS, ...config.labels } },
    provideEnvironmentInitializer(() => inject(TesseraTheme)),
  ]);
}
