import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormField, email, form, required, submit } from '@angular/forms/signals';
import { moduleMetadata } from '@storybook/angular-vite';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { TesButton } from '../button/button';
import { TesInput } from '../input/input';
import { TesFormField } from './form-field';

const meta: Meta<TesFormField> = {
  title: 'Components/Form field',
  component: TesFormField,
  subcomponents: { TesInput },
  decorators: [moduleMetadata({ imports: [TesInput] })],
  args: { label: 'Email', hint: 'Receipts are sent here.', error: '', optional: false },
  render: (args) => ({
    props: args,
    template: `
      <tes-form-field [label]="label" [hint]="hint" [error]="error" [optional]="optional" style="max-inline-size: 22rem">
        <input tes-input type="email" required autocomplete="email" />
      </tes-form-field>`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'Label, hint and error for one control. `input[tes-input]` and `textarea[tes-input]` register with the ' +
          'field, which wires `for`, `aria-describedby` and `aria-invalid`. Works with Signal Forms, Reactive ' +
          'Forms and ngModel, since the control stays native.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesFormField>;

export const Playground: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: /Email/ });
    await expect(input).toHaveAccessibleDescription('Receipts are sent here.');
    await userEvent.type(input, 'ana@example.com');
    await expect(input).toHaveValue('ana@example.com');
  },
};

export const WithError: Story = {
  args: { error: 'Enter an email address like name@example.com' },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: /Email/ });
    await expect(input).toBeInvalid();
    await expect(input).toHaveAccessibleDescription(
      'Receipts are sent here. Enter an email address like name@example.com',
    );
  },
};

export const States: Story = {
  render: () => ({
    template: `
      <div class="sb-grid">
        <tes-form-field label="Optional" optional><input tes-input placeholder="e.g. ACME-42" /></tes-form-field>
        <tes-form-field label="Read only"><input tes-input value="INV-2026-0184" readonly /></tes-form-field>
        <tes-form-field label="Disabled"><input tes-input value="Locked" disabled /></tes-form-field>
        <tes-form-field label="Small"><input tes-input size="sm" /></tes-form-field>
        <tes-form-field label="Large"><input tes-input size="lg" /></tes-form-field>
      </div>`,
  }),
};

export const Textarea: Story = {
  render: () => ({
    template: `
      <tes-form-field label="Clinical notes" hint="Grows with the text, up to twelve lines." style="max-inline-size: 28rem">
        <textarea tes-input></textarea>
      </tes-form-field>`,
  }),
};

@Component({
  selector: 'tes-docs-signup',
  imports: [TesFormField, TesInput, TesButton, FormField],
  template: `
    <form class="sb-stack" style="max-inline-size: 22rem" novalidate (submit)="send($event)">
      <tes-form-field label="Full name" [error]="errorOf('name')">
        <input tes-input autocomplete="name" [formField]="signup.name" />
      </tes-form-field>
      <tes-form-field label="Work email" [error]="errorOf('email')">
        <input tes-input type="email" autocomplete="email" [formField]="signup.email" />
      </tes-form-field>
      <div><button tes-button variant="primary" type="submit">Create account</button></div>
      @if (sent()) {
        <p role="status">Account created for {{ model().email }}.</p>
      }
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SignupForm {
  protected readonly model = signal({ name: '', email: '' });
  protected readonly sent = signal(false);
  protected readonly signup = form(this.model, (p) => {
    required(p.name, { message: 'Enter your name' });
    required(p.email, { message: 'Enter your work email' });
    email(p.email, { message: 'Enter an email address like name@example.com' });
  });
  readonly #messages = computed(() => ({
    name: this.signup.name().errors()[0]?.message,
    email: this.signup.email().errors()[0]?.message,
  }));

  /** Errors show once the field was touched (blur or submit). */
  protected errorOf(field: 'name' | 'email'): string | null {
    return this.signup[field]().touched() ? (this.#messages()[field] ?? null) : null;
  }

  protected send(event: Event): void {
    event.preventDefault();
    void submit(this.signup, () => {
      this.sent.set(true);
      return Promise.resolve();
    });
  }
}

export const WithSignalForms: Story = {
  render: () => ({ moduleMetadata: { imports: [SignupForm] }, template: '<tes-docs-signup />' }),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Create account' }));
    const email = canvas.getByRole('textbox', { name: /Work email/ });
    await expect(email).toBeInvalid();
    await expect(email).toHaveAccessibleDescription('Enter your work email');

    await userEvent.type(canvas.getByRole('textbox', { name: /Full name/ }), 'Ana Souza');
    await userEvent.type(email, 'ana@acme.com');
    await userEvent.click(canvas.getByRole('button', { name: 'Create account' }));
    await expect(await canvas.findByRole('status')).toHaveTextContent('ana@acme.com');
  },
};
