import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type TesTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
export type TesBadgeVariant = 'subtle' | 'solid';

/**
 * A short status or count label.
 *
 * ```html
 * <tes-badge tone="success">Paid</tes-badge>
 * <tes-badge tone="danger" variant="solid">3</tes-badge>
 * ```
 *
 * Color is never the only cue: the text says the status. For counts, give the context in nearby
 * text or an `aria-label` on the badge's container.
 */
@Component({
  selector: 'tes-badge',
  template: `<ng-content />`,
  styleUrl: './badge.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tes-badge',
    '[attr.data-tone]': 'tone()',
    '[attr.data-variant]': 'variant()',
  },
})
export class TesBadge {
  readonly tone = input<TesTone>('neutral');
  readonly variant = input<TesBadgeVariant>('subtle');
}
