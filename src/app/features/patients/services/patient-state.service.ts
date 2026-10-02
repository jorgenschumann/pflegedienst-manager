import { Injectable, computed, signal } from '@angular/core';
import {
  Patient,
  Pflegegrad,
  RiskAssessment,
  RiskAssessmentType,
  RiskLevel,
  SisRecord,
  SisThemenfeldCode
} from '../models';

/** Deterministischer Pseudozufallsgenerator (mulberry32) für stabile Demodaten. */
function createRng(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = createRng(7);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];
const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');

const FIRST_NAMES = [
  'Hildegard', 'Werner', 'Ingrid', 'Helmut', 'Ursula', 'Karl-Heinz', 'Gertrud', 'Herbert', 'Erika', 'Günther',
  'Elfriede', 'Heinz', 'Christa', 'Horst', 'Ilse', 'Manfred', 'Edith', 'Rolf', 'Annemarie', 'Dieter',
  'Brigitte', 'Walter', 'Renate', 'Gerhard', 'Gisela', 'Klaus', 'Marianne', 'Alfred', 'Waltraud', 'Siegfried'
];

const LAST_NAMES = [
  'Schmidt', 'Müller', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Hoffmann', 'Schäfer',
  'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun',
  'Krüger', 'Hofmann', 'Hartmann', 'Lange', 'Schmitt', 'Werner', 'Krause', 'Meier', 'Lehmann', 'Huber'
];

const STREETS = [
  'Hauptstraße', 'Gartenweg', 'Bergstraße', 'Schulstraße', 'Lindenallee', 'Kirchweg', 'Rosenweg', 'Am Markt',
  'Talstraße', 'Birkenweg'
];

const CITIES = [
  { zip: '70173', city: 'Stuttgart' },
  { zip: '76133', city: 'Karlsruhe' },
  { zip: '79098', city: 'Freiburg im Breisgau' },
  { zip: '68159', city: 'Mannheim' },
  { zip: '72070', city: 'Tübingen' },
  { zip: '89073', city: 'Ulm' }
];

const INSURANCE_PROVIDERS = [
  { type: 'GKV' as const, name: 'AOK Baden-Württemberg' },
  { type: 'GKV' as const, name: 'Techniker Krankenkasse' },
  { type: 'GKV' as const, name: 'Barmer' },
  { type: 'GKV' as const, name: 'DAK-Gesundheit' },
  { type: 'PKV' as const, name: 'Allianz Private Krankenversicherung' },
  { type: 'PKV' as const, name: 'Debeka' }
];

/** Realistische Pflegegrad-Verteilung: höhere Grade seltener als mittlere. */
const PFLEGEGRAD_WEIGHTS: { grad: Pflegegrad; weight: number }[] = [
  { grad: 1, weight: 1 },
  { grad: 2, weight: 4 },
  { grad: 3, weight: 4 },
  { grad: 4, weight: 2 },
  { grad: 5, weight: 1 }
];

function pickPflegegrad(): Pflegegrad {
  const total = PFLEGEGRAD_WEIGHTS.reduce((sum, w) => sum + w.weight, 0);
  let r = rng() * total;
  for (const entry of PFLEGEGRAD_WEIGHTS) {
    if (r < entry.weight) return entry.grad;
    r -= entry.weight;
  }
  return 2;
}

const today = new Date();
const isoOffset = (daysOffset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().slice(0, 10);
};
const isoYearsAgo = (years: number, extraDaysOffset = 0) => {
  const d = new Date(today);
  d.setFullYear(d.getFullYear() - years);
  d.setDate(d.getDate() + extraDaysOffset);
  return d.toISOString().slice(0, 10);
};

const PATIENT_COUNT = 30;

function generatePatients(): Patient[] {
  const patients: Patient[] = [];

  for (let i = 0; i < PATIENT_COUNT; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i * 5 + 11) % LAST_NAMES.length];
    const location = CITIES[i % CITIES.length];
    const insurance = INSURANCE_PROVIDERS[i % INSURANCE_PROVIDERS.length];
    const ageYears = 68 + Math.floor(rng() * 25); // 68–92 Jahre, typisch für ambulante Pflege
    const pflegegrad = pickPflegegrad();
    const hasLegalRepresentative = rng() > 0.4;

    patients.push({
      id: `pat-${i + 1}`,
      firstName,
      lastName,
      dateOfBirth: isoYearsAgo(ageYears, Math.floor(rng() * 300)),
      address: {
        street: `${pick(STREETS)} ${1 + Math.floor(rng() * 60)}`,
        zip: location.zip,
        city: location.city
      },
      phone: `0711-${(2000000 + i * 37).toString()}`,
      insurance: {
        type: insurance.type,
        providerName: insurance.name,
        insuranceNumber: `${toSlug(lastName).slice(0, 2).toUpperCase()}${100000000 + i * 777}`
      },
      pflegegrad,
      pflegegradSince: pflegegrad > 0 ? isoYearsAgo(1 + Math.floor(rng() * 4)) : undefined,
      legalRepresentative: hasLegalRepresentative
        ? {
            name: `${pick(FIRST_NAMES)} ${lastName}`,
            relationship: pick(['Sohn', 'Tochter', 'Ehepartner/-in', 'Berufsbetreuer/-in']),
            phone: `0711-${(3000000 + i * 41).toString()}`,
            isLegalGuardian: rng() > 0.6
          }
        : undefined,
      emergencyContact: {
        name: `${pick(FIRST_NAMES)} ${lastName}`,
        relationship: pick(['Sohn', 'Tochter', 'Nachbar/-in', 'Ehepartner/-in']),
        phone: `0711-${(4000000 + i * 53).toString()}`
      },
      assignedTourIds: [],
      active: i < PATIENT_COUNT - 2, // 2 Patienten als "entlassen/inaktiv" für Demo-Zwecke
      admittedAt: isoYearsAgo(Math.floor(rng() * 3), Math.floor(rng() * 300))
    });
  }

  return patients;
}

const THEMENFELD_TEXTE: Record<SisThemenfeldCode, string[]> = {
  KOGNITION_KOMMUNIKATION: [
    'Örtlich und zeitlich orientiert, kommuniziert klar und verständlich.',
    'Leichte Vergesslichkeit bei Terminen, versteht Anweisungen gut.',
    'Deutlich eingeschränktes Kurzzeitgedächtnis, benötigt wiederholte Erklärungen.'
  ],
  MOBILITAET_BEWEGLICHKEIT: [
    'Mobilisiert sich selbstständig mit Rollator im Wohnbereich.',
    'Benötigt Unterstützung beim Transfer Bett-Stuhl, sonst gehfähig.',
    'Weitgehend bettlägerig, Lagerung durch Pflegekraft erforderlich.'
  ],
  KRANKHEITSBEZOGENE_ANFORDERUNGEN: [
    'Insulinpflichtiger Diabetes mellitus Typ 2, Medikamentengabe durch Pflegedienst.',
    'Z.n. Apoplex, Blutdruckkontrolle und Medikamentenstellung erforderlich.',
    'Chronische Wunde am linken Unterschenkel, regelmäßiger Verbandswechsel.'
  ],
  SELBSTVERSORGUNG: [
    'Übernimmt Körperpflege größtenteils selbstständig, Hilfe bei Rücken/Füßen.',
    'Benötigt vollständige Unterstützung bei Körperpflege und Ankleiden.',
    'Selbstständig bei Nahrungsaufnahme, Unterstützung bei Zubereitung nötig.'
  ],
  LEBEN_SOZIALE_BEZIEHUNGEN: [
    'Regelmäßiger Besuch der Familie, nimmt am Dorfleben teil.',
    'Lebt allein, wöchentlicher Kontakt zu Tochter, sonst zurückgezogen.',
    'Guter Kontakt zu Nachbarschaft, besucht Seniorentreff.'
  ],
  HAUSHALTSFUEHRUNG: [
    'Haushalt wird komplett durch Angehörige übernommen.',
    'Kleinere Tätigkeiten selbstständig, Reinigung durch Haushaltshilfe.',
    'Einkäufe und Reinigung vollständig durch Pflegedienst/Angehörige organisiert.'
  ]
};

function generateSisRecords(patients: Patient[]): SisRecord[] {
  const codes = Object.keys(THEMENFELD_TEXTE) as SisThemenfeldCode[];

  return patients
    .filter((p) => p.active)
    .map((patient, idx) => ({
      id: `sis-${patient.id}`,
      patientId: patient.id,
      createdAt: isoYearsAgo(Math.floor(rng() * 2)),
      createdBy: 'emp-1',
      lastUpdatedAt: isoOffset(-Math.floor(rng() * 90)),
      biografieNotizen: 'War früher berufstätig als Handwerker/-in, mag klassische Musik, bevorzugt feste Tagesstruktur.',
      themenfelder: codes.map((code) => ({
        code,
        text: THEMENFELD_TEXTE[code][idx % THEMENFELD_TEXTE[code].length]
      })),
      nextReviewDate: isoOffset(30 + Math.floor(rng() * 300))
    }));
}

function pickRiskLevel(biasHigherForPflegegrad: Pflegegrad): RiskLevel {
  // Höherer Pflegegrad → tendenziell höheres Risiko (realistische Korrelation).
  const r = rng();
  if (biasHigherForPflegegrad >= 4) return r > 0.5 ? 'HOCH' : r > 0.2 ? 'MITTEL' : 'NIEDRIG';
  if (biasHigherForPflegegrad >= 2) return r > 0.75 ? 'HOCH' : r > 0.35 ? 'MITTEL' : 'NIEDRIG';
  return r > 0.85 ? 'MITTEL' : 'NIEDRIG';
}

function generateRiskAssessments(patients: Patient[]): RiskAssessment[] {
  const types: RiskAssessmentType[] = ['STURZ', 'DEKUBITUS', 'ERNAEHRUNG'];
  const assessments: RiskAssessment[] = [];

  for (const patient of patients.filter((p) => p.active)) {
    for (const type of types) {
      const riskLevel = pickRiskLevel(patient.pflegegrad);
      const score = type === 'DEKUBITUS' ? 23 - (riskLevel === 'HOCH' ? 14 : riskLevel === 'MITTEL' ? 8 : 2) - Math.floor(rng() * 3) : undefined;
      assessments.push({
        id: `risk-${patient.id}-${type}`,
        patientId: patient.id,
        type,
        assessedAt: isoOffset(-Math.floor(rng() * 60)),
        assessedBy: 'emp-1',
        riskLevel,
        score,
        nextAssessmentDate: isoOffset(14 + Math.floor(rng() * 60))
      });
    }
  }

  return assessments;
}

const INITIAL_PATIENTS = generatePatients();
const INITIAL_SIS_RECORDS = generateSisRecords(INITIAL_PATIENTS);
const INITIAL_RISK_ASSESSMENTS = generateRiskAssessments(INITIAL_PATIENTS);

/**
 * Zentraler Patienten-State-Service (Stammdaten, SIS-Dokumentation, Risikoeinschätzungen).
 * Verwendet Angular Signals als Single Source of Truth; aktuell mit In-Memory-Daten,
 * später austauschbar gegen einen HttpClient-Backend-Call.
 */
@Injectable({ providedIn: 'root' })
export class PatientStateService {
  private readonly _patients = signal<Patient[]>(INITIAL_PATIENTS);
  private readonly _sisRecords = signal<SisRecord[]>(INITIAL_SIS_RECORDS);
  private readonly _riskAssessments = signal<RiskAssessment[]>(INITIAL_RISK_ASSESSMENTS);

  readonly patients = this._patients.asReadonly();
  readonly sisRecords = this._sisRecords.asReadonly();
  readonly riskAssessments = this._riskAssessments.asReadonly();

  readonly activePatients = computed(() => this._patients().filter((p) => p.active));

  readonly patientsByPflegegradCount = computed(() => {
    const counts = new Map<Pflegegrad, number>();
    for (const p of this.activePatients()) {
      counts.set(p.pflegegrad, (counts.get(p.pflegegrad) ?? 0) + 1);
    }
    return counts;
  });

  /** Patienten, deren SIS-Evaluation überfällig ist (nextReviewDate in der Vergangenheit). */
  readonly overdueSisReviews = computed(() => {
    const todayIso = isoOffset(0);
    return this._sisRecords().filter((s) => s.nextReviewDate < todayIso);
  });

  /** Risikoeinschätzungen mit Stufe HOCH bei aktiven Patienten (für Dashboard-Hinweise). */
  readonly highRiskAssessments = computed(() =>
    this._riskAssessments().filter((r) => r.riskLevel === 'HOCH')
  );

  // ---- Patient CRUD ----
  addPatient(patient: Patient): void {
    this._patients.update((list) => [...list, patient]);
  }

  updatePatient(id: string, changes: Partial<Patient>): void {
    this._patients.update((list) => list.map((p) => (p.id === id ? { ...p, ...changes } : p)));
  }

  deactivatePatient(id: string): void {
    this.updatePatient(id, { active: false });
  }

  getPatient(id: string): Patient | undefined {
    return this._patients().find((p) => p.id === id);
  }

  // ---- SIS ----
  getSisRecord(patientId: string): SisRecord | undefined {
    return this._sisRecords().find((s) => s.patientId === patientId);
  }

  upsertSisRecord(record: SisRecord): void {
    this._sisRecords.update((list) => {
      const exists = list.some((s) => s.id === record.id);
      return exists ? list.map((s) => (s.id === record.id ? record : s)) : [...list, record];
    });
  }

  // ---- Risikoeinschätzungen ----
  getRiskAssessments(patientId: string): RiskAssessment[] {
    return this._riskAssessments().filter((r) => r.patientId === patientId);
  }

  upsertRiskAssessment(assessment: RiskAssessment): void {
    this._riskAssessments.update((list) => {
      const exists = list.some((r) => r.id === assessment.id);
      return exists ? list.map((r) => (r.id === assessment.id ? assessment : r)) : [...list, assessment];
    });
  }
}
