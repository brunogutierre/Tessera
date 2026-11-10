import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';
import { TesButton } from '../button/button';
import { TesFormField } from '../form-field/form-field';
import { TesInput } from '../input/input';
import { TesDialog, TesDialogLayout } from './dialog';

@Component({
  selector: 'tes-docs-delete-dialog',
  imports: [TesDialogLayout, TesButton],
  template: `
    <tes-dialog heading="Delete invoice {{ invoice }}?">
      <p style="margin: 0">
        The invoice and its payment history will be removed. This cannot be undone.
      </p>
      <div tesDialogFooter>
        <button tes-button variant="secondary" (click)="ref.close(false)">Cancel</button>
        <button tes-button variant="danger" (click)="ref.close(true)">Delete invoice</button>
      </div>
    </tes-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DeleteDialog {
  protected readonly invoice = inject<string>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<boolean>>(DialogRef);
}

@Component({
  selector: 'tes-docs-edit-drawer',
  imports: [TesDialogLayout, TesButton, TesFormField, TesInput],
  template: `
    <tes-dialog heading="Edit customer">
      <div class="sb-stack">
        <tes-form-field label="Company name"><input tes-input value="Acme Corp" /></tes-form-field>
        <tes-form-field label="Billing email"
          ><input tes-input type="email" value="ap@acme.example"
        /></tes-form-field>
        <tes-form-field label="Notes" optional><textarea tes-input></textarea></tes-form-field>
      </div>
      <div tesDialogFooter>
        <button tes-button variant="secondary" (click)="ref.close()">Cancel</button>
        <button tes-button variant="primary" (click)="ref.close()">Save changes</button>
      </div>
    </tes-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class EditDrawer {
  protected readonly ref = inject(DialogRef);
}

@Component({
  selector: 'tes-docs-dialog-launcher',
  imports: [TesButton],
  template: `
    <div class="sb-row">
      <button tes-button variant="danger" (click)="confirm()">Delete invoice…</button>
      <button tes-button variant="outline" (click)="edit()">Edit customer…</button>
    </div>
    <p role="status">{{ result() }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Launcher {
  readonly #dialog = inject(TesDialog);
  protected readonly result = signal('');

  protected confirm(): void {
    this.#dialog
      .open<boolean, string>(DeleteDialog, {
        data: 'INV-2026-0184',
        role: 'alertdialog',
        size: 'sm',
      })
      .closed.subscribe((deleted) => {
        this.result.set(deleted ? 'Invoice deleted.' : 'Nothing was deleted.');
      });
  }

  protected edit(): void {
    this.#dialog.open(EditDrawer, { drawer: true });
  }
}

const meta: Meta = {
  title: 'Components/Dialog',
  component: TesDialogLayout,
  render: () => ({
    moduleMetadata: { imports: [Launcher] },
    template: '<tes-docs-dialog-launcher />',
  }),
  parameters: {
    docs: {
      description: {
        component:
          '`TesDialog.open(Component, options)` opens a modal dialog or a drawer (CDK Dialog: focus trap, focus ' +
          'return, Escape, `aria-modal`). The content uses `<tes-dialog heading>` as its root, which names the ' +
          'dialog and adds the close button. `role: "alertdialog"` is for urgent confirmations: no Escape, no ' +
          'backdrop dismissal.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Confirmation: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Delete invoice…' }));
    const page = within(canvasElement.ownerDocument.body);
    const dialog = await page.findByRole('alertdialog', { name: 'Delete invoice INV-2026-0184?' });
    await expect(dialog).toBeVisible();
    await userEvent.click(page.getByRole('button', { name: 'Cancel' }));
    await expect(await canvas.findByText('Nothing was deleted.')).toBeVisible();
  },
};

export const Drawer: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Edit customer…' }));
    const page = within(canvasElement.ownerDocument.body);
    await expect(await page.findByRole('dialog', { name: 'Edit customer' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};
