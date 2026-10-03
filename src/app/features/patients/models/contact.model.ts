export type PowerOfAttorneyType =
  | 'VORSORGEVOLLMACHT'
  | 'PATIENTENVERFUEGUNG'
  | 'BETREUUNGSVERFUEGUNG'
  | 'GERICHTLICHE_BETREUUNG';

export const POWER_OF_ATTORNEY_LABELS: Record<PowerOfAttorneyType, string> = {
  VORSORGEVOLLMACHT: 'Vorsorgevollmacht',
  PATIENTENVERFUEGUNG: 'Patientenverfügung',
  BETREUUNGSVERFUEGUNG: 'Betreuungsverfügung',
  GERICHTLICHE_BETREUUNG: 'Gerichtlich bestellte Betreuung'
};

export const ALL_POWER_OF_ATTORNEY_TYPES: PowerOfAttorneyType[] = Object.keys(
  POWER_OF_ATTORNEY_LABELS
) as PowerOfAttorneyType[];

/** Angehöriger/Kontaktperson eines Patienten inkl. hinterlegter Vollmachten/Verfügungen. */
export interface Contact {
  id: string;
  patientId: string;
  name: string;
  relationship: string; // z. B. "Sohn", "Tochter", "Nachbar/-in"
  phone: string;
  email?: string;
  isEmergencyContact: boolean;
  powersOfAttorney: PowerOfAttorneyType[];
  /** Ob das jeweilige Dokument in Kopie in der Patientenakte hinterlegt ist. */
  documentOnFile: boolean;
  notes?: string;
}
