import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { PatientStateService } from '../../services/patient-state.service';
import { ALL_POWER_OF_ATTORNEY_TYPES, Contact, POWER_OF_ATTORNEY_LABELS, PowerOfAttorneyType } from '../../models';

interface SelectOption<T> {
  label: string;
  value: T;
}

/** Formular zum Anlegen/Bearbeiten eines Angehörigen-/Kontakteintrags inkl. Vollmachten. */
@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, CheckboxModule, MultiSelectModule, TextareaModule],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss'
})
export class ContactFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly patientState = inject(PatientStateService);

  readonly patientId = input.required<string>();
  readonly contact = input<Contact | null>(null);
  readonly save = output<void>();
  readonly cancel = output<void>();

  readonly poaOptions: SelectOption<PowerOfAttorneyType>[] = ALL_POWER_OF_ATTORNEY_TYPES.map((value) => ({
    label: POWER_OF_ATTORNEY_LABELS[value],
    value
  }));

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    relationship: ['', Validators.required],
    phone: ['', Validators.required],
    email: [''],
    isEmergencyContact: [false],
    powersOfAttorney: this.fb.nonNullable.control<PowerOfAttorneyType[]>([]),
    documentOnFile: [false],
    notes: ['']
  });

  constructor() {
    const existing = this.contact();
    if (existing) {
      this.form.patchValue({
        name: existing.name,
        relationship: existing.relationship,
        phone: existing.phone,
        email: existing.email ?? '',
        isEmergencyContact: existing.isEmergencyContact,
        powersOfAttorney: existing.powersOfAttorney,
        documentOnFile: existing.documentOnFile,
        notes: existing.notes ?? ''
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const existing = this.contact();
    const result: Contact = {
      id: existing?.id ?? crypto.randomUUID(),
      patientId: this.patientId(),
      name: value.name,
      relationship: value.relationship,
      phone: value.phone,
      email: value.email || undefined,
      isEmergencyContact: value.isEmergencyContact,
      powersOfAttorney: value.powersOfAttorney,
      documentOnFile: value.documentOnFile,
      notes: value.notes || undefined
    };

    this.patientState.upsertContact(result);
    this.save.emit();
  }
}
