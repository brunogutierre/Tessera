import { Tab, TabList, TabPanel, Tabs } from '@angular/aria/tabs';
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  contentChildren,
  inject,
  input,
  model,
} from '@angular/core';

/**
 * One panel of a `tes-tabs`. Its `label` becomes the tab; `value` links the two.
 *
 * Hidden panels are `inert` and not displayed; their content stays rendered, so form state inside
 * them survives a tab switch.
 */
@Component({
  selector: 'tes-tab-panel',
  template: '<ng-content />',
  styleUrl: './tab-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: TabPanel, inputs: ['value'] }],
  host: { class: 'tes-tab-panel' },
})
export class TesTabPanel {
  /** Links the panel to its tab (the `value` input, owned by Aria's TabPanel). */
  readonly value = inject(TabPanel).value;
  readonly label = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
}

/**
 * Tabs: one visible panel at a time, chosen from a tab list.
 *
 * ```html
 * <tes-tabs [(selected)]="section" label="Account">
 *   <tes-tab-panel value="overview" label="Overview">…</tes-tab-panel>
 *   <tes-tab-panel value="invoices" label="Invoices">…</tes-tab-panel>
 * </tes-tabs>
 * ```
 *
 * Keyboard and ARIA from `@angular/aria/tabs`: one tab stop, arrow keys (flipped in RTL), Home and
 * End; the selection follows focus. Disabled tabs stay focusable but cannot be selected.
 */
@Component({
  selector: 'tes-tabs',
  imports: [TabList, Tab],
  template: `
    <div
      ngTabList
      class="list"
      [selectedTab]="current()"
      (selectedTabChange)="selected.set($event)"
      [attr.aria-label]="label() ?? null"
      [orientation]="'horizontal'"
    >
      @for (panel of panels(); track panel.value()) {
        <button
          ngTab
          type="button"
          class="tab"
          [value]="panel.value()"
          [disabled]="panel.disabled()"
        >
          {{ panel.label() }}
        </button>
      }
    </div>
    <ng-content />
  `,
  styleUrl: './tabs.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [Tabs],
  host: { class: 'tes-tabs' },
})
export class TesTabs {
  /** Value of the selected panel. Defaults to the first one. */
  readonly selected = model<string | undefined>();
  /** Accessible name of the tab list, when the page has no visible heading for it. */
  readonly label = input<string>();

  protected readonly panels = contentChildren(TesTabPanel);
  /** The selected panel, or the first enabled one when nothing is selected. */
  protected readonly current = computed(
    () =>
      this.selected() ??
      this.panels()
        .find((panel) => !panel.disabled())
        ?.value(),
  );
}
