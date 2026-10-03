import { Injectable, computed, inject, signal } from '@angular/core';
import { PatientStateService } from '../../patients/services/patient-state.service';
import { EpaConsent, EpaDocument, KimMessage, TiConnectorStatus } from '../models';

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

function daysFromNow(d: number): string {
  const date = new Date();
  date.setDate(date.getDate() + d);
  return date.toISOString().slice(0, 10);
}

const ARZT_NAMEN = ['Dr. med. Brandt', 'Dr. med. Vogel', 'Dr. med. Lindner', 'Dr. med. Ahrens'];

/**
 * Simuliert die Anbindung an die Telematikinfrastruktur (TI): Konnektor-Status, KIM-Postfach
 * (verschlüsselte Arztkommunikation) und ePA-Zugriffe je Patient. Da eine echte TI-Anbindung
 * zertifizierte Hardware (Konnektor, SMC-B-Karte) voraussetzt, die in einer Demo-Umgebung nicht
 * verfügbar ist, liefert dieser Service ausschließlich simulierte Zustände/Demodaten.
 */
@Injectable({ providedIn: 'root' })
export class TiStateService {
  private readonly patientState = inject(PatientStateService);

  private readonly _connector = signal<TiConnectorStatus>({
    status: 'ONLINE',
    lastSync: hoursAgo(2),
    certificateValidUntil: daysFromNow(312),
    firmwareVersion: 'PTV5 4.1.3'
  });
  readonly connector = this._connector.asReadonly();

  private readonly _kimMessages = signal<KimMessage[]>(this.generateKimMessages());
  readonly kimMessages = this._kimMessages.asReadonly();

  readonly unreadKimCount = computed(
    () => this._kimMessages().filter((m) => m.direction === 'EINGANG' && !m.read).length
  );

  private readonly _epaConsents = signal<EpaConsent[]>(this.generateConsents());
  readonly epaConsents = this._epaConsents.asReadonly();

  private readonly _epaDocuments = signal<EpaDocument[]>(this.generateEpaDocuments());
  readonly epaDocuments = this._epaDocuments.asReadonly();

  private generateKimMessages(): KimMessage[] {
    const patients = this.patientState.patients().slice(0, 6);
    const subjects = [
      'Aktualisierter Medikationsplan',
      'Arztbrief nach Krankenhausentlassung',
      'Rückfrage zur Wundversorgung',
      'Verordnung häusliche Krankenpflege',
      'Laborbefund angefordert',
      'Anpassung Insulindosierung'
    ];
    return patients.map((patient, i) => ({
      id: `kim-${i + 1}`,
      direction: i % 3 === 0 ? 'AUSGANG' : 'EINGANG',
      sender: i % 3 === 0 ? 'Pflegedienst Manager' : ARZT_NAMEN[i % ARZT_NAMEN.length],
      recipient: i % 3 === 0 ? ARZT_NAMEN[i % ARZT_NAMEN.length] : 'Pflegedienst Manager',
      subject: `${subjects[i % subjects.length]} – ${patient.firstName} ${patient.lastName}`,
      receivedAt: hoursAgo(i * 9 + 3),
      patientId: patient.id,
      read: i % 2 === 0
    }));
  }

  private generateConsents(): EpaConsent[] {
    return this.patientState.patients().map((patient, i) => ({
      patientId: patient.id,
      granted: i % 4 !== 0, // ca. 75% haben die Einwilligung erteilt
      grantedAt: i % 4 !== 0 ? daysFromNow(-(30 + (i % 10))) : undefined
    }));
  }

  private generateEpaDocuments(): EpaDocument[] {
    const docs: EpaDocument[] = [];
    const consented = this.generateConsents().filter((c) => c.granted);
    consented.forEach((consent, i) => {
      const patient = this.patientState.getPatient(consent.patientId);
      if (!patient) return;
      docs.push({
        id: `epa-${consent.patientId}-1`,
        patientId: consent.patientId,
        category: 'MEDIKATIONSPLAN',
        title: 'Bundeseinheitlicher Medikationsplan',
        author: ARZT_NAMEN[i % ARZT_NAMEN.length],
        createdAt: daysFromNow(-(5 + (i % 20)))
      });
      if (i % 2 === 0) {
        docs.push({
          id: `epa-${consent.patientId}-2`,
          patientId: consent.patientId,
          category: 'ARZTBRIEF',
          title: 'Arztbrief – hausärztliche Verlaufskontrolle',
          author: ARZT_NAMEN[(i + 1) % ARZT_NAMEN.length],
          createdAt: daysFromNow(-(15 + (i % 30)))
        });
      }
    });
    return docs;
  }

  /** Simuliert eine erneute Synchronisation mit dem TI-Konnektor. */
  simulateSync(): void {
    this._connector.update((c) => ({ ...c, lastSync: new Date().toISOString() }));
  }

  markKimRead(id: string): void {
    this._kimMessages.update((list) => list.map((m) => (m.id === id ? { ...m, read: true } : m)));
  }

  consentFor(patientId: string): EpaConsent | undefined {
    return this._epaConsents().find((c) => c.patientId === patientId);
  }

  documentsFor(patientId: string): EpaDocument[] {
    return this._epaDocuments().filter((d) => d.patientId === patientId);
  }

  toggleConsent(patientId: string): void {
    this._epaConsents.update((list) =>
      list.map((c) =>
        c.patientId === patientId
          ? { ...c, granted: !c.granted, grantedAt: !c.granted ? new Date().toISOString().slice(0, 10) : undefined }
          : c
      )
    );
  }
}
