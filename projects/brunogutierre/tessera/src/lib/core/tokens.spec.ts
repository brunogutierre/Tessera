import { contrast, resolveColor, toRgba } from '../../test-utils/color';
import { loadTesseraStyles, readStyle } from '../../test-utils/styles';
import { TES_CONTRAST_PAIRS } from './contrast';
import { SEMANTIC_TOKENS, TES_THEMES } from './tokens';
import type { TesThemeName } from './tokens';

type Mode = 'light' | 'dark';
const MODES: readonly Mode[] = ['light', 'dark'];
const scopes: HTMLElement[] = [];

function scope(theme: TesThemeName, mode?: Mode | 'system', parent = document.body): HTMLElement {
  const el = document.createElement('div');
  el.dataset['tesTheme'] = theme;
  if (mode) el.dataset['tesMode'] = mode;
  parent.append(el);
  scopes.push(el);
  return el;
}

/** Pairs below their minimum ratio, as readable strings. */
function failures(minRatio: number, el: HTMLElement): string[] {
  return TES_CONTRAST_PAIRS.filter((p) => p.minRatio === minRatio)
    .map((p) => ({
      pair: `${p.foreground} on ${p.background}`,
      ratio: contrast(resolveColor(p.foreground, el), resolveColor(p.background, el)),
    }))
    .filter((r) => r.ratio < minRatio)
    .map((r) => `${r.pair}: ${r.ratio.toFixed(2)}`);
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
  it('checks 49 contrast pairs', () => {
    expect(TES_CONTRAST_PAIRS).toHaveLength(49);
    for (const p of TES_CONTRAST_PAIRS) {
      expect(SEMANTIC_TOKENS).toContain(p.foreground);
      expect(SEMANTIC_TOKENS).toContain(p.background);
    }
  });

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
      expect(failures(4.5, el)).toEqual([]);
    });

    it.each(MODES)('meets non-text contrast (3:1) in %s mode', (mode) => {
      const el = scope(theme, mode);
      expect(failures(3, el)).toEqual([]);
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

  it('leaves the root font size to the browser, so rem tokens keep their size', () => {
    document.documentElement.dataset['tesTheme'] = 'enterprise';
    try {
      expect(getComputedStyle(document.documentElement).fontSize).toBe('16px');
      expect(getComputedStyle(document.body).fontSize).toBe('14px'); // Enterprise text-md
      expect(getComputedStyle(scope('care')).fontSize).toBe('16px'); // Care text-md
    } finally {
      delete document.documentElement.dataset['tesTheme'];
    }
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
