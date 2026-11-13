import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { TES_LABELS } from '../core/labels';
import type { TesStatusTone } from '../core/tones';
import { TesButton } from '../button/button';
import { TesIcon } from '../icon/icon';
import type { TesIconName } from '../icon/icons';

export type TesAlertLive = 'off' | 'polite' | 'assertive';

const ICONS: Record<TesStatusTone, TesIconName> = {
  info: 'info',
  success: 'circle-check',
  warning: 'triangle-alert',
  danger: 'circle-alert',
};

/**
 * An inline message about the page or a task.
 *
 * ```html
 * <tes-alert tone="warning" heading="Payment overdue">Invoice INV-0184 was due on 30 Nov.</tes-alert>
 * <tes-alert tone="success" live="polite" dismissible (dismissed)="saved = false">Saved.</tes-alert>
 * ```
 *
 * The tone is spoken before the content ("Warning: Payment overdue…"), so it never depends on
 * color or icon alone. Use `live` only for alerts that appear in response to something: `polite`
 * (role `status`) for confirmations, `assertive` (role `alert`) for errors that need attention now.
 */
@Component({
  selector: 'tes-alert',
  imports: [TesButton, TesIcon],
  template: `
    <tes-icon class="icon" data-tes-part="icon" [name]="icon()" />
    <div class="content" data-tes-part="content">
      @if (heading(); as heading) {
        <p class="heading" data-tes-part="heading">
          <span class="tes-visually-hidden">{{ toneLabel() }}: </span>{{ heading }}
        </p>
      } @else {
        <span class="tes-visually-hidden">{{ toneLabel() }}: </span>
      }
      <div class="body" data-tes-part="body"><ng-content /></div>
    </div>
    @if (dismissible()) {
      <button
        type="button"
        tes-button
        variant="ghost"
        size="sm"
        iconOnly
        class="dismiss"
        data-tes-part="dismiss"
        [attr.aria-label]="labels.dismiss"
        (click)="dismissed.emit()"
      >
        <tes-icon name="x" />
      </button>
    }
  `,
  styleUrl: './alert.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tes-alert',
    '[attr.data-tone]': 'tone()',
    '[attr.role]': 'role()',
  },
})
export class TesAlert {
  protected readonly labels = inject(TES_LABELS);

  readonly tone = input<TesStatusTone>('info');
  readonly heading = input<string>();
  /** Announce the alert when it appears: `polite` → role `status`, `assertive` → role `alert`. */
  readonly live = input<TesAlertLive>('off');
  /** Shows a dismiss button that emits `dismissed`; removing the alert is up to the app. */
  readonly dismissible = input(false, { transform: booleanAttribute });
  readonly dismissed = output();

  protected readonly icon = computed(() => ICONS[this.tone()]);
  protected readonly toneLabel = computed(() => this.labels.tones[this.tone()]);
  protected readonly role = computed(() => {
    const live = this.live();
    return live === 'assertive' ? 'alert' : live === 'polite' ? 'status' : null;
  });
}
