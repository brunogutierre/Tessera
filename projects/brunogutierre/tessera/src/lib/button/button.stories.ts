import { argsToTemplate, moduleMetadata } from '@storybook/angular-vite';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect, fn } from 'storybook/test';
import { TesIcon } from '../icon/icon';
import { TesButton } from './button';

type Args = TesButton & { clicked: () => void };

const meta: Meta<Args> = {
  title: 'Components/Button',
  component: TesButton,
  decorators: [moduleMetadata({ imports: [TesIcon] })],
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    clicked: { table: { disable: true } },
  },
  args: { variant: 'primary', size: 'md', loading: false, iconOnly: false, clicked: fn() },
  render: ({ clicked, ...args }) => ({
    props: { ...args, clicked },
    template: `<button tes-button ${argsToTemplate(args)} (click)="clicked()">Save changes</button>`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'Styles a native `<button>` or `<a>`, so `type`, `href`, `disabled`, forms and ARIA keep working. ' +
          '`loading` keeps the button focusable and blocks clicks.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<Args>;

export const Playground: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }));
    await expect(args.clicked).toHaveBeenCalledOnce();
  },
};

export const Variants: Story = {
  render: () => ({
    template: `
      <div class="sb-row">
        <button tes-button variant="primary">Primary</button>
        <button tes-button variant="secondary">Secondary</button>
        <button tes-button variant="outline">Outline</button>
        <button tes-button variant="ghost">Ghost</button>
        <button tes-button variant="danger">Delete</button>
      </div>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="sb-row">
        <button tes-button variant="primary" size="sm">Small</button>
        <button tes-button variant="primary">Medium</button>
        <button tes-button variant="primary" size="lg">Large</button>
      </div>`,
  }),
};

export const WithIcons: Story = {
  render: () => ({
    template: `
      <div class="sb-row">
        <button tes-button variant="primary"><tes-icon name="plus" />New invoice</button>
        <button tes-button variant="outline"><tes-icon name="download" />Export</button>
        <button tes-button variant="ghost">Next<tes-icon name="chevron-right" /></button>
      </div>`,
  }),
};

export const IconOnly: Story = {
  render: () => ({
    template: `
      <div class="sb-row">
        <button tes-button iconOnly size="sm" aria-label="Edit"><tes-icon name="pencil" /></button>
        <button tes-button iconOnly variant="outline" aria-label="Filter"><tes-icon name="filter" /></button>
        <button tes-button iconOnly variant="danger" size="lg" aria-label="Delete"><tes-icon name="trash-2" /></button>
      </div>`,
  }),
};

export const Loading: Story = {
  args: { loading: true },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Save changes' });
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    await expect(args.clicked).not.toHaveBeenCalled();
  },
};

export const Disabled: Story = {
  render: () => ({
    template: `
      <div class="sb-row">
        <button tes-button variant="primary" disabled>Primary</button>
        <button tes-button variant="outline" disabled>Outline</button>
      </div>`,
  }),
};

export const AsLink: Story = {
  render: () => ({
    template: `<a tes-button variant="outline" href="#help"><tes-icon name="info" />Help center</a>`,
  }),
};
