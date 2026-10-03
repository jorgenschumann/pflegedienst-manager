import { LeistungCode } from '../../touren/models';

/** Rechtsgrundlage der Abrechnung: Pflegeversicherung (SGB XI) oder Krankenversicherung (SGB V). */
export type LegalBasis = 'SGB_XI' | 'SGB_V';

export const LEGAL_BASIS_LABELS: Record<LegalBasis, string> = {
  SGB_XI: '§ 105 SGB XI (Pflegekasse)',
  SGB_V: '§ 302 SGB V (Krankenkasse)'
};

/** Ordnet jede Leistung ihrer abrechnungsrechtlichen Grundlage zu. */
export const LEISTUNG_LEGAL_BASIS: Record<LeistungCode, LegalBasis> = {
  GRUNDPFLEGE: 'SGB_XI',
  HAUSWIRTSCHAFT: 'SGB_XI',
  BEHANDLUNGSPFLEGE: 'SGB_V',
  MEDIKAMENTENGABE: 'SGB_V',
  VERBANDSWECHSEL: 'SGB_V',
  BLUTDRUCKMESSUNG: 'SGB_V',
  BLUTZUCKERMESSUNG: 'SGB_V'
};

/** Pauschalpreis je Einsatz/Leistungskomplex in EUR (vereinfachtes Demo-Preismodell). */
export const LEISTUNG_PRICES: Record<LeistungCode, number> = {
  GRUNDPFLEGE: 18.5,
  HAUSWIRTSCHAFT: 15.2,
  BEHANDLUNGSPFLEGE: 12.8,
  MEDIKAMENTENGABE: 6.5,
  VERBANDSWECHSEL: 14.9,
  BLUTDRUCKMESSUNG: 5.3,
  BLUTZUCKERMESSUNG: 5.8
};

export type AbrechnungStatus = 'ENTWURF' | 'ERSTELLT' | 'UEBERMITTELT' | 'BEZAHLT' | 'ZURUECKGEWIESEN';

export const ABRECHNUNG_STATUS_LABELS: Record<AbrechnungStatus, string> = {
  ENTWURF: 'Entwurf',
  ERSTELLT: 'Erstellt',
  UEBERMITTELT: 'Übermittelt',
  BEZAHLT: 'Bezahlt',
  ZURUECKGEWIESEN: 'Zurückgewiesen'
};

/** Einzelne abgerechnete Leistung innerhalb einer Abrechnung (ein Besuch kann mehrere Positionen erzeugen). */
export interface AbrechnungPosition {
  id: string;
  visitId: string;
  date: string; // ISO-Datum des Besuchs
  leistung: LeistungCode;
  amount: number; // EUR
}

/**
 * Sammelabrechnung für einen Patienten, einen Zeitraum und eine Rechtsgrundlage (Kasse).
 * Fasst alle im Zeitraum dokumentierten (erledigten) Besuche mit passenden Leistungen zusammen.
 */
export interface Abrechnung {
  id: string;
  patientId: string;
  kostentraegerName: string; // z. B. "AOK Baden-Württemberg"
  legalBasis: LegalBasis;
  periodStart: string; // ISO-Datum
  periodEnd: string; // ISO-Datum
  positions: AbrechnungPosition[];
  totalAmount: number; // EUR, Summe der Positionen
  status: AbrechnungStatus;
  createdAt: string; // ISO-Timestamp
  submittedAt?: string; // ISO-Timestamp
  paidAt?: string; // ISO-Timestamp
  rejectionReason?: string;
}
