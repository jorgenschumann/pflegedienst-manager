import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { PatientStateService } from '../../services/patient-state.service';
import {
  Medication,
  MEDICATION_FORM_LABELS,
  MEDICATION_TIME_LABELS,
  MedicationForm,
  MedicationTime
} from '../../models';

interface SelectOption<T> {
  label: string;
  value: T;
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Formular zum Anlegen eines neuen Medikamentenplan-Eintrags für einen Patienten. */
@Component({
  selector: 'app-medication-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    CheckboxModule,
    DatePickerModule,
    TextareaModule
  ],
  templateUrl: './medication-form.component.html',
  styleUrl: './medication-form.component.scss'
})
export class MedicationFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly patientState = inject(PatientStateService);

  readonly patientId = input.required<string>();
  readonly save = output<void>();
  readonly cancel = output<void>();

  readonly formOptions: SelectOption<MedicationForm>[] = (
    Object.keys(MEDICATION_FORM_LABELS) as MedicationForm[]
  ).map((value) => ({ label: MEDICATION_FORM_LABELS[value], value }));

  readonly timeOptions: SelectOption<MedicationTime>[] = (
    Object.keys(MEDICATION_TIME_LABELS) as MedicationTime[]
  ).map((value) => ({ label: MEDICATION_TIME_LABELS[value], value }));

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    dosage: ['', Validators.required],
    form: this.fb.nonNullable.control<MedicationForm>('TABLETTE', Validators.required),
    schedule: this.fb.nonNullable.control<MedicationTime[]>([], Validators.required),
    isBtm: [false],
    instructions: [''],
    startDate: this.fb.control<Date | null>(new Date(), Validators.required),
    supplyUntil: this.fb.control<Date | null>(null),
    prescribedBy: [''],
    note: ['']
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const medication: Medication = {
      id: crypto.randomUUID(),
      patientId: this.patientId(),
      name: value.name,
      dosage: value.dosage,
      form: value.form,
      schedule: value.schedule,
      isBtm: value.isBtm,
      instructions: value.instructions || undefined,
      startDate: toIso(value.startDate as Date),
      supplyUntil: value.supplyUntil ? toIso(value.supplyUntil) : undefined,
      prescribedBy: value.prescribedBy || undefined,
      note: value.note || undefined,
      active: true
    };

    this.patientState.addMedication(medication);
    this.save.emit();
  }
}
