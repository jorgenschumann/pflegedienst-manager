import { Injectable, computed, signal } from '@angular/core';
import { Absence, Employee, EmploymentType, Qualification, QualificationCode, Shift, ShiftType } from '../models';

/** Demo-Qualifikationen für In-Memory-Seed-Daten. */
const Q = (code: QualificationCode, label: string): Qualification => ({ code, label });

/** Deterministischer Pseudozufallsgenerator (mulberry32), damit die Demodaten bei jedem Neustart stabil bleiben. */
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

const rng = createRng(42);
const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');

const FIRST_NAMES = [
  'Anna', 'Markus', 'Sabine', 'Julia', 'Thomas', 'Laura', 'Michael', 'Sophie', 'Daniel', 'Lena',
  'Stefan', 'Nina', 'Christian', 'Sarah', 'Andreas', 'Maria', 'Peter', 'Katharina', 'Jonas', 'Petra',
  'Florian', 'Melanie', 'Tobias', 'Claudia', 'Sebastian', 'Nicole', 'Martin', 'Vanessa', 'Alexander', 'Jasmin',
  'Patrick', 'Carolin', 'Benjamin', 'Simone', 'David', 'Verena', 'Matthias', 'Franziska', 'Fabian', 'Birgit'
];

const LAST_NAMES = [
  'Keller', 'Weber', 'Fischer', 'Schmidt', 'Müller', 'Schneider', 'Meyer', 'Wagner', 'Becker', 'Schulz',
  'Hoffmann', 'Koch', 'Richter', 'Bauer', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann',
  'Braun', 'Krüger', 'Hofmann', 'Hartmann', 'Lange', 'Schmitt', 'Werner', 'Krause', 'Meier', 'Lehmann',
  'Schmid', 'Schulte', 'Maier', 'Köhler', 'Herrmann', 'König', 'Walter', 'Mayer', 'Huber', 'Kaiser'
];

const SHIFT_TYPE_TIMES: Record<ShiftType, { start: string; end: string }> = {
  FRUEHDIENST: { start: '06:30', end: '14:00' },
  SPAETDIENST: { start: '14:00', end: '21:00' },
  NACHTDIENST: { start: '21:00', end: '06:30' },
  BEREITSCHAFT: { start: '00:00', end: '23:59' }
};

/** Baden-Württemberg Feiertage 2026 (nur die für die Dienstplan-Generierung relevanten Monate Okt–Dez). */
const BW_HOLIDAYS_2026 = new Set<string>([
  '2026-10-03', // Tag der Deutschen Einheit
  '2026-11-01', // Allerheiligen
  '2026-12-25', // 1. Weihnachtsfeiertag
  '2026-12-26' // 2. Weihnachtsfeiertag
]);

interface GeneratedEmployeeSpec {
  role: Employee['role'];
  count: number;
}

/** Erzeugt die restlichen Mitarbeiter (über die 3 handgepflegten Kern-Mitarbeiter hinaus) gemäß Rollen-Soll. */
function generateEmployees(startIndex: number, specs: GeneratedEmployeeSpec[]): Employee[] {
  const employees: Employee[] = [];
  let i = startIndex;

  for (const spec of specs) {
    for (let n = 0; n < spec.count; n++) {
      const genIndex = i - startIndex;
      const firstName = FIRST_NAMES[genIndex % FIRST_NAMES.length];
      const lastName = LAST_NAMES[(genIndex * 3 + 7) % LAST_NAMES.length];
      const id = `emp-${i + 1}`;

      employees.push({
        id,
        firstName,
        lastName,
        email: `${toSlug(firstName)}.${toSlug(lastName)}@pflegedienst.de`,
        phone: `0151-10000${(i + 1).toString().padStart(2, '0')}`,
        role: spec.role,
        qualifications: qualificationsForRole(spec.role),
        contract: contractForRole(spec.role),
        assignedTourIds: [],
        // Die letzten beiden Ergänzenden Hilfen als inaktiv markieren, um den "Inaktiv"-Status im Demo-Datenbestand zu zeigen.
        active: !(spec.role === 'ERGAENZENDE_HILFE' && n >= spec.count - 2)
      });
      i++;
    }
  }

  return employees;
}

function qualificationsForRole(role: Employee['role']): Qualification[] {
  switch (role) {
    case 'TEAMLEITUNG':
      return [Q('EXAMINIERTE_PFLEGEFACHKRAFT', 'Examinierte Pflegefachkraft'), Q('PRAXISANLEITER', 'Praxisanleiter/-in')];
    case 'VERWALTUNG':
      return [];
    case 'PFLEGEFACHKRAFT': {
      const quals = [Q('EXAMINIERTE_PFLEGEFACHKRAFT', 'Examinierte Pflegefachkraft')];
      quals.push(rng() > 0.5 ? Q('BEHANDLUNGSPFLEGE_LG2', 'Behandlungspflege LG2 (SGB V)') : Q('BEHANDLUNGSPFLEGE_LG1', 'Behandlungspflege LG1 (SGB V)'));
      if (rng() > 0.7) quals.push(Q('WUNDMANAGER', 'Wundmanager'));
      return quals;
    }
    case 'PFLEGEHELFER': {
      const quals = [rng() > 0.5 ? Q('PFLEGEHELFER_1_JAHR', '1-jährige Pflegehilfskraft') : Q('PFLEGEHELFER_BASISKURS', 'Basiskurs-Pflegehelfer')];
      if (rng() > 0.6) quals.push(Q('FAHRERLAUBNIS_PKW', 'Fahrerlaubnis PKW'));
      return quals;
    }
    case 'ERGAENZENDE_HILFE':
      return [Q('BETREUUNGSKRAFT_43B', 'Zusätzliche Betreuungskraft (§ 43b SGB XI)')];
  }
}

function contractForRole(role: Employee['role']): Employee['contract'] {
  const timeAccountBalanceHours = Math.round((rng() * 20 - 8) * 10) / 10;
  let employmentType: EmploymentType;
  let weeklyTargetHours: number;

  switch (role) {
    case 'TEAMLEITUNG':
      employmentType = 'VOLLZEIT';
      weeklyTargetHours = 35 + Math.round(rng() * 3);
      break;
    case 'VERWALTUNG':
      employmentType = rng() > 0.4 ? 'VOLLZEIT' : 'TEILZEIT';
      weeklyTargetHours = employmentType === 'VOLLZEIT' ? 38 : 20 + Math.round(rng() * 10);
      break;
    case 'PFLEGEFACHKRAFT':
      employmentType = rng() > 0.35 ? 'VOLLZEIT' : 'TEILZEIT';
      weeklyTargetHours = employmentType === 'VOLLZEIT' ? 38 : 20 + Math.round(rng() * 12);
      break;
    case 'PFLEGEHELFER':
      employmentType = rng() > 0.6 ? 'TEILZEIT' : 'VOLLZEIT';
      weeklyTargetHours = employmentType === 'VOLLZEIT' ? 38 : 15 + Math.round(rng() * 15);
      break;
    case 'ERGAENZENDE_HILFE':
      employmentType = rng() > 0.5 ? 'MINIJOB' : 'TEILZEIT';
      weeklyTargetHours = employmentType === 'MINIJOB' ? 5 + Math.round(rng() * 5) : 10 + Math.round(rng() * 10);
      break;
  }

  return { weeklyTargetHours, employmentType, timeAccountBalanceHours };
}

const CORE_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    firstName: 'Anna',
    lastName: 'Keller',
    email: 'anna.keller@pflegedienst.de',
    phone: '0151-1000001',
    role: 'PFLEGEFACHKRAFT',
    qualifications: [
      Q('EXAMINIERTE_PFLEGEFACHKRAFT', 'Examinierte Pflegefachkraft'),
      Q('BEHANDLUNGSPFLEGE_LG2', 'Behandlungspflege LG2 (SGB V)'),
      Q('WUNDMANAGER', 'Wundmanager')
    ],
    contract: { weeklyTargetHours: 38, employmentType: 'VOLLZEIT', timeAccountBalanceHours: 6.5 },
    assignedTourIds: ['tour-1'],
    active: true
  },
  {
    id: 'emp-2',
    firstName: 'Markus',
    lastName: 'Weber',
    email: 'markus.weber@pflegedienst.de',
    phone: '0151-1000002',
    role: 'PFLEGEHELFER',
    qualifications: [Q('PFLEGEHELFER_1_JAHR', '1-jährige Pflegehilfskraft'), Q('FAHRERLAUBNIS_PKW', 'Fahrerlaubnis PKW')],
    contract: { weeklyTargetHours: 20, employmentType: 'TEILZEIT', timeAccountBalanceHours: -3 },
    assignedTourIds: ['tour-2'],
    active: true
  },
  {
    id: 'emp-3',
    firstName: 'Sabine',
    lastName: 'Fischer',
    email: 'sabine.fischer@pflegedienst.de',
    phone: '0151-1000003',
    role: 'TEAMLEITUNG',
    qualifications: [
      Q('EXAMINIERTE_PFLEGEFACHKRAFT', 'Examinierte Pflegefachkraft'),
      Q('PRAXISANLEITER', 'Praxisanleiterin')
    ],
    contract: { weeklyTargetHours: 35, employmentType: 'VOLLZEIT', timeAccountBalanceHours: 12 },
    assignedTourIds: [],
    active: true
  }
];

// Rollen-Soll gesamt: 2 Teamleitung, 2 Verwaltung, 8 Pflegefachkraft, 10 Pflegehelfer, 20 Ergänzende Hilfen.
// Die 3 Kern-Mitarbeiter oben decken bereits 1x Teamleitung, 1x Pflegefachkraft, 1x Pflegehelfer ab.
const GENERATED_EMPLOYEES = generateEmployees(CORE_EMPLOYEES.length, [
  { role: 'TEAMLEITUNG', count: 1 },
  { role: 'VERWALTUNG', count: 2 },
  { role: 'PFLEGEFACHKRAFT', count: 7 },
  { role: 'PFLEGEHELFER', count: 9 },
  { role: 'ERGAENZENDE_HILFE', count: 20 }
]);

const INITIAL_EMPLOYEES: Employee[] = [...CORE_EMPLOYEES, ...GENERATED_EMPLOYEES];

const today = new Date();
const iso = (daysOffset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().slice(0, 10);
};
const toIsoDate = (d: Date) => d.toISOString().slice(0, 10);

/** Teilt `total` möglichst gleichmäßig auf `parts` Gruppen auf (z. B. 20 auf 3 Rollen → [7, 7, 6]). */
function splitEvenly(total: number, parts: number): number[] {
  const base = Math.floor(total / parts);
  const remainder = total % parts;
  return Array.from({ length: parts }, (_, idx) => base + (idx < remainder ? 1 : 0));
}

/** Round-Robin-Zustand pro Rolle, damit sich die Diensteinteilung über den Zeitraum fair auf alle Mitarbeiter verteilt. */
class RoundRobinPool {
  private index = 0;
  constructor(private readonly employees: Employee[]) {}

  take(count: number): Employee[] {
    const n = this.employees.length;
    if (n === 0) return [];
    const take = Math.min(count, n);
    const result: Employee[] = [];
    for (let i = 0; i < take; i++) {
      result.push(this.employees[(this.index + i) % n]);
    }
    this.index = (this.index + take) % n;
    return result;
  }
}

/**
 * Generiert den Dienstplan für den Zeitraum [startDate, endDate] (inklusive):
 * - Montag–Freitag ohne Feiertag: 20 Mitarbeiter/Tag, gleichmäßig verteilt auf
 *   Pflegefachkraft / Pflegehelfer / Ergänzende Hilfe (Round-Robin je Rolle).
 * - Wochenende oder Feiertag: 10 Mitarbeiter/Tag, gleiche Verteilungslogik.
 * - Schichttyp je eingeteiltem Mitarbeiter rotiert im Muster Früh/Spät/Früh/Spät/Nacht/Bereitschaft.
 */
function generateShifts(employees: Employee[], startDate: Date, endDate: Date, holidays: Set<string>): Shift[] {
  const fachkraftPool = new RoundRobinPool(employees.filter((e) => e.role === 'PFLEGEFACHKRAFT' && e.active));
  const pflegehelferPool = new RoundRobinPool(employees.filter((e) => e.role === 'PFLEGEHELFER' && e.active));
  const ergaenzendePool = new RoundRobinPool(employees.filter((e) => e.role === 'ERGAENZENDE_HILFE' && e.active));

  const shiftTypePattern: ShiftType[] = ['FRUEHDIENST', 'SPAETDIENST', 'FRUEHDIENST', 'SPAETDIENST', 'NACHTDIENST', 'BEREITSCHAFT'];

  const shifts: Shift[] = [];
  const cursor = new Date(startDate);
  const startIso = toIsoDate(startDate);

  while (cursor <= endDate) {
    const dateIso = toIsoDate(cursor);
    const weekday = cursor.getDay(); // 0 = Sonntag, 6 = Samstag
    const isWeekend = weekday === 0 || weekday === 6;
    const isHoliday = holidays.has(dateIso);
    const totalForDay = isWeekend || isHoliday ? 10 : 20;

    const [fachkraftCount, pflegehelferCount, ergaenzendeCount] = splitEvenly(totalForDay, 3);

    const selected = [
      ...fachkraftPool.take(fachkraftCount),
      ...pflegehelferPool.take(pflegehelferCount),
      ...ergaenzendePool.take(ergaenzendeCount)
    ];

    selected.forEach((employee, idx) => {
      const type = shiftTypePattern[idx % shiftTypePattern.length];
      const times = SHIFT_TYPE_TIMES[type];
      shifts.push({
        id: `shift-${dateIso}-${idx}`,
        employeeId: employee.id,
        type,
        status: dateIso === startIso ? 'BESTAETIGT' : 'GEPLANT',
        date: dateIso,
        startTime: times.start,
        endTime: times.end
      });
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return shifts;
}

const SHIFT_GENERATION_START = today; // ab heute
const SHIFT_GENERATION_END = new Date('2026-12-31T00:00:00');

const INITIAL_SHIFTS: Shift[] = generateShifts(
  INITIAL_EMPLOYEES,
  SHIFT_GENERATION_START,
  SHIFT_GENERATION_END,
  BW_HOLIDAYS_2026
);

const INITIAL_ABSENCES: Absence[] = [
  {
    id: 'abs-1',
    employeeId: 'emp-2',
    type: 'URLAUB',
    status: 'BEANTRAGT',
    startDate: iso(5),
    endDate: iso(9),
    days: 5,
    requestedAt: new Date().toISOString()
  }
];

/**
 * Zentraler HR-State-Service (Mitarbeiter, Dienstplan, Abwesenheiten).
 * Verwendet Angular Signals als Single Source of Truth; aktuell mit
 * In-Memory-Daten, später austauschbar gegen einen HttpClient-Backend-Call.
 */
@Injectable({ providedIn: 'root' })
export class HrStateService {
  private readonly _employees = signal<Employee[]>(INITIAL_EMPLOYEES);
  private readonly _shifts = signal<Shift[]>(INITIAL_SHIFTS);
  private readonly _absences = signal<Absence[]>(INITIAL_ABSENCES);

  readonly employees = this._employees.asReadonly();
  readonly shifts = this._shifts.asReadonly();
  readonly absences = this._absences.asReadonly();

  readonly activeEmployees = computed(() => this._employees().filter((e) => e.active));

  readonly pendingAbsenceRequests = computed(() =>
    this._absences().filter((a) => a.status === 'BEANTRAGT')
  );

  readonly todaysShifts = computed(() => {
    const today = iso(0);
    return this._shifts().filter((s) => s.date === today);
  });

  /** Summe der Arbeitszeitkonten-Salden über alle aktiven Mitarbeiter (Monitoring). */
  readonly totalTimeAccountBalance = computed(() =>
    this.activeEmployees().reduce((sum, e) => sum + e.contract.timeAccountBalanceHours, 0)
  );

  // ---- Employee CRUD ----
  addEmployee(employee: Employee): void {
    this._employees.update((list) => [...list, employee]);
  }

  updateEmployee(id: string, changes: Partial<Employee>): void {
    this._employees.update((list) => list.map((e) => (e.id === id ? { ...e, ...changes } : e)));
  }

  deactivateEmployee(id: string): void {
    this.updateEmployee(id, { active: false });
  }

  /** Prüft, ob ein Mitarbeiter die für eine Leistung nötigen Qualifikationen besitzt. */
  hasQualification(employeeId: string, required: QualificationCode[]): boolean {
    const employee = this._employees().find((e) => e.id === employeeId);
    if (!employee) return false;
    const codes = new Set(employee.qualifications.map((q) => q.code));
    return required.every((code) => codes.has(code));
  }

  // ---- Shift CRUD ----
  addShift(shift: Shift): void {
    this._shifts.update((list) => [...list, shift]);
  }

  updateShift(id: string, changes: Partial<Shift>): void {
    this._shifts.update((list) => list.map((s) => (s.id === id ? { ...s, ...changes } : s)));
  }

  removeShift(id: string): void {
    this._shifts.update((list) => list.filter((s) => s.id !== id));
  }

  // ---- Absence CRUD ----
  requestAbsence(absence: Absence): void {
    this._absences.update((list) => [...list, absence]);
  }

  decideAbsence(id: string, status: 'GENEHMIGT' | 'ABGELEHNT', decidedBy: string): void {
    this._absences.update((list) =>
      list.map((a) => (a.id === id ? { ...a, status, decidedBy } : a))
    );
  }

  cancelAbsence(id: string): void {
    this._absences.update((list) =>
      list.map((a) => (a.id === id ? { ...a, status: 'STORNIERT' as const } : a))
    );
  }
}
