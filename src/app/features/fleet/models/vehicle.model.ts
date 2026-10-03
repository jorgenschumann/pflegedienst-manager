export type VehicleType = 'PKW' | 'E_BIKE' | 'FAHRRAD';

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  PKW: 'PKW',
  E_BIKE: 'E-Bike',
  FAHRRAD: 'Fahrrad'
};

export type VehicleStatus = 'VERFUEGBAR' | 'IM_EINSATZ' | 'WARTUNG' | 'AUSSER_BETRIEB';

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  VERFUEGBAR: 'Verfügbar',
  IM_EINSATZ: 'Im Einsatz',
  WARTUNG: 'In Wartung',
  AUSSER_BETRIEB: 'Außer Betrieb'
};

/** Ein Fahrzeug/Fortbewegungsmittel des Fuhrparks. */
export interface Vehicle {
  id: string;
  kennzeichen: string;
  type: VehicleType;
  model: string;
  status: VehicleStatus;
  /** Aktueller Kilometerstand laut letztem Fahrtenbucheintrag. */
  kilometerstand: number;
  /** Datum der nächsten TÜV-/HU-Fälligkeit (nur PKW). */
  tuevFaelligkeit?: string; // ISO-Datum
  /** Datum der nächsten Inspektion/Wartung. */
  naechsteWartung?: string; // ISO-Datum
  /** Dauerhaft zugeordnete/r Mitarbeiter/-in (z. B. Dienstwagen), optional. */
  assignedEmployeeId?: string;
  notes?: string;
}
