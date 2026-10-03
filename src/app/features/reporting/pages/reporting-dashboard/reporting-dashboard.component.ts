import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { HrStateService } from '../../../hr/services/hr-state.service';
import { Employee } from '../../../hr/models';
import { TourStateService } from '../../../touren/services/tour-state.service';
import { Visit } from '../../../touren/models';

interface EmployeeUtilisationRow {
  employeeId: string;
  name: string;
  roleLabel: string;
  tourCount: number;
  total: number;
  erledigt: number;
  ausgefallen: number;
  offen: number;
  completionRate: number; // 0-100, bezogen auf bereits fällige Besuche (erledigt+ausgefallen)
}

interface RoleShiftRow {
  role: Employee['role'];
  roleLabel: string;
  employeeCount: number;
  shiftsTotal: number;
  bestaetigt: number;
  entfallen: number;
  vertretung: number;
}

interface DocumentedVisitRow {
  visitId: string;
  dateIso: string;
  patientName: string;
  employeeName: string;
  status: Visit['status'];
  detail: string;
}

const ROLE_LABELS: Record<Employee['role'], string> = {
  PFLEGEFACHKRAFT: 'Pflegefachkraft',
  PFLEGEHELFER: 'Pflegehelfer',
  ERGAENZENDE_HILFE: 'Ergänzende Hilfe',
  TEAMLEITUNG: 'Teamleitung',
  VERWALTUNG: 'Verwaltung'
};

const ABSENCE_TYPE_LABELS: Record<string, string> = {
  URLAUB: 'Urlaub',
  KRANKHEIT: 'Krankheit',
  FORTBILDUNG: 'Fortbildung',
  SONSTIGES: 'Sonstiges'
};

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Reporting/KPI-Dashboard: wertet die im System erfassten Daten (Leistungserfassung,
 * Dienstplan, Abwesenheiten) für einen wählbaren Zeitraum aus. Rein lesend, keine
 * Mutationen – aggregiert ausschließlich bestehende Signals der Fach-Services.
 */
@Component({
  selector: 'app-reporting-dashboard',
  standalone: true,
  imports: [FormsModule, CardModule, TagModule, DatePickerModule, ButtonModule, TableModule],
  templateUrl: './reporting-dashboard.component.html',
  styleUrl: './reporting-dashboard.component.scss'
})
export class ReportingDashboardComponent {
  private readonly hrState = inject(HrStateService);
  private readonly tourState = inject(TourStateService);

  private readonly today = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  readonly rangeStart = signal(this.today);
  readonly rangeEnd = signal(this.addDays(this.today, 29));

  readonly rangeStartIso = computed(() => toIso(this.rangeStart()));
  readonly rangeEndIso = computed(() => toIso(this.rangeEnd()));

  private readonly tourDateById = computed(() => {
    const map = new Map<string, string>();
    for (const tour of this.tourState.tours()) map.set(tour.id, tour.date);
    return map;
  });

  private readonly employeeById = computed(() => {
    const map = new Map<string, Employee>();
    for (const e of this.hrState.employees()) map.set(e.id, e);
    return map;
  });

  /** Besuche, deren zugehörige Tour im gewählten Zeitraum liegt. */
  readonly visitsInRange = computed(() => {
    const start = this.rangeStartIso();
    const end = this.rangeEndIso();
    const dates = this.tourDateById();
    return this.tourState.visits().filter((v) => {
      const date = dates.get(v.tourId);
      return !!date && date >= start && date <= end;
    });
  });

  readonly visitTotal = computed(() => this.visitsInRange().length);
  readonly visitErledigt = computed(() => this.visitsInRange().filter((v) => v.status === 'ERLEDIGT').length);
  readonly visitAusgefallen = computed(() => this.visitsInRange().filter((v) => v.status === 'AUSGEFALLEN').length);
  readonly visitOffen = computed(() => this.visitsInRange().filter((v) => v.status === 'GEPLANT').length);

  readonly visitErledigtPercent = computed(() => this.percent(this.visitErledigt(), this.visitTotal()));
  readonly visitAusgefallenPercent = computed(() => this.percent(this.visitAusgefallen(), this.visitTotal()));
  readonly visitOffenPercent = computed(() => this.percent(this.visitOffen(), this.visitTotal()));

  /** Schichten im gewählten Zeitraum. */
  readonly shiftsInRange = computed(() => {
    const start = this.rangeStartIso();
    const end = this.rangeEndIso();
    return this.hrState.shifts().filter((s) => s.date >= start && s.date <= end);
  });

  readonly shiftTotal = computed(() => this.shiftsInRange().length);
  readonly shiftBestaetigt = computed(() => this.shiftsInRange().filter((s) => s.status === 'BESTAETIGT').length);
  readonly shiftEntfallen = computed(() => this.shiftsInRange().filter((s) => s.status === 'ENTFALLEN').length);
  readonly shiftVertretung = computed(() => this.shiftsInRange().filter((s) => s.status === 'VERTRETUNG').length);

  /** Genehmigte Abwesenheitstage im Zeitraum, nach Typ gruppiert. */
  readonly absencesByType = computed(() => {
    const start = this.rangeStartIso();
    const end = this.rangeEndIso();
    const totals = new Map<string, number>();
    for (const a of this.hrState.absences()) {
      if (a.status !== 'GENEHMIGT') continue;
      if (a.endDate < start || a.startDate > end) continue; // kein Überlapp mit Zeitraum
      totals.set(a.type, (totals.get(a.type) ?? 0) + a.days);
    }
    return (Object.keys(ABSENCE_TYPE_LABELS) as (keyof typeof ABSENCE_TYPE_LABELS)[])
      .map((type) => ({ type, label: ABSENCE_TYPE_LABELS[type], days: totals.get(type) ?? 0 }))
      .filter((row) => row.days > 0);
  });

  readonly pendingAbsenceRequests = this.hrState.pendingAbsenceRequests;

  /** Auslastung/Abschlussquote je Mitarbeiter mit Touren im Zeitraum. */
  readonly employeeUtilisation = computed<EmployeeUtilisationRow[]>(() => {
    const start = this.rangeStartIso();
    const end = this.rangeEndIso();
    const tours = this.tourState.tours().filter((t) => t.date >= start && t.date <= end);
    const employees = this.employeeById();

    const rows = new Map<string, EmployeeUtilisationRow>();
    for (const tour of tours) {
      const employee = employees.get(tour.employeeId);
      if (!employee) continue;
      let row = rows.get(tour.employeeId);
      if (!row) {
        row = {
          employeeId: tour.employeeId,
          name: `${employee.firstName} ${employee.lastName}`,
          roleLabel: ROLE_LABELS[employee.role],
          tourCount: 0,
          total: 0,
          erledigt: 0,
          ausgefallen: 0,
          offen: 0,
          completionRate: 0
        };
        rows.set(tour.employeeId, row);
      }
      row.tourCount += 1;
      for (const visit of this.tourState.visitsForTour(tour.id)) {
        row.total += 1;
        if (visit.status === 'ERLEDIGT') row.erledigt += 1;
        else if (visit.status === 'AUSGEFALLEN') row.ausgefallen += 1;
        else row.offen += 1;
      }
    }

    return [...rows.values()]
      .map((row) => ({ ...row, completionRate: this.percent(row.erledigt, row.erledigt + row.ausgefallen) }))
      .sort((a, b) => b.total - a.total);
  });

  /** Dienstplan-Auslastung je Rolle im Zeitraum. */
  readonly roleShiftOverview = computed<RoleShiftRow[]>(() => {
    const shifts = this.shiftsInRange();
    const employees = this.employeeById();

    const roles = Object.keys(ROLE_LABELS) as Employee['role'][];
    return roles
      .map((role) => {
        const roleShifts = shifts.filter((s) => employees.get(s.employeeId)?.role === role);
        const employeeCount = new Set(
          this.hrState
            .employees()
            .filter((e) => e.role === role && e.active)
            .map((e) => e.id)
        ).size;
        return {
          role,
          roleLabel: ROLE_LABELS[role],
          employeeCount,
          shiftsTotal: roleShifts.length,
          bestaetigt: roleShifts.filter((s) => s.status === 'BESTAETIGT').length,
          entfallen: roleShifts.filter((s) => s.status === 'ENTFALLEN').length,
          vertretung: roleShifts.filter((s) => s.status === 'VERTRETUNG').length
        };
      })
      .filter((row) => row.shiftsTotal > 0 || row.employeeCount > 0);
  });

  /** Zuletzt dokumentierte Besuche (erledigt oder ausgefallen), unabhängig vom Zeitraumfilter. */
  readonly recentlyDocumented = computed<DocumentedVisitRow[]>(() => {
    const employees = this.employeeById();
    const tours = new Map(this.tourState.tours().map((t) => [t.id, t]));

    return this.tourState
      .visits()
      .filter((v) => v.status !== 'GEPLANT' && v.confirmedAt)
      .map((v) => {
        const tour = tours.get(v.tourId);
        const employee = tour ? employees.get(tour.employeeId) : undefined;
        const patient = this.tourState.getPatient(v.patientId);
        return {
          visitId: v.id,
          dateIso: tour?.date ?? '',
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unbekannt',
          employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unbekannt',
          status: v.status,
          detail:
            v.status === 'ERLEDIGT'
              ? `Ist: ${v.actualStart}–${v.actualEnd}`
              : (v.cancelReason ?? '')
        };
      })
      .sort((a, b) => (b.dateIso || '').localeCompare(a.dateIso || ''));
  });

  resetRange(): void {
    this.rangeStart.set(this.today);
    this.rangeEnd.set(this.addDays(this.today, 29));
  }

  visitStatusSeverity(status: Visit['status']): 'success' | 'danger' | 'secondary' {
    if (status === 'ERLEDIGT') return 'success';
    if (status === 'AUSGEFALLEN') return 'danger';
    return 'secondary';
  }

  shiftStatusSeverity(status: 'BESTAETIGT' | 'ENTFALLEN' | 'VERTRETUNG'): 'success' | 'danger' | 'warn' {
    if (status === 'BESTAETIGT') return 'success';
    if (status === 'ENTFALLEN') return 'danger';
    return 'warn';
  }

  private percent(part: number, total: number): number {
    if (total <= 0) return 0;
    return Math.round((part / total) * 100);
  }

  private addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }
}
