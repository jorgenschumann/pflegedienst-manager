import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PatientStateService } from '../../../patients/services/patient-state.service';
import { Medication } from '../../../patients/models';

interface MedicationRow {
  medication: Medication;
  patientName: string;
}

/**
 * Lagerbestand & Nachbestellung: zeigt patientenübergreifend alle aktiven Medikamente, deren
 * Bestand den Meldebestand unterschritten hat oder deren Rezept-Vorrat in Kürze ausläuft, und
 * ermöglicht das Markieren als bestellt sowie das Bestätigen des Wareneingangs.
 */
@Component({
  selector: 'app-reorder-list',
  standalone: true,
  imports: [DatePipe, FormsModule, ButtonModule, CardModule, TableModule, TagModule, DialogModule, InputNumberModule, InputTextModule],
  templateUrl: './reorder-list.component.html',
  styleUrl: './reorder-list.component.scss'
})
export class ReorderListComponent {
  private readonly patientState = inject(PatientStateService);

  private rowsFor(medications: Medication[]): MedicationRow[] {
    return medications
      .map((medication) => {
        const patient = this.patientState.getPatient(medication.patientId);
        return {
          medication,
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unbekannt'
        };
      })
      .sort((a, b) => a.patientName.localeCompare(b.patientName));
  }

  readonly reorderCandidates = computed(() => this.rowsFor(this.patientState.reorderCandidates()));

  readonly openOrders = computed(() =>
    this.rowsFor(this.patientState.medications().filter((m) => m.active && m.reorderStatus === 'BESTELLT'))
  );

  readonly deliveryDialogVisible = signal(false);
  readonly deliveryMedicationId = signal<string | null>(null);
  readonly deliveryQuantity = signal<number>(30);
  readonly deliveryPerformedBy = signal('');

  stockReason(row: MedicationRow): string {
    const m = row.medication;
    const stockLow =
      m.currentStock !== undefined && m.reorderThreshold !== undefined && m.currentStock <= m.reorderThreshold;
    const renewalDue = this.patientState.isRenewalDue(m);
    if (stockLow && renewalDue) return 'Bestand niedrig & Rezept fällig';
    if (stockLow) return 'Bestand niedrig';
    return 'Rezept bald fällig';
  }

  markOrdered(row: MedicationRow): void {
    this.patientState.markReorderOrdered(row.medication.id);
  }

  openDeliveryDialog(row: MedicationRow): void {
    this.deliveryMedicationId.set(row.medication.id);
    this.deliveryQuantity.set(30);
    this.deliveryPerformedBy.set('');
    this.deliveryDialogVisible.set(true);
  }

  confirmDelivery(): void {
    const medicationId = this.deliveryMedicationId();
    if (!medicationId || !this.deliveryPerformedBy().trim()) return;
    this.patientState.confirmReorderDelivery(medicationId, this.deliveryQuantity(), this.deliveryPerformedBy().trim());
    this.deliveryDialogVisible.set(false);
  }
}
