import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TES_ICONS } from './icons';
import type { TesIconName } from './icons';

/**
 * An inline SVG icon from Tessera's built-in set. Decorative by default (hidden from assistive
 * technology); give it a `label` when the icon alone carries meaning.
 *
 * ```html
 * <tes-icon name="search" />
 * <tes-icon name="triangle-alert" label="Warning" />
 * ```
 *
 * Size follows the font size (`1.25em`); override with `--tes-icon-size`.
 */
@Component({
  selector: 'tes-icon',
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      @for (d of paths(); track $index) {
        <path [attr.d]="d" />
      }
    </svg>
  `,
  styleUrl: './icon.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tes-icon',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() ?? null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
    '[attr.data-directional]': 'directional() || null',
  },
})
export class TesIcon {
  readonly name = input.required<TesIconName>();
  /** Accessible name. Without it the icon is decorative. */
  readonly label = input<string>();

  protected readonly paths = computed(() => TES_ICONS[this.name()]);
  /** Horizontal arrows and chevrons point the other way in right-to-left layouts. */
  protected readonly directional = computed(() => /-(left|right)$/.test(this.name()));
}
