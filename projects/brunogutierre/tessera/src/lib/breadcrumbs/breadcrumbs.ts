import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  inject,
  isDevMode,
} from '@angular/core';
import { TES_LABELS } from '../core/labels';

/**
 * The path to the current page. Write the items as list items, with whatever links the app uses
 * (`href`, `routerLink`), and mark the current page with `aria-current="page"`:
 *
 * ```html
 * <tes-breadcrumbs>
 *   <li><a routerLink="/">Home</a></li>
 *   <li><a routerLink="/invoices">Invoices</a></li>
 *   <li aria-current="page">INV-2026-0184</li>
 * </tes-breadcrumbs>
 * ```
 *
 * Renders `nav > ol` named by `TES_LABELS.breadcrumbs`. Styles reach the projected items, so this
 * component is not view-encapsulated; every selector is scoped under `.tes-breadcrumbs`.
 */
@Component({
  selector: 'tes-breadcrumbs',
  template: `<nav [attr.aria-label]="labels.breadcrumbs">
    <ol>
      <ng-content />
    </ol>
  </nav>`,
  styleUrl: './breadcrumbs.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tes-breadcrumbs' },
})
export class TesBreadcrumbs {
  protected readonly labels = inject(TES_LABELS);

  constructor() {
    if (isDevMode()) {
      const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
      afterNextRender(() => {
        if (host.querySelector('li') && !host.querySelector('[aria-current]')) {
          console.warn('tes-breadcrumbs: mark the current page with aria-current="page".', host);
        }
      });
    }
  }
}
