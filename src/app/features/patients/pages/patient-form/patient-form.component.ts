import { Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InsuranceType, Patient, Pflegegrad } from '../../models';

interface PflegegradOption {
  label: string;
  value: Pflegegrad;
}

interface InsuranceTypeOption {
  label: string;
  value: InsuranceType;
}

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, SelectModule, DatePickerModule],
  templateUrl: './patient-form.component.html',
  styleUrl: './patient-form.component.scss'
})
export class PatientFormComponent {
  private readonly fb = inject(FormBuilder);

  /** Übergebener Patient im Bearbeiten-Modus, sonst null für Neuanlage. */
  readonly patient = input<Patient | null>(null);

  readonly save = output<Patient>();
  readonly cancel = output<void>();

  readonly pflegegradOptions: PflegegradOption[] = [
    { label: 'Kein Pflegegrad', value: 0 },
    { label: 'Pflegegrad 1', value: 1 },
    { label: 'Pflegegrad 2', value: 2 },
    { label: 'Pflegegrad 3', value: 3 },
    { label: 'Pflegegrad 4', value: 4 },
    { label: 'Pflegegrad 5', value: 5 }
  ];

  readonly insuranceTypeOptions: InsuranceTypeOption[] = [
    { label: 'Gesetzlich (GKV)', value: 'GKV' },
    { label: 'Privat (PKV)', value: 'PKV' }
  ];

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    dateOfBirth: [new Date(1950, 0, 1), Validators.required],
    street: ['', Validators.required],
    zip: ['', Validators.required],
    city: ['', Validators.required],
    phone: ['', Validators.required],
    insuranceType: this.fb.nonNullable.control<InsuranceType>('GKV', Validators.required),
    insuranceProviderName: ['', Validators.required],
    insuranceNumber: ['', Validators.required],
    pflegegrad: this.fb.nonNullable.control<Pflegegrad>(0, Validators.required),
    emergencyContactName: ['', Validators.required],
    emergencyContactRelationship: ['', Validators.required],
    emergencyContactPhone: ['', Validators.required]
  });

  constructor() {
    effect(() => {
      const current = this.patient();
      if (current) {
        this.form.patchValue({
          firstName: current.firstName,
          lastName: current.lastName,
          dateOfBirth: new Date(current.dateOfBirth),
          street: current.address.street,
          zip: current.address.zip,
          city: current.address.city,
          phone: current.phone,
          insuranceType: current.insurance.type,
          insuranceProviderName: current.insurance.providerName,
          insuranceNumber: current.insurance.insuranceNumber,
          pflegegrad: current.pflegegrad,
          emergencyContactName: current.emergencyContact.name,
          emergencyContactRelationship: current.emergencyContact.relationship,
          emergencyContactPhone: current.emergencyContact.phone
        });
      } else {
        this.form.reset({
          firstName: '',
          lastName: '',
          dateOfBirth: new Date(1950, 0, 1),
          street: '',
          zip: '',
          city: '',
          phone: '',
          insuranceType: 'GKV',
          insuranceProviderName: '',
          insuranceNumber: '',
          pflegegrad: 0,
          emergencyContactName: '',
          emergencyContactRelationship: '',
          emergencyContactPhone: ''
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
    const existing = this.patient();

    const result: Patient = {
      id: existing?.id ?? crypto.randomUUID(),
      firstName: value.firstName,
      lastName: value.lastName,
      dateOfBirth: value.dateOfBirth.toISOString().slice(0, 10),
      address: { street: value.street, zip: value.zip, city: value.city },
      phone: value.phone,
      insurance: {
        type: value.insuranceType,
        providerName: value.insuranceProviderName,
        insuranceNumber: value.insuranceNumber
      },
      pflegegrad: value.pflegegrad,
      pflegegradSince: existing?.pflegegradSince ?? (value.pflegegrad > 0 ? new Date().toISOString().slice(0, 10) : undefined),
      legalRepresentative: existing?.legalRepresentative,
      emergencyContact: {
        name: value.emergencyContactName,
        relationship: value.emergencyContactRelationship,
        phone: value.emergencyContactPhone
      },
      assignedTourIds: existing?.assignedTourIds ?? [],
      active: existing?.active ?? true,
      admittedAt: existing?.admittedAt ?? new Date().toISOString().slice(0, 10)
    };

    this.save.emit(result);
  }
}
