import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { loadTesseraStyles } from '../../test-utils/styles';
import { TesSkeleton } from './skeleton';
import type { TesSkeletonShape } from './skeleton';

@Component({
  imports: [TesSkeleton],
  template: `
    <div style="inline-size: 400px">
      <tes-skeleton [shape]="shape()" [lines]="lines()" [width]="width()" [height]="height()" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly shape = signal<TesSkeletonShape>('text');
  readonly lines = signal(3);
  readonly width = signal<string | undefined>(undefined);
  readonly height = signal<string | undefined>(undefined);
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const skeleton = (fixture.nativeElement as HTMLElement).querySelector('tes-skeleton')!;
  return { fixture, host: fixture.componentInstance, skeleton };
}

beforeAll(loadTesseraStyles);

describe('TesSkeleton', () => {
  it('is hidden from assistive technology', async () => {
    const { skeleton } = await render();
    expect(skeleton.getAttribute('aria-hidden')).toBe('true');
  });

  it('draws text lines with a shorter last line', async () => {
    const { skeleton } = await render();
    const bones = [...skeleton.querySelectorAll('.bone')];
    expect(bones).toHaveLength(3);
    const widths = bones.map((b) => b.getBoundingClientRect().width);
    expect(widths[0]).toBe(400);
    expect(widths[2]).toBe(240);
  });

  it('draws a single circle sized by width or height', async () => {
    const { fixture, host, skeleton } = await render();
    host.shape.set('circle');
    host.height.set('48px');
    await fixture.whenStable();
    const bones = skeleton.querySelectorAll('.bone');
    expect(bones).toHaveLength(1);
    const rect = bones[0]!.getBoundingClientRect();
    expect(rect.width).toBe(48);
    expect(rect.height).toBe(48);
  });

  it('applies custom rectangle sizes', async () => {
    const { fixture, host, skeleton } = await render();
    host.shape.set('rect');
    host.width.set('200px');
    host.height.set('80px');
    await fixture.whenStable();
    const rect = skeleton.querySelector('.bone')!.getBoundingClientRect();
    expect([rect.width, rect.height]).toEqual([200, 80]);
  });

  it('never draws zero lines', async () => {
    const { fixture, host, skeleton } = await render();
    host.lines.set(0);
    await fixture.whenStable();
    expect(skeleton.querySelectorAll('.bone')).toHaveLength(1);
  });
});
