import { Injectable, computed, signal } from '@angular/core';
import {
  Medication,
  MedicationAdministration,
  MedicationTime,
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
  { zip: '70173', city: 'Stuttgart', lat: 48.7758, lng: 9.1829 },
  { zip: '76133', city: 'Karlsruhe', lat: 49.0069, lng: 8.4037 },
  { zip: '79098', city: 'Freiburg im Breisgau', lat: 47.9990, lng: 7.8421 },
  { zip: '68159', city: 'Mannheim', lat: 49.4875, lng: 8.4660 },
  { zip: '72070', city: 'Tübingen', lat: 48.5216, lng: 9.0576 },
  { zip: '89073', city: 'Ulm', lat: 48.4011, lng: 9.9876 }
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
        city: location.city,
        // Jitter von bis zu ±0.03° (≈ ±3 km) um das Stadtzentrum, um plausible Einzeladressen zu simulieren.
        location: { lat: location.lat + (rng() - 0.5) * 0.06, lng: location.lng + (rng() - 0.5) * 0.06 }
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

const MEDICATION_CATALOG: {
  name: string;
  dosage: string;
  form: Medication['form'];
  schedule: MedicationTime[];
  isBtm?: boolean;
  instructions?: string;
}[] = [
  { name: 'Ramipril 5 mg', dosage: '1-0-0', form: 'TABLETTE', schedule: ['MORGENS'], instructions: 'Morgens vor dem Frühstück' },
  { name: 'Metformin 850 mg', dosage: '1-0-1', form: 'TABLETTE', schedule: ['MORGENS', 'ABENDS'], instructions: 'Zu den Mahlzeiten einnehmen' },
  { name: 'ASS 100', dosage: '1-0-0', form: 'TABLETTE', schedule: ['MORGENS'], instructions: 'Nach dem Essen' },
  { name: 'L-Thyroxin 75 µg', dosage: '1-0-0', form: 'TABLETTE', schedule: ['MORGENS'], instructions: 'Nüchtern, 30 Min. vor dem Frühstück' },
  { name: 'Simvastatin 20 mg', dosage: '0-0-1', form: 'TABLETTE', schedule: ['ABENDS'], instructions: 'Abends einnehmen' },
  { name: 'Pantoprazol 40 mg', dosage: '1-0-0', form: 'KAPSEL', schedule: ['MORGENS'], instructions: 'Vor dem Essen, nicht zerkauen' },
  { name: 'Torasemid 10 mg', dosage: '1-0-0', form: 'TABLETTE', schedule: ['MORGENS'] },
  { name: 'Bisoprolol 5 mg', dosage: '1-0-0', form: 'TABLETTE', schedule: ['MORGENS'] },
  { name: 'Novaminsulfon-Tropfen', dosage: '20 Tropfen', form: 'TROPFEN', schedule: ['BEI_BEDARF'], instructions: 'Bei Bedarf, max. 4x täglich' },
  { name: 'Macrogol', dosage: '1 Btl.', form: 'TABLETTE', schedule: ['MORGENS'], instructions: 'In einem Glas Wasser auflösen' },
  {
    name: 'Oxycodon 10 mg',
    dosage: '1-0-1',
    form: 'TABLETTE',
    schedule: ['MORGENS', 'ABENDS'],
    isBtm: true,
    instructions: 'Vier-Augen-Prinzip: Gabe durch zweite Fachkraft bestätigen lassen'
  },
  { name: 'Marcumar', dosage: 'nach Plan', form: 'TABLETTE', schedule: ['ABENDS'], instructions: 'Gemäß aktuellem Gerinnungs-Ausweis' }
];

/** Generiert einen plausiblen Medikationsplan (1–4 Medikamente) je aktivem Patienten. */
function generateMedications(patients: Patient[]): Medication[] {
  const medications: Medication[] = [];

  for (const patient of patients.filter((p) => p.active)) {
    const count = 1 + Math.floor(rng() * 4);
    const usedIndices = new Set<number>();
    for (let i = 0; i < count; i++) {
      let idx = Math.floor(rng() * MEDICATION_CATALOG.length);
      let attempts = 0;
      while (usedIndices.has(idx) && attempts < MEDICATION_CATALOG.length) {
        idx = (idx + 1) % MEDICATION_CATALOG.length;
        attempts++;
      }
      usedIndices.add(idx);
      const entry = MEDICATION_CATALOG[idx];

      medications.push({
        id: `med-${patient.id}-${i + 1}`,
        patientId: patient.id,
        name: entry.name,
        dosage: entry.dosage,
        form: entry.form,
        schedule: entry.schedule,
        isBtm: !!entry.isBtm,
        instructions: entry.instructions,
        startDate: isoYearsAgo(0, -(30 + Math.floor(rng() * 300))),
        prescribedBy: pick(['Dr. med. Brandt', 'Dr. med. Vogel', 'Dr. med. Lindner', 'Dr. med. Ahrens']),
        // Vorrat: ca. 10% der Medikamente laufen demnächst (0–10 Tage) aus, Rest 11–45 Tage – für Rezeptmanagement-Demo.
        supplyUntil: isoOffset(rng() > 0.9 ? Math.floor(rng() * 10) : 11 + Math.floor(rng() * 35)),
        active: true
      });
    }
  }

  return medications;
}

/** Erzeugt für die letzten 3 Tage ein Gabenprotokoll je Medikament und planmäßigem Zeitfenster. */
function generateMedicationAdministrations(medications: Medication[]): MedicationAdministration[] {
  const administrations: MedicationAdministration[] = [];
  const confirmers = ['Anna Keller', 'Julia Schröder', 'Laura Hofmann', 'Sophie Meier', 'Markus Weber'];

  for (const med of medications) {
    for (let dayOffset = -2; dayOffset <= 0; dayOffset++) {
      const dateIso = isoOffset(dayOffset);
      for (const time of med.schedule) {
        if (time === 'BEI_BEDARF') continue; // Bedarfsmedikation wird nicht planmäßig protokolliert
        if (dayOffset === 0 && rng() > 0.5) continue; // heute teils noch offen/ungegeben
        const statusRoll = rng();
        administrations.push({
          id: `admin-${med.id}-${dateIso}-${time}`,
          medicationId: med.id,
          patientId: med.patientId,
          scheduledTime: time,
          administeredAt: `${dateIso}T${time === 'MORGENS' ? '08:00' : time === 'MITTAGS' ? '12:30' : time === 'ABENDS' ? '18:30' : '21:30'}:00`,
          status: statusRoll > 0.92 ? 'VERWEIGERT' : statusRoll > 0.88 ? 'AUSGELASSEN' : 'GEGEBEN',
          confirmedBy: pick(confirmers)
        });
      }
    }
  }

  return administrations;
}

const INITIAL_PATIENTS = generatePatients();
const INITIAL_SIS_RECORDS = generateSisRecords(INITIAL_PATIENTS);
const INITIAL_RISK_ASSESSMENTS = generateRiskAssessments(INITIAL_PATIENTS);
const INITIAL_MEDICATIONS = generateMedications(INITIAL_PATIENTS);
const INITIAL_MEDICATION_ADMINISTRATIONS = generateMedicationAdministrations(INITIAL_MEDICATIONS);

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
  private readonly _medications = signal<Medication[]>(INITIAL_MEDICATIONS);
  private readonly _medicationAdministrations = signal<MedicationAdministration[]>(
    INITIAL_MEDICATION_ADMINISTRATIONS
  );

  readonly patients = this._patients.asReadonly();
  readonly sisRecords = this._sisRecords.asReadonly();
  readonly riskAssessments = this._riskAssessments.asReadonly();
  readonly medications = this._medications.asReadonly();
  readonly medicationAdministrations = this._medicationAdministrations.asReadonly();

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

  /** Alle Betäubungsmittel-Medikationen aktiver Patienten (erhöhte Dokumentationspflicht). */
  readonly activeBtmMedications = computed(() =>
    this._medications().filter((m) => m.active && m.isBtm)
  );

  /** Aktive Medikamente, deren Vorrat laut Plan innerhalb der nächsten 7 Tage ausläuft (Rezeptmanagement-Erinnerung). */
  readonly medicationsDueForRenewal = computed(() => {
    const limit = isoOffset(7);
    return this._medications().filter((m) => m.active && m.supplyUntil && m.supplyUntil <= limit);
  });

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

  // ---- Medikation ----
  getMedications(patientId: string): Medication[] {
    return this._medications().filter((m) => m.patientId === patientId);
  }

  getActiveMedications(patientId: string): Medication[] {
    return this.getMedications(patientId).filter((m) => m.active);
  }

  addMedication(medication: Medication): void {
    this._medications.update((list) => [...list, medication]);
  }

  updateMedication(id: string, changes: Partial<Medication>): void {
    this._medications.update((list) => list.map((m) => (m.id === id ? { ...m, ...changes } : m)));
  }

  /** Setzt ein Medikament ab: Markiert es als inaktiv und trägt das Enddatum ein. */
  discontinueMedication(id: string): void {
    this.updateMedication(id, { active: false, endDate: new Date().toISOString().slice(0, 10) });
  }

  /** Prüft, ob der Vorrat eines Medikaments innerhalb von 7 Tagen ausläuft (Rezept-Erinnerung). */
  isRenewalDue(medication: Medication): boolean {
    if (!medication.active || !medication.supplyUntil) return false;
    return medication.supplyUntil <= isoOffset(7);
  }

  /**
   * Simuliert das Einlesen des bundeseinheitlichen Medikationsplans (BMP) per QR-Code:
   * ergänzt den Medikationsplan um 1–2 bislang nicht erfasste Einträge aus dem Katalog.
   */
  importFromBmp(patientId: string): number {
    const existingNames = new Set(this.getMedications(patientId).map((m) => m.name));
    const candidates = MEDICATION_CATALOG.filter((entry) => !existingNames.has(entry.name));
    const toImport = candidates.slice(0, 1 + Math.floor(rng() * 2));

    const imported: Medication[] = toImport.map((entry, i) => ({
      id: `med-${patientId}-bmp-${Date.now()}-${i}`,
      patientId,
      name: entry.name,
      dosage: entry.dosage,
      form: entry.form,
      schedule: entry.schedule,
      isBtm: !!entry.isBtm,
      instructions: entry.instructions,
      startDate: isoOffset(0),
      supplyUntil: isoOffset(30),
      note: 'Importiert aus dem bundeseinheitlichen Medikationsplan (BMP)',
      active: true
    }));

    if (imported.length > 0) {
      this._medications.update((list) => [...list, ...imported]);
    }
    return imported.length;
  }

  getMedicationAdministrations(patientId: string): MedicationAdministration[] {
    return this._medicationAdministrations()
      .filter((a) => a.patientId === patientId)
      .sort((a, b) => b.administeredAt.localeCompare(a.administeredAt));
  }

  recordMedicationAdministration(administration: MedicationAdministration): void {
    this._medicationAdministrations.update((list) => [...list, administration]);
  }
}
