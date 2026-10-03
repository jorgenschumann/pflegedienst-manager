export type MedicationForm =
  | 'TABLETTE'
  | 'KAPSEL'
  | 'TROPFEN'
  | 'SALBE'
  | 'PFLASTER'
  | 'INJEKTION'
  | 'SPRAY';

export const MEDICATION_FORM_LABELS: Record<MedicationForm, string> = {
  TABLETTE: 'Tablette',
  KAPSEL: 'Kapsel',
  TROPFEN: 'Tropfen',
  SALBE: 'Salbe',
  PFLASTER: 'Pflaster',
  INJEKTION: 'Injektion',
  SPRAY: 'Spray'
};

/** Zeitfenster für die Einnahme/Gabe eines Medikaments im Tagesverlauf. */
export type MedicationTime = 'MORGENS' | 'MITTAGS' | 'ABENDS' | 'NACHTS' | 'BEI_BEDARF';

export const MEDICATION_TIME_LABELS: Record<MedicationTime, string> = {
  MORGENS: 'Morgens',
  MITTAGS: 'Mittags',
  ABENDS: 'Abends',
  NACHTS: 'Nachts',
  BEI_BEDARF: 'Bei Bedarf'
};

export type ReorderStatus = 'OFFEN' | 'BESTELLT';

export const REORDER_STATUS_LABELS: Record<ReorderStatus, string> = {
  OFFEN: 'Nachbestellung nötig',
  BESTELLT: 'Bestellt'
};

/** Medikamentenplan-Eintrag eines Patienten (Dauer- oder Bedarfsmedikation). */
export interface Medication {
  id: string;
  patientId: string;
  /** Handelsname oder Wirkstoff, z. B. "Ramipril 5 mg". */
  name: string;
  dosage: string; // z. B. "1-0-1", "20 Tropfen"
  form: MedicationForm;
  schedule: MedicationTime[];
  /** Betäubungsmittel – erfordert besonders lückenlose Dokumentation jeder Gabe sowie Vier-Augen-Prinzip bei der Gabe. */
  isBtm: boolean;
  /** Einnahmehinweis aus dem Medikationsplan, z. B. "vor dem Essen" oder "nicht zerkauen". */
  instructions?: string;
  startDate: string; // ISO-Datum
  endDate?: string; // ISO-Datum, gesetzt bei Absetzen
  prescribedBy?: string; // verordnende/r Arzt/Ärztin
  /** Vorrat reicht laut Packungsgröße/Verordnung voraussichtlich bis zu diesem Datum (für Rezeptmanagement). */
  supplyUntil?: string; // ISO-Datum
  note?: string;
  active: boolean;
  /** Aktueller Lagerbestand am Pflegedienst-Depot (für Nachbestellung & BTM-Bestandsbuch). */
  currentStock?: number;
  /** Einheit des Lagerbestands, z. B. "Stk.", "Tbl.", "ml". */
  stockUnit?: string;
  /** Meldebestand – wird dieser unterschritten, erscheint das Medikament in der Nachbestell-Liste. */
  reorderThreshold?: number;
  /** Status einer laufenden Nachbestellung. */
  reorderStatus?: ReorderStatus;
  /** Zeitpunkt der letzten Nachbestellung. */
  lastOrderedAt?: string;
}

export type MedicationAdministrationStatus = 'GEGEBEN' | 'VERWEIGERT' | 'AUSGELASSEN';

export const MEDICATION_ADMINISTRATION_STATUS_LABELS: Record<MedicationAdministrationStatus, string> = {
  GEGEBEN: 'Gegeben',
  VERWEIGERT: 'Verweigert',
  AUSGELASSEN: 'Ausgelassen'
};

/** Protokollierte Einzelgabe eines Medikaments (digitale Bestätigung durch die durchführende Pflegekraft). */
export interface MedicationAdministration {
  id: string;
  medicationId: string;
  patientId: string;
  /** Verknüpfung zum Besuch, falls im Rahmen einer Tour dokumentiert. */
  visitId?: string;
  scheduledTime: MedicationTime;
  administeredAt: string; // ISO-Timestamp
  status: MedicationAdministrationStatus;
  note?: string;
  confirmedBy: string; // Name der durchführenden Pflegekraft
  /** Zweite Bestätigung (Vier-Augen-Prinzip) – erforderlich bei Hochrisiko-/BTM-Medikamenten. */
  secondConfirmedBy?: string;
}
