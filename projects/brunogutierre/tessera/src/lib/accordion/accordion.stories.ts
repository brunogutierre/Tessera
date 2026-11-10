import { moduleMetadata } from '@storybook/angular-vite';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { expect } from 'storybook/test';
import { TesAccordion, TesAccordionItem } from './accordion';

const meta: Meta<TesAccordion> = {
  title: 'Components/Accordion',
  component: TesAccordion,
  subcomponents: { TesAccordionItem },
  decorators: [moduleMetadata({ imports: [TesAccordionItem] })],
  render: () => ({
    template: `
      <tes-accordion style="max-inline-size: 36rem">
        <tes-accordion-item heading="How are fees calculated?" [expanded]="true">
          A flat 0.25% per settled transfer, billed monthly. There are no fees for failed transfers.
        </tes-accordion-item>
        <tes-accordion-item heading="When do transfers settle?">
          Domestic transfers settle the same business day; international ones in one to three days.
        </tes-accordion-item>
        <tes-accordion-item heading="Can I cancel a scheduled transfer?">
          Yes, until 17:00 UTC on the business day before it settles.
        </tes-accordion-item>
        <tes-accordion-item heading="Dedicated account manager" disabled>
          Available on the Enterprise plan.
        </tes-accordion-item>
      </tes-accordion>`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'Accordion over `@angular/aria/accordion`: headings (level 3 by default) with buttons; Enter and Space ' +
          'toggle, arrows, Home and End move. Opening one closes the others unless `multi`. Content is rendered ' +
          'only while expanded.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<TesAccordion>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const second = canvas.getByRole('button', { name: 'When do transfers settle?' });
    await userEvent.click(second);
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('button', { name: 'How are fees calculated?' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  },
};

export const Multiple: Story = {
  render: () => ({
    template: `
      <tes-accordion multi style="max-inline-size: 36rem">
        <tes-accordion-item heading="Allergies" [expanded]="true">Penicillin.</tes-accordion-item>
        <tes-accordion-item heading="Medications" [expanded]="true">Lisinopril 10 mg daily.</tes-accordion-item>
        <tes-accordion-item heading="Family history">Type 2 diabetes (father).</tes-accordion-item>
      </tes-accordion>`,
  }),
};
