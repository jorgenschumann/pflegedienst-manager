import { Component, computed, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { TourStateService } from '../../services/tour-state.service';
import { LEISTUNG_LABELS, LeistungCode } from '../../models';

interface SelectOption {
  label: string;
  value: string;
}

interface LeistungOption {
  label: string;
  value: LeistungCode;
}

@Component({
  selector: 'app-tour-edit',
  standalone: true,
  imports: [FormsModule, ButtonModule, SelectModule, MultiSelectModule],
  templateUrl: './tour-edit.component.html',
  styleUrl: './tour-edit.component.scss'
})
export class TourEditComponent {
  private readonly tourState = inject(TourStateService);

  /** ID der zu bearbeitenden Tour. */
  readonly tourId = input.required<string>();

  readonly close = output<void>();

  readonly leistungOptions: LeistungOption[] = (Object.keys(LEISTUNG_LABELS) as LeistungCode[]).map((code) => ({
    label: LEISTUNG_LABELS[code],
    value: code
  }));

  readonly tour = computed(() => this.tourState.getTour(this.tourId()));

  readonly visits = computed(() => this.tourState.visitsForTour(this.tourId()));

  readonly employeeOptions = computed<SelectOption[]>(() =>
    this.tourState.tourPersonal().map((e) => ({ label: `${e.firstName} ${e.lastName}`, value: e.id }))
  );

  /** Alle aktiven Patienten (mehrere Besuche desselben Patienten an unterschiedlichen Touren/Zeiten sind zulässig). */
  readonly patientOptions = computed<SelectOption[]>(() =>
    this.tourState.assignablePatients().map((p) => ({ label: `${p.firstName} ${p.lastName}`, value: p.id }))
  );

  /** Patienten, die dieser Tour noch nicht zugeordnet sind (für "Besuch hinzufügen"). */
  readonly availablePatientOptions = computed<SelectOption[]>(() => {
    const assignedIds = new Set(this.visits().map((v) => v.patientId));
    return this.patientOptions().filter((o) => !assignedIds.has(o.value));
  });

  /** Patienten-Optionen für den Select eines einzelnen Besuchs (alle Patienten außer bereits anderweitig in dieser Tour zugeordnete). */
  patientOptionsForVisit(currentVisitId: string, currentPatientId: string): SelectOption[] {
    const assignedElsewhereInTour = new Set(
      this.visits()
        .filter((v) => v.id !== currentVisitId)
        .map((v) => v.patientId)
    );
    return this.patientOptions().filter((o) => o.value === currentPatientId || !assignedElsewhereInTour.has(o.value));
  }

  selectedNewPatientId: string | null = null;

  onEmployeeChange(employeeId: string): void {
    this.tourState.reassignTourEmployee(this.tourId(), employeeId);
  }

  onPatientChange(visitId: string, patientId: string): void {
    this.tourState.updateVisit(visitId, { patientId });
  }

  onTimeChange(visitId: string, field: 'plannedStart' | 'plannedEnd', value: string): void {
    this.tourState.updateVisit(visitId, { [field]: value });
  }

  onLeistungenChange(visitId: string, leistungen: LeistungCode[]): void {
    this.tourState.updateVisit(visitId, { leistungen });
  }

  removeVisit(visitId: string): void {
    this.tourState.removeVisit(visitId);
  }

  addVisit(): void {
    if (!this.selectedNewPatientId) return;
    this.tourState.addVisit(this.tourId(), this.selectedNewPatientId);
    this.selectedNewPatientId = null;
  }

  patientName(patientId: string): string {
    return this.tourState.getPatient(patientId)
      ? `${this.tourState.getPatient(patientId)!.firstName} ${this.tourState.getPatient(patientId)!.lastName}`
      : 'Unbekannt';
  }
}
