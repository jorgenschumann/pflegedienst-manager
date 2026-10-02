/** Pflegerische/hauswirtschaftliche Leistungen, die bei einem Besuch erbracht werden können. */
export type LeistungCode =
  | 'GRUNDPFLEGE'
  | 'BEHANDLUNGSPFLEGE'
  | 'MEDIKAMENTENGABE'
  | 'VERBANDSWECHSEL'
  | 'HAUSWIRTSCHAFT'
  | 'BLUTDRUCKMESSUNG'
  | 'BLUTZUCKERMESSUNG';

export const LEISTUNG_LABELS: Record<LeistungCode, string> = {
  GRUNDPFLEGE: 'Grundpflege',
  BEHANDLUNGSPFLEGE: 'Behandlungspflege',
  MEDIKAMENTENGABE: 'Medikamentengabe',
  VERBANDSWECHSEL: 'Verbandswechsel',
  HAUSWIRTSCHAFT: 'Hauswirtschaft',
  BLUTDRUCKMESSUNG: 'Blutdruckmessung',
  BLUTZUCKERMESSUNG: 'Blutzuckermessung'
};

export type VisitStatus = 'GEPLANT' | 'ERLEDIGT' | 'AUSGEFALLEN';

/** Ein einzelner Besuch bei einem Patienten innerhalb einer Tour. */
export interface Visit {
  id: string;
  tourId: string;
  patientId: string;
  /** Reihenfolge des Besuchs innerhalb der Tour (1-basiert). */
  sequence: number;
  plannedStart: string; // HH:mm
  plannedEnd: string; // HH:mm
  leistungen: LeistungCode[];
  status: VisitStatus;
  notes?: string;
}

export type TourStatus = 'GEPLANT' | 'IN_ARBEIT' | 'ABGESCHLOSSEN';

/** Eine Tour fasst die Besuche eines Mitarbeiters an einem Tag zu einer Route zusammen. */
export interface Tour {
  id: string;
  date: string; // ISO-Datum
  employeeId: string;
  name: string;
  status: TourStatus;
  visitIds: string[];
}
