/**
 * Simulierte Telematikinfrastruktur (TI): Konnektor-Status, KIM-Postfach und ePA-Zugriffe.
 * Da eine echte TI-Anbindung zertifizierte Konnektor-Hardware/-Software (gematik-Zulassung)
 * voraussetzt, bildet dieses Modul die Schnittstellen ausschließlich als Demo-/Mock-Daten ab.
 */

export type KonnektorStatus = 'ONLINE' | 'OFFLINE' | 'WARTUNG';

export interface TiConnectorStatus {
  status: KonnektorStatus;
  lastSync: string; // ISO-Timestamp
  certificateValidUntil: string; // ISO-Datum (SMC-B-Zertifikat)
  firmwareVersion: string;
}

export type KimDirection = 'EINGANG' | 'AUSGANG';

/** Verschlüsselte Nachricht über den KIM-Dienst (Kommunikation im Medizinwesen). */
export interface KimMessage {
  id: string;
  direction: KimDirection;
  sender: string;
  recipient: string;
  subject: string;
  receivedAt: string; // ISO-Timestamp
  patientId?: string;
  read: boolean;
}

export type EpaDocumentCategory = 'ARZTBRIEF' | 'MEDIKATIONSPLAN' | 'BEFUND' | 'IMPFPASS' | 'PFLEGEBERICHT';

export const EPA_CATEGORY_LABELS: Record<EpaDocumentCategory, string> = {
  ARZTBRIEF: 'Arztbrief',
  MEDIKATIONSPLAN: 'Medikationsplan',
  BEFUND: 'Befund',
  IMPFPASS: 'Impfpass',
  PFLEGEBERICHT: 'Pflegebericht'
};

/** Dokument in der elektronischen Patientenakte (ePA) eines Patienten. */
export interface EpaDocument {
  id: string;
  patientId: string;
  category: EpaDocumentCategory;
  title: string;
  author: string;
  createdAt: string; // ISO-Datum
}

/** Einwilligung des Patienten zum Zugriff des Pflegedienstes auf dessen ePA. */
export interface EpaConsent {
  patientId: string;
  granted: boolean;
  grantedAt?: string; // ISO-Datum
}
