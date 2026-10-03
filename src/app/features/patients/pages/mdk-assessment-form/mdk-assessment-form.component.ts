import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { PatientStateService } from '../../services/patient-state.service';
import { MdkAssessment } from '../../models';

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Formular zum Planen eines neuen MD-/MDK-Begutachtungstermins für einen Patienten. */
@Component({
  selector: 'app-mdk-assessment-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, DatePickerModule, TextareaModule],
  templateUrl: './mdk-assessment-form.component.html',
  styleUrl: './mdk-assessment-form.component.scss'
})
export class MdkAssessmentFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly patientState = inject(PatientStateService);

  readonly patientId = input.required<string>();
  readonly save = output<void>();
  readonly cancel = output<void>();

  readonly form = this.fb.nonNullable.group({
    scheduledDate: this.fb.control<Date | null>(null, Validators.required),
    assessorOrganization: ['', Validators.required],
    reason: ['Höherstufungsantrag', Validators.required],
    note: ['']
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const assessment: MdkAssessment = {
      id: crypto.randomUUID(),
      patientId: this.patientId(),
      scheduledDate: toIso(value.scheduledDate as Date),
      status: 'GEPLANT',
      assessorOrganization: value.assessorOrganization,
      reason: value.reason,
      note: value.note || undefined
    };

    this.patientState.scheduleMdkAssessment(assessment);
    this.save.emit();
  }
}
