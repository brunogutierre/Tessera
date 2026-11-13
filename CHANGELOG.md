# Changelog

All notable changes to `@brunogutierre/tessera` are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [0.2.0] - 2026-11-12

Hooks for theme packages, such as `@brunogutierre/tessera-themes`. All changes are additive.

### Added

- Theme registry: `TesThemeRegistry` (augment it to add theme names to the types), `provideTesseraThemes()` and `TES_EXTRA_THEMES` to register them at runtime, and `TesseraTheme.themes`, which lists every theme the app can show.
- Public styling API, documented in Foundations/Extending Tessera: `data-tes-part` on the internal elements of components, next to the host classes, state attributes and component tokens. `npm run check:parts` keeps the docs and templates in sync.
- Component tokens for native controls: `--tes-checkbox-mark`, `--tes-checkbox-mark-indeterminate`, `--tes-switch-knob`, `--tes-switch-knob-checked`, `--tes-slider-filled`, `--tes-slider-empty` and `--tes-slider-thumb-image`.
- `TES_CONTRAST_PAIRS`: the 49 color pairs, with their WCAG minimum ratios, that every theme must pass. A theme is complete when it defines `SEMANTIC_TOKENS` and passes these pairs.

## [0.1.1] - 2026-11-11

### Changed

- First version published from CI through npm Trusted Publishing, with a signed provenance statement. The code is the same as 0.1.0.

## [0.1.0] - 2026-11-11

First release.

### Added

- Design tokens as CSS custom properties in three tiers (primitives, semantic, component) and three themes, Enterprise, Fintech and Care, each with light and dark modes through `light-dark()`.
- Runtime theming: `provideTessera()`, `TesseraTheme` (theme and mode signals, resolved system mode) and the `tesTheme` scope directive.
- Built-in, overridable strings through `TES_LABELS`.
- 35 components:
  - Actions and display: Button, Icon, Spinner, Badge, Tag, Avatar, Card, Skeleton, Alert, Progress, Stat.
  - Navigation: Breadcrumbs, Tabs, Accordion, Toolbar, Tree, Paginator.
  - Forms: Form field, Input/Textarea, Checkbox, Radio, Switch, Slider, Choice, Fieldset, Select, Listbox, Autocomplete, Calendar, Date picker.
  - Overlays: Tooltip, Menu, Dialog (modal and drawer), Toast.
  - Data: Table with sortable headers and `tesSortRows`.
- Signal Forms `FormValueControl` support for composite controls; Reactive Forms and `ngModel` work without value accessors.
- WCAG 2.2 AA: contrast-tested tokens in all six theme and mode combinations, APG keyboard patterns from `@angular/aria`, axe checks on every story.
