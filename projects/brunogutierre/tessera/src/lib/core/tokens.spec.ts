import { contrast, resolveColor, toRgba } from '../../test-utils/color';
import { loadTesseraStyles, readStyle } from '../../test-utils/styles';
import { SEMANTIC_TOKENS, TES_THEMES } from './tokens';
import type { TesThemeName } from './tokens';

type Mode = 'light' | 'dark';
const MODES: readonly Mode[] = ['light', 'dark'];
const STATUSES = ['success', 'warning', 'danger', 'info'] as const;

/** [foreground, background] pairs that carry text: WCAG 1.4.3 needs 4.5:1. */
const TEXT_PAIRS: readonly (readonly [string, string])[] = [
  ['text', 'bg'],
  ['text', 'surface'],
  ['text', 'surface-raised'],
  ['text', 'surface-sunken'],
  ['text', 'selected'],
  ['text', 'neutral-subtle'],
  ['text', 'neutral-subtle-hover'],
  ['text-muted', 'bg'],
  ['text-muted', 'surface'],
  ['on-primary', 'primary'],
  ['on-primary', 'primary-hover'],
  ['on-primary', 'primary-active'],
  ['on-primary-subtle', 'primary-subtle'],
  ['primary', 'surface'],
  ['primary', 'bg'],
  ...STATUSES.flatMap((s) => [
    [`on-${s}`, s] as const,
    [`on-${s}`, `${s}-hover`] as const,
    [`${s}-text`, `${s}-subtle`] as const,
    [`${s}-text`, 'surface'] as const,
    [`${s}-text`, 'bg'] as const,
  ]),
];

/** Pairs for borders, focus rings and icons: WCAG 1.4.11 needs 3:1. */
const UI_PAIRS: readonly (readonly [string, string])[] = [
  ['border-strong', 'surface'],
  ['border-strong', 'bg'],
  ['focus', 'bg'],
  ['focus', 'surface'],
  ['focus', 'surface-raised'],
  ...STATUSES.map((s) => [s, 'surface'] as const),
];

const scopes: HTMLElement[] = [];

function scope(theme: TesThemeName, mode?: Mode | 'system', parent = document.body): HTMLElement {
  const el = document.createElement('div');
  el.dataset['tesTheme'] = theme;
  if (mode) el.dataset['tesMode'] = mode;
  parent.append(el);
  scopes.push(el);
  return el;
}

function ratio(fg: string, bg: string, el: HTMLElement): number {
  return contrast(resolveColor(`--tes-color-${fg}`, el), resolveColor(`--tes-color-${bg}`, el));
}

function token(el: Element, name: string): string {
  return getComputedStyle(el).getPropertyValue(name).trim();
}

beforeAll(loadTesseraStyles);
afterEach(() => {
  scopes.splice(0).forEach((el) => {
    el.remove();
  });
});

describe('design tokens', () => {
  describe.each(TES_THEMES)('%s theme', (theme) => {
    it('declares exactly the semantic token set', async () => {
      const css = await readStyle(`themes/${theme}.css`);
      const declared = new Set([...css.matchAll(/(--tes-[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
      expect([...declared].sort()).toEqual([...SEMANTIC_TOKENS].sort());
    });

    it('resolves every semantic token', () => {
      const el = scope(theme, 'light');
      const empty = SEMANTIC_TOKENS.filter((name) => token(el, name) === '');
      expect(empty).toEqual([]);
    });

    it.each(MODES)('meets text contrast (4.5:1) in %s mode', (mode) => {
      const el = scope(theme, mode);
      const failures = TEXT_PAIRS.map(([fg, bg]) => ({
        pair: `${fg} on ${bg}`,
        ratio: ratio(fg, bg, el),
      }))
        .filter((r) => r.ratio < 4.5)
        .map((r) => `${r.pair}: ${r.ratio.toFixed(2)}`);
      expect(failures).toEqual([]);
    });

    it.each(MODES)('meets non-text contrast (3:1) in %s mode', (mode) => {
      const el = scope(theme, mode);
      const failures = UI_PAIRS.map(([fg, bg]) => ({
        pair: `${fg} on ${bg}`,
        ratio: ratio(fg, bg, el),
      }))
        .filter((r) => r.ratio < 3)
        .map((r) => `${r.pair}: ${r.ratio.toFixed(2)}`);
      expect(failures).toEqual([]);
    });

    it('gives light and dark modes different colors from the same tokens', () => {
      const light = resolveColor('--tes-color-bg', scope(theme, 'light'));
      const dark = resolveColor('--tes-color-bg', scope(theme, 'dark'));
      expect(light).not.toEqual(dark);
    });

    it('paints the scope with the theme background and text color', () => {
      const el = scope(theme, 'dark');
      expect(toRgba(getComputedStyle(el).backgroundColor)).toEqual(
        resolveColor('--tes-color-bg', el),
      );
      expect(toRgba(getComputedStyle(el).color)).toEqual(resolveColor('--tes-color-text', el));
    });
  });

  it('maps modes to color-scheme, with system following the OS', () => {
    expect(getComputedStyle(scope('care', 'light')).colorScheme).toBe('light');
    expect(getComputedStyle(scope('care', 'dark')).colorScheme).toBe('dark');
    expect(getComputedStyle(scope('care', 'system')).colorScheme).toBe('light dark');
  });

  it('uses the Enterprise theme when no theme attribute is set', () => {
    const plain = document.createElement('div');
    document.body.append(plain);
    scopes.push(plain);
    const enterprise = scope('enterprise');
    expect(token(plain, '--tes-radius-md')).toBe(token(enterprise, '--tes-radius-md'));
    expect(token(plain, '--tes-font-sans')).toBe(token(enterprise, '--tes-font-sans'));
  });

  it('lets a nested scope switch theme and mode for its subtree only', () => {
    const outer = scope('enterprise', 'light');
    const inner = scope('fintech', 'dark', outer);
    const fintech = scope('fintech', 'dark');
    expect(token(inner, '--tes-font-sans')).toBe(token(fintech, '--tes-font-sans'));
    expect(resolveColor('--tes-color-bg', inner)).toEqual(resolveColor('--tes-color-bg', fintech));
    expect(resolveColor('--tes-color-bg', outer)).not.toEqual(
      resolveColor('--tes-color-bg', inner),
    );
  });
});
