import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect, fn } from 'storybook/test';
import { TesMenu } from './menu';
import type { TesMenuEntry } from './menu';

const ACTIONS: TesMenuEntry[] = [
  { value: 'edit', label: 'Edit invoice', icon: 'pencil' },
  { value: 'download', label: 'Download PDF', icon: 'download' },
  { value: 'remind', label: 'Send reminder', icon: 'bell' },
  { value: 'archive', label: 'Archive', icon: 'folder', disabled: true },
  'separator',
  { value: 'delete', label: 'Delete', icon: 'trash-2', danger: true },
];

type Args = TesMenu & { onSelected: (value: string) => void };

const meta: Meta<Args> = {
  title: 'Components/Menu',
  component: TesMenu,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'outline', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    onSelected: { table: { disable: true } },
  },
  args: { label: 'Actions', items: ACTIONS, variant: 'outline', size: 'md', onSelected: fn() },
  render: (args) => ({
    props: args,
    template: `<tes-menu [label]="label" [items]="items" [variant]="variant" [size]="size" [iconOnly]="iconOnly" [icon]="icon" (selected)="onSelected($event)" />`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'Menu button over `@angular/aria/menu`: Enter, Space or the arrow keys open it; arrows and typeahead ' +
          'move; Escape closes it and focus returns to the button. Items are data (`TesMenuEntry`), with icons, ' +
          'disabled and destructive actions and separators. The panel is an inline CDK popover, so it keeps a ' +
          'scoped theme and is never clipped.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<Args>;

export const Default: Story = {
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Actions' });
    button.focus();
    await userEvent.keyboard('{Enter}');
    const menu = await canvas.findByRole('menu');
    await expect(menu).toBeVisible();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    await expect(args.onSelected).toHaveBeenCalledWith('download');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(canvasElement.ownerDocument.activeElement).toBe(button);
  },
};

export const IconOnly: Story = {
  args: { label: 'More actions', icon: 'ellipsis', iconOnly: true, variant: 'ghost' },
};

export const Open: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Actions' }));
    await expect(await canvas.findByRole('menu')).toBeVisible();
  },
};
