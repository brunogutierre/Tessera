# Tessera roadmap

## Where Tessera stands (0.2.0)

**Strengths**

- Modern Angular 22: standalone, signals, OnPush, zoneless-ready, Signal Forms `FormValueControl`
- Accessibility built in: `@angular/aria` and CDK behavior, and an axe matrix over 6 theme/mode combinations
- 35 components, including table, tree, calendar and date picker
- Three themes × light/dark, with a three-tier token architecture
- A typed extension API (theme registry, `data-tes-part`, contrast pairs), already used by [TesseraThemes](https://github.com/brunogutierre/TesseraThemes)
- Visual regression baselines and npm publishing with provenance

**Gaps**

- No adoption signal yet. Free alternatives are well known (Angular Material, PrimeNG, Taiga UI, Spartan).
- Angular only: teams on other stacks can't use any part of it.
- Storybook is the only documentation. There is no landing page or guides.
- No Figma assets and no page-level blocks or templates.

## Direction

1. **Keep the components in Angular.** The niche is modern, accessible Angular for back-office, fintech and healthcare apps.
2. **Make the design language framework-agnostic.** Tokens move to their own package, generated from a single [DTCG](https://www.designtokens.org/) source into CSS, SCSS, TypeScript, a Tailwind preset and Figma Variables. Any stack can then use the Tessera look.
3. **Open core.** Everything here stays MIT: all components, themes, the tokens package, TesseraThemes and a set of sample blocks. A separate commercial **Tessera Pro** adds full page templates and a Figma kit.

## Step by step (this repository)

1. `docs`: README hero and badges; GitHub description, topics and homepage
2. `feat(tokens)`: DTCG source for primitives and semantic tokens (3 themes × 2 modes) in a new `@brunogutierre/tessera-tokens` package
3. `build(tokens)`: Style Dictionary pipeline that outputs CSS custom properties, SCSS and TypeScript constants
4. `feat(tokens)`: Tailwind v4 `@theme` preset and Figma Variables / Tokens Studio export
5. `refactor`: Tessera consumes the generated CSS. Gate: zero visual diff on the existing baselines.
6. `docs`: landing page and MDX guides in Storybook (getting started, theming, tokens, extending). A separate docs app is rejected as duplicated effort.
7. `feat(docs)`: theme builder: pick a brand hue and contrast level, preview live, export token JSON
8. `docs(examples)`: StackBlitz starters, one for Angular and one for plain HTML/React using only the tokens package
9. `feat(blocks)`: three free sample blocks (login, settings page, data table with filters)
10. `chore(release)`: OIDC publish for the tokens package, Tessera 0.3.0, TesseraThemes 0.1.0 on npm

## Tessera Pro (planned)

A commercial add-on, delivered as source:

- **Page templates and blocks**: admin dashboard, CRUD list and detail, auth flows, settings, billing, analytics. They grow from the current showcase pages and come in all three themes and both modes.
- **Figma kit**: token variables (generated from the tokens package) plus a component library.
- Priority issues.

Pro never holds back fixes or accessibility work from the open components.

## Extras

- RTL showcase and `dir` testing in the story matrix
- More free themes contributed through the theme registry
- Dataviz tokens (categorical and sequential palettes) for charts
- Schematics: `ng add @brunogutierre/tessera`
- "Built with Tessera" gallery, starting with [AtlasMTL](https://github.com/brunogutierre/AtlasMTL)
