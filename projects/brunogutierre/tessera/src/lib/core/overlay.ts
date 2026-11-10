import type { ConnectedPosition } from '@angular/cdk/overlay';

/**
 * Overlay defaults shared by Tessera's anchored panels (menus, selects, tooltips):
 *
 * - CDK Overlay with the browser Popover API (`usePopover`), placed `inline`, next to its origin.
 *   The panel renders in the top layer (no z-index fights, never clipped by `overflow`), yet stays
 *   inside the DOM subtree, so a `tesTheme` scope and the component's encapsulated styles apply.
 * - Positions use `start`/`end`, which the CDK flips in right-to-left layouts.
 */
export const TES_DROPDOWN_POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
  { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 },
  { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -4 },
];

export const TES_TOOLTIP_POSITIONS: ConnectedPosition[] = [
  { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -6 },
  { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 6 },
  { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 6 },
  { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -6 },
];
