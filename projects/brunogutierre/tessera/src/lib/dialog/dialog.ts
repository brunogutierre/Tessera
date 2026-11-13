import { Dialog, DialogRef } from '@angular/cdk/dialog';
import type { ComponentType } from '@angular/cdk/overlay';
import { createGlobalPositionStrategy } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  Injectable,
  InjectionToken,
  Injector,
  inject,
  input,
} from '@angular/core';
import { uniqueId } from '../core/id';
import { TES_LABELS } from '../core/labels';
import { TesButton } from '../button/button';
import { TesIcon } from '../icon/icon';

export type TesDialogSize = 'sm' | 'md' | 'lg';

export interface TesDialogOptions<D = unknown> {
  /** Passed to the content component through `DIALOG_DATA`. */
  data?: D;
  size?: TesDialogSize;
  /** Slides in from the inline-end edge, full height, instead of a centered modal. */
  drawer?: boolean;
  /** `alertdialog` for urgent confirmations; it cannot be dismissed with Escape or the backdrop. */
  role?: 'dialog' | 'alertdialog';
  /** Escape, the backdrop and the close button dismiss it. Defaults to true for `dialog`. */
  dismissible?: boolean;
}

/** What a `tes-dialog` layout needs to know about the dialog it is in. */
export interface TesDialogContext {
  titleId: string;
  size: TesDialogSize;
  drawer: boolean;
  dismissible: boolean;
}

export const TES_DIALOG_CONTEXT = new InjectionToken<TesDialogContext>('TES_DIALOG_CONTEXT');

/**
 * Opens modal dialogs and drawers (CDK Dialog: focus trap, focus return, Escape, `aria-modal`).
 *
 * ```ts
 * const ref = inject(TesDialog).open<boolean>(ConfirmDelete, { role: 'alertdialog', size: 'sm' });
 * ref.closed.subscribe((confirmed) => …);
 * ```
 *
 * The content component uses `<tes-dialog heading="…">` as its root. Dialogs render at the page
 * level, so they follow the page theme, not a `tesTheme` scope.
 */
@Injectable({ providedIn: 'root' })
export class TesDialog {
  readonly #dialog = inject(Dialog);
  readonly #injector = inject(Injector);

  open<R = unknown, D = unknown, C = unknown>(
    component: ComponentType<C>,
    options: TesDialogOptions<D> = {},
  ): DialogRef<R, C> {
    const role = options.role ?? 'dialog';
    const context: TesDialogContext = {
      titleId: uniqueId('tes-dialog-title'),
      size: options.size ?? 'md',
      drawer: options.drawer ?? false,
      dismissible: options.dismissible ?? role === 'dialog',
    };
    return this.#dialog.open<R, D, C>(component, {
      data: options.data,
      role,
      ariaLabelledBy: context.titleId,
      // The CDK default is false; these dialogs are modal (focus trapped, page behind a backdrop).
      ariaModal: true,
      disableClose: !context.dismissible,
      backdropClass: 'tes-dialog-backdrop',
      panelClass: context.drawer ? 'tes-drawer-pane' : 'tes-dialog-pane',
      positionStrategy: context.drawer
        ? createGlobalPositionStrategy(this.#injector).end('0').top('0')
        : undefined,
      height: context.drawer ? '100%' : undefined,
      providers: [{ provide: TES_DIALOG_CONTEXT, useValue: context }],
    });
  }
}

/**
 * The frame of a dialog's content: a titled header with a close button, a scrolling body and an
 * optional footer for actions.
 *
 * ```html
 * <tes-dialog heading="Delete invoice INV-0184?">
 *   <p>This cannot be undone.</p>
 *   <div tesDialogFooter>
 *     <button tes-button (click)="ref.close(false)">Cancel</button>
 *     <button tes-button variant="danger" (click)="ref.close(true)">Delete</button>
 *   </div>
 * </tes-dialog>
 * ```
 */
@Component({
  selector: 'tes-dialog',
  imports: [TesButton, TesIcon],
  template: `
    <div class="header" data-tes-part="header">
      <h2 class="title" data-tes-part="title" [id]="context?.titleId ?? null">{{ heading() }}</h2>
      @if (context?.dismissible ?? true) {
        <button
          tes-button
          variant="ghost"
          size="sm"
          iconOnly
          type="button"
          [attr.aria-label]="labels.close"
          (click)="close()"
        >
          <tes-icon name="x" />
        </button>
      }
    </div>
    <div class="body" data-tes-part="body"><ng-content /></div>
    <div class="footer" data-tes-part="footer"><ng-content select="[tesDialogFooter]" /></div>
  `,
  styleUrl: './dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tes-dialog',
    '[attr.data-size]': 'context?.size ?? "md"',
    '[attr.data-drawer]': 'context?.drawer || null',
  },
})
export class TesDialogLayout {
  protected readonly labels = inject(TES_LABELS);
  protected readonly context = inject(TES_DIALOG_CONTEXT, { optional: true });
  readonly #ref = inject(DialogRef, { optional: true });

  readonly heading = input.required<string>();

  protected close(): void {
    this.#ref?.close();
  }
}
