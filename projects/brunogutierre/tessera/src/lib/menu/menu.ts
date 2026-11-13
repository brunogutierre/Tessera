import { Menu, MenuContent, MenuItem, MenuTrigger } from '@angular/aria/menu';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  output,
  viewChild,
} from '@angular/core';
import { TES_DROPDOWN_POSITIONS } from '../core/overlay';
import { TesButton } from '../button/button';
import type { TesButtonSize, TesButtonVariant } from '../button/button';
import { TesIcon } from '../icon/icon';
import type { TesIconName } from '../icon/icons';

/** One action in a `tes-menu`. */
export interface TesMenuItem<V = string> {
  value: V;
  label: string;
  icon?: TesIconName;
  disabled?: boolean;
  /** Destructive action, shown in the danger color. */
  danger?: boolean;
}

/** A menu entry: an action, or a separator line between groups. */
export type TesMenuEntry<V = string> = TesMenuItem<V> | 'separator';

/**
 * A menu button: a button that opens a list of actions.
 *
 * ```html
 * <tes-menu label="Actions" [items]="actions" (selected)="run($event)" />
 * ```
 *
 * Keyboard, focus and ARIA come from `@angular/aria` (menu button pattern: Enter, Space and the
 * arrow keys open it, arrows and typeahead move, Escape and Tab close it and focus returns to the
 * button). The panel is a CDK popover placed inline, so it keeps a scoped `tesTheme`.
 */
@Component({
  selector: 'tes-menu',
  imports: [
    TesButton,
    TesIcon,
    MenuTrigger,
    Menu,
    MenuContent,
    MenuItem,
    CdkConnectedOverlay,
    CdkOverlayOrigin,
  ],
  template: `
    <button
      tes-button
      ngMenuTrigger
      #trigger="ngMenuTrigger"
      cdkOverlayOrigin
      #origin="cdkOverlayOrigin"
      [menu]="menu()"
      [variant]="variant()"
      [size]="size()"
      [iconOnly]="iconOnly()"
      [attr.aria-label]="iconOnly() ? label() : null"
    >
      @if (icon(); as icon) {
        <tes-icon [name]="icon" />
      }
      @if (!iconOnly()) {
        {{ label() }}
        <tes-icon name="chevron-down" class="chevron" data-tes-part="chevron" />
      }
    </button>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayOpen]="trigger.expanded()"
      [cdkConnectedOverlayPositions]="positions"
      cdkConnectedOverlayUsePopover="inline"
    >
      <div ngMenu class="panel" data-tes-part="panel" (itemSelected)="onSelected($event)">
        <ng-template ngMenuContent>
          @for (entry of items(); track $index) {
            @if (entry === 'separator') {
              <div class="separator" data-tes-part="separator" role="separator"></div>
            } @else {
              <div
                ngMenuItem
                class="item"
                data-tes-part="item"
                [value]="entry.value"
                [disabled]="!!entry.disabled"
                [searchTerm]="entry.label"
                [attr.data-danger]="entry.danger || null"
              >
                @if (entry.icon) {
                  <tes-icon [name]="entry.icon" />
                }
                <span class="item-label" data-tes-part="item-label">{{ entry.label }}</span>
              </div>
            }
          }
        </ng-template>
      </div>
    </ng-template>
  `,
  styleUrl: './menu.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tes-menu' },
})
export class TesMenu<V = string> {
  /** Text of the menu button, and its accessible name when `iconOnly`. */
  readonly label = input.required<string>();
  readonly items = input.required<readonly TesMenuEntry<V>[]>();
  readonly icon = input<TesIconName>();
  readonly iconOnly = input(false, { transform: booleanAttribute });
  readonly variant = input<TesButtonVariant>('outline');
  readonly size = input<TesButtonSize>('md');
  /** Emits the value of the chosen item; the menu then closes. */
  readonly selected = output<V>();

  protected readonly positions = TES_DROPDOWN_POSITIONS;
  protected readonly menu = viewChild(Menu<V>);

  protected onSelected(value: V | undefined): void {
    if (value !== undefined) this.selected.emit(value);
  }
}
