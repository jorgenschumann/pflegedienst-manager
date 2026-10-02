import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { Employee, EmploymentType } from '../../models';

interface RoleOption {
  label: string;
  value: Employee['role'];
}

interface EmploymentTypeOption {
  label: string;
  value: EmploymentType;
}

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, SelectModule, InputNumberModule],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss'
})
export class EmployeeFormComponent {
  private readonly fb = inject(FormBuilder);

  /** Übergebener Mitarbeiter im Bearbeiten-Modus, sonst null für Neuanlage. */
  readonly employee = input<Employee | null>(null);

  readonly save = output<Employee>();
  readonly cancel = output<void>();

  readonly roleOptions: RoleOption[] = [
    { label: 'Pflegefachkraft', value: 'PFLEGEFACHKRAFT' },
    { label: 'Pflegehelfer', value: 'PFLEGEHELFER' },
    { label: 'Teamleitung', value: 'TEAMLEITUNG' },
    { label: 'Verwaltung', value: 'VERWALTUNG' }
  ];

  readonly employmentTypeOptions: EmploymentTypeOption[] = [
    { label: 'Vollzeit', value: 'VOLLZEIT' },
    { label: 'Teilzeit', value: 'TEILZEIT' },
    { label: 'Minijob', value: 'MINIJOB' },
    { label: 'Aushilfe', value: 'AUSHILFE' }
  ];

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    role: this.fb.nonNullable.control<Employee['role']>('PFLEGEFACHKRAFT', Validators.required),
    employmentType: this.fb.nonNullable.control<EmploymentType>('VOLLZEIT', Validators.required),
    weeklyTargetHours: [38, [Validators.required, Validators.min(1), Validators.max(45)]]
  });

  constructor() {
    // Formular mit vorhandenem Mitarbeiter befüllen, sobald das Input-Signal gesetzt wird.
    effect(() => {
      const current = this.employee();
      if (current) {
        this.form.patchValue({
          firstName: current.firstName,
          lastName: current.lastName,
          email: current.email,
          phone: current.phone,
          role: current.role,
          employmentType: current.contract.employmentType,
          weeklyTargetHours: current.contract.weeklyTargetHours
        });
      } else {
        this.form.reset({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          role: 'PFLEGEFACHKRAFT',
          employmentType: 'VOLLZEIT',
          weeklyTargetHours: 38
        });
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const existing = this.employee();

    const result: Employee = {
      id: existing?.id ?? crypto.randomUUID(),
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email,
      phone: value.phone,
      role: value.role,
      qualifications: existing?.qualifications ?? [],
      contract: {
        weeklyTargetHours: value.weeklyTargetHours,
        employmentType: value.employmentType,
        timeAccountBalanceHours: existing?.contract.timeAccountBalanceHours ?? 0
      },
      assignedTourIds: existing?.assignedTourIds ?? [],
      active: existing?.active ?? true
    };

    this.save.emit(result);
  }
}
