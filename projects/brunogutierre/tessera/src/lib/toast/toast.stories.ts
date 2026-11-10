import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect, within } from 'storybook/test';
import { TesButton } from '../button/button';
import { TesToastStack, TesToaster } from './toast';

@Component({
  selector: 'tes-docs-toast-launcher',
  imports: [TesButton],
  template: `
    <div class="sb-row">
      <button tes-button variant="outline" (click)="success()">Send invoice</button>
      <button tes-button variant="outline" (click)="undo()">Archive invoice</button>
      <button tes-button variant="outline" (click)="failure()">Retry transfer</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Launcher {
  readonly #toaster = inject(TesToaster);

  protected success(): void {
    this.#toaster.show({ message: 'Invoice INV-2026-0184 sent to Acme Corp.', tone: 'success' });
  }

  protected undo(): void {
    this.#toaster.show({
      message: 'Invoice archived.',
      action: { label: 'Undo', run: () => undefined },
    });
  }

  protected failure(): void {
    this.#toaster.show({ message: 'The receiving bank rejected the transfer.', tone: 'danger' });
  }
}

const meta: Meta = {
  title: 'Components/Toast',
  component: TesToastStack,
  render: () => ({
    moduleMetadata: { imports: [Launcher] },
    template: '<tes-docs-toast-launcher />',
  }),
  parameters: {
    docs: {
      description: {
        component:
          '`TesToaster.show({ message, tone, action, duration })`: brief messages stacked at the inline-end ' +
          'bottom of the page in a "Notifications" region. Each one is announced through the CDK LiveAnnouncer ' +
          '(errors assertively); countdowns pause while the pointer or focus is on the stack, and a toast with ' +
          'an action never times out.',
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Archive invoice' }));
    const page = within(canvasElement.ownerDocument.body);
    const region = await page.findByRole('region', { name: 'Notifications' });
    await expect(region).toHaveTextContent('Invoice archived.');
    await userEvent.click(page.getByRole('button', { name: 'Undo' }));
  },
};
