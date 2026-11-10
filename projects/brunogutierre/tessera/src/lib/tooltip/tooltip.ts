import { AriaDescriber } from '@angular/cdk/a11y';
import {
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
} from '@angular/cdk/overlay';
import type { OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import type { ComponentRef } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  effect,
  inject,
  input,
  numberAttribute,
} from '@angular/core';
import { TES_TOOLTIP_POSITIONS } from '../core/overlay';

/** The floating label. Hidden from assistive technology: the host is described instead. */
@Component({
  selector: 'tes-tooltip-panel',
  template: `{{ text() }}`,
  styleUrl: './tooltip.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tes-tooltip', 'aria-hidden': 'true' },
})
export class TesTooltipPanel {
  readonly text = input('');
}

/**
 * A short description shown on hover and keyboard focus.
 *
 * ```html
 * <button tes-button iconOnly aria-label="Export" tesTooltip="Export as CSV"><tes-icon name="download" /></button>
 * ```
 *
 * Follows WCAG 1.4.13: Escape dismisses it, the pointer can move onto it without it closing, and it
 * stays until the pointer or focus leaves. The text is always the host's accessible description
 * (`aria-describedby`), so screen readers get it without the tooltip being visible. Never put
 * essential or interactive content in a tooltip.
 */
@Directive({
  selector: '[tesTooltip]',
  host: {
    '(mouseenter)': 'scheduleShow()',
    '(mouseleave)': 'scheduleHide()',
    '(focusin)': 'onFocus()',
    '(focusout)': 'hide()',
  },
})
export class TesTooltip {
  readonly #injector = inject(Injector);
  readonly #host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  readonly #describer = inject(AriaDescriber);
  readonly #document = inject(DOCUMENT);
  #overlay: OverlayRef | null = null;
  #panel: ComponentRef<TesTooltipPanel> | null = null;
  #timer: ReturnType<typeof setTimeout> | undefined;
  #described = '';

  readonly tesTooltip = input.required<string>();
  /** Delay before showing on hover, in milliseconds. Keyboard focus shows it at once. */
  readonly tesTooltipDelay = input(400, { transform: numberAttribute });

  readonly #onKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.#overlay?.hasAttached()) {
      event.stopPropagation();
      this.hide();
    }
  };

  constructor() {
    effect(() => {
      const text = this.tesTooltip();
      if (this.#described) this.#describer.removeDescription(this.#host, this.#described);
      this.#describer.describe(this.#host, text);
      this.#described = text;
      this.#panel?.setInput('text', text);
    });
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.#timer);
      this.#describer.removeDescription(this.#host, this.#described);
      this.#document.removeEventListener('keydown', this.#onKeydown, true);
      this.#overlay?.dispose();
    });
  }

  protected scheduleShow(): void {
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => {
      this.show();
    }, this.tesTooltipDelay());
  }

  protected scheduleHide(): void {
    clearTimeout(this.#timer);
    // A short grace period lets the pointer travel onto the tooltip (WCAG 1.4.13 "hoverable").
    this.#timer = setTimeout(() => {
      this.hide();
    }, 100);
  }

  protected onFocus(): void {
    if (this.#host.matches(':focus-visible')) this.show();
  }

  show(): void {
    clearTimeout(this.#timer);
    const overlay = this.#overlay ?? this.#createOverlay();
    if (overlay.hasAttached()) return;
    this.#panel = overlay.attach(new ComponentPortal(TesTooltipPanel, null, this.#injector));
    this.#panel.setInput('text', this.tesTooltip());
    // Hover tracking on the panel itself: the overlay host element is a viewport-sized
    // positioning box, so pointer events on it say nothing about the tooltip.
    const panel = this.#panel.location.nativeElement as HTMLElement;
    panel.addEventListener('mouseenter', () => {
      clearTimeout(this.#timer);
    });
    panel.addEventListener('mouseleave', () => {
      this.scheduleHide();
    });
    this.#document.addEventListener('keydown', this.#onKeydown, true);
  }

  hide(): void {
    clearTimeout(this.#timer);
    this.#overlay?.detach();
    this.#panel = null;
    this.#document.removeEventListener('keydown', this.#onKeydown, true);
  }

  #createOverlay(): OverlayRef {
    const overlay = createOverlayRef(this.#injector, {
      positionStrategy: createFlexibleConnectedPositionStrategy(this.#injector, this.#host)
        .withPositions(TES_TOOLTIP_POSITIONS)
        .withPopoverLocation('inline'),
      scrollStrategy: createRepositionScrollStrategy(this.#injector),
      usePopover: true,
    });
    this.#overlay = overlay;
    return overlay;
  }
}
