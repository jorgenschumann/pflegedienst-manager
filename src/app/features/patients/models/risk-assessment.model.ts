export type RiskAssessmentType = 'STURZ' | 'DEKUBITUS' | 'ERNAEHRUNG';
export type RiskLevel = 'NIEDRIG' | 'MITTEL' | 'HOCH';

export interface RiskAssessment {
  id: string;
  patientId: string;
  type: RiskAssessmentType;
  assessedAt: string; // ISO-Datum
  assessedBy: string; // Employee-ID
  riskLevel: RiskLevel;
  /** Skalenwert, sofern ein standardisiertes Instrument verwendet wurde (z. B. Braden-Skala 6–23). */
  score?: number;
  notes?: string;
  nextAssessmentDate: string; // ISO-Datum
}

export const RISK_ASSESSMENT_LABELS: Record<RiskAssessmentType, string> = {
  STURZ: 'Sturzrisiko',
  DEKUBITUS: 'Dekubitusrisiko (Braden-Skala)',
  ERNAEHRUNG: 'Ernährungsrisiko (Screening)'
};
