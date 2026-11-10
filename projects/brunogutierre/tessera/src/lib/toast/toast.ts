import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  createGlobalPositionStrategy,
  createNoopScrollStrategy,
  createOverlayRef,
} from '@angular/cdk/overlay';
import type { OverlayRef } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  Injectable,
  Injector,
  inject,
  signal,
} from '@angular/core';
import { TES_LABELS } from '../core/labels';
import { TesButton } from '../button/button';
import { TesIcon } from '../icon/icon';
import type { TesIconName } from '../icon/icons';

export type TesToastTone = 'info' | 'success' | 'warning' | 'danger';

export interface TesToastOptions {
  message: string;
  tone?: TesToastTone;
  /** One action, such as "Undo". A toast with an action stays until it is used or dismissed. */
  action?: { label: string; run: () => void };
  /** Milliseconds before it disappears; 0 keeps it until dismissed. Default 5000. */
  duration?: number;
}

/** A toast on screen. */
export interface TesToast {
  readonly id: number;
  readonly message: string;
  readonly tone: TesToastTone;
  readonly action?: { label: string; run: () => void };
}

/** Handle returned by `TesToaster.show()`. */
export interface TesToastRef {
  dismiss(): void;
}

const ICONS: Record<TesToastTone, TesIconName> = {
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
  #overlay: OverlayRef | null = null;
  #nextId = 0;
  #paused = false;

  /** The toasts on screen, oldest first. */
  readonly toasts = signal<readonly TesToast[]>([]);

  show(options: TesToastOptions): TesToastRef {
    const toast: TesToast = {
      id: this.#nextId++,
      message: options.message,
      tone: options.tone ?? 'info',
      action: options.action,
    };
    this.#ensureStack();
    this.toasts.update((list) => [...list, toast]);
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
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  /** Stops every countdown (pointer or focus on the stack). */
  pause(): void {
    this.#paused = true;
    for (const timer of this.#timers.values()) {
      clearTimeout(timer.handle);
      timer.remaining -= Date.now() - timer.started;
    }
  }

  resume(): void {
    this.#paused = false;
    for (const [id, timer] of this.#timers) this.#start(id, timer);
  }

  #start(id: number, timer: Timer): void {
    timer.started = Date.now();
    timer.handle = setTimeout(
      () => {
        this.dismiss(id);
      },
      Math.max(timer.remaining, 0),
    );
  }

  #ensureStack(): void {
    if (this.#overlay) return;
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
    <section
      class="stack"
      [attr.aria-label]="labels.notifications"
      (mouseenter)="toaster.pause()"
      (mouseleave)="toaster.resume()"
      (focusin)="toaster.pause()"
      (focusout)="toaster.resume()"
    >
      <ol class="list">
        @for (toast of toaster.toasts(); track toast.id) {
          <li class="toast" [attr.data-tone]="toast.tone">
            <tes-icon class="icon" [name]="icons[toast.tone]" />
            <p class="message">
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
              [attr.aria-label]="labels.dismiss"
              (click)="toaster.dismiss(toast.id)"
            >
              <tes-icon name="x" />
            </button>
          </li>
        }
      </ol>
    </section>
  `,
  styleUrl: './toast.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tes-toast-stack' },
})
export class TesToastStack {
  protected readonly toaster = inject(TesToaster);
  protected readonly labels = inject(TES_LABELS);
  protected readonly icons = ICONS;

  protected run(id: number, action: () => void): void {
    action();
    this.toaster.dismiss(id);
  }
}
