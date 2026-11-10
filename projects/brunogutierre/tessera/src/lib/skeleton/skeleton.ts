import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';

export type TesSkeletonShape = 'text' | 'rect' | 'circle';

/**
 * A placeholder shown while content loads. Always hidden from assistive technology: mark the
 * loading region with `aria-busy="true"` (and announce completion if it matters).
 *
 * ```html
 * <section aria-busy="true">
 *   <tes-skeleton shape="circle" width="2.5rem" />
 *   <tes-skeleton lines="3" />
 * </section>
 * ```
 */
@Component({
  selector: 'tes-skeleton',
  template: `
    @for (line of lineList(); track line) {
      <span class="bone"></span>
    }
  `,
  styleUrl: './skeleton.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tes-skeleton',
    'aria-hidden': 'true',
    '[attr.data-shape]': 'shape()',
    '[style.--_width]': 'width() ?? null',
    '[style.--_height]': 'height() ?? null',
  },
})
export class TesSkeleton {
  readonly shape = input<TesSkeletonShape>('text');
  /** Any CSS length. Text defaults to the full width; circles to their height. */
  readonly width = input<string>();
  readonly height = input<string>();
  /** Number of text lines; the last one is shorter, like a paragraph. */
  readonly lines = input(1, { transform: numberAttribute });

  protected readonly lineList = computed(() =>
    Array.from({ length: this.shape() === 'text' ? Math.max(1, this.lines()) : 1 }, (_, i) => i),
  );
}
