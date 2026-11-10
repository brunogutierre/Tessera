import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostAttributeToken,
  afterNextRender,
  booleanAttribute,
  inject,
  input,
  isDevMode,
} from '@angular/core';
import { TesSpinner } from '../spinner/spinner';

export type TesButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type TesButtonSize = 'sm' | 'md' | 'lg';

/**
 * Styles a native `<button>` or `<a>`, so `type`, `form`, `href`, `disabled` and every ARIA
 * attribute keep their native behavior.
 *
 * ```html
 * <button tes-button variant="primary" (click)="save()">Save</button>
 * <a tes-button variant="ghost" href="/help"><tes-icon name="info" />Help</a>
 * <button tes-button iconOnly aria-label="Close"><tes-icon name="x" /></button>
 * ```
 *
 * `loading` keeps the button focusable (`aria-disabled`, unlike `disabled`) and blocks clicks
 * while a spinner replaces the label.
 */
@Component({
  selector: 'button[tes-button], a[tes-button]',
  imports: [TesSpinner],
  template: `
    <span class="label"><ng-content /></span>
    @if (loading()) {
      <tes-spinner class="spinner" size="sm" decorative />
    }
  `,
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tes-button',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.data-icon-only]': 'iconOnly() || null',
    '[attr.data-loading]': 'loading() || null',
    '[attr.aria-disabled]': 'loading() || softDisabled() || staticAriaDisabled',
    '[attr.aria-busy]': 'loading() || null',
  },
})
export class TesButton {
  readonly variant = input<TesButtonVariant>('secondary');
  readonly size = input<TesButtonSize>('md');
  /** Square button for a single icon. Requires `aria-label` (or `aria-labelledby`). */
  readonly iconOnly = input(false, { transform: booleanAttribute });
  /** Shows a spinner, sets `aria-busy` and ignores clicks, without losing focus. */
  readonly loading = input(false, { transform: booleanAttribute });
  /**
   * Unavailable but still focusable (`aria-disabled`): use it for buttons that become unavailable
   * right after being pressed (pagination ends), so keyboard focus is not thrown to the page.
   */
  readonly softDisabled = input(false, { transform: booleanAttribute });

  /** An `aria-disabled` written by the consumer is kept when the button is not loading. */
  protected readonly staticAriaDisabled = inject(new HostAttributeToken('aria-disabled'), {
    optional: true,
  });

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    // A capture listener on the target runs before the consumer's (click) handler.
    const blockWhileLoading = (event: Event): void => {
      if (this.loading() || this.softDisabled()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    host.addEventListener('click', blockWhileLoading, { capture: true });
    inject(DestroyRef).onDestroy(() => {
      host.removeEventListener('click', blockWhileLoading, { capture: true });
    });

    if (isDevMode()) {
      afterNextRender(() => {
        const named =
          ['aria-label', 'aria-labelledby', 'title'].some((a) => host.hasAttribute(a)) ||
          host.textContent.trim() !== ''; // e.g. visually hidden text next to the icon
        if (this.iconOnly() && !named) {
          console.warn('tes-button: an iconOnly button needs aria-label or aria-labelledby.', host);
        }
      });
    }
  }
}
