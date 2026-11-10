import { Tree, TreeItem, TreeItemGroup } from '@angular/aria/tree';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, booleanAttribute, input, model } from '@angular/core';
import { TesIcon } from '../icon/icon';
import type { TesIconName } from '../icon/icons';

/** One node of a `tes-tree`. */
export interface TesTreeNode<V = string> {
  value: V;
  label: string;
  children?: readonly TesTreeNode<V>[];
  icon?: TesIconName;
  disabled?: boolean;
  /** Initially expanded. */
  expanded?: boolean;
}

/** Template context of one level of the tree. */
interface Level<V> {
  nodes: readonly TesTreeNode<V>[];
  parent: Tree<V> | TreeItemGroup<V>;
}

/**
 * A hierarchical list (folders, categories, org charts).
 *
 * ```html
 * <tes-tree label="Documents" [nodes]="folders" [(value)]="selected" />
 * ```
 *
 * Keyboard and ARIA from `@angular/aria/tree`: one tab stop; Up and Down move, Right expands or
 * enters, Left collapses or goes to the parent (flipped in RTL), Home, End and typeahead; Enter
 * or Space selects. `value` holds the selected values (one, or several with `multiple`).
 */
@Component({
  selector: 'tes-tree',
  imports: [Tree, TreeItem, TreeItemGroup, NgTemplateOutlet, TesIcon],
  templateUrl: './tree.html',
  styleUrl: './tree.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tes-tree' },
})
export class TesTree<V = string> {
  readonly nodes = input.required<readonly TesTreeNode<V>[]>();
  /** Accessible name of the tree. */
  readonly label = input.required<string>();
  /** Selected values. */
  readonly value = model<readonly V[]>([]);
  readonly multiple = input(false, { transform: booleanAttribute });

  /** Typed access to the recursive template's context. */
  protected level(context: unknown): Level<V> {
    return context as Level<V>;
  }

  protected onValueChange(values: V[]): void {
    this.value.set(values);
  }

  protected selectedValues(): V[] {
    return [...this.value()];
  }
}
