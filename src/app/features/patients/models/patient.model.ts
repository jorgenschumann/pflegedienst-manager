export type Pflegegrad = 0 | 1 | 2 | 3 | 4 | 5; // 0 = kein Pflegegrad (nur Verhinderungspflege o.ä.)
export type InsuranceType = 'GKV' | 'PKV';

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Address {
  street: string;
  zip: string;
  city: string;
  /** Näherungs-Koordinaten für die Routenoptimierung (Demo: ohne externe Geocoding-API ermittelt). */
  location?: GeoLocation;
}

export interface Insurance {
  type: InsuranceType;
  providerName: string; // z. B. "AOK Baden-Württemberg"
  insuranceNumber: string;
}

/** Bevollmächtigte/r oder gesetzliche/r Betreuer/in für rechtliche Angelegenheiten. */
export interface LegalRepresentative {
  name: string;
  relationship: string; // z. B. "Sohn", "Berufsbetreuerin"
  phone: string;
  isLegalGuardian: boolean; // true = gerichtlich bestellte Betreuung, false = Vorsorgevollmacht
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO-Datum
  address: Address;
  phone: string;
  email?: string;
  insurance: Insurance;
  pflegegrad: Pflegegrad;
  pflegegradSince?: string; // ISO-Datum
  legalRepresentative?: LegalRepresentative;
  emergencyContact: EmergencyContact;
  /** Für das Stammtouren-Prinzip: dauerhaft zugeordnete Tour-ID(s). */
  assignedTourIds: string[];
  active: boolean;
  admittedAt: string; // ISO-Datum der Aufnahme in die Pflege
}
