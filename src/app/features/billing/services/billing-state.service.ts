import { Injectable, computed, inject, signal } from '@angular/core';
import { TourStateService } from '../../touren/services/tour-state.service';
import { PatientStateService } from '../../patients/services/patient-state.service';
import { Visit } from '../../touren/models';
import {
  Abrechnung,
  AbrechnungPosition,
  AbrechnungStatus,
  LEISTUNG_LEGAL_BASIS,
  LEISTUNG_PRICES,
  LegalBasis
} from '../models';

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Abrechnungs-State-Service: erzeugt aus dokumentierten (erledigten) Besuchen
 * Sammelabrechnungen je Patient, Zeitraum und Rechtsgrundlage (SGB XI/SGB V) und
 * bildet deren Freigabe-Workflow ab (Entwurf → Erstellt → Übermittelt → Bezahlt).
 * Verwendet Angular Signals als Single Source of Truth, aktuell mit In-Memory-Daten.
 */
@Injectable({ providedIn: 'root' })
export class BillingStateService {
  private readonly tourState = inject(TourStateService);
  private readonly patientState = inject(PatientStateService);

  private readonly _abrechnungen = signal<Abrechnung[]>([]);
  readonly abrechnungen = this._abrechnungen.asReadonly();

  private readonly tourDateById = computed(() => {
    const map = new Map<string, string>();
    for (const tour of this.tourState.tours()) map.set(tour.id, tour.date);
    return map;
  });

  readonly totalOffen = computed(() =>
    this._abrechnungen()
      .filter((a) => a.status !== 'BEZAHLT' && a.status !== 'ZURUECKGEWIESEN')
      .reduce((sum, a) => sum + a.totalAmount, 0)
  );

  readonly totalBezahlt = computed(() =>
    this._abrechnungen().filter((a) => a.status === 'BEZAHLT').reduce((sum, a) => sum + a.totalAmount, 0)
  );

  readonly countByStatus = computed(() => {
    const counts = new Map<AbrechnungStatus, number>();
    for (const a of this._abrechnungen()) counts.set(a.status, (counts.get(a.status) ?? 0) + 1);
    return counts;
  });

  /**
   * Generiert für alle im Zeitraum erledigten Besuche mit erbrachten Leistungen je Patient
   * getrennte Abrechnungen für SGB XI (Pflegekasse) und SGB V (Krankenkasse). Besuche, die
   * bereits in einer vorhandenen Abrechnung desselben Zeitraums/Patienten/Rechtsgrundlage
   * enthalten sind, werden nicht doppelt berücksichtigt.
   */
  generateAbrechnungen(periodStart: string, periodEnd: string): number {
    const dates = this.tourDateById();
    const alreadyBilledVisitIds = new Set(
      this._abrechnungen().flatMap((a) => a.positions.map((p) => p.visitId))
    );

    const billableVisits = this.tourState.visits().filter((v) => {
      if (v.status !== 'ERLEDIGT' || !v.performedLeistungen?.length) return false;
      if (alreadyBilledVisitIds.has(v.id)) return false;
      const date = dates.get(v.tourId);
      return !!date && date >= periodStart && date <= periodEnd;
    });

    // Gruppiere Positionen je (Patient, Rechtsgrundlage).
    const groups = new Map<string, { patientId: string; legalBasis: LegalBasis; positions: AbrechnungPosition[] }>();

    for (const visit of billableVisits) {
      const date = dates.get(visit.tourId) ?? '';
      for (const leistung of visit.performedLeistungen ?? []) {
        const legalBasis = LEISTUNG_LEGAL_BASIS[leistung];
        const key = `${visit.patientId}|${legalBasis}`;
        let group = groups.get(key);
        if (!group) {
          group = { patientId: visit.patientId, legalBasis, positions: [] };
          groups.set(key, group);
        }
        group.positions.push({
          id: `pos-${visit.id}-${leistung}`,
          visitId: visit.id,
          date,
          leistung,
          amount: LEISTUNG_PRICES[leistung]
        });
      }
    }

    const createdAt = new Date().toISOString();
    const neu: Abrechnung[] = [];
    for (const { patientId, legalBasis, positions } of groups.values()) {
      const patient = this.patientState.getPatient(patientId);
      if (!patient) continue;
      neu.push({
        id: `abr-${patientId}-${legalBasis}-${periodStart}`,
        patientId,
        kostentraegerName: patient.insurance.providerName,
        legalBasis,
        periodStart,
        periodEnd,
        positions,
        totalAmount: Math.round(positions.reduce((sum, p) => sum + p.amount, 0) * 100) / 100,
        status: 'ENTWURF',
        createdAt
      });
    }

    if (neu.length > 0) {
      this._abrechnungen.update((list) => [...list, ...neu]);
    }
    return neu.length;
  }

  /** Erstellt eine Abrechnung final (Entwurf → Erstellt), bereit zur Übermittlung. */
  markErstellt(id: string): void {
    this.updateStatus(id, 'ERSTELLT');
  }

  /** Simuliert die verschlüsselte Übermittlung an die Kasse (Erstellt → Übermittelt). */
  submit(id: string): void {
    this._abrechnungen.update((list) =>
      list.map((a) => (a.id === id ? { ...a, status: 'UEBERMITTELT' as AbrechnungStatus, submittedAt: new Date().toISOString() } : a))
    );
  }

  /** Markiert eine übermittelte Abrechnung als von der Kasse bezahlt. */
  markBezahlt(id: string): void {
    this._abrechnungen.update((list) =>
      list.map((a) => (a.id === id ? { ...a, status: 'BEZAHLT' as AbrechnungStatus, paidAt: new Date().toISOString() } : a))
    );
  }

  /** Markiert eine übermittelte Abrechnung als von der Kasse zurückgewiesen. */
  reject(id: string, reason: string): void {
    this._abrechnungen.update((list) =>
      list.map((a) => (a.id === id ? { ...a, status: 'ZURUECKGEWIESEN' as AbrechnungStatus, rejectionReason: reason } : a))
    );
  }

  private updateStatus(id: string, status: AbrechnungStatus): void {
    this._abrechnungen.update((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));
  }
}
