import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { TourStateService } from '../../services/tour-state.service';
import { LEISTUNG_LABELS, LeistungCode } from '../../models';

interface LeistungOption {
  label: string;
  value: LeistungCode;
}

type DocumentationMode = 'ERLEDIGT' | 'AUSGEFALLEN';

/**
 * Dialoginhalt zur Leistungserfassung/Tourendokumentation eines einzelnen Besuchs:
 * erfasst Ist-Zeiten, tatsächlich erbrachte Leistungen und einen Pflegebericht-Hinweis
 * bzw. bei Ausfall den Grund, und bestätigt dies digital durch die durchführende Pflegekraft.
 */
@Component({
  selector: 'app-visit-documentation',
  standalone: true,
  imports: [DatePipe, FormsModule, ButtonModule, MultiSelectModule, TextareaModule],
  templateUrl: './visit-documentation.component.html',
  styleUrl: './visit-documentation.component.scss'
})
export class VisitDocumentationComponent {
  private readonly tourState = inject(TourStateService);

  readonly visitId = input.required<string>();
  readonly close = output<void>();

  readonly leistungOptions: LeistungOption[] = (Object.keys(LEISTUNG_LABELS) as LeistungCode[]).map((code) => ({
    label: LEISTUNG_LABELS[code],
    value: code
  }));

  readonly visit = computed(() => this.tourState.visits().find((v) => v.id === this.visitId()));

  readonly mode = signal<DocumentationMode>('ERLEDIGT');

  readonly actualStart = signal('');
  readonly actualEnd = signal('');
  readonly performedLeistungen = signal<LeistungCode[]>([]);
  readonly notes = signal('');
  readonly cancelReason = signal('');

  readonly patientName = computed(() => {
    const v = this.visit();
    if (!v) return 'Unbekannt';
    const patient = this.tourState.getPatient(v.patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unbekannt';
  });

  readonly confirmedByName = computed(() => {
    const v = this.visit();
    if (!v) return 'Unbekannt';
    const tour = this.tourState.getTour(v.tourId);
    const employee = tour ? this.tourState.getEmployee(tour.employeeId) : undefined;
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unbekannt';
  });

  readonly alreadyDocumented = computed(() => {
    const v = this.visit();
    return !!v && v.status !== 'GEPLANT';
  });

  constructor() {
    // Lokale Bearbeitungsfelder werden erst initialisiert, sobald das (required) Input verfügbar ist.
    effect(() => {
      const v = this.visit();
      if (!v) return;
      this.actualStart.set(v.actualStart ?? v.plannedStart);
      this.actualEnd.set(v.actualEnd ?? v.plannedEnd);
      this.performedLeistungen.set(v.performedLeistungen ?? v.leistungen);
      this.notes.set(v.notes ?? '');
      this.cancelReason.set(v.cancelReason ?? '');
      if (v.status === 'AUSGEFALLEN') {
        this.mode.set('AUSGEFALLEN');
      }
    });
  }

  setMode(mode: DocumentationMode): void {
    this.mode.set(mode);
  }

  confirmErledigt(): void {
    this.tourState.documentVisit(this.visitId(), {
      actualStart: this.actualStart(),
      actualEnd: this.actualEnd(),
      performedLeistungen: this.performedLeistungen(),
      notes: this.notes() || undefined,
      confirmedBy: this.confirmedByName()
    });
    this.close.emit();
  }

  confirmAusgefallen(): void {
    if (!this.cancelReason().trim()) return;
    this.tourState.cancelVisit(this.visitId(), this.cancelReason().trim(), this.confirmedByName());
    this.close.emit();
  }

  leistungLabel(code: LeistungCode): string {
    return LEISTUNG_LABELS[code];
  }
}
