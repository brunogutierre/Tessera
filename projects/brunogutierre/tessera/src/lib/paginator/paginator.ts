import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  numberAttribute,
} from '@angular/core';
import { TES_LABELS } from '../core/labels';
import { TesButton } from '../button/button';
import { TesIcon } from '../icon/icon';
import { TesSelect } from '../select/select';
import type { TesOption, TesSelectValue } from '../select/select';

/**
 * Moves through pages of a list or table.
 *
 * ```html
 * <tes-paginator [length]="invoices().length" [(pageIndex)]="page" [(pageSize)]="size" />
 * ```
 *
 * A `nav` landmark with a page-size select, the visible range ("11–20 of 87", announced politely
 * when it changes) and first, previous, next and last buttons. All strings come from `TES_LABELS`.
 */
@Component({
  selector: 'tes-paginator',
  imports: [TesButton, TesIcon, TesSelect],
  template: `
    <nav class="bar" data-tes-part="bar" [attr.aria-label]="labels.pagination">
      @if (pageSizes().length > 1) {
        <span class="size" data-tes-part="size">
          <span class="size-label" data-tes-part="size-label" aria-hidden="true">{{
            labels.itemsPerPage
          }}</span>
          <tes-select
            class="size-select"
            data-tes-part="size-select"
            [label]="labels.itemsPerPage"
            [options]="sizeOptions()"
            [value]="pageSize()"
            (valueChange)="setPageSize($event)"
          />
        </span>
      }
      <span class="range" data-tes-part="range" role="status">{{ range() }}</span>
      <span class="buttons" data-tes-part="buttons">
        <button
          tes-button
          variant="ghost"
          size="sm"
          iconOnly
          type="button"
          [attr.aria-label]="labels.firstPage"
          [softDisabled]="isFirst()"
          (click)="pageIndex.set(0)"
        >
          <tes-icon name="chevrons-left" />
        </button>
        <button
          tes-button
          variant="ghost"
          size="sm"
          iconOnly
          type="button"
          [attr.aria-label]="labels.previousPage"
          [softDisabled]="isFirst()"
          (click)="pageIndex.set(page() - 1)"
        >
          <tes-icon name="chevron-left" />
        </button>
        <button
          tes-button
          variant="ghost"
          size="sm"
          iconOnly
          type="button"
          [attr.aria-label]="labels.nextPage"
          [softDisabled]="isLast()"
          (click)="pageIndex.set(page() + 1)"
        >
          <tes-icon name="chevron-right" />
        </button>
        <button
          tes-button
          variant="ghost"
          size="sm"
          iconOnly
          type="button"
          [attr.aria-label]="labels.lastPage"
          [softDisabled]="isLast()"
          (click)="pageIndex.set(pageCount() - 1)"
        >
          <tes-icon name="chevrons-right" />
        </button>
      </span>
    </nav>
  `,
  styleUrl: './paginator.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tes-paginator' },
})
export class TesPaginator {
  protected readonly labels = inject(TES_LABELS);

  /** Total number of items. */
  readonly length = input.required({ transform: numberAttribute });
  /** Zero-based index of the current page. */
  readonly pageIndex = model(0);
  readonly pageSize = model(10);
  readonly pageSizes = input<readonly number[]>([10, 25, 50]);

  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.length() / Math.max(1, this.pageSize()))),
  );
  /** The page shown: the requested index, clamped when the list shrinks below it. */
  protected readonly page = computed(() =>
    Math.min(Math.max(this.pageIndex(), 0), this.pageCount() - 1),
  );
  protected readonly isFirst = computed(() => this.page() <= 0);
  protected readonly isLast = computed(() => this.page() >= this.pageCount() - 1);
  protected readonly range = computed(() => {
    const total = this.length();
    const first = total === 0 ? 0 : this.page() * this.pageSize() + 1;
    const last = Math.min(total, (this.page() + 1) * this.pageSize());
    return this.labels.pageRange(first, last, total);
  });
  protected readonly sizeOptions = computed<TesOption<number>[]>(() =>
    this.pageSizes().map((size) => ({ value: size, label: String(size) })),
  );

  /** Keeps the first visible item on screen when the page size changes. */
  protected setPageSize(value: TesSelectValue<number>): void {
    if (typeof value !== 'number') return;
    const firstItem = this.page() * this.pageSize();
    this.pageSize.set(value);
    this.pageIndex.set(Math.floor(firstItem / value));
  }
}
