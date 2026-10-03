import { Component, computed, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { TourStateService } from '../../services/tour-state.service';
import { LEISTUNG_LABELS, LeistungCode, Tour, VisitStatus } from '../../models';
import { TourEditComponent } from '../tour-edit/tour-edit.component';
import { VisitDocumentationComponent } from '../visit-documentation/visit-documentation.component';

interface SelectOption<T> {
  label: string;
  value: T;
}

type TourStatusFilter = 'ALLE' | Tour['status'];

@Component({
  selector: 'app-touren-plan',
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    TagModule,
    TooltipModule,
    DatePickerModule,
    DialogModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    FormsModule,
    TourEditComponent,
    VisitDocumentationComponent
  ],
  templateUrl: './touren-plan.component.html',
  styleUrl: './touren-plan.component.scss'
})
export class TourenPlanComponent {
  private readonly tourState = inject(TourStateService);

  readonly selectedDate = signal(this.startOfToday());
  readonly leistungLabels = LEISTUNG_LABELS;

  readonly editingTourId = signal<string | null>(null);
  readonly editDialogVisible = computed(() => this.editingTourId() !== null);

  readonly documentingVisitId = signal<string | null>(null);

  readonly searchTerm = signal('');
  readonly employeeFilter = signal<string | null>(null);
  readonly statusFilter = signal<TourStatusFilter>('ALLE');

  readonly statusOptions: SelectOption<TourStatusFilter>[] = [
    { label: 'Alle Status', value: 'ALLE' },
    { label: 'Geplant', value: 'GEPLANT' },
    { label: 'In Arbeit', value: 'IN_ARBEIT' },
    { label: 'Abgeschlossen', value: 'ABGESCHLOSSEN' }
  ];

  readonly employeeOptions = computed<SelectOption<string | null>[]>(() => [
    { label: 'Alle Mitarbeiter/-innen', value: null },
    ...this.tourState.tourPersonal().map((e) => ({ label: `${e.firstName} ${e.lastName}`, value: e.id }))
  ]);

  readonly selectedDateIso = computed(() => this.toIso(this.selectedDate()));

  private readonly toursForDay = computed(() => {
    const iso = this.selectedDateIso();
    return this.tourState
      .tours()
      .filter((t) => t.date === iso)
      .sort((a, b) => this.employeeName(a.employeeId).localeCompare(this.employeeName(b.employeeId)));
  });

  readonly tours = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const employeeId = this.employeeFilter();
    const status = this.statusFilter();

    return this.toursForDay().filter((tour) => {
      if (employeeId && tour.employeeId !== employeeId) return false;
      if (status !== 'ALLE' && tour.status !== status) return false;
      if (term) {
        const visits = this.visitsForTour(tour);
        const haystack = [
          this.employeeName(tour.employeeId),
          ...visits.map((v) => `${this.patientName(v.patientId)} ${this.patientAddress(v.patientId)}`)
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  });

  readonly isWeekend = computed(() => {
    const day = this.selectedDate().getDay();
    return day === 0 || day === 6;
  });

  resetFilters(): void {
    this.searchTerm.set('');
    this.employeeFilter.set(null);
    this.statusFilter.set('ALLE');
  }

  visitsForTour(tour: Tour) {
    return this.tourState.visitsForTour(tour.id);
  }

  tourLabel(tour: Tour): string {
    const prefix = tour.name.split('–')[0].trim();
    return `${prefix} – ${this.employeeName(tour.employeeId)}`;
  }

  routeDistanceLabel(tourId: string): string | null {
    const km = this.tourState.routeDistanceKm(tourId);
    if (km === undefined) return null;
    return `${km.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km Fahrstrecke`;
  }

  optimizeRoute(tourId: string): void {
    this.tourState.optimizeRoute(tourId);
  }

  employeeName(employeeId: string): string {
    const employee = this.tourState.getEmployee(employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unbekannt';
  }

  patientName(patientId: string): string {
    const patient = this.tourState.getPatient(patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unbekannt';
  }

  patientAddress(patientId: string): string {
    const patient = this.tourState.getPatient(patientId);
    return patient ? `${patient.address.street}, ${patient.address.city}` : '';
  }

  leistungLabel(code: LeistungCode): string {
    return this.leistungLabels[code];
  }

  tourStatusSeverity(status: Tour['status']): 'info' | 'success' | 'warn' {
    if (status === 'ABGESCHLOSSEN') return 'success';
    if (status === 'IN_ARBEIT') return 'warn';
    return 'info';
  }

  visitStatusSeverity(status: VisitStatus): 'success' | 'danger' | 'secondary' {
    if (status === 'ERLEDIGT') return 'success';
    if (status === 'AUSGEFALLEN') return 'danger';
    return 'secondary';
  }

  markVisit(visitId: string, status: VisitStatus): void {
    this.tourState.setVisitStatus(visitId, status);
  }

  openDocumentation(visitId: string): void {
    this.documentingVisitId.set(visitId);
  }

  closeDocumentation(): void {
    this.documentingVisitId.set(null);
  }

  openEdit(tourId: string): void {
    this.editingTourId.set(tourId);
  }

  closeEdit(): void {
    this.editingTourId.set(null);
  }

  goToPreviousDay(): void {
    this.shiftDay(-1);
  }

  goToNextDay(): void {
    this.shiftDay(1);
  }

  goToToday(): void {
    this.selectedDate.set(this.startOfToday());
  }

  private shiftDay(offset: number): void {
    const d = new Date(this.selectedDate());
    d.setDate(d.getDate() + offset);
    this.selectedDate.set(d);
  }

  private startOfToday(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private toIso(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
