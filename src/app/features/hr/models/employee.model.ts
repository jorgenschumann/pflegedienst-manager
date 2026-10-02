import { Qualification } from './qualification.model';

export type EmploymentType = 'VOLLZEIT' | 'TEILZEIT' | 'MINIJOB' | 'AUSHILFE';

export interface WorkingHoursContract {
  /** Vertragliche Soll-Arbeitszeit pro Woche in Stunden. */
  weeklyTargetHours: number;
  employmentType: EmploymentType;
  /** Aktueller Saldo des Arbeitszeitkontos in Stunden (positiv = Überstunden). */
  timeAccountBalanceHours: number;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'PFLEGEFACHKRAFT' | 'PFLEGEHELFER' | 'TEAMLEITUNG' | 'VERWALTUNG';
  qualifications: Qualification[];
  contract: WorkingHoursContract;
  /** Für das Stammtouren-Prinzip: dauerhaft zugeordnete Tour-ID(s). */
  assignedTourIds: string[];
  active: boolean;
}
