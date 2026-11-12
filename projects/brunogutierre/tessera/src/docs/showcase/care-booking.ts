import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormField, form, required, submit } from '@angular/forms/signals';
import { TesAccordion, TesAccordionItem } from '../../lib/accordion/accordion';
import { TesAutocomplete } from '../../lib/autocomplete/autocomplete';
import { TesAvatar } from '../../lib/avatar/avatar';
import { TesButton } from '../../lib/button/button';
import { TesCard } from '../../lib/card/card';
import { TesCheckbox } from '../../lib/checkbox/checkbox';
import { TesChoice } from '../../lib/choice/choice';
import { TesDatePicker } from '../../lib/date-picker/date-picker';
import { TesFieldset } from '../../lib/fieldset/fieldset';
import { TesFormField } from '../../lib/form-field/form-field';
import { TesInput } from '../../lib/input/input';
import { TesRadio } from '../../lib/radio/radio';
import { TesSelect } from '../../lib/select/select';
import type { TesOption } from '../../lib/select/select';
import { TesToaster } from '../../lib/toast/toast';

interface Booking {
  visit: string;
  specialty: string | null;
  doctor: string | null;
  date: string | null;
  notes: string;
  consent: boolean;
}

const DOCTORS: TesOption[] = [
  { value: 'prado', label: 'Dr. Helena Prado · Cardiology' },
  { value: 'okafor', label: 'Dr. Chidi Okafor · Pediatrics' },
  { value: 'lindqvist', label: 'Dr. Sara Lindqvist · Dermatology' },
  { value: 'tanaka', label: 'Dr. Kenji Tanaka · Orthopedics' },
];

/** Care showcase: a calm, roomy appointment booking form. */
@Component({
  selector: 'tes-showcase-care',
  imports: [
    FormField,
    TesAccordion,
    TesAccordionItem,
    TesAutocomplete,
    TesAvatar,
    TesButton,
    TesCard,
    TesCheckbox,
    TesChoice,
    TesDatePicker,
    TesFieldset,
    TesFormField,
    TesInput,
    TesRadio,
    TesSelect,
  ],
  templateUrl: './care-booking.html',
  styleUrl: './showcase.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareBooking {
  readonly #toaster = inject(TesToaster);
  protected readonly specialties: TesOption[] = [
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'dermatology', label: 'Dermatology' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'orthopedics', label: 'Orthopedics' },
  ];
  protected readonly doctors = DOCTORS;

  protected readonly model = signal<Booking>({
    visit: 'clinic',
    specialty: null,
    doctor: null,
    date: null,
    notes: '',
    consent: false,
  });
  protected readonly booking = form(this.model, (p) => {
    required(p.specialty, { message: 'Choose a specialty' });
    required(p.date, { message: 'Choose a date' });
    required(p.consent, { message: 'Please accept the privacy notice' });
  });

  protected readonly doctorName = computed(
    () => DOCTORS.find((d) => d.value === this.model().doctor)?.label.split(' · ')[0] ?? null,
  );

  protected errorOf(field: 'specialty' | 'date' | 'consent'): string | null {
    const state = this.booking[field]();
    return state.touched() ? (state.errors()[0]?.message ?? null) : null;
  }

  protected send(event: Event): void {
    event.preventDefault();
    void submit(this.booking, () => {
      this.#toaster.show({
        message: 'Appointment requested. We will confirm by email.',
        tone: 'success',
      });
      return Promise.resolve();
    });
  }
}
