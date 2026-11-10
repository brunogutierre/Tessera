# Changelog

All notable changes to `@brunogutierre/tessera` are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [0.1.0] - Unreleased

First release.

### Added

- Design tokens as CSS custom properties in three tiers (primitives, semantic, component) and three themes, Enterprise, Fintech and Care, each with light and dark modes through `light-dark()`.
- Runtime theming: `provideTessera()`, `TesseraTheme` (theme and mode signals, resolved system mode) and the `tesTheme` scope directive.
- Built-in, overridable strings through `TES_LABELS`.
- 33 components:
  - Actions and display: Button, Icon, Spinner, Badge, Tag, Avatar, Card, Skeleton, Alert, Progress, Stat.
  - Navigation: Breadcrumbs, Tabs, Accordion, Toolbar, Tree, Paginator.
  - Forms: Form field, Input/Textarea, Checkbox, Radio, Switch, Slider, Choice, Fieldset, Select, Listbox, Autocomplete.
  - Overlays: Tooltip, Menu, Dialog (modal and drawer), Toast.
  - Data: Table with sortable headers and `tesSortRows`.
- Signal Forms `FormValueControl` support for composite controls; Reactive Forms and `ngModel` work without value accessors.
- WCAG 2.2 AA: contrast-tested tokens in all six theme and mode combinations, APG keyboard patterns from `@angular/aria`, axe checks on every story.
