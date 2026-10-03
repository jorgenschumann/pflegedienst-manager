import { Component, computed, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { PatientStateService } from '../../services/patient-state.service';
import { HrStateService } from '../../../hr/services/hr-state.service';
import {
  MEDICATION_ADMINISTRATION_STATUS_LABELS,
  MEDICATION_TIME_LABELS,
  MedicationAdministration,
  MedicationAdministrationStatus,
  MedicationTime
} from '../../models';

interface SelectOption<T> {
  label: string;
  value: T;
}

/** Formular zur Protokollierung einer einzelnen Medikamentengabe (digitale Bestätigung). */
@Component({
  selector: 'app-medication-administration',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, SelectModule, TextareaModule],
  templateUrl: './medication-administration.component.html',
  styleUrl: './medication-administration.component.scss'
})
export class MedicationAdministrationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly patientState = inject(PatientStateService);
  private readonly hrState = inject(HrStateService);

  readonly patientId = input.required<string>();
  readonly save = output<void>();
  readonly cancel = output<void>();

  readonly medicationOptions = computed<SelectOption<string>[]>(() =>
    this.patientState.getActiveMedications(this.patientId()).map((m) => ({
      label: `${m.name} (${m.dosage})`,
      value: m.id
    }))
  );

  readonly timeOptions: SelectOption<MedicationTime>[] = (
    Object.keys(MEDICATION_TIME_LABELS) as MedicationTime[]
  ).map((value) => ({ label: MEDICATION_TIME_LABELS[value], value }));

  readonly statusOptions: SelectOption<MedicationAdministrationStatus>[] = (
    Object.keys(MEDICATION_ADMINISTRATION_STATUS_LABELS) as MedicationAdministrationStatus[]
  ).map((value) => ({ label: MEDICATION_ADMINISTRATION_STATUS_LABELS[value], value }));

  readonly employeeOptions = computed<SelectOption<string>[]>(() =>
    this.hrState
      .employees()
      .filter((e) => e.active)
      .map((e) => ({ label: `${e.firstName} ${e.lastName}`, value: `${e.firstName} ${e.lastName}` }))
  );

  readonly form = this.fb.nonNullable.group({
    medicationId: ['', Validators.required],
    scheduledTime: this.fb.nonNullable.control<MedicationTime>('MORGENS', Validators.required),
    status: this.fb.nonNullable.control<MedicationAdministrationStatus>('GEGEBEN', Validators.required),
    confirmedBy: ['', Validators.required],
    secondConfirmedBy: [''],
    note: ['']
  });

  private readonly selectedMedicationId = toSignal(this.form.controls.medicationId.valueChanges, {
    initialValue: ''
  });

  /** Ausgewähltes Medikament erfordert Vier-Augen-Prinzip (BTM) – zweite Bestätigung verpflichtend. */
  readonly requiresSecondConfirmation = computed(() => {
    const medications = this.patientState.getActiveMedications(this.patientId());
    return medications.find((m) => m.id === this.selectedMedicationId())?.isBtm ?? false;
  });

  readonly secondConfirmerOptions = computed<SelectOption<string>[]>(() =>
    this.hrState
      .employees()
      .filter((e) => e.active)
      .map((e) => ({ label: `${e.firstName} ${e.lastName}`, value: `${e.firstName} ${e.lastName}` }))
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.requiresSecondConfirmation() && !this.form.controls.secondConfirmedBy.value) {
      this.form.controls.secondConfirmedBy.setErrors({ required: true });
      this.form.controls.secondConfirmedBy.markAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const administration: MedicationAdministration = {
      id: crypto.randomUUID(),
      medicationId: value.medicationId,
      patientId: this.patientId(),
      scheduledTime: value.scheduledTime,
      administeredAt: new Date().toISOString(),
      status: value.status,
      confirmedBy: value.confirmedBy,
      secondConfirmedBy: value.secondConfirmedBy || undefined,
      note: value.note || undefined
    };

    this.patientState.recordMedicationAdministration(administration);
    this.save.emit();
  }
}
