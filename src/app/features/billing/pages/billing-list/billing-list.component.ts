import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { BillingStateService } from '../../services/billing-state.service';
import { PatientStateService } from '../../../patients/services/patient-state.service';
import {
  ABRECHNUNG_STATUS_LABELS,
  Abrechnung,
  AbrechnungStatus,
  LEGAL_BASIS_LABELS,
  LegalBasis
} from '../../models';
import { LEISTUNG_LABELS } from '../../../touren/models';

interface SelectOption<T> {
  label: string;
  value: T;
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Abrechnungs-Übersicht: generiert Sammelabrechnungen (SGB XI/SGB V) aus dokumentierten Besuchen
 * eines Zeitraums und bildet den Freigabe-Workflow ab (Entwurf → Erstellt → Übermittelt → Bezahlt).
 */
@Component({
  selector: 'app-billing-list',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    ToolbarModule,
    DialogModule,
    SelectModule,
    DatePickerModule,
    TooltipModule,
    CardModule
  ],
  templateUrl: './billing-list.component.html',
  styleUrl: './billing-list.component.scss'
})
export class BillingListComponent {
  private readonly billingState = inject(BillingStateService);
  private readonly patientState = inject(PatientStateService);

  readonly abrechnungen = this.billingState.abrechnungen;
  readonly totalOffen = this.billingState.totalOffen;
  readonly totalBezahlt = this.billingState.totalBezahlt;

  readonly generationMonth = signal<Date>(startOfMonth(new Date()));
  readonly generateDialogVisible = signal(false);
  readonly lastGeneratedCount = signal<number | null>(null);

  readonly detailDialogVisible = signal(false);
  readonly selectedAbrechnung = signal<Abrechnung | null>(null);

  readonly rejectDialogVisible = signal(false);
  readonly rejectReason = signal('');
  private rejectTargetId: string | null = null;

  readonly statusFilter = signal<AbrechnungStatus | 'ALLE'>('ALLE');
  readonly legalBasisFilter = signal<LegalBasis | 'ALLE'>('ALLE');

  readonly statusOptions: SelectOption<AbrechnungStatus | 'ALLE'>[] = [
    { label: 'Alle Status', value: 'ALLE' },
    ...(Object.entries(ABRECHNUNG_STATUS_LABELS) as [AbrechnungStatus, string][]).map(([value, label]) => ({
      label,
      value
    }))
  ];

  readonly legalBasisOptions: SelectOption<LegalBasis | 'ALLE'>[] = [
    { label: 'Alle Kassen', value: 'ALLE' },
    ...(Object.entries(LEGAL_BASIS_LABELS) as [LegalBasis, string][]).map(([value, label]) => ({ label, value }))
  ];

  private readonly patientById = computed(() => new Map(this.patientState.patients().map((p) => [p.id, p])));

  readonly rows = computed(() => {
    const status = this.statusFilter();
    const legalBasis = this.legalBasisFilter();
    const byId = this.patientById();
    return this.abrechnungen()
      .filter((a) => status === 'ALLE' || a.status === status)
      .filter((a) => legalBasis === 'ALLE' || a.legalBasis === legalBasis)
      .map((a) => {
        const patient = byId.get(a.patientId);
        return {
          abrechnung: a,
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unbekannt'
        };
      })
      .sort((a, b) => b.abrechnung.createdAt.localeCompare(a.abrechnung.createdAt));
  });

  statusLabel(status: AbrechnungStatus): string {
    return ABRECHNUNG_STATUS_LABELS[status];
  }

  legalBasisLabel(legalBasis: LegalBasis): string {
    return LEGAL_BASIS_LABELS[legalBasis];
  }

  leistungLabel(code: keyof typeof LEISTUNG_LABELS): string {
    return LEISTUNG_LABELS[code];
  }

  statusSeverity(status: AbrechnungStatus): 'success' | 'info' | 'danger' | 'warn' | 'secondary' {
    switch (status) {
      case 'BEZAHLT':
        return 'success';
      case 'UEBERMITTELT':
        return 'info';
      case 'ERSTELLT':
        return 'warn';
      case 'ZURUECKGEWIESEN':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  openGenerateDialog(): void {
    this.lastGeneratedCount.set(null);
    this.generateDialogVisible.set(true);
  }

  confirmGenerate(): void {
    const month = this.generationMonth();
    const periodStart = toIso(startOfMonth(month));
    const periodEnd = toIso(endOfMonth(month));
    const count = this.billingState.generateAbrechnungen(periodStart, periodEnd);
    this.lastGeneratedCount.set(count);
  }

  openDetail(abrechnung: Abrechnung): void {
    this.selectedAbrechnung.set(abrechnung);
    this.detailDialogVisible.set(true);
  }

  patientName(patientId: string): string {
    const patient = this.patientById().get(patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unbekannt';
  }

  erstellen(abrechnung: Abrechnung): void {
    this.billingState.markErstellt(abrechnung.id);
  }

  uebermitteln(abrechnung: Abrechnung): void {
    this.billingState.submit(abrechnung.id);
  }

  bezahlt(abrechnung: Abrechnung): void {
    this.billingState.markBezahlt(abrechnung.id);
  }

  openRejectDialog(abrechnung: Abrechnung): void {
    this.rejectTargetId = abrechnung.id;
    this.rejectReason.set('');
    this.rejectDialogVisible.set(true);
  }

  confirmReject(): void {
    if (!this.rejectTargetId) return;
    this.billingState.reject(this.rejectTargetId, this.rejectReason() || 'Kein Grund angegeben');
    this.rejectDialogVisible.set(false);
    this.rejectTargetId = null;
  }
}
