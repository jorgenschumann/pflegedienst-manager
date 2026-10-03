import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { PatientStateService } from '../../../patients/services/patient-state.service';
import { BtmLedgerEntry, BTM_MOVEMENT_LABELS, BtmMovementType, Medication } from '../../../patients/models';

interface BtmMedicationRow {
  medication: Medication;
  patientName: string;
}

/**
 * Betäubungsmittel-Bestandsbuch gemäß § 13 BtMVV: listet alle BTM-pflichtigen Medikamente
 * patientenübergreifend mit aktuellem Bestand und erlaubt das Einsehen des lückenlosen
 * Bestandsbuchs je Medikament sowie das Erfassen manueller Bestandsbewegungen (Zugang,
 * Vernichtung, Korrektur) inkl. Vier-Augen-Prinzip (durchführende und bezeugende Person).
 */
@Component({
  selector: 'app-btm-ledger',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    ButtonModule,
    CardModule,
    TableModule,
    TagModule,
    DialogModule,
    SelectModule,
    InputNumberModule,
    InputTextModule,
    TextareaModule
  ],
  templateUrl: './btm-ledger.component.html',
  styleUrl: './btm-ledger.component.scss'
})
export class BtmLedgerComponent {
  private readonly patientState = inject(PatientStateService);

  readonly movementLabels = BTM_MOVEMENT_LABELS;

  readonly rows = computed<BtmMedicationRow[]>(() =>
    this.patientState
      .medications()
      .filter((m) => m.isBtm)
      .map((medication) => {
        const patient = this.patientState.getPatient(medication.patientId);
        return {
          medication,
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unbekannt'
        };
      })
      .sort((a, b) => a.patientName.localeCompare(b.patientName))
  );

  readonly selectedMedicationId = signal<string | null>(null);

  readonly selectedRow = computed(() => this.rows().find((r) => r.medication.id === this.selectedMedicationId()));

  readonly ledgerEntries = computed<BtmLedgerEntry[]>(() => {
    const id = this.selectedMedicationId();
    return id ? this.patientState.getBtmLedger(id) : [];
  });

  readonly movementDialogVisible = signal(false);
  readonly movementType = signal<'ZUGANG' | 'VERNICHTUNG' | 'KORREKTUR'>('ZUGANG');
  readonly movementQuantity = signal<number>(1);
  readonly movementPerformedBy = signal('');
  readonly movementWitnessedBy = signal('');
  readonly movementNote = signal('');

  readonly movementTypeOptions: { label: string; value: 'ZUGANG' | 'VERNICHTUNG' | 'KORREKTUR' }[] = [
    { label: BTM_MOVEMENT_LABELS.ZUGANG, value: 'ZUGANG' },
    { label: BTM_MOVEMENT_LABELS.VERNICHTUNG, value: 'VERNICHTUNG' },
    { label: BTM_MOVEMENT_LABELS.KORREKTUR, value: 'KORREKTUR' }
  ];

  selectMedication(medicationId: string): void {
    this.selectedMedicationId.set(medicationId);
  }

  movementLabel(type: BtmMovementType): string {
    return this.movementLabels[type];
  }

  stockSeverity(medication: Medication): 'success' | 'warn' | 'danger' {
    if (medication.reorderThreshold === undefined || medication.currentStock === undefined) return 'success';
    if (medication.currentStock <= 0) return 'danger';
    if (medication.currentStock <= medication.reorderThreshold) return 'warn';
    return 'success';
  }

  openMovementDialog(): void {
    this.movementType.set('ZUGANG');
    this.movementQuantity.set(1);
    this.movementPerformedBy.set('');
    this.movementWitnessedBy.set('');
    this.movementNote.set('');
    this.movementDialogVisible.set(true);
  }

  confirmMovement(): void {
    const medicationId = this.selectedMedicationId();
    if (!medicationId || !this.movementPerformedBy().trim()) return;

    this.patientState.recordBtmMovement(
      medicationId,
      this.movementType(),
      this.movementQuantity(),
      this.movementPerformedBy().trim(),
      this.movementWitnessedBy().trim() || undefined,
      this.movementNote().trim() || undefined
    );
    this.movementDialogVisible.set(false);
  }
}
