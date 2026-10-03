import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TiStateService } from '../../services/ti-state.service';
import { PatientStateService } from '../../../patients/services/patient-state.service';
import { EPA_CATEGORY_LABELS, EpaDocumentCategory, KimDirection, KonnektorStatus } from '../../models';

interface SelectOption<T> {
  label: string;
  value: T;
}

/**
 * Status-Übersicht der (simulierten) Telematikinfrastruktur: Konnektor-Status, KIM-Postfach
 * und ePA-Zugriffe je Patient. Deutlich als Demo/Simulation gekennzeichnet, da eine echte
 * Anbindung zertifizierte Konnektor-Hardware voraussetzt.
 */
@Component({
  selector: 'app-ti-status',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    ButtonModule,
    CardModule,
    TableModule,
    TagModule,
    SelectModule,
    TooltipModule,
    ToggleSwitchModule
  ],
  templateUrl: './ti-status.component.html',
  styleUrl: './ti-status.component.scss'
})
export class TiStatusComponent {
  private readonly tiState = inject(TiStateService);
  private readonly patientState = inject(PatientStateService);

  readonly connector = this.tiState.connector;
  readonly kimMessages = this.tiState.kimMessages;
  readonly unreadKimCount = this.tiState.unreadKimCount;

  readonly patients = computed(() => this.patientState.activePatients());
  readonly selectedPatientId = signal<string | null>(null);

  readonly patientOptions = computed<SelectOption<string>[]>(() =>
    this.patients().map((p) => ({ label: `${p.firstName} ${p.lastName}`, value: p.id }))
  );

  readonly selectedConsent = computed(() => {
    const id = this.selectedPatientId();
    return id ? this.tiState.consentFor(id) : undefined;
  });

  readonly selectedDocuments = computed(() => {
    const id = this.selectedPatientId();
    return id ? this.tiState.documentsFor(id) : [];
  });

  constructor() {
    const first = this.patientState.patients()[0];
    if (first) this.selectedPatientId.set(first.id);
  }

  connectorLabel(status: KonnektorStatus): string {
    switch (status) {
      case 'ONLINE':
        return 'Online';
      case 'OFFLINE':
        return 'Offline';
      default:
        return 'Wartung';
    }
  }

  connectorSeverity(status: KonnektorStatus): 'success' | 'danger' | 'warn' {
    switch (status) {
      case 'ONLINE':
        return 'success';
      case 'OFFLINE':
        return 'danger';
      default:
        return 'warn';
    }
  }

  directionLabel(direction: KimDirection): string {
    return direction === 'EINGANG' ? 'Eingang' : 'Ausgang';
  }

  categoryLabel(category: EpaDocumentCategory): string {
    return EPA_CATEGORY_LABELS[category];
  }

  patientNameFor(patientId: string | undefined): string {
    if (!patientId) return '–';
    const patient = this.patientState.getPatient(patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unbekannt';
  }

  sync(): void {
    this.tiState.simulateSync();
  }

  markRead(id: string): void {
    this.tiState.markKimRead(id);
  }

  toggleConsent(): void {
    const id = this.selectedPatientId();
    if (id) this.tiState.toggleConsent(id);
  }
}
