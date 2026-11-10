import { ChangeDetectionStrategy, Component } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { SEMANTIC_TOKENS } from '../lib/core/tokens';

const GROUPS = ['Surfaces', 'Text and borders', 'Brand and interaction', 'Status'] as const;

function groupOf(token: string): (typeof GROUPS)[number] {
  if (/-(success|warning|danger|info)/.test(token)) return 'Status';
  if (/-(bg|surface|backdrop)/.test(token)) return 'Surfaces';
  if (/-(text|border)/.test(token)) return 'Text and borders';
  return 'Brand and interaction';
}

const COLOR_GROUPS = GROUPS.map((name) => ({
  name,
  tokens: SEMANTIC_TOKENS.filter((t) => t.startsWith('--tes-color-') && groupOf(t) === name),
}));

/** Foreground/background pairs a component may combine; all are covered by the contrast tests. */
const PAIRS = [
  ['text', 'surface'],
  ['text-muted', 'surface'],
  ['primary', 'surface'],
  ['on-primary', 'primary'],
  ['on-primary-subtle', 'primary-subtle'],
  ['text', 'selected'],
  ...(['success', 'warning', 'danger', 'info'] as const).flatMap((s) => [
    [`on-${s}`, s],
    [`${s}-text`, `${s}-subtle`],
  ]),
] as const;

@Component({
  selector: 'tes-docs-colors',
  template: `
    @for (g of groups; track g.name) {
      <h3>{{ g.name }}</h3>
      <div class="sb-grid">
        @for (token of g.tokens; track token) {
          <figure class="swatch">
            <div class="chip" [style.background]="'var(' + token + ')'"></div>
            <figcaption>
              <code>{{ token }}</code>
            </figcaption>
          </figure>
        }
      </div>
    }
    <h3>Text pairs</h3>
    <div class="sb-grid">
      @for (p of pairs; track p[0] + p[1]) {
        <div
          class="pair"
          [style.color]="'var(--tes-color-' + p[0] + ')'"
          [style.background]="'var(--tes-color-' + p[1] + ')'"
        >
          <strong>Aa</strong> {{ p[0] }} on {{ p[1] }}
        </div>
      }
    </div>
  `,
  styles: `
    h3 {
      font-size: var(--tes-text-lg);
      margin-block: var(--tes-space-6) var(--tes-space-3);
    }
    .swatch {
      margin: 0;
      display: grid;
      gap: var(--tes-space-2);
    }
    .chip {
      block-size: 3rem;
      border-radius: var(--tes-radius-md);
      border: var(--tes-border-width) solid var(--tes-color-border);
    }
    figcaption {
      font-size: var(--tes-text-sm);
      overflow-wrap: anywhere;
    }
    .pair {
      padding: var(--tes-space-3) var(--tes-space-4);
      border-radius: var(--tes-radius-md);
      border: var(--tes-border-width) solid var(--tes-color-border);
      font-size: var(--tes-text-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Colors {
  protected readonly groups = COLOR_GROUPS;
  protected readonly pairs = PAIRS;
}

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
const WEIGHTS = ['regular', 'medium', 'semibold', 'bold'] as const;

@Component({
  selector: 'tes-docs-typography',
  template: `
    <div class="sb-stack">
      @for (size of sizes; track size) {
        <p class="sample" [style.font-size]="'var(--tes-text-' + size + ')'">
          <code>--tes-text-{{ size }}</code> Quarterly revenue grew 12.5% to 1,234,567.89
        </p>
      }
    </div>
    <h3>Weights</h3>
    <div class="sb-row">
      @for (weight of weights; track weight) {
        <span [style.font-weight]="'var(--tes-weight-' + weight + ')'">{{ weight }}</span>
      }
    </div>
    <h3>Monospace</h3>
    <p class="mono">INV-2026-000184 · 0x1f4e · 1,234,567.89</p>
  `,
  styles: `
    h3 {
      font-size: var(--tes-text-lg);
      margin-block: var(--tes-space-6) var(--tes-space-3);
    }
    .sample {
      margin: 0;
      line-height: var(--tes-leading-tight);
    }
    code {
      font-size: var(--tes-text-sm);
      color: var(--tes-color-text-muted);
      margin-inline-end: var(--tes-space-3);
    }
    .mono {
      font-family: var(--tes-font-mono);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Typography {
  protected readonly sizes = SIZES;
  protected readonly weights = WEIGHTS;
}

@Component({
  selector: 'tes-docs-shape',
  template: `
    <h3>Space</h3>
    <div class="sb-stack">
      @for (n of space; track n) {
        <div class="sb-row">
          <code>--tes-space-{{ n }}</code>
          <span class="bar" [style.inline-size]="'var(--tes-space-' + n + ')'"></span>
        </div>
      }
    </div>
    <h3>Control heights (density)</h3>
    <div class="sb-row">
      @for (size of controls; track size) {
        <span class="control" [style.block-size]="'var(--tes-control-height-' + size + ')'">{{
          size
        }}</span>
      }
    </div>
    <h3>Radius and elevation</h3>
    <div class="sb-row">
      @for (r of radii; track r) {
        <span class="box" [style.border-radius]="'var(--tes-radius-' + r + ')'"
          >radius {{ r }}</span
        >
      }
      @for (s of shadows; track s) {
        <span class="box raised" [style.box-shadow]="'var(--tes-shadow-' + s + ')'"
          >shadow {{ s }}</span
        >
      }
    </div>
  `,
  styles: `
    h3 {
      font-size: var(--tes-text-lg);
      margin-block: var(--tes-space-6) var(--tes-space-3);
    }
    code {
      font-size: var(--tes-text-sm);
      min-inline-size: 8rem;
    }
    .bar {
      block-size: var(--tes-space-4);
      background: var(--tes-color-primary);
      border-radius: var(--tes-radius-sm);
    }
    .control {
      display: inline-flex;
      align-items: center;
      padding-inline: var(--tes-control-padding-x);
      border: var(--tes-border-width) solid var(--tes-color-border-strong);
      border-radius: var(--tes-radius-md);
    }
    .box {
      display: inline-grid;
      place-items: center;
      inline-size: 7rem;
      block-size: 4rem;
      border: var(--tes-border-width) solid var(--tes-color-border-strong);
      background: var(--tes-color-surface);
      font-size: var(--tes-text-sm);
    }
    .raised {
      border-color: var(--tes-color-border);
      background: var(--tes-color-surface-raised);
      border-radius: var(--tes-radius-lg);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Shape {
  protected readonly space = [1, 2, 3, 4, 5, 6, 7, 8];
  protected readonly controls = ['sm', 'md', 'lg'];
  protected readonly radii = ['sm', 'md', 'lg', 'full'];
  protected readonly shadows = ['sm', 'md', 'lg'];
}

const meta: Meta = {
  title: 'Foundations/Tokens',
  tags: ['!autodocs'],
};
export default meta;

export const ColorTokens: StoryObj = {
  name: 'Colors',
  render: () => ({ moduleMetadata: { imports: [Colors] }, template: '<tes-docs-colors />' }),
};
export const TypeScale: StoryObj = {
  name: 'Typography',
  render: () => ({
    moduleMetadata: { imports: [Typography] },
    template: '<tes-docs-typography />',
  }),
};
export const SpaceAndShape: StoryObj = {
  name: 'Space, density and shape',
  render: () => ({ moduleMetadata: { imports: [Shape] }, template: '<tes-docs-shape />' }),
};
