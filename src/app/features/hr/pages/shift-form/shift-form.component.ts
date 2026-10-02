import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { Employee, Shift, ShiftType } from '../../models';

export interface ShiftFormValue {
  employeeId: string;
  tourId?: string;
  type: ShiftType;
  date: string;
  startTime: string;
  endTime: string;
}

interface ShiftTypeOption {
  label: string;
  value: ShiftType;
}

const SHIFT_TYPE_DEFAULT_TIMES: Record<ShiftType, { start: string; end: string }> = {
  FRUEHDIENST: { start: '06:30', end: '14:00' },
  SPAETDIENST: { start: '14:00', end: '21:00' },
  NACHTDIENST: { start: '21:00', end: '06:30' },
  BEREITSCHAFT: { start: '00:00', end: '23:59' }
};

@Component({
  selector: 'app-shift-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, SelectModule, DatePickerModule],
  templateUrl: './shift-form.component.html',
  styleUrl: './shift-form.component.scss'
})
export class ShiftFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly shift = input<Shift | null>(null);
  readonly prefilledDate = input<string | null>(null);
  readonly prefilledEmployeeId = input<string | null>(null);
  readonly prefilledStartTime = input<string | null>(null);
  readonly employees = input<Employee[]>([]);

  readonly save = output<ShiftFormValue>();
  readonly delete = output<void>();
  readonly cancel = output<void>();

  readonly shiftTypeOptions: ShiftTypeOption[] = [
    { label: 'Frühdienst', value: 'FRUEHDIENST' },
    { label: 'Spätdienst', value: 'SPAETDIENST' },
    { label: 'Nachtdienst', value: 'NACHTDIENST' },
    { label: 'Bereitschaft', value: 'BEREITSCHAFT' }
  ];

  readonly employeeOptions = () =>
    this.employees().map((e) => ({ label: `${e.firstName} ${e.lastName}`, value: e.id }));

  readonly form = this.fb.nonNullable.group({
    employeeId: ['', Validators.required],
    type: this.fb.nonNullable.control<ShiftType>('FRUEHDIENST', Validators.required),
    date: [new Date(), Validators.required],
    startTime: ['06:30', Validators.required],
    endTime: ['14:00', Validators.required]
  });

  constructor() {
    effect(() => {
      const current = this.shift();
      const prefilled = this.prefilledDate();

      if (current) {
        this.form.patchValue({
          employeeId: current.employeeId,
          type: current.type,
          date: new Date(current.date),
          startTime: current.startTime,
          endTime: current.endTime
        });
      } else {
        const date = prefilled ? new Date(prefilled) : new Date();
        const employeeId = this.prefilledEmployeeId() ?? '';
        const startTime = this.prefilledStartTime() ?? '06:30';
        const defaultType: ShiftType = 'FRUEHDIENST';
        const endTime = this.prefilledStartTime()
          ? this.addMinutes(startTime, 7 * 60 + 30)
          : SHIFT_TYPE_DEFAULT_TIMES[defaultType].end;
        this.form.reset({
          employeeId,
          type: defaultType,
          date,
          startTime,
          endTime
        });
      }
    });

    // Bei Schichttyp-Wechsel die üblichen Start-/Endzeiten vorschlagen.
    this.form.controls.type.valueChanges.subscribe((type) => {
      const defaults = SHIFT_TYPE_DEFAULT_TIMES[type];
      this.form.patchValue({ startTime: defaults.start, endTime: defaults.end });
    });
  }

  private addMinutes(time: string, minutesToAdd: number): string {
    const [h, m] = time.split(':').map(Number);
    const total = (h * 60 + m + minutesToAdd) % (24 * 60);
    const hours = Math.floor(total / 60)
      .toString()
      .padStart(2, '0');
    const minutes = (total % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.save.emit({
      employeeId: value.employeeId,
      type: value.type,
      date: value.date.toISOString().slice(0, 10),
      startTime: value.startTime,
      endTime: value.endTime
    });
  }
}
