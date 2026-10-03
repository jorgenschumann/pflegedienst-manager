import { Component, computed, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { HrStateService } from '../../services/hr-state.service';
import { Absence, AbsenceType } from '../../models';

interface SelectOption<T> {
  label: string;
  value: T;
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Formular zum Beantragen einer Abwesenheit (Urlaub, Krankheit, Fortbildung, Sonstiges). */
@Component({
  selector: 'app-absence-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, SelectModule, DatePickerModule, TextareaModule],
  templateUrl: './absence-form.component.html',
  styleUrl: './absence-form.component.scss'
})
export class AbsenceFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly hrState = inject(HrStateService);

  /** Vorausgewählte/r Mitarbeiter/-in (z. B. aus dem Mitarbeiter-Detail heraus), sonst frei wählbar. */
  readonly defaultEmployeeId = input<string | null>(null);

  readonly save = output<Absence>();
  readonly cancel = output<void>();

  readonly typeOptions: SelectOption<AbsenceType>[] = [
    { label: 'Urlaub', value: 'URLAUB' },
    { label: 'Krankheit', value: 'KRANKHEIT' },
    { label: 'Fortbildung', value: 'FORTBILDUNG' },
    { label: 'Sonstiges', value: 'SONSTIGES' }
  ];

  readonly employeeOptions = computed<SelectOption<string>[]>(() =>
    this.hrState
      .employees()
      .filter((e) => e.active)
      .map((e) => ({ label: `${e.firstName} ${e.lastName}`, value: e.id }))
  );

  readonly form = this.fb.nonNullable.group({
    employeeId: ['', Validators.required],
    type: this.fb.nonNullable.control<AbsenceType>('URLAUB', Validators.required),
    startDate: this.fb.control<Date | null>(null, Validators.required),
    endDate: this.fb.control<Date | null>(null, Validators.required),
    note: ['']
  });

  constructor() {
    effect(() => {
      const employeeId = this.defaultEmployeeId();
      if (employeeId) {
        this.form.patchValue({ employeeId });
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const start = value.startDate as Date;
    const end = value.endDate as Date;
    if (end < start) return;

    const days = Math.round((toDateOnly(end).getTime() - toDateOnly(start).getTime()) / 86_400_000) + 1;

    const absence: Absence = {
      id: crypto.randomUUID(),
      employeeId: value.employeeId,
      type: value.type,
      status: 'BEANTRAGT',
      startDate: toIso(start),
      endDate: toIso(end),
      days,
      note: value.note || undefined,
      requestedAt: new Date().toISOString()
    };

    this.save.emit(absence);
  }
}

function toDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
