/**
 * Qualifikationen gemäß SGB V / SGB XI – steuern, welche Leistungen
 * eine Pflegekraft erbringen darf (Qualifikationsmatrix).
 */
export type QualificationCode =
  | 'EXAMINIERTE_PFLEGEFACHKRAFT' // Pflegefachkraft, examiniert
  | 'PFLEGEHELFER_1_JAHR' // 1-jährig ausgebildete Pflegehilfskraft
  | 'PFLEGEHELFER_BASISKURS' // Basiskurs-Pflegehelfer
  | 'BEHANDLUNGSPFLEGE_LG1' // Leistungsgruppe 1 nach SGB V
  | 'BEHANDLUNGSPFLEGE_LG2' // Leistungsgruppe 2 nach SGB V (z.B. Injektionen, Wundversorgung)
  | 'WUNDMANAGER'
  | 'PRAXISANLEITER'
  | 'FAHRERLAUBNIS_PKW'
  | 'BETREUUNGSKRAFT_43B'; // Zusätzliche Betreuungskraft nach § 43b / § 53c SGB XI (Ergänzende Hilfen)

export interface Qualification {
  code: QualificationCode;
  label: string;
  /** Gültigkeit, falls die Qualifikation turnusmäßig erneuert werden muss (z. B. Erste-Hilfe-Auffrischung). */
  validUntil?: string; // ISO-Datum
}

/** Leistungen, die eine bestimmte Mindest-Qualifikation voraussetzen. */
export interface ServiceQualificationRequirement {
  serviceCode: string; // z. B. 'LG2_WUNDVERSORGUNG'
  serviceLabel: string;
  requiredQualifications: QualificationCode[];
}

/** Anzeige-Label je Qualifikationscode, für Spaltentitel der Qualifikationsmatrix. */
export const QUALIFICATION_LABELS: Record<QualificationCode, string> = {
  EXAMINIERTE_PFLEGEFACHKRAFT: 'Examinierte Pflegefachkraft',
  PFLEGEHELFER_1_JAHR: '1-jährige Pflegehilfskraft',
  PFLEGEHELFER_BASISKURS: 'Basiskurs-Pflegehelfer',
  BEHANDLUNGSPFLEGE_LG1: 'Behandlungspflege LG1',
  BEHANDLUNGSPFLEGE_LG2: 'Behandlungspflege LG2',
  WUNDMANAGER: 'Wundmanager',
  PRAXISANLEITER: 'Praxisanleiter/-in',
  FAHRERLAUBNIS_PKW: 'Fahrerlaubnis PKW',
  BETREUUNGSKRAFT_43B: 'Betreuungskraft § 43b'
};

export const ALL_QUALIFICATION_CODES: QualificationCode[] = Object.keys(QUALIFICATION_LABELS) as QualificationCode[];
