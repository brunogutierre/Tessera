/** The themes that ship with Tessera. */
export const TES_THEMES = ['enterprise', 'fintech', 'care'] as const;
export type TesThemeName = (typeof TES_THEMES)[number];

/** Color modes. `system` follows the operating system preference. */
export const TES_MODES = ['light', 'dark', 'system'] as const;
export type TesMode = (typeof TES_MODES)[number];

const STATUSES = ['success', 'warning', 'danger', 'info'] as const;
const statusTokens = STATUSES.flatMap(
  (s) =>
    [
      `--tes-color-${s}`,
      `--tes-color-${s}-hover`,
      `--tes-color-on-${s}`,
      `--tes-color-${s}-subtle`,
      `--tes-color-${s}-text`,
    ] as const,
);

/**
 * Every semantic token a theme must define. Components only read these (or their own component
 * tokens that fall back to these), so a new theme is complete when it defines this list.
 */
export const SEMANTIC_TOKENS = [
  // Surfaces and text
  '--tes-color-bg',
  '--tes-color-surface',
  '--tes-color-surface-raised',
  '--tes-color-surface-sunken',
  '--tes-color-backdrop',
  '--tes-color-text',
  '--tes-color-text-muted',
  '--tes-color-text-disabled',
  '--tes-color-text-inverse',
  '--tes-color-border',
  '--tes-color-border-strong',
  // Brand and interaction
  '--tes-color-primary',
  '--tes-color-primary-hover',
  '--tes-color-primary-active',
  '--tes-color-on-primary',
  '--tes-color-primary-subtle',
  '--tes-color-on-primary-subtle',
  '--tes-color-neutral-subtle',
  '--tes-color-neutral-subtle-hover',
  '--tes-color-hover',
  '--tes-color-selected',
  '--tes-color-focus',
  // Status
  ...statusTokens,
  // Typography
  '--tes-font-sans',
  '--tes-font-mono',
  '--tes-text-xs',
  '--tes-text-sm',
  '--tes-text-md',
  '--tes-text-lg',
  '--tes-text-xl',
  '--tes-text-2xl',
  '--tes-text-3xl',
  '--tes-leading-tight',
  '--tes-leading-normal',
  '--tes-weight-regular',
  '--tes-weight-medium',
  '--tes-weight-semibold',
  '--tes-weight-bold',
  '--tes-numeric',
  // Space and density
  '--tes-space-1',
  '--tes-space-2',
  '--tes-space-3',
  '--tes-space-4',
  '--tes-space-5',
  '--tes-space-6',
  '--tes-space-7',
  '--tes-space-8',
  '--tes-control-height-sm',
  '--tes-control-height-md',
  '--tes-control-height-lg',
  '--tes-control-padding-x',
  '--tes-control-gap',
  // Shape
  '--tes-radius-sm',
  '--tes-radius-md',
  '--tes-radius-lg',
  '--tes-radius-full',
  '--tes-border-width',
  '--tes-focus-ring-width',
  '--tes-focus-ring-offset',
  // Elevation and motion
  '--tes-shadow-sm',
  '--tes-shadow-md',
  '--tes-shadow-lg',
  '--tes-duration-fast',
  '--tes-duration-normal',
  '--tes-duration-slow',
  '--tes-easing-standard',
  '--tes-easing-emphasized',
] as const;

export type TesToken = (typeof SEMANTIC_TOKENS)[number];
