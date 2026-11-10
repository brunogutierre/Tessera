# Contributing to Tessera

These conventions were set with the Button, Icon and Spinner components and apply to every component. Lint enforces the ones it can; reviews check the rest.

## Component checklist

Every component ships, in `projects/brunogutierre/tessera/src/lib/<name>/`:

| File                | Content                                                                  |
| ------------------- | ------------------------------------------------------------------------ |
| `<name>.ts`         | Standalone component or directive, `ChangeDetectionStrategy.OnPush`      |
| `<name>.css`        | Styles inside `@layer tessera.components { … }`                          |
| `<name>.html`       | Only when the template is longer than about 30 lines                     |
| `<name>.spec.ts`    | Unit tests in Chromium (behavior, ARIA, keyboard, token-driven styles)   |
| `<name>.stories.ts` | Storybook stories under `Components/<Name>`; play functions for behavior |

Then export it from `src/public-api.ts` and add it to the README component table.

## API

- **Selectors.** Components that enhance a native element are attribute selectors on that element (`button[tes-button]`, `input[tes-input]`, `table[tes-table]`), so native semantics, forms and ARIA pass through. Composite widgets are elements (`<tes-select>`). Directives are camelCase attributes (`[tesTooltip]`).
- **Names.** Classes are `Tes<Name>` with no `Component` suffix; files are `<name>.ts`.
- **Signals only.** `input()` / `input.required()`, `model()` for two-way state (`value`, `checked`, `expanded`), `output()`; `booleanAttribute` for flags so `<button tes-button loading>` works.
- **Host metadata, not decorators.** Use the `host` object: a static `class: 'tes-<name>'` plus `data-*` attributes for state (`[attr.data-variant]`, `[attr.data-size]`), which the CSS selects with `:host([data-variant='primary'])`.
- **Private state** uses ES `#fields`, so it never reaches the public typings or the Storybook props table. Signal queries (`viewChild`, `contentChildren`) are the exception: Angular cannot read ES private fields, so they are TypeScript `private`.
- **Strings** that users or assistive technology see come from `TES_LABELS`, never hard-coded English.
- **Accessible names are required.** If a component cannot be named by its content (icon-only button), it warns in dev mode.

## Styles

- Read **semantic tokens** only (`--tes-color-*`, `--tes-space-*`, `--tes-control-height-*`, …), never primitives (`--tes-palette-*`).
- Expose a few **component tokens** as public overrides that fall back to semantic tokens: `var(--tes-button-radius, var(--tes-radius-md))`.
- Internal variables start with `--_` (`--_bg`, `--_height`) and are set per variant.
- Use **logical properties** (`padding-inline`, `inset-inline-start`), so right-to-left layouts work.
- **Focus:** `:host(:focus-visible) { outline: var(--tes-focus-ring-width) solid var(--tes-color-focus); outline-offset: var(--tes-focus-ring-offset); }`. Never use a shadow-only focus indicator.
- **Interaction feedback** goes behind `:not(:disabled, [aria-disabled='true'])`.
- **Borders that identify a control** use `--tes-color-border-strong` (3:1). Decorative borders use `--tes-color-border`.
- **Target size** stays at 24px or more, including `sm` sizes in the dense Enterprise theme.
- **Motion** uses `--tes-duration-*`, which drop to `0ms` with reduced motion. Never wait for `transitionend`.
- Add a `forced-colors` block when a component relies on backgrounds to show its shape.

## Tests

- Unit tests run in Chromium. Call `loadTesseraStyles()` (from `src/test-utils/styles.ts`) when a test reads computed styles; compare colors with `resolveColor()` and `toRgba()` from `src/test-utils/color.ts`.
- Test behavior and accessibility (roles, names, states, keyboard), not implementation details.
- Coverage must stay at 80% or more for statements, branches, functions and lines.
- Stories are tests too: `npm run test:stories` renders every story in all six theme and mode combinations and fails on any axe violation.

## Git

- One branch per change (`feat/…`, `fix/…`, `docs/…`, `test/…`, `chore/…`) and a pull request to `main`.
- Conventional Commits; keep each commit under about 500 changed lines (lockfiles excluded) and working on its own.
- Before committing: `npm run format:check && npm run lint && npm run test:coverage && npm run test:stories`.
