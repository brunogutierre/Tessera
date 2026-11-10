# @brunogutierre/tessera

An Angular design system: 33 accessible components, three professional themes (Enterprise, Fintech and Care), each with light and dark modes.

- **Storybook (docs, playground and showcase pages):** https://brunogutierre.github.io/Tessera/
- **Source, decisions and contributing guide:** https://github.com/brunogutierre/Tessera

## Install

```bash
npm install @brunogutierre/tessera @angular/cdk @angular/aria
```

Requires Angular 22.2 or later.

## Set up

1. Add the styles once, in `angular.json`:

   ```json
   "styles": ["node_modules/@brunogutierre/tessera/styles/tessera.css", "src/styles.css"]
   ```

2. Set the first theme in `index.html`, so the first paint is already themed:

   ```html
   <html lang="en" data-tes-theme="enterprise" data-tes-mode="system"></html>
   ```

3. Provide Tessera (optional: initial theme, mode and translated labels):

   ```ts
   bootstrapApplication(App, { providers: [provideTessera({ theme: 'fintech', mode: 'dark' })] });
   ```

## Use

Components are standalone; import the ones you need.

```ts
@Component({
  imports: [TesButton, TesFormField, TesInput, TesSelect],
  template: `
    <tes-form-field label="Email" [error]="emailError()">
      <input tes-input type="email" [formField]="signup.email" />
    </tes-form-field>
    <tes-form-field label="Country">
      <tes-select [options]="countries" [formField]="signup.country" />
    </tes-form-field>
    <button tes-button variant="primary" type="submit">Create account</button>
  `,
})
export class Signup {}
```

Form controls work with Signal Forms (`[formField]`), Reactive Forms and `ngModel`.

## Themes

| Attribute        | Values                          |
| ---------------- | ------------------------------- |
| `data-tes-theme` | `enterprise`, `fintech`, `care` |
| `data-tes-mode`  | `light`, `dark`, `system`       |

Switch at runtime with `inject(TesseraTheme).theme.set('care')`, or theme a subtree with `<section tesTheme="fintech" tesMode="dark">`. All styles live in cascade layers, so your own CSS always wins.

## License

MIT. Icons adapted from Lucide (ISC), see `THIRD-PARTY-NOTICES.md`.
