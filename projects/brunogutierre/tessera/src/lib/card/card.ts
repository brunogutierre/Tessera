import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type TesCardVariant = 'outlined' | 'elevated' | 'filled';

/**
 * A surface that groups related content. Mark optional regions with attributes:
 *
 * ```html
 * <tes-card>
 *   <h3 tesCardHeader>Monthly revenue</h3>
 *   <p>…</p>
 *   <div tesCardFooter><button tes-button>Details</button></div>
 * </tes-card>
 * ```
 *
 * Use `<article tes-card>` or `<section tes-card>` when the card needs a landmark or article role.
 */
@Component({
  selector: 'tes-card, article[tes-card], section[tes-card]',
  template: `
    <div class="header" data-tes-part="header"><ng-content select="[tesCardHeader]" /></div>
    <div class="body" data-tes-part="body"><ng-content /></div>
    <div class="footer" data-tes-part="footer"><ng-content select="[tesCardFooter]" /></div>
  `,
  styleUrl: './card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tes-card',
    '[attr.data-variant]': 'variant()',
  },
})
export class TesCard {
  readonly variant = input<TesCardVariant>('outlined');
}
