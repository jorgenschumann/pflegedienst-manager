import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { HrStateService } from '../../services/hr-state.service';

interface SelectOption<T> {
  label: string;
  value: T;
}

interface ViolationRow {
  id: string;
  type: 'RUHEZEIT' | 'WUNSCHFREI';
  shiftId: string;
  date: string;
  employeeName: string;
  detail: string;
  suggestedEmployeeId: string | undefined;
  suggestedEmployeeName: string;
}

/**
 * Automatische Dienstplan-Prüfung: erkennt Regelverstöße im Dienstplan der kommenden 14 Tage
 * (Ruhezeiten nach § 5 ArbZG, Kollisionen mit genehmigtem Wunschfrei) und schlägt je Verstoß
 * eine qualifizierte, am betroffenen Tag verfügbare Ersatzkraft für die Schicht vor.
 */
@Component({
  selector: 'app-regelpruefung',
  standalone: true,
  imports: [FormsModule, ButtonModule, TableModule, TagModule, CardModule, DialogModule, SelectModule],
  templateUrl: './regelpruefung.component.html',
  styleUrl: './regelpruefung.component.scss'
})
export class RegelpruefungComponent {
  private readonly hrState = inject(HrStateService);

  private readonly employeesById = computed(() => new Map(this.hrState.employees().map((e) => [e.id, e])));

  readonly rows = computed<ViolationRow[]>(() => {
    const byId = this.employeesById();
    return this.hrState
      .planViolations()
      .map((v) => {
        const employee = byId.get(v.employeeId);
        const suggestion = this.hrState.suggestShiftSwap(v.shift.id);
        return {
          id: v.id,
          type: v.type,
          shiftId: v.shift.id,
          date: v.shift.date,
          employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unbekannt',
          detail: v.detail,
          suggestedEmployeeId: suggestion?.id,
          suggestedEmployeeName: suggestion ? `${suggestion.firstName} ${suggestion.lastName}` : 'Kein passendes Personal verfügbar'
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  });

  readonly manualDialogVisible = signal(false);
  readonly manualTargetShiftId = signal<string | null>(null);
  readonly manualSelection = signal<string | null>(null);

  readonly manualEmployeeOptions = computed<SelectOption<string>[]>(() =>
    this.hrState
      .activeEmployees()
      .map((e) => ({ label: `${e.firstName} ${e.lastName}`, value: e.id }))
  );

  typeLabel(type: ViolationRow['type']): string {
    return type === 'RUHEZEIT' ? 'Ruhezeit' : 'Wunschfrei';
  }

  acceptSuggestion(row: ViolationRow): void {
    if (!row.suggestedEmployeeId) return;
    this.hrState.applyShiftReassignment(row.shiftId, row.suggestedEmployeeId);
  }

  openManual(row: ViolationRow): void {
    this.manualTargetShiftId.set(row.shiftId);
    this.manualSelection.set(row.suggestedEmployeeId ?? null);
    this.manualDialogVisible.set(true);
  }

  confirmManual(): void {
    const shiftId = this.manualTargetShiftId();
    const employeeId = this.manualSelection();
    if (!shiftId || !employeeId) return;
    this.hrState.applyShiftReassignment(shiftId, employeeId);
    this.manualDialogVisible.set(false);
  }
}
