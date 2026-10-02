export type ShiftType = 'FRUEHDIENST' | 'SPAETDIENST' | 'NACHTDIENST' | 'BEREITSCHAFT';
export type ShiftStatus = 'GEPLANT' | 'BESTAETIGT' | 'ENTFALLEN' | 'VERTRETUNG';

export interface Shift {
  id: string;
  employeeId: string;
  tourId?: string;
  type: ShiftType;
  status: ShiftStatus;
  date: string; // ISO-Datum (Tag der Schicht)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  /** Gesetzt, wenn die Schicht wegen Ausfall (Krankheit/Urlaub) von jemand anderem übernommen wurde. */
  substituteForEmployeeId?: string;
}

/** Rahmendienstplan: wiederkehrendes Schichtmuster je Mitarbeiter (Drag-and-Drop-Basis). */
export interface ShiftTemplate {
  id: string;
  employeeId: string;
  weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sonntag
  type: ShiftType;
  startTime: string;
  endTime: string;
}
