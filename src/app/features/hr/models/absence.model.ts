export type AbsenceType = 'URLAUB' | 'KRANKHEIT' | 'FORTBILDUNG' | 'SONSTIGES';
export type AbsenceStatus = 'BEANTRAGT' | 'GENEHMIGT' | 'ABGELEHNT' | 'STORNIERT';

export interface Absence {
  id: string;
  employeeId: string;
  type: AbsenceType;
  status: AbsenceStatus;
  startDate: string; // ISO-Datum
  endDate: string; // ISO-Datum
  /** Anzahl der angerechneten Urlaubs-/Ausfalltage. */
  days: number;
  note?: string;
  requestedAt: string; // ISO-Timestamp
  decidedBy?: string; // Employee-ID der entscheidenden Teamleitung
}
