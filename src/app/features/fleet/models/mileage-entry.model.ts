/** Ein Fahrtenbuch-Eintrag (Dienstfahrt) für ein Fahrzeug. */
export interface MileageEntry {
  id: string;
  vehicleId: string;
  employeeId: string;
  /** Verknüpfte Tour, falls die Fahrt im Rahmen einer Tour erfolgte. */
  tourId?: string;
  date: string; // ISO-Datum
  startKm: number;
  endKm: number;
  purpose: string; // z. B. "Tour 2 – Stuttgart" oder "Werkstatt"
  notes?: string;
}
