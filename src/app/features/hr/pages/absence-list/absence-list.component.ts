import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { HrStateService } from '../../services/hr-state.service';
import { Absence, AbsenceStatus, AbsenceType, Employee } from '../../models';
import { AbsenceFormComponent } from '../absence-form/absence-form.component';

interface SelectOption<T> {
  label: string;
  value: T;
}

const TYPE_LABELS: Record<AbsenceType, string> = {
  URLAUB: 'Urlaub',
  KRANKHEIT: 'Krankheit',
  FORTBILDUNG: 'Fortbildung',
  SONSTIGES: 'Sonstiges'
};

const STATUS_LABELS: Record<AbsenceStatus, string> = {
  BEANTRAGT: 'Beantragt',
  GENEHMIGT: 'Genehmigt',
  ABGELEHNT: 'Abgelehnt',
  STORNIERT: 'Storniert'
};

/** Verwaltung aller Abwesenheiten (Urlaub, Krankheit, Fortbildung, Sonstiges) mit Genehmigungs-Workflow. */
@Component({
  selector: 'app-absence-list',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    ToolbarModule,
    DialogModule,
    SelectModule,
    TooltipModule,
    AbsenceFormComponent
  ],
  templateUrl: './absence-list.component.html',
  styleUrl: './absence-list.component.scss'
})
export class AbsenceListComponent {
  private readonly hrState = inject(HrStateService);

  readonly employees = this.hrState.employees;

  readonly statusFilter = signal<AbsenceStatus | 'ALLE'>('ALLE');
  readonly typeFilter = signal<AbsenceType | 'ALLE'>('ALLE');

  readonly dialogVisible = signal(false);

  readonly statusOptions: SelectOption<AbsenceStatus | 'ALLE'>[] = [
    { label: 'Alle Status', value: 'ALLE' },
    { label: 'Beantragt', value: 'BEANTRAGT' },
    { label: 'Genehmigt', value: 'GENEHMIGT' },
    { label: 'Abgelehnt', value: 'ABGELEHNT' },
    { label: 'Storniert', value: 'STORNIERT' }
  ];

  readonly typeOptions: SelectOption<AbsenceType | 'ALLE'>[] = [
    { label: 'Alle Arten', value: 'ALLE' },
    { label: 'Urlaub', value: 'URLAUB' },
    { label: 'Krankheit', value: 'KRANKHEIT' },
    { label: 'Fortbildung', value: 'FORTBILDUNG' },
    { label: 'Sonstiges', value: 'SONSTIGES' }
  ];

  private readonly employeeById = computed<Map<string, Employee>>(
    () => new Map(this.employees().map((e) => [e.id, e]))
  );

  /** Erste aktive Teamleitung als Platzhalter für die entscheidende Person (kein Auth-System vorhanden). */
  private readonly currentApprover = computed(
    () => this.employees().find((e) => e.role === 'TEAMLEITUNG' && e.active) ?? null
  );

  readonly rows = computed(() => {
    const status = this.statusFilter();
    const type = this.typeFilter();
    const byId = this.employeeById();

    return this.hrState
      .absences()
      .filter((a) => status === 'ALLE' || a.status === status)
      .filter((a) => type === 'ALLE' || a.type === type)
      .map((a) => ({
        absence: a,
        employeeName: this.formatName(byId.get(a.employeeId)),
        decidedByName: a.decidedBy ? this.formatName(byId.get(a.decidedBy)) : '–'
      }))
      .sort((a, b) => b.absence.requestedAt.localeCompare(a.absence.requestedAt));
  });

  readonly pendingCount = computed(
    () => this.hrState.absences().filter((a) => a.status === 'BEANTRAGT').length
  );

  private formatName(employee: Employee | undefined): string {
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unbekannt';
  }

  typeLabel(type: AbsenceType): string {
    return TYPE_LABELS[type];
  }

  statusLabel(status: AbsenceStatus): string {
    return STATUS_LABELS[status];
  }

  statusSeverity(status: AbsenceStatus): 'success' | 'info' | 'danger' | 'warn' | 'secondary' {
    switch (status) {
      case 'GENEHMIGT':
        return 'success';
      case 'BEANTRAGT':
        return 'warn';
      case 'ABGELEHNT':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  isFuture(dateIso: string): boolean {
    return dateIso >= new Date().toISOString().slice(0, 10);
  }

  openNew(): void {
    this.dialogVisible.set(true);
  }

  onSaved(absence: Absence): void {
    this.hrState.requestAbsence(absence);
    this.dialogVisible.set(false);
  }

  approve(absence: Absence): void {
    this.hrState.decideAbsence(absence.id, 'GENEHMIGT', this.currentApprover()?.id ?? 'teamleitung');
  }

  reject(absence: Absence): void {
    this.hrState.decideAbsence(absence.id, 'ABGELEHNT', this.currentApprover()?.id ?? 'teamleitung');
  }

  cancel(absence: Absence): void {
    this.hrState.cancelAbsence(absence.id);
  }
}
