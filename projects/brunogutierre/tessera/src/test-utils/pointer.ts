import { userEvent } from 'vitest/browser';

/**
 * Moves the pointer onto a corner element, away from anything a test renders. The browser keeps the
 * pointer where the previous test left it, so a freshly rendered control could start in :hover.
 */
export async function movePointerAway(): Promise<void> {
  const corner = document.createElement('div');
  corner.style.cssText =
    'position: fixed; inset: auto 0 0 auto; inline-size: 2px; block-size: 2px;';
  document.body.append(corner);
  await userEvent.hover(corner);
  corner.remove();
}
