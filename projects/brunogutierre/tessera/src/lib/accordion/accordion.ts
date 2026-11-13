import {
  AccordionContent,
  AccordionGroup,
  AccordionPanel,
  AccordionTrigger,
} from '@angular/aria/accordion';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  booleanAttribute,
  contentChildren,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
} from '@angular/core';
import { TesIcon } from '../icon/icon';

/**
 * One section of a `tes-accordion`: a heading with a button that shows or hides its content.
 * The content is rendered only while expanded.
 */
@Component({
  selector: 'tes-accordion-item',
  imports: [AccordionTrigger, AccordionPanel, AccordionContent, TesIcon],
  template: `
    <div class="heading" data-tes-part="heading" role="heading" [attr.aria-level]="level()">
      <button
        ngAccordionTrigger
        type="button"
        class="trigger"
        data-tes-part="trigger"
        [panel]="panel"
        [disabled]="disabled()"
        [(expanded)]="expanded"
      >
        <span class="title" data-tes-part="title">{{ heading() }}</span>
        <tes-icon name="chevron-down" class="chevron" data-tes-part="chevron" />
      </button>
    </div>
    <div ngAccordionPanel #panel="ngAccordionPanel" class="panel" data-tes-part="panel">
      <ng-template ngAccordionContent>
        <div class="content" data-tes-part="content"><ng-content /></div>
      </ng-template>
    </div>
  `,
  styleUrl: './accordion-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tes-accordion-item' },
})
export class TesAccordionItem {
  readonly heading = input.required<string>();
  /** Heading level of the section title, to fit the page outline (2–6). */
  readonly level = input(3, { transform: numberAttribute });
  readonly expanded = model(false);
  readonly disabled = input(false, { transform: booleanAttribute });

  constructor() {
    // forwardRef: TesAccordion is declared below this class.
    const accordion: TesAccordion | null = inject<TesAccordion>(
      forwardRef(() => TesAccordion),
      { optional: true },
    );
    const subscription = this.expanded.subscribe((expanded) => {
      if (expanded) accordion?.collapseOthers(this);
    });
    inject(DestroyRef).onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}

/**
 * Stacked sections that expand and collapse.
 *
 * ```html
 * <tes-accordion multiple>
 *   <tes-accordion-item heading="Shipping">…</tes-accordion-item>
 *   <tes-accordion-item heading="Returns" [expanded]="true">…</tes-accordion-item>
 * </tes-accordion>
 * ```
 *
 * Keyboard and ARIA from `@angular/aria/accordion`: Enter and Space toggle, the arrow keys, Home and
 * End move between headers. Without `multiple`, opening a section closes the others.
 */
@Component({
  selector: 'tes-accordion',
  template: '<ng-content />',
  styleUrl: './accordion.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Aria's group allows several open sections by default; single mode is enforced below.
  hostDirectives: [AccordionGroup],
  host: { class: 'tes-accordion' },
})
export class TesAccordion {
  /** Allows several sections open at once. */
  readonly multiple = input(false, { transform: booleanAttribute });

  private readonly items = contentChildren(TesAccordionItem);

  /** Called when a section opens: in single mode, the others close. */
  collapseOthers(opened: TesAccordionItem): void {
    if (this.multiple()) return;
    for (const item of this.items()) {
      if (item !== opened) item.expanded.set(false);
    }
  }
}
