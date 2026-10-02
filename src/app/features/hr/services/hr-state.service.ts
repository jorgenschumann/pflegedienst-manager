import { Injectable, computed, signal } from '@angular/core';
import { Absence, Employee, Qualification, QualificationCode, Shift } from '../models';

/** Demo-Qualifikationen für In-Memory-Seed-Daten. */
const Q = (code: QualificationCode, label: string): Qualification => ({ code, label });

const INITIAL_EMPLOYEES: Employee[] = [
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

const today = new Date();
const iso = (daysOffset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().slice(0, 10);
};

const INITIAL_SHIFTS: Shift[] = [
  { id: 'shift-1', employeeId: 'emp-1', tourId: 'tour-1', type: 'FRUEHDIENST', status: 'BESTAETIGT', date: iso(0), startTime: '06:30', endTime: '14:00' },
  { id: 'shift-2', employeeId: 'emp-2', tourId: 'tour-2', type: 'SPAETDIENST', status: 'GEPLANT', date: iso(0), startTime: '14:00', endTime: '21:00' },
  { id: 'shift-3', employeeId: 'emp-1', tourId: 'tour-1', type: 'FRUEHDIENST', status: 'GEPLANT', date: iso(1), startTime: '06:30', endTime: '14:00' }
];

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
