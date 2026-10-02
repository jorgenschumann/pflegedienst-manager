import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { PatientStateService } from '../../services/patient-state.service';
import { Patient } from '../../models';
import { PatientFormComponent } from '../patient-form/patient-form.component';

type StatusFilter = 'ALLE' | 'AKTIV' | 'INAKTIV';

interface SelectOption<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    ToolbarModule,
    DialogModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    PatientFormComponent
  ],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss'
})
export class PatientListComponent {
  private readonly patientState = inject(PatientStateService);
  private readonly router = inject(Router);

  readonly patients = this.patientState.patients;

  readonly dialogVisible = signal(false);
  readonly editingPatient = signal<Patient | null>(null);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<StatusFilter>('ALLE');
  readonly pflegegradFilter = signal<number | null>(null);

  readonly statusOptions: SelectOption<StatusFilter>[] = [
    { label: 'Alle', value: 'ALLE' },
    { label: 'Aktiv', value: 'AKTIV' },
    { label: 'Inaktiv', value: 'INAKTIV' }
  ];

  readonly pflegegradOptions: SelectOption<number | null>[] = [
    { label: 'Alle Pflegegrade', value: null },
    { label: 'Kein PG', value: 0 },
    { label: 'PG 1', value: 1 },
    { label: 'PG 2', value: 2 },
    { label: 'PG 3', value: 3 },
    { label: 'PG 4', value: 4 },
    { label: 'PG 5', value: 5 }
  ];

  readonly filteredPatients = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    const pflegegrad = this.pflegegradFilter();

    return this.patients().filter((p) => {
      if (status === 'AKTIV' && !p.active) return false;
      if (status === 'INAKTIV' && p.active) return false;
      if (pflegegrad !== null && p.pflegegrad !== pflegegrad) return false;
      if (term) {
        const haystack =
          `${p.firstName} ${p.lastName} ${p.address.street} ${p.address.zip} ${p.address.city} ${p.insurance.providerName}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  });

  resetFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('ALLE');
    this.pflegegradFilter.set(null);
  }

  openNew(): void {
    this.editingPatient.set(null);
    this.dialogVisible.set(true);
  }

  edit(patient: Patient, event: Event): void {
    event.stopPropagation();
    this.editingPatient.set(patient);
    this.dialogVisible.set(true);
  }

  deactivate(patient: Patient, event: Event): void {
    event.stopPropagation();
    this.patientState.deactivatePatient(patient.id);
  }

  openDetail(patient: Patient): void {
    this.router.navigate(['/patienten', patient.id]);
  }

  onSaved(patient: Patient): void {
    if (this.editingPatient()) {
      this.patientState.updatePatient(patient.id, patient);
    } else {
      this.patientState.addPatient(patient);
    }
    this.dialogVisible.set(false);
  }

  pflegegradSeverity(grad: number): 'success' | 'info' | 'warn' | 'danger' {
    if (grad <= 1) return 'success';
    if (grad <= 3) return 'info';
    if (grad === 4) return 'warn';
    return 'danger';
  }

  age(dateOfBirth: string): number {
    const dob = new Date(dateOfBirth);
    const diff = Date.now() - dob.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }
}
