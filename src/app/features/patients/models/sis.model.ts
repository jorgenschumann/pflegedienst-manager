/**
 * Strukturierte Informationssammlung (SIS) nach dem Strukturmodell zur
 * Entbürokratisierung der Pflegedokumentation (vereinbart von GKV-Spitzenverband,
 * Pflegeberufe und Kostenträgern). Gliedert sich in 6 Themenfelder.
 */
export type SisThemenfeldCode =
  | 'KOGNITION_KOMMUNIKATION'
  | 'MOBILITAET_BEWEGLICHKEIT'
  | 'KRANKHEITSBEZOGENE_ANFORDERUNGEN'
  | 'SELBSTVERSORGUNG'
  | 'LEBEN_SOZIALE_BEZIEHUNGEN'
  | 'HAUSHALTSFUEHRUNG';

export interface SisThemenfeld {
  code: SisThemenfeldCode;
  /** Freitext-Einschätzung der Pflegefachkraft zu diesem Themenfeld. */
  text: string;
}

export interface SisRecord {
  id: string;
  patientId: string;
  createdAt: string; // ISO-Datum
  createdBy: string; // Employee-ID
  lastUpdatedAt: string; // ISO-Datum
  /** Kurzbiografie / wichtige Gewohnheiten und Vorlieben. */
  biografieNotizen: string;
  themenfelder: SisThemenfeld[];
  /** Nächstes geplantes Evaluationsdatum der SIS (i.d.R. anlassbezogen + jährlich). */
  nextReviewDate: string; // ISO-Datum
}

export const SIS_THEMENFELD_LABELS: Record<SisThemenfeldCode, string> = {
  KOGNITION_KOMMUNIKATION: 'Kognition und Kommunikation',
  MOBILITAET_BEWEGLICHKEIT: 'Mobilität und Beweglichkeit',
  KRANKHEITSBEZOGENE_ANFORDERUNGEN: 'Krankheitsbezogene Anforderungen und Belastungen',
  SELBSTVERSORGUNG: 'Selbstversorgung',
  LEBEN_SOZIALE_BEZIEHUNGEN: 'Leben in sozialen Beziehungen',
  HAUSHALTSFUEHRUNG: 'Haushaltsführung'
};
