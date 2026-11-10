# Tessera

An Angular design system: 30 accessible components, three professional themes (Enterprise, Fintech and Care), each with light and dark modes, documented in Storybook.

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
| Unit tests      | Vitest 5 via `@angular/build:unit-test`, browser mode in headless Chromium |
| Lint and format | angular-eslint (type-checked rules), Prettier                              |
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
.github/workflows/ci.yml          format, lint, tests with coverage, build and package checks
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

## Decisions

- **Library-only workspace.** Storybook is the documentation and the playground, so there is no separate demo app to build, deploy and keep in sync.
- **Unit tests run in a real browser (Chromium) instead of jsdom.** Components rely on the Popover API, focus management, `:focus-visible`, `matchMedia` and the CSS cascade to resolve tokens; jsdom fakes or lacks all of these.
- **Lint enforces the component conventions.** Selectors must use the `tes` prefix (`<tes-select>`, `button[tes-button]`, `[tesTooltip]`), components must be OnPush and prefer signals, so reviews can focus on behavior.
- **Plain CSS tokens, no Sass and no token pipeline.** Custom properties switch at runtime and cross component boundaries; a pipeline such as Style Dictionary only pays off when tokens must also reach native apps or design tools.
- **`light-dark()` with `color-scheme` for modes.** Each theme defines each color once, `system` mode needs no JavaScript, and a subtree can switch mode by setting one attribute.
- **Cascade layers** (`tessera.tokens`, `tessera.themes`, `tessera.base`, `tessera.components`). Any unlayered app CSS wins over Tessera regardless of specificity, so overrides never need `!important`.
- **Prefixed attributes** (`data-tes-theme`, `data-tes-mode`) instead of `data-theme`, which many apps and libraries already use.
- **Dark mode puts dark text on bright fills.** One `primary` token must work as link text on dark surfaces and as a button fill; a mid-tone fill with white text cannot pass both contrast checks.
- **Contrast is tested, not eyeballed.** Unit tests resolve every token in Chromium and check 45 foreground and background pairs in all six theme and mode combinations: 4.5:1 for text and 3:1 for borders, focus rings and icons.
- **Coverage gate of 80%** on statements, branches, functions and lines; stories and the public API barrel are excluded.

## Development

Requirements: Node 24 and npm 11. Browser tests need Chromium: `npx playwright install chromium-headless-shell` (once).

```bash
npm ci
npm test
```

| Command                 | What it does                                       |
| ----------------------- | -------------------------------------------------- |
| `npm test`              | Unit tests in headless Chromium                    |
| `npm run test:watch`    | Unit tests in watch mode                           |
| `npm run test:coverage` | Unit tests with coverage thresholds (80%)          |
| `npm run lint`          | ESLint (TypeScript and templates)                  |
| `npm run format:check`  | Prettier check (`npm run format` fixes)            |
| `npm run build`         | Builds the library into `dist/`                    |
| `npm run check:package` | Build, then publint, attw and `npm pack --dry-run` |

## License

[MIT](LICENSE)
