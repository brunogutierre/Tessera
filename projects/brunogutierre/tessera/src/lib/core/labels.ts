import { InjectionToken } from '@angular/core';

/**
 * Every built-in string Tessera renders (screen-reader labels, button names, status text).
 * English by default; override the whole set or part of it with `provideTessera({ labels })`.
 */
export interface TesLabels {
  close: string;
  dismiss: string;
  loading: string;
  clear: string;
  noResults: string;
  required: string;
  optional: string;
  breadcrumbs: string;
  notifications: string;
  firstPage: string;
  previousPage: string;
  nextPage: string;
  lastPage: string;
  itemsPerPage: string;
  /** Paginator summary, e.g. "11–20 of 87". */
  pageRange: (first: number, last: number, total: number) => string;
  /** Accessible name of a removable tag's remove button. */
  remove: (item: string) => string;
  /** Spoken before an alert's content, so its tone never depends on color or icon alone. */
  tones: { info: string; success: string; warning: string; danger: string };
  /** Spoken after a stat's change, e.g. "+12.5% increase". */
  increase: string;
  decrease: string;
}

export const DEFAULT_LABELS: TesLabels = {
  close: 'Close',
  dismiss: 'Dismiss',
  loading: 'Loading',
  clear: 'Clear',
  noResults: 'No results',
  required: 'required',
  optional: 'optional',
  breadcrumbs: 'Breadcrumb',
  notifications: 'Notifications',
  firstPage: 'First page',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  lastPage: 'Last page',
  itemsPerPage: 'Items per page',
  pageRange: (first, last, total) =>
    total === 0 ? '0 of 0' : `${String(first)}–${String(last)} of ${String(total)}`,
  remove: (item) => `Remove ${item}`,
  tones: { info: 'Information', success: 'Success', warning: 'Warning', danger: 'Error' },
  increase: 'increase',
  decrease: 'decrease',
};

/** The labels in use. Components inject this token; apps set it through `provideTessera()`. */
export const TES_LABELS = new InjectionToken<TesLabels>('TES_LABELS', {
  providedIn: 'root',
  factory: () => DEFAULT_LABELS,
});
