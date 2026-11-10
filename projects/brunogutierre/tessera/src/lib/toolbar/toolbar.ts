import { Toolbar, ToolbarWidget } from '@angular/aria/toolbar';
import { ChangeDetectionStrategy, Component, Directive } from '@angular/core';

/**
 * Marks a control inside a `tes-toolbar` as one of its items, so the arrow keys reach it.
 * Pass `disabled` through this directive (not the native attribute) so the toolbar knows.
 */
@Directive({
  selector: '[tesToolbarItem]',
  hostDirectives: [{ directive: ToolbarWidget, inputs: ['disabled'] }],
})
export class TesToolbarItem {}

/** A thin divider between groups of toolbar items. */
@Component({
  selector: 'tes-toolbar-separator',
  template: '',
  styleUrl: './toolbar-separator.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tes-toolbar-separator', role: 'separator', 'aria-orientation': 'vertical' },
})
export class TesToolbarSeparator {}

/**
 * A row of controls with a single tab stop.
 *
 * ```html
 * <tes-toolbar aria-label="Invoice actions">
 *   <button tes-button tesToolbarItem>Approve</button>
 *   <button tes-button tesToolbarItem>Reject</button>
 *   <tes-toolbar-separator />
 *   <button tes-button tesToolbarItem iconOnly aria-label="Print"><tes-icon name="file" /></button>
 * </tes-toolbar>
 * ```
 *
 * Keyboard and ARIA from `@angular/aria/toolbar`: Tab enters and leaves the toolbar, the arrow keys
 * (flipped in RTL), Home and End move between items. Always give it an `aria-label`.
 */
@Component({
  selector: 'tes-toolbar',
  template: '<ng-content />',
  styleUrl: './toolbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: Toolbar, inputs: ['orientation', 'wrap'] }],
  host: { class: 'tes-toolbar' },
})
export class TesToolbar {}
