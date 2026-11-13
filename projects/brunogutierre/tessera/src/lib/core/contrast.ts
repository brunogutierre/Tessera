import type { TesToken } from './tokens';

/** A foreground and background token that must contrast, and the WCAG 2.2 minimum ratio. */
export interface TesContrastPair {
  readonly foreground: TesToken;
  readonly background: TesToken;
  /** 4.5 for text (WCAG 1.4.3), 3 for borders, focus rings and icons (WCAG 1.4.11). */
  readonly minRatio: 4.5 | 3;
}

const STATUSES = ['success', 'warning', 'danger', 'info'] as const;
// The spec checks that every name below is a semantic token.
const c = (name: string) => `--tes-color-${name}` as TesToken;

const text = (fg: string, bg: string): TesContrastPair => ({
  foreground: c(fg),
  background: c(bg),
  minRatio: 4.5,
});
const ui = (fg: string, bg: string): TesContrastPair => ({
  foreground: c(fg),
  background: c(bg),
  minRatio: 3,
});

/**
 * The color pairs every theme must pass, in light and in dark mode. Tessera tests its own themes
 * against this list; a theme package should test its themes against it too.
 */
export const TES_CONTRAST_PAIRS: readonly TesContrastPair[] = [
  text('text', 'bg'),
  text('text', 'surface'),
  text('text', 'surface-raised'),
  text('text', 'surface-sunken'),
  text('text', 'selected'),
  text('text', 'neutral-subtle'),
  text('text', 'neutral-subtle-hover'),
  text('text-muted', 'bg'),
  text('text-muted', 'surface'),
  text('text-muted', 'surface-raised'),
  text('text-muted', 'surface-sunken'),
  text('on-primary', 'primary'),
  text('on-primary', 'primary-hover'),
  text('on-primary', 'primary-active'),
  text('on-primary-subtle', 'primary-subtle'),
  text('primary', 'surface'),
  text('primary', 'bg'),
  text('primary', 'surface-raised'),
  ...STATUSES.flatMap((s) => [
    text(`on-${s}`, s),
    text(`on-${s}`, `${s}-hover`),
    text(`${s}-text`, `${s}-subtle`),
    text(`${s}-text`, 'surface'),
    text(`${s}-text`, 'bg'),
  ]),
  ui('border-strong', 'surface'),
  ui('border-strong', 'bg'),
  ui('border-strong', 'surface-raised'),
  ui('border-strong', 'surface-sunken'),
  ui('focus', 'bg'),
  ui('focus', 'surface'),
  ui('focus', 'surface-raised'),
  ...STATUSES.map((s) => ui(s, 'surface')),
];
