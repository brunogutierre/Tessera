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
- **Signals only.** `input()` / `input.required()`, `output()`, `booleanAttribute` for flags so `<button tes-button loading>` works. `model()` is for the state of composite widgets (`value`, `expanded`, `selectedIndex`); the name `checked` is reserved by Signal Forms for checkbox-like controls.
- **Native state is not mirrored.** A component on a native control (`input[type=checkbox][tes-checkbox]`) adds no `checked`, `value` or `disabled` input: forms bind the native element directly, and CSS reads `:checked`, `:disabled` and `[aria-invalid]`.
- **Attribute ownership.** Never bind `null` to an attribute the consumer can also write: Angular would remove theirs. Merge the static value read with `HostAttributeToken` (see `TesButton.staticAriaDisabled`), or expose an input. Id lists such as `aria-describedby` are merged, never replaced.
- **Host metadata, not decorators.** Use the `host` object: a static `class: 'tes-<name>'` plus `data-*` attributes for visual options (`[attr.data-variant]`, `[attr.data-size]`), which the CSS selects with `:host([data-variant='primary'])`. Interactive state is styled from ARIA attributes first (`aria-expanded`, `aria-selected`, `aria-current`, `aria-invalid`), which `@angular/aria` already maintains.
- **Visibility.** Private state uses ES `#fields`, so it never reaches the public typings or the Storybook props table. Members read by templates or host bindings are `protected` (templates cannot read `#` fields), and signal queries (`viewChild`, `contentChildren`) are TypeScript `private` (Angular cannot read ES private fields either).
- **Behavior comes from `@angular/aria` and the CDK**, as host directives or in the template; never re-implement their keyboard handling. Read direction from the CDK `Directionality` in TypeScript, and use logical properties and `:dir()` in CSS. No `:host-context()` and no `::ng-deep`. Components whose job is to style the consumer's markup (Breadcrumbs, Table) use `ViewEncapsulation.None` with every selector under their host class, still inside `@layer tessera.components`. Layout of attribute-marked app elements (`[tesCardFooter]`, `[tesDialogFooter]`) lives in `base.css`.
- **Icons are projected.** Public APIs take icons through content projection, so apps can use their own icon set. The exception is data-driven item models (`TesMenuEntry`, `TesTreeNode`), where an optional `icon: TesIconName` keeps the data plain.
- **Strings** that users or assistive technology see come from `TES_LABELS`, never hard-coded English. Screen-reader-only text uses the global `.tes-visually-hidden` class; keep a space inside it when it sits next to other text.
- **Accessible names are required.** Native `aria-label` when the named role is the host itself (toolbar, icon-only button); a `label` input when the named role is an element inside the template (select, autocomplete, listbox, tree), because an `aria-label` on a generic host element is ignored. Inside a `tes-form-field`, the field's label wins. Icon-only buttons warn in dev mode when unnamed.
- **Disabled.** Form-like controls (input, select, autocomplete, listbox) are natively disabled: not focusable, like the HTML controls they replace. Items of composite widgets (tabs, menu, toolbar, tree) are soft-disabled (focusable, `aria-disabled`), as the APG recommends. A button that becomes unavailable right after being pressed uses `softDisabled`, so focus stays on it.
- **Touched.** Controls emit `touch` when focus leaves the whole control, not when it moves inside it.
- **Naming.** Multiple selection is `multiple`; status tones are `TesStatusTone`.
- **Server rendering.** No DOM reads outside `afterNextRender`, `afterRenderEffect` or event handlers; inject `DOCUMENT` instead of using `document` or `window`.

## Styles

- Read **semantic tokens** only (`--tes-color-*`, `--tes-space-*`, `--tes-control-height-*`, …), never primitives (`--tes-palette-*`).
- Expose a few **component tokens** as public overrides that fall back to semantic tokens: `var(--tes-button-radius, var(--tes-radius-md))`.
- Internal variables start with `--_` (`--_bg`, `--_height`) and are set per variant.
- Use **logical properties** (`padding-inline`, `inset-inline-start`), so right-to-left layouts work.
- **Focus:** `:host(:focus-visible) { outline: var(--tes-focus-ring-width) solid var(--tes-color-focus); outline-offset: var(--tes-focus-ring-offset); }`. Never use a shadow-only focus indicator. Widgets that move a virtual focus with `aria-activedescendant` draw the same ring on the active item.
- **Overlays** (menus, selects, tooltips) use CDK Overlay with the popover location `inline`, so they stay inside the `tesTheme` subtree. Style an inner element Tessera owns, never `.cdk-overlay-*` (the CDK injects its own `@layer` after Tessera's). Panels reset inherited text properties (font, color, text-align, white-space); enter with `@starting-style`.
- **Interaction feedback** goes behind `:not(:disabled, [aria-disabled='true'])`.
- **Borders that identify a control** use `--tes-color-border-strong` (3:1). Decorative borders use `--tes-color-border`.
- **Target size** stays at 24px or more, including `sm` sizes in the dense Enterprise theme.
- **Never set `font-size` on the root element.** Tokens are in rem; Tessera leaves the root size to the browser and the user.
- **`surface-sunken` is for wells inside a surface** (table headers, inputs read-only), never directly on the page: in dark mode it equals the page background.
- **Motion** uses `--tes-duration-*`, which drop to `0ms` with reduced motion. Never wait for `transitionend`.
- Add a `forced-colors` block when a component relies on backgrounds to show its shape.

## Tests

- Unit tests run in Chromium at the browser's default 16px root size. Call `loadTesseraStyles()` (from `src/test-utils/styles.ts`) when a test reads computed styles; compare colors with `resolveColor()` and `toRgba()` from `src/test-utils/color.ts`.
- Test behavior and accessibility (roles, names, states, keyboard), not implementation details.
- Coverage must stay at 80% or more for statements, branches, functions and lines.
- Stories are tests too: `npm run test:stories` renders every story in all six theme and mode combinations and fails on any axe violation.

## Git

- One branch per change (`feat/…`, `fix/…`, `docs/…`, `test/…`, `chore/…`) and a pull request to `main`.
- Conventional Commits; keep each commit under about 500 changed lines (lockfiles excluded) and working on its own.
- Before committing: `npm run format:check && npm run lint && npm run test:coverage && npm run test:stories`.
