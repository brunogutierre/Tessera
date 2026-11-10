export type Rgba = readonly [number, number, number, number];

let context: CanvasRenderingContext2D | null = null;

function canvas(): CanvasRenderingContext2D {
  if (!context) {
    const el = document.createElement('canvas');
    el.width = el.height = 1;
    context = el.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('2D canvas is not available');
  }
  return context;
}

/** Converts any CSS color the browser understands (oklch, color-mix, …) to 8-bit sRGB. */
export function toRgba(cssColor: string): Rgba {
  const ctx = canvas();
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = cssColor;
  ctx.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0, a = 0] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a / 255];
}

/**
 * Resolves a color token as the browser would inside `scope`: `light-dark()` follows the scope's
 * `color-scheme`, so the same token gives different values in light and dark subtrees.
 */
export function resolveColor(token: string, scope: HTMLElement): Rgba {
  const probe = document.createElement('span');
  probe.style.color = `var(${token})`;
  scope.append(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();
  return toRgba(computed);
}

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2 relative luminance. */
export function luminance([r, g, b]: Rgba): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG 2 contrast ratio between two opaque colors (1 to 21). */
export function contrast(a: Rgba, b: Rgba): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}
