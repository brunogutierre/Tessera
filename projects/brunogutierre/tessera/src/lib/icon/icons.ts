/*
 * Icon paths adapted from Lucide (https://lucide.dev), ISC License:
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT).
 * All other copyright (c) for Lucide are held by Lucide Contributors 2022.
 * Permission to use, copy, modify, and/or distribute this software for any purpose with or without
 * fee is hereby granted, provided that the above copyright notice and this permission notice
 * appear in all copies.
 *
 * Every icon is a list of path commands on a 24×24 grid, drawn with a 2px round stroke. Circles
 * and rectangles are written as paths so the template stays a single @for.
 */
const circle = (cx: number, cy: number, r: number): string =>
  `M${String(cx - r)} ${String(cy)}a${String(r)} ${String(r)} 0 1 0 ${String(2 * r)} 0a${String(r)} ${String(r)} 0 1 0 ${String(-2 * r)} 0`;

export const TES_ICONS = {
  'arrow-down': ['M12 5v14', 'm19 12-7 7-7-7'],
  'arrow-up': ['m5 12 7-7 7 7', 'M12 19V5'],
  'arrow-up-down': ['m21 16-4 4-4-4', 'M17 20V4', 'm3 8 4-4 4 4', 'M7 4v16'],
  bell: [
    'M10.27 21a2 2 0 0 0 3.46 0',
    'M3.26 15.33A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.67C19.41 13.96 18 12.5 18 8A6 6 0 0 0 6 8c0 4.5-1.41 5.96-2.74 7.33',
  ],
  calendar: [
    'M8 2v4',
    'M16 2v4',
    'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
    'M3 10h18',
  ],
  check: ['M20 6 9 17l-5-5'],
  'chevron-down': ['m6 9 6 6 6-6'],
  'chevron-left': ['m15 18-6-6 6-6'],
  'chevron-right': ['m9 18 6-6-6-6'],
  'chevron-up': ['m18 15-6-6-6 6'],
  'chevrons-left': ['m11 17-5-5 5-5', 'm18 17-5-5 5-5'],
  'chevrons-right': ['m6 17 5-5-5-5', 'm13 17 5-5-5-5'],
  'circle-alert': [circle(12, 12, 10), 'M12 8v4', 'M12 16h.01'],
  'circle-check': [circle(12, 12, 10), 'm9 12 2 2 4-4'],
  'circle-x': [circle(12, 12, 10), 'm15 9-6 6', 'm9 9 6 6'],
  clock: [circle(12, 12, 10), 'M12 6v6l4 2'],
  download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5', 'M12 15V3'],
  ellipsis: [circle(5, 12, 1), circle(12, 12, 1), circle(19, 12, 1)],
  file: ['M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z', 'M14 2v4a2 2 0 0 0 2 2h4'],
  filter: ['M22 3H2l8 9.46V19l4 2v-8.54z'],
  folder: [
    'M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z',
  ],
  heart: [
    'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z',
  ],
  home: [
    'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8',
    'M3 10a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  ],
  info: [circle(12, 12, 10), 'M12 16v-4', 'M12 8h.01'],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  minus: ['M5 12h14'],
  pencil: [
    'M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z',
    'm15 5 4 4',
  ],
  plus: ['M5 12h14', 'M12 5v14'],
  search: [circle(11, 11, 8), 'm21 21-4.3-4.3'],
  'trash-2': [
    'M3 6h18',
    'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6',
    'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2',
    'M10 11v6',
    'M14 11v6',
  ],
  'trending-down': ['M22 17 13.5 8.5l-5 5L2 7', 'M16 17h6v-6'],
  'trending-up': ['M22 7 13.5 15.5l-5-5L2 17', 'M16 7h6v6'],
  'triangle-alert': [
    'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3',
    'M12 9v4',
    'M12 17h.01',
  ],
  user: ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', circle(12, 7, 4)],
  x: ['M18 6 6 18', 'm6 6 12 12'],
} as const satisfies Record<string, readonly string[]>;

export type TesIconName = keyof typeof TES_ICONS;
