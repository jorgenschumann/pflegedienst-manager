import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TourStateService } from '../../services/tour-state.service';
import { HrStateService } from '../../../hr/services/hr-state.service';

interface SelectOption<T> {
  label: string;
  value: T;
}

interface SubstitutionRow {
  tourId: string;
  tourName: string;
  date: string;
  absentEmployeeName: string;
  absenceType: string;
  suggestedEmployeeId: string | undefined;
  suggestedEmployeeName: string;
}

/**
 * Vertretungsregelung: zeigt Touren, die wegen einer genehmigten Abwesenheit (Krankheit/Urlaub)
 * noch nicht umbesetzt sind, schlägt automatisch qualifiziertes, verfügbares Ersatzpersonal vor
 * (ohne Terminkonflikt am selben Tag) und erlaubt die Übernahme per Klick oder manuelle Auswahl.
 */
@Component({
  selector: 'app-vertretungen',
  standalone: true,
  imports: [FormsModule, ButtonModule, TableModule, TagModule, CardModule, DialogModule, SelectModule],
  templateUrl: './vertretungen.component.html',
  styleUrl: './vertretungen.component.scss'
})
export class VertretungenComponent {
  private readonly tourState = inject(TourStateService);
  private readonly hrState = inject(HrStateService);

  private readonly approvedAbsences = computed(() => this.hrState.absences().filter((a) => a.status === 'GENEHMIGT'));

  readonly rows = computed<SubstitutionRow[]>(() => {
    const rows: SubstitutionRow[] = [];
    for (const absence of this.approvedAbsences()) {
      const tours = this.tourState.affectedToursForAbsence(absence);
      const absentEmployee = this.tourState.getEmployee(absence.employeeId);
      for (const tour of tours) {
        const suggestion = this.tourState.suggestReplacement(tour.id);
        rows.push({
          tourId: tour.id,
          tourName: tour.name,
          date: tour.date,
          absentEmployeeName: absentEmployee ? `${absentEmployee.firstName} ${absentEmployee.lastName}` : 'Unbekannt',
          absenceType: this.absenceTypeLabel(absence.type),
          suggestedEmployeeId: suggestion?.id,
          suggestedEmployeeName: suggestion ? `${suggestion.firstName} ${suggestion.lastName}` : 'Kein passendes Personal verfügbar'
        });
      }
    }
    return rows.sort((a, b) => a.date.localeCompare(b.date));
  });

  readonly manualDialogVisible = signal(false);
  readonly manualTargetTourId = signal<string | null>(null);
  readonly manualSelection = signal<string | null>(null);

  readonly manualEmployeeOptions = computed<SelectOption<string>[]>(() =>
    this.tourState
      .tourPersonal()
      .map((e) => ({ label: `${e.firstName} ${e.lastName}`, value: e.id }))
  );

  private absenceTypeLabel(type: string): string {
    switch (type) {
      case 'URLAUB':
        return 'Urlaub';
      case 'KRANKHEIT':
        return 'Krankheit';
      case 'FORTBILDUNG':
        return 'Fortbildung';
      default:
        return 'Sonstiges';
    }
  }

  acceptSuggestion(row: SubstitutionRow): void {
    if (!row.suggestedEmployeeId) return;
    this.tourState.applySubstitution(row.tourId, row.suggestedEmployeeId);
  }

  openManual(row: SubstitutionRow): void {
    this.manualTargetTourId.set(row.tourId);
    this.manualSelection.set(row.suggestedEmployeeId ?? null);
    this.manualDialogVisible.set(true);
  }

  confirmManual(): void {
    const tourId = this.manualTargetTourId();
    const employeeId = this.manualSelection();
    if (!tourId || !employeeId) return;
    this.tourState.applySubstitution(tourId, employeeId);
    this.manualDialogVisible.set(false);
  }
}
