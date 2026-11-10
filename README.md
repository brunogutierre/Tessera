# Tessera

An Angular design system: 30 accessible components, three professional themes (Enterprise, Fintech and Care), each with light and dark modes, documented in Storybook.

> Work in progress. Sections are filled in as each part of the system lands.

## Goal

Show how a production-grade design system is built with modern Angular: design tokens as CSS custom properties, runtime theming, headless accessibility primitives (`@angular/aria` + Angular CDK) with fully custom visuals, and documentation that doubles as a test suite.

## Stack

| Area            | Choice                                                                     |
| --------------- | -------------------------------------------------------------------------- |
| Framework       | Angular 22 (standalone components, signals, OnPush, zoneless-ready)        |
| Behavior        | `@angular/aria` (headless APG widgets) and Angular CDK (overlay, a11y)     |
| Packaging       | ng-packagr (Angular Package Format), single entry point                    |
| Unit tests      | Vitest 5 via `@angular/build:unit-test`, browser mode in headless Chromium |
| Lint and format | angular-eslint (type-checked rules), Prettier                              |
| Package checks  | publint, `@arethetypeswrong/cli`, `npm pack --dry-run`                     |

## Repository layout

```
projects/brunogutierre/tessera/   the library (@brunogutierre/tessera)
  src/lib/core/                   shared utilities (ids, theme, labels)
  src/public-api.ts               everything the package exports
.github/workflows/ci.yml          format, lint, tests with coverage, build and package checks
```

## Decisions

- **Library-only workspace.** Storybook is the documentation and the playground, so there is no separate demo app to build, deploy and keep in sync.
- **Unit tests run in a real browser (Chromium) instead of jsdom.** Components rely on the Popover API, focus management, `:focus-visible`, `matchMedia` and the CSS cascade to resolve tokens; jsdom fakes or lacks all of these.
- **Lint enforces the component conventions.** Selectors must use the `tes` prefix (`<tes-select>`, `button[tes-button]`, `[tesTooltip]`), components must be OnPush and prefer signals, so reviews can focus on behavior.
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
