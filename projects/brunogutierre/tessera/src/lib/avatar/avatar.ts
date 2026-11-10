import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  linkedSignal,
} from '@angular/core';

export type TesAvatarSize = 'sm' | 'md' | 'lg';

const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

function firstGrapheme(word: string | undefined): string {
  if (!word) return '';
  for (const { segment } of graphemes.segment(word)) return segment;
  return '';
}

/** "Ana Maria Souza" → "AS"; "Bruno" → "B". Grapheme aware, so "Émile Zola" → "ÉZ". */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const last = words.length > 1 ? firstGrapheme(words[words.length - 1]) : '';
  return (firstGrapheme(words[0]) + last).toLocaleUpperCase();
}

/**
 * A person's picture, or their initials when there is no picture or it fails to load.
 *
 * ```html
 * <tes-avatar name="Ana Souza" src="/people/ana.jpg" />
 * <tes-avatar name="Ana Souza" decorative />  <!-- when the name is already next to it -->
 * ```
 */
@Component({
  selector: 'tes-avatar',
  template: `
    @if (showImage()) {
      <img [src]="src()" alt="" (error)="failed.set(true)" />
    } @else {
      <span aria-hidden="true">{{ initials() }}</span>
    }
  `,
  styleUrl: './avatar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tes-avatar',
    '[attr.data-size]': 'size()',
    '[attr.role]': 'decorative() ? null : "img"',
    '[attr.aria-label]': 'decorative() ? null : name()',
    '[attr.aria-hidden]': 'decorative() ? "true" : null',
  },
})
export class TesAvatar {
  /** Full name: the accessible name and the source of the initials. */
  readonly name = input.required<string>();
  readonly src = input<string>();
  readonly size = input<TesAvatarSize>('md');
  /** Hides the avatar from assistive technology when the name is already shown next to it. */
  readonly decorative = input(false, { transform: booleanAttribute });

  /** Resets whenever `src` changes, so a new picture gets a fresh chance to load. */
  protected readonly failed = linkedSignal({ source: this.src, computation: () => false });
  protected readonly showImage = computed(() => !!this.src() && !this.failed());
  protected readonly initials = computed(() => initials(this.name()));
}
