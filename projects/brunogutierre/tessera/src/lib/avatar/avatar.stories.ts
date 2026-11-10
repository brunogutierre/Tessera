import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { TesAvatar } from './avatar';

/** An inline SVG portrait placeholder, so stories need no network. */
const PICTURE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#94a3b8"/><circle cx="32" cy="26" r="12" fill="#e2e8f0"/><path d="M10 64c2-14 12-20 22-20s20 6 22 20z" fill="#e2e8f0"/></svg>`,
  );

const meta: Meta<TesAvatar> = {
  title: 'Components/Avatar',
  component: TesAvatar,
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  args: { name: 'Ana Souza', size: 'md', decorative: false },
  parameters: {
    docs: {
      description: {
        component:
          'Picture or initials. Named by `name` (`role="img"`), or `decorative` when the name is ' +
          'already visible. A picture that fails to load falls back to initials.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesAvatar>;

export const Playground: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Ana Souza' })).toHaveTextContent('AS');
  },
};

export const WithPicture: Story = { args: { src: PICTURE } };

export const BrokenPicture: Story = {
  args: { src: 'data:image/png;base64,broken', name: 'Carlos Lima' },
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="sb-row">
        <tes-avatar size="sm" name="Ana Souza" />
        <tes-avatar name="Bruno Gutierre" />
        <tes-avatar size="lg" name="Carla Dias" />
      </div>`,
  }),
};

export const WithName: Story = {
  render: () => ({
    template: `
      <div class="sb-row">
        <tes-avatar name="Dr. Helena Prado" decorative />
        <div><strong>Dr. Helena Prado</strong><br />Cardiology</div>
      </div>`,
  }),
};
