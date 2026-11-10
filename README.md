# Tessera

An Angular design system: 30 accessible components, three professional themes (Enterprise, Fintech and Care), each with light and dark modes, documented in Storybook.

**Live Storybook:** https://brunogutierre.github.io/Tessera/

> Work in progress. Sections are filled in as each part of the system lands.

## Goal

Show how a production-grade design system is built with modern Angular: design tokens as CSS custom properties, runtime theming, headless accessibility primitives (`@angular/aria` + Angular CDK) with fully custom visuals, and documentation that doubles as a test suite.

## Stack

| Area            | Choice                                                                     |
| --------------- | -------------------------------------------------------------------------- |
| Framework       | Angular 22 (standalone components, signals, OnPush, zoneless-ready)        |
| Styling         | Plain CSS: custom properties, `oklch()`, `light-dark()`, cascade layers    |
| Behavior        | `@angular/aria` (headless APG widgets) and Angular CDK (overlay, a11y)     |
| Packaging       | ng-packagr (Angular Package Format), single entry point                    |
| Documentation   | Storybook 10 (`@storybook/angular-vite`), deployed to GitHub Pages         |
| Unit tests      | Vitest 5 via `@angular/build:unit-test`, browser mode in headless Chromium |
| Lint and format | angular-eslint (type-checked rules), Prettier                              |
| Story tests     | `@storybook/addon-vitest` + `@storybook/addon-a11y` (axe, WCAG 2.2 AA)     |
| Package checks  | publint, `@arethetypeswrong/cli`, `npm pack --dry-run`                     |

## Repository layout

```
projects/brunogutierre/tessera/   the library (@brunogutierre/tessera)
  styles/                         design tokens and themes (shipped as @brunogutierre/tessera/styles/*)
    tessera.css                   entry point: layer order + imports
    tokens/primitives.css         oklch palettes, size and time scales
    themes/                       modes.css, enterprise.css, fintech.css, care.css
    base.css                      text and background of themed subtrees
  src/lib/core/                   shared utilities (ids, tokens, theme, labels)
  src/public-api.ts               everything the package exports
.storybook/                      Storybook config: globals for theme, mode and direction; fonts
  src/docs/                       MDX pages and foundation stories
vitest.storybook.config.mts       runs every story as a browser test
scripts/test-stories.mjs          runs the story tests once per theme and mode
.github/workflows/ci.yml          format, lint, unit tests, package checks, story tests
.github/workflows/pages.yml       deploys Storybook to GitHub Pages on every push to main
```

## Themes and design tokens

| Theme          | Built for                    | Character                                             |
| -------------- | ---------------------------- | ----------------------------------------------------- |
| **Enterprise** | ERP, back office, admin      | Dense and sober: IBM Plex Sans, small radii, compact  |
| **Fintech**    | Trading, banking, dashboards | High contrast, dark-first: Inter with tabular numbers |
| **Care**       | Healthcare and services      | Soft and calm: Nunito, large radii, roomy spacing     |

Tokens come in three tiers:

1. **Primitives** (`--tes-palette-blue-600`, `--tes-size-16`): raw values, never used by components.
2. **Semantic tokens** (`--tes-color-primary`, `--tes-control-height-md`): what components read. Every theme defines the same set, listed in `SEMANTIC_TOKENS`.
3. **Component tokens** (`--tes-button-radius`): optional overrides that fall back to semantic tokens.

```html
<html data-tes-theme="fintech" data-tes-mode="dark"></html>
```

## Components

| Component    | Selector                                  | Built on   | Notes                                                       |
| ------------ | ----------------------------------------- | ---------- | ----------------------------------------------------------- |
| Button       | `button[tes-button]`, `a[tes-button]`     | native     | 5 variants, 3 sizes, icon-only, loading (stays focusable)   |
| Icon         | `tes-icon`                                | inline SVG | 35 icons adapted from Lucide; decorative unless labelled    |
| Spinner      | `tes-spinner`                             | native     | Indeterminate progressbar; pulses with reduced motion       |
| Badge        | `tes-badge`                               | native     | 6 tones, subtle or solid; text always states the status     |
| Tag          | `tes-tag`                                 | native     | Optional remove button named "Remove {text}"                |
| Avatar       | `tes-avatar`                              | native     | Picture or initials; falls back when the picture fails      |
| Card         | `tes-card`, `article[tes-card]`           | native     | Outlined, elevated or filled; optional header and footer    |
| Skeleton     | `tes-skeleton`                            | native     | Text lines, rectangle or circle; always `aria-hidden`       |
| Alert        | `tes-alert`                               | native     | 4 tones spoken first ("Warning: …"); optional live region   |
| Progress     | `tes-progress`                            | native     | Determinate or indeterminate progressbar, localized value   |
| Stat         | `tes-stat`                                | native     | KPI with localized change; `positive` picks the color       |
| Breadcrumbs  | `tes-breadcrumbs`                         | native     | `nav > ol` over your own `<li>` links (any router)          |
| Form field   | `tes-form-field`                          | native     | Label, hint and error wired to the control by itself        |
| Input        | `input[tes-input]`, `textarea[tes-input]` | native     | Native value and validation; textareas grow with content    |
| Checkbox     | `input[type=checkbox][tes-checkbox]`      | native     | Checked, indeterminate; mark cut out with a CSS mask        |
| Radio        | `input[type=radio][tes-radio]`            | native     | Browser arrow keys and single tab stop                      |
| Switch       | `input[type=checkbox][tes-switch]`        | native     | `role="switch"`; knob mirrors in RTL                        |
| Slider       | `input[type=range][tes-slider]`           | native     | Filled track follows the value, even when set by a form     |
| Choice       | `label[tes-choice]`                       | native     | Clickable label for a checkbox, radio or switch             |
| Fieldset     | `fieldset[tes-fieldset]`                  | native     | Legend, hint and error for a group of choices               |
| Tooltip      | `[tesTooltip]`                            | CDK        | WCAG 1.4.13: dismissible, hoverable; always the description |
| Menu         | `tes-menu`                                | Aria + CDK | Menu button with data-driven items, separators, danger      |
| Select       | `tes-select`                              | Aria + CDK | Single or multiple; a Signal Forms `FormValueControl`       |
| Listbox      | `tes-listbox`                             | Aria       | Always-visible list, single (follows focus) or multiple     |
| Autocomplete | `tes-autocomplete`                        | Aria + CDK | Editable combobox, accent-insensitive filter, "no results"  |

## Usage

```bash
npm install @brunogutierre/tessera @angular/cdk @angular/aria
```

1. Add `node_modules/@brunogutierre/tessera/styles/tessera.css` to the `styles` of your `angular.json`.
2. Set the first theme in `index.html` so the first paint is already themed: `<html data-tes-theme="enterprise" data-tes-mode="system">`.
3. Provide Tessera:

```ts
bootstrapApplication(App, {
  providers: [provideTessera({ theme: 'fintech', mode: 'dark', labels: { close: 'Fechar' } })],
});
```

Switch at runtime with signals, or theme a subtree with a directive:

```ts
const theme = inject(TesseraTheme);
theme.theme.set('care');
theme.mode.set('system');
theme.resolvedMode(); // 'light' | 'dark'
```

```html
<aside tesTheme="enterprise" tesMode="light">…</aside>
```

Every built-in string (button names, screen-reader text, paginator summary) comes from `TES_LABELS`, in English by default and overridable through `provideTessera({ labels })`.

## Decisions

- **Library-only workspace.** Storybook is the documentation and the playground, so there is no separate demo app to build, deploy and keep in sync.
- **Storybook on Vite (`@storybook/angular-vite`) instead of Webpack.** It is the only Angular framework that runs stories as Vitest tests, and it matches Angular's own esbuild/Vite toolchain. It is still marked preview, so versions are pinned exactly; the fallback is `@storybook/angular`.
- **Every story is a test, in every theme.** `npm run test:stories` renders each story in Chromium, runs its play function and fails on any axe violation (`a11y.test: 'error'`), once per theme and mode (six runs, sequential to keep memory low).
- **Fonts only in Storybook.** The package ships no fonts and its tokens end in system stacks; Storybook loads OFL fonts locally (`@fontsource-variable/*`) so pages and screenshots never depend on a CDN.
- **Unit tests run in a real browser (Chromium) instead of jsdom.** Components rely on the Popover API, focus management, `:focus-visible`, `matchMedia` and the CSS cascade to resolve tokens; jsdom fakes or lacks all of these.
- **Theme state is two attributes on `<html>`.** `TesseraTheme` only writes `data-tes-theme` and `data-tes-mode`; the CSS does the rest. It adopts attributes already present in `index.html`, so server-rendered or static pages never flash the wrong theme.
- **Built-in strings are injectable, and the ones with numbers are functions** (`pageRange(first, last, total)`), because word order and plurals differ between languages.
- **Native elements stay native.** Components that enhance a native element are attributes on it (`<button tes-button>`), so `type="submit"`, `href`, `disabled` and ARIA attributes work as usual. A wrapper element (`<tes-button>`) would have to re-implement or forward all of them.
- **`loading` uses `aria-disabled`, not `disabled`.** A disabled button loses focus, so keyboard users would be thrown back to the top of the page while a form saves.
- **Form controls stay native.** `input[tes-input]` is a component on the `<input>` itself, so Signal Forms (`[formField]`), Reactive Forms and `ngModel` bind it with their built-in accessors: no `ControlValueAccessor` to maintain. The surrounding `tes-form-field` wires `for`, `aria-describedby` and `aria-invalid` through dependency injection.
- **Checkboxes, radios, switches and sliders are native inputs too.** `@angular/aria` has no such widgets, and the native ones bring keyboard support, forms binding, RTL and forced-colors rendering for free. The check mark is cut out of the filled box with `mask-composite: exclude`, so it shows whatever surface is behind it, with no image per theme; a second, enlarged mask layer keeps the focus ring visible.
- **The app decides when an error shows.** `tes-form-field` takes the message (`[error]`), not a validation rule, so the same field works with any form library and any "show after blur or submit" policy.
- **Anchored panels are inline popovers.** Menus, selects and tooltips use the CDK Overlay with the browser Popover API, placed next to their origin: they render in the top layer (no z-index, never clipped) yet stay in the DOM subtree, so a scoped `tesTheme` and encapsulated styles still apply.
- **Menus take their items as data.** `@angular/aria`'s trigger links to its menu through a template input, so `tes-menu` renders both the button and the panel and receives `TesMenuEntry[]`; apps never touch Aria types.
- **Composite controls are `FormValueControl`s, with no `ControlValueAccessor`.** `tes-select` and `tes-listbox` expose `value` as a `model()` plus a `touch` output; Angular 22 binds that shape from Signal Forms (`[formField]`), Reactive Forms and `ngModel` alike.
- **Status is never color alone.** Alerts speak their tone first ("Warning: …"), stats speak the direction of a change ("increase"), and badges always carry text.
- **Breadcrumbs take your own `<li>` markup** instead of an items array, so links can use `href`, `routerLink` or anything else without Tessera depending on the router. It is the one component that is not view-encapsulated: its styles must reach projected items, so every selector is scoped under `.tes-breadcrumbs`.
- **Icons are drawn from a typed map in the template.** No icon font, no runtime registry, no `innerHTML`: unknown names fail at compile time and nothing needs sanitizing.
- **Lint enforces the component conventions.** Selectors must use the `tes` prefix (`<tes-select>`, `button[tes-button]`, `[tesTooltip]`), components must be OnPush and prefer signals, so reviews can focus on behavior.
- **Plain CSS tokens, no Sass and no token pipeline.** Custom properties switch at runtime and cross component boundaries; a pipeline such as Style Dictionary only pays off when tokens must also reach native apps or design tools.
- **`light-dark()` with `color-scheme` for modes.** Each theme defines each color once, `system` mode needs no JavaScript, and a subtree can switch mode by setting one attribute.
- **Cascade layers** (`tessera.tokens`, `tessera.themes`, `tessera.base`, `tessera.components`). Any unlayered app CSS wins over Tessera regardless of specificity, so overrides never need `!important`.
- **Prefixed attributes** (`data-tes-theme`, `data-tes-mode`) instead of `data-theme`, which many apps and libraries already use.
- **Dark mode puts dark text on bright fills.** One `primary` token must work as link text on dark surfaces and as a button fill; a mid-tone fill with white text cannot pass both contrast checks.
- **Contrast is tested, not eyeballed.** Unit tests resolve every token in Chromium and check 44 foreground and background pairs in all six theme and mode combinations: 4.5:1 for text and 3:1 for borders, focus rings and icons.
- **Coverage gate of 80%** on statements, branches, functions and lines; stories and the public API barrel are excluded.

## Development

Requirements: Node 24 and npm 11. Browser tests need Chromium: `npx playwright install chromium-headless-shell` (once).

```bash
npm ci
npm test
```

| Command                   | What it does                                       |
| ------------------------- | -------------------------------------------------- |
| `npm test`                | Unit tests in headless Chromium                    |
| `npm run test:watch`      | Unit tests in watch mode                           |
| `npm run test:coverage`   | Unit tests with coverage thresholds (80%)          |
| `npm run lint`            | ESLint (TypeScript and templates)                  |
| `npm run format:check`    | Prettier check (`npm run format` fixes)            |
| `npm run build`           | Builds the library into `dist/`                    |
| `npm run storybook`       | Storybook at http://localhost:6006                 |
| `npm run test:stories`    | Every story as a browser test, with axe            |
| `npm run build-storybook` | Static Storybook in `storybook-static/`            |
| `npm run check:package`   | Build, then publint, attw and `npm pack --dry-run` |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the component checklist, API and styling conventions.

## License

[MIT](LICENSE)
