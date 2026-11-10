import { Directive, input } from '@angular/core';
import type { TesMode, TesThemeName } from './tokens';

/**
 * Gives a subtree its own theme and, optionally, its own mode:
 *
 * ```html
 * <aside tesTheme="enterprise" tesMode="light">…</aside>
 * ```
 *
 * Overlays that render in the global container (dialogs, toasts) follow the page theme instead;
 * popovers anchored inside the subtree (menus, selects, tooltips) keep the scoped theme.
 */
@Directive({
  selector: '[tesTheme]',
  host: {
    '[attr.data-tes-theme]': 'tesTheme()',
    '[attr.data-tes-mode]': 'tesMode() ?? null',
  },
})
export class TesThemeScope {
  readonly tesTheme = input.required<TesThemeName>();
  readonly tesMode = input<TesMode>();
}
