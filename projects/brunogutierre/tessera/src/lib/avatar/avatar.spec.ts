import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TesAvatar, initials } from './avatar';

/** A 1×1 transparent GIF: loads instantly without network. */
const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

@Component({
  imports: [TesAvatar],
  template: `<tes-avatar [name]="name()" [src]="src()" [decorative]="decorative()" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly name = signal('Ana Maria Souza');
  readonly src = signal<string | undefined>(undefined);
  readonly decorative = signal(false);
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const avatar = (fixture.nativeElement as HTMLElement).querySelector('tes-avatar')!;
  return { fixture, host: fixture.componentInstance, avatar };
}

describe('initials', () => {
  it.each([
    ['Ana Maria Souza', 'AS'],
    ['bruno', 'B'],
    ['  Émile   Zola ', 'ÉZ'],
    ['', ''],
  ])('%s → %s', (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});

describe('TesAvatar', () => {
  it('shows initials and is named by the full name', async () => {
    const { avatar } = await render();
    expect(avatar.getAttribute('role')).toBe('img');
    expect(avatar.getAttribute('aria-label')).toBe('Ana Maria Souza');
    expect(avatar.textContent.trim()).toBe('AS');
    expect(avatar.querySelector('span')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('shows the picture, and falls back to initials when it fails', async () => {
    const { avatar, fixture, host } = await render();
    host.src.set(PIXEL);
    await fixture.whenStable();
    const img = avatar.querySelector('img')!;
    expect(img.getAttribute('alt')).toBe('');

    img.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(avatar.querySelector('img')).toBeNull();
    expect(avatar.textContent.trim()).toBe('AS');

    host.src.set(`${PIXEL}#retry`);
    await fixture.whenStable();
    expect(avatar.querySelector('img')).not.toBeNull();
  });

  it('can be hidden when the name is shown next to it', async () => {
    const { avatar, fixture, host } = await render();
    host.decorative.set(true);
    await fixture.whenStable();
    expect(avatar.getAttribute('aria-hidden')).toBe('true');
    expect(avatar.hasAttribute('role')).toBe(false);
    expect(avatar.hasAttribute('aria-label')).toBe(false);
  });
});
