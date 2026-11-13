import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  createGlobalPositionStrategy,
  createNoopScrollStrategy,
  createOverlayRef,
} from '@angular/cdk/overlay';
import type { OverlayRef } from '@angular/cdk/overlay';
import type { ElementRef } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  Injectable,
  Injector,
  afterRenderEffect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TES_LABELS } from '../core/labels';
import type { TesStatusTone } from '../core/tones';
import { TesButton } from '../button/button';
import { TesIcon } from '../icon/icon';
import type { TesIconName } from '../icon/icons';

export interface TesToastOptions {
  message: string;
  tone?: TesStatusTone;
  /** One action, such as "Undo". A toast with an action stays until it is used or dismissed. */
  action?: { label: string; run: () => void };
  /** Milliseconds before it disappears; 0 keeps it until dismissed. Default 5000. */
  duration?: number;
}

/** A toast on screen. */
export interface TesToast {
  readonly id: number;
  readonly message: string;
  readonly tone: TesStatusTone;
  readonly action?: { label: string; run: () => void };
}

/** Handle returned by `TesToaster.show()`. */
export interface TesToastRef {
  dismiss(): void;
}

const ICONS: Record<TesStatusTone, TesIconName> = {
  info: 'info',
  success: 'circle-check',
  warning: 'triangle-alert',
  danger: 'circle-alert',
};

interface Timer {
  remaining: number;
  started: number;
  handle?: ReturnType<typeof setTimeout>;
}

/**
 * Brief messages about a completed action ("Invoice sent"), stacked at the inline-end bottom of
 * the page.
 *
 * ```ts
 * inject(TesToaster).show({ message: 'Invoice sent', tone: 'success', action: { label: 'Undo', run: undo } });
 * ```
 *
 * Every toast is announced through the CDK `LiveAnnouncer` (errors assertively). Timers pause while
 * the pointer or keyboard focus is on the stack (WCAG 2.2.1), and a toast with an action never
 * times out. Toasts render at the page level and follow the page theme.
 */
@Injectable({ providedIn: 'root' })
export class TesToaster {
  readonly #injector = inject(Injector);
  readonly #announcer = inject(LiveAnnouncer);
  readonly #labels = inject(TES_LABELS);
  readonly #timers = new Map<number, Timer>();
  readonly #toasts = signal<readonly TesToast[]>([]);
  #overlay: OverlayRef | null = null;
  #nextId = 0;
  #hovered = false;
  #focused = false;

  /** The toasts on screen, oldest first. */
  readonly toasts = this.#toasts.asReadonly();

  show(options: TesToastOptions): TesToastRef {
    const toast: TesToast = {
      id: this.#nextId++,
      message: options.message,
      tone: options.tone ?? 'info',
      action: options.action,
    };
    this.#ensureStack();
    this.#toasts.update((list) => [...list, toast]);
    void this.#announcer.announce(
      `${this.#labels.tones[toast.tone]}: ${toast.message}`,
      toast.tone === 'danger' ? 'assertive' : 'polite',
    );
    const duration = options.action ? 0 : (options.duration ?? 5000);
    if (duration > 0) {
      const timer: Timer = { remaining: duration, started: Date.now() };
      this.#timers.set(toast.id, timer);
      if (!this.#paused) this.#start(toast.id, timer);
    }
    return {
      dismiss: () => {
        this.dismiss(toast.id);
      },
    };
  }

  dismiss(id: number): void {
    clearTimeout(this.#timers.get(id)?.handle);
    this.#timers.delete(id);
    this.#toasts.update((list) => list.filter((t) => t.id !== id));
  }

  /** Countdowns pause while the pointer is over the stack (WCAG 2.2.1). */
  setHovered(hovered: boolean): void {
    this.#setPaused(() => (this.#hovered = hovered));
  }

  /** Countdowns pause while keyboard focus is inside the stack. */
  setFocused(focused: boolean): void {
    this.#setPaused(() => (this.#focused = focused));
  }

  get #paused(): boolean {
    return this.#hovered || this.#focused;
  }

  /** Applies a flag change and acts only when the paused state itself changes. */
  #setPaused(change: () => void): void {
    const before = this.#paused;
    change();
    if (before === this.#paused) return;
    for (const [id, timer] of this.#timers) {
      if (this.#paused) {
        clearTimeout(timer.handle);
        timer.remaining -= Date.now() - timer.started;
      } else {
        this.#start(id, timer);
      }
    }
  }

  #start(id: number, timer: Timer): void {
    clearTimeout(timer.handle);
    timer.started = Date.now();
    timer.handle = setTimeout(
      () => {
        this.dismiss(id);
      },
      Math.max(timer.remaining, 0),
    );
  }

  #ensureStack(): void {
    if (this.#overlay) {
      // Re-enter the top layer, so a toast raised while a dialog is open shows above it.
      const host = this.#overlay.hostElement;
      if (host.matches(':popover-open')) {
        host.hidePopover();
        host.showPopover();
      }
      return;
    }
    this.#overlay = createOverlayRef(this.#injector, {
      positionStrategy: createGlobalPositionStrategy(this.#injector).bottom('1rem').end('1rem'),
      scrollStrategy: createNoopScrollStrategy(),
      usePopover: true,
    });
    this.#overlay.attach(new ComponentPortal(TesToastStack, null, this.#injector));
  }
}

/** The live list of toasts. Rendered once, by `TesToaster`. */
@Component({
  selector: 'tes-toast-stack',
  imports: [TesButton, TesIcon],
  template: `
    @if (toaster.toasts().length > 0) {
      <section
        #stack
        class="stack"
        data-tes-part="stack"
        [attr.aria-label]="labels.notifications"
        (mouseenter)="toaster.setHovered(true)"
        (mouseleave)="toaster.setHovered(false)"
        (focusin)="toaster.setFocused(true)"
        (focusout)="onFocusOut($event)"
      >
        <ol class="list" data-tes-part="list">
          @for (toast of toaster.toasts(); track toast.id) {
            <li
              class="toast"
              data-tes-part="toast"
              [attr.data-tone]="toast.tone"
              [attr.data-id]="toast.id"
            >
              <tes-icon class="icon" data-tes-part="icon" [name]="icons[toast.tone]" />
              <p class="message" data-tes-part="message">
                <span class="tes-visually-hidden">{{ labels.tones[toast.tone] }}: </span>
                {{ toast.message }}
              </p>
              @if (toast.action; as action) {
                <button
                  tes-button
                  variant="ghost"
                  size="sm"
                  type="button"
                  (click)="run(toast.id, action.run)"
                >
                  {{ action.label }}
                </button>
              }
              <button
                tes-button
                variant="ghost"
                size="sm"
                iconOnly
                type="button"
                class="dismiss"
                data-tes-part="dismiss"
                [attr.aria-label]="labels.dismiss"
                (click)="dismiss(toast.id)"
              >
                <tes-icon name="x" />
              </button>
            </li>
          }
        </ol>
      </section>
    }
  `,
  styleUrl: './toast.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tes-toast-stack' },
})
export class TesToastStack {
  protected readonly toaster = inject(TesToaster);
  protected readonly labels = inject(TES_LABELS);
  protected readonly icons = ICONS;
  readonly #document = inject(DOCUMENT);
  /** Toast to move focus to after the focused one is dismissed. */
  #focusNext: number | null = null;
  private readonly stack = viewChild<ElementRef<HTMLElement>>('stack');

  constructor() {
    // A removed element fires no focusout in every browser: check where focus is after each
    // change, and move it to the next toast when the focused one was dismissed.
    afterRenderEffect(() => {
      this.toaster.toasts();
      const stack = this.stack()?.nativeElement;
      if (this.#focusNext !== null && stack) {
        stack
          .querySelector<HTMLElement>(`[data-id="${String(this.#focusNext)}"] .dismiss`)
          ?.focus();
        this.#focusNext = null;
      }
      if (!stack?.contains(this.#document.activeElement)) this.toaster.setFocused(false);
    });
  }

  protected onFocusOut(event: FocusEvent): void {
    const stack = event.currentTarget as HTMLElement;
    if (!stack.contains(event.relatedTarget as Node | null)) this.toaster.setFocused(false);
  }

  protected dismiss(id: number): void {
    const list = this.toaster.toasts();
    const index = list.findIndex((t) => t.id === id);
    this.#focusNext = (list[index + 1] ?? list[index - 1])?.id ?? null;
    this.toaster.dismiss(id);
  }

  protected run(id: number, action: () => void): void {
    action();
    this.dismiss(id);
  }
}
