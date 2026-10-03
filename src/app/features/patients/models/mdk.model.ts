import { Pflegegrad } from './patient.model';

export type MdkAssessmentStatus = 'GEPLANT' | 'DURCHGEFUEHRT' | 'ABGESAGT';

export const MDK_STATUS_LABELS: Record<MdkAssessmentStatus, string> = {
  GEPLANT: 'Geplant',
  DURCHGEFUEHRT: 'Durchgeführt',
  ABGESAGT: 'Abgesagt'
};

/** Einzelner Eintrag in der Pflegegrad-Historie eines Patienten (Einstufung/Höherstufung). */
export interface PflegegradHistoryEntry {
  id: string;
  patientId: string;
  pflegegrad: Pflegegrad;
  validFrom: string; // ISO-Datum, ab dem der Grad gilt
  decisionDate: string; // ISO-Datum des Bescheids der Pflegekasse
  note?: string;
}

/** Begutachtungstermin durch den Medizinischen Dienst (MD, vormals MDK) zur (Neu-)Einstufung. */
export interface MdkAssessment {
  id: string;
  patientId: string;
  scheduledDate: string; // ISO-Datum
  status: MdkAssessmentStatus;
  assessorOrganization: string; // z. B. "Medizinischer Dienst Baden-Württemberg"
  reason: string; // z. B. "Erstbegutachtung", "Höherstufungsantrag"
  resultPflegegrad?: Pflegegrad; // nach Durchführung eingetragen
  note?: string;
}
