import { Injectable, computed, inject, signal } from '@angular/core';
import { HrStateService } from '../../hr/services/hr-state.service';
import { Employee } from '../../hr/models';
import { PatientStateService } from '../../patients/services/patient-state.service';
import { Patient } from '../../patients/models';
import { LeistungCode, Tour, TourStatus, Visit, VisitStatus } from '../models';

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

const rng = createRng(21);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];

const LEISTUNG_POOL: LeistungCode[] = [
  'GRUNDPFLEGE',
  'BEHANDLUNGSPFLEGE',
  'MEDIKAMENTENGABE',
  'VERBANDSWECHSEL',
  'HAUSWIRTSCHAFT',
  'BLUTDRUCKMESSUNG',
  'BLUTZUCKERMESSUNG'
];

function pickLeistungen(): LeistungCode[] {
  const count = 1 + Math.floor(rng() * 2); // 1-2 Leistungen pro Besuch
  const result = new Set<LeistungCode>();
  while (result.size < count) {
    result.add(pick(LEISTUNG_POOL));
  }
  return [...result];
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/** Anzahl Planungstage für die Demo-Tourenplanung: heute + die folgenden 13 Tage. */
const PLANNING_DAYS = 14;

/** Anzahl vergangener Tage, für die bereits dokumentierte Besuche erzeugt werden (Grundlage für Reporting/Abrechnung). */
const HISTORY_DAYS = 60;

/** Gruppiert ein Array in gleich große Chunks (letzter Chunk kann kleiner sein). */
function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

interface GeneratedData {
  tours: Tour[];
  visits: Visit[];
}

/**
 * Erzeugt Demo-Touren nach dem Stammtouren-Prinzip: Jede Mitarbeiter/Patientengruppen-Zuordnung
 * bleibt über den gesamten Planungszeitraum stabil, an Wochenenden werden Gruppen zusammengelegt
 * (reduzierte Besetzung), analog zur Dienstplan-Demodatenlogik.
 */
function generateTourData(employees: Employee[], patients: Patient[]): GeneratedData {
  const tourPersonal = employees.filter(
    (e) => e.active && (e.role === 'PFLEGEFACHKRAFT' || e.role === 'PFLEGEHELFER' || e.role === 'ERGAENZENDE_HILFE')
  );
  const activePatients = patients.filter((p) => p.active);

  if (tourPersonal.length === 0 || activePatients.length === 0) {
    return { tours: [], visits: [] };
  }

  // Patienten in Gruppen von ca. 3 einteilen ("Stammtouren").
  const patientGroups = chunk(activePatients, 3);
  const groupCount = patientGroups.length;

  // Jeder Gruppe dauerhaft eine/n Mitarbeiter/-in zuordnen (rotierend durch den Personalpool).
  const assignedEmployees = Array.from({ length: groupCount }, (_, i) => tourPersonal[i % tourPersonal.length]);

  const tours: Tour[] = [];
  const visits: Visit[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = toIsoDate(today);

  for (let dayOffset = -HISTORY_DAYS; dayOffset < PLANNING_DAYS; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);
    const dateIso = toIsoDate(date);
    const weekend = isWeekend(date);
    const isPast = dateIso < todayIso;

    // An Wochenenden nur jede zweite Stammtour besetzen, dafür mit doppelter Patientenzahl (reduzierte Besetzung).
    const groupIndices = weekend
      ? Array.from({ length: groupCount }, (_, i) => i).filter((i) => i % 2 === 0)
      : Array.from({ length: groupCount }, (_, i) => i);

    for (const groupIndex of groupIndices) {
      const employee = assignedEmployees[groupIndex];
      const groups = weekend ? [...patientGroups[groupIndex], ...(patientGroups[groupIndex + 1] ?? [])] : patientGroups[groupIndex];

      const tourId = `tour-${dateIso}-${groupIndex}`;
      const visitIds: string[] = [];
      let cursor = '07:30';

      groups.forEach((patient, idx) => {
        const duration = 20 + Math.floor(rng() * 25); // 20-45 Min Besuchsdauer
        const start = cursor;
        const end = addMinutes(start, duration);
        cursor = addMinutes(end, 12); // 12 Min Fahrzeit zum nächsten Patienten

        const leistungen = pickLeistungen();
        let status: VisitStatus = 'GEPLANT';
        let performedLeistungen: LeistungCode[] | undefined;
        let confirmedBy: string | undefined;
        let confirmedAt: string | undefined;
        if (isPast) {
          status = rng() > 0.93 ? 'AUSGEFALLEN' : 'ERLEDIGT';
          if (status === 'ERLEDIGT') {
            performedLeistungen = leistungen;
            confirmedBy = `${employee.firstName} ${employee.lastName}`;
            confirmedAt = `${dateIso}T${end}:00`;
          }
        }

        const visitId = `${tourId}-visit-${idx + 1}`;
        visits.push({
          id: visitId,
          tourId,
          patientId: patient.id,
          sequence: idx + 1,
          plannedStart: start,
          plannedEnd: end,
          leistungen,
          status,
          ...(status === 'ERLEDIGT' ? { actualStart: start, actualEnd: end, performedLeistungen, confirmedBy, confirmedAt } : {}),
          ...(status === 'AUSGEFALLEN' ? { cancelReason: 'Patient nicht angetroffen', confirmedBy: `${employee.firstName} ${employee.lastName}`, confirmedAt: `${dateIso}T${end}:00` } : {})
        });
        visitIds.push(visitId);
      });

      let tourStatus: TourStatus = 'GEPLANT';
      if (isPast) {
        tourStatus = 'ABGESCHLOSSEN';
      }

      tours.push({
        id: tourId,
        date: dateIso,
        employeeId: employee.id,
        name: `Tour ${groupIndex + 1} – ${employee.firstName} ${employee.lastName}`,
        status: tourStatus,
        visitIds
      });
    }
  }

  return { tours, visits };
}

/**
 * Zentraler Tourenplanungs-State-Service. Verknüpft Patienten (Patientenverwaltung) mit
 * Mitarbeitern (HR) zu täglichen Routen. Verwendet Angular Signals als Single Source of Truth;
 * aktuell mit In-Memory-Demodaten, später austauschbar gegen einen HttpClient-Backend-Call.
 */
@Injectable({ providedIn: 'root' })
export class TourStateService {
  private readonly hrState = inject(HrStateService);
  private readonly patientState = inject(PatientStateService);

  private readonly generated = generateTourData(this.hrState.employees(), this.patientState.patients());

  private readonly _tours = signal<Tour[]>(this.generated.tours);
  private readonly _visits = signal<Visit[]>(this.generated.visits);

  readonly tours = this._tours.asReadonly();
  readonly visits = this._visits.asReadonly();

  /** Für die Tourenzuordnung wählbares Personal (aktive Pflegekräfte/Hilfen). */
  readonly tourPersonal = computed(() =>
    this.hrState
      .employees()
      .filter((e) => e.active && (e.role === 'PFLEGEFACHKRAFT' || e.role === 'PFLEGEHELFER' || e.role === 'ERGAENZENDE_HILFE'))
  );

  /** Aktive Patienten für die Zuordnung zu einer Tour. */
  readonly assignablePatients = computed(() => this.patientState.activePatients());

  /**
   * Patienten, die einer bestimmten Tour noch nicht zugeordnet sind (verhindert nur
   * Duplikate innerhalb derselben Tour – mehrere Besuche desselben Patienten an
   * unterschiedlichen Touren/Zeiten am selben Tag sind in der Pflege üblich, z. B.
   * Medikamentengabe morgens und abends).
   */
  patientsNotInTour(tourId: string): Patient[] {
    const assignedPatientIds = new Set(this.visitsForTour(tourId).map((v) => v.patientId));
    return this.patientState.activePatients().filter((p) => !assignedPatientIds.has(p.id));
  }

  getTour(tourId: string): Tour | undefined {
    return this._tours().find((t) => t.id === tourId);
  }

  toursForDate(dateIso: string) {
    return computed(() => this._tours().filter((t) => t.date === dateIso));
  }

  visitsForTour(tourId: string): Visit[] {
    return this._visits()
      .filter((v) => v.tourId === tourId)
      .sort((a, b) => a.sequence - b.sequence);
  }

  getEmployee(employeeId: string): Employee | undefined {
    return this.hrState.employees().find((e) => e.id === employeeId);
  }

  getPatient(patientId: string): Patient | undefined {
    return this.patientState.getPatient(patientId);
  }

  setVisitStatus(visitId: string, status: VisitStatus): void {
    this._visits.update((list) => list.map((v) => (v.id === visitId ? { ...v, status } : v)));
  }

  /**
   * Dokumentiert die tatsächliche Durchführung eines Besuchs (Leistungserfassung):
   * Ist-Zeiten, erbrachte Leistungen, Pflegebericht-Notiz und digitale Bestätigung
   * durch die durchführende Pflegekraft. Setzt den Status auf "ERLEDIGT".
   */
  documentVisit(
    visitId: string,
    data: { actualStart: string; actualEnd: string; performedLeistungen: LeistungCode[]; notes?: string; confirmedBy: string }
  ): void {
    this._visits.update((list) =>
      list.map((v) =>
        v.id === visitId
          ? {
              ...v,
              status: 'ERLEDIGT' as VisitStatus,
              actualStart: data.actualStart,
              actualEnd: data.actualEnd,
              performedLeistungen: data.performedLeistungen,
              notes: data.notes,
              confirmedBy: data.confirmedBy,
              confirmedAt: new Date().toISOString(),
              cancelReason: undefined
            }
          : v
      )
    );
  }

  /** Markiert einen Besuch als ausgefallen und erfasst den Grund. */
  cancelVisit(visitId: string, reason: string, confirmedBy: string): void {
    this._visits.update((list) =>
      list.map((v) =>
        v.id === visitId
          ? {
              ...v,
              status: 'AUSGEFALLEN' as VisitStatus,
              cancelReason: reason,
              confirmedBy,
              confirmedAt: new Date().toISOString()
            }
          : v
      )
    );
  }

  /** Weist der Tour eine/n andere/n Mitarbeiter/-in zu. */
  reassignTourEmployee(tourId: string, employeeId: string): void {
    this._tours.update((list) => list.map((t) => (t.id === tourId ? { ...t, employeeId } : t)));
  }

  /** Ändert den zugeordneten Patienten, Zeitfenster oder die Leistungen eines Besuchs. */
  updateVisit(visitId: string, changes: Partial<Pick<Visit, 'patientId' | 'plannedStart' | 'plannedEnd' | 'leistungen' | 'notes'>>): void {
    if (changes.patientId) {
      const visit = this._visits().find((v) => v.id === visitId);
      if (visit && changes.patientId !== visit.patientId) {
        // Doppelbuchung nur innerhalb derselben Tour verhindern (gleicher Patient, gleiche Tour).
        const duplicateInTour = this.visitsForTour(visit.tourId).some(
          (v) => v.id !== visitId && v.patientId === changes.patientId
        );
        if (duplicateInTour) return;
      }
    }
    this._visits.update((list) => list.map((v) => (v.id === visitId ? { ...v, ...changes } : v)));
  }

  /** Fügt einer Tour einen neuen Besuch hinzu (am Ende der Route, direkt nach dem letzten Besuch). */
  addVisit(tourId: string, patientId: string): void {
    const tour = this.getTour(tourId);
    if (!tour) return;

    // Doppelbuchung nur innerhalb derselben Tour verhindern (gleicher Patient, gleiche Tour).
    const duplicateInTour = this.visitsForTour(tourId).some((v) => v.patientId === patientId);
    if (duplicateInTour) return;

    const existingVisits = this.visitsForTour(tourId);
    const lastVisit = existingVisits[existingVisits.length - 1];
    const start = lastVisit ? addMinutes(lastVisit.plannedEnd, 12) : '07:30';
    const end = addMinutes(start, 30);

    const newVisit: Visit = {
      id: `${tourId}-visit-${Date.now()}`,
      tourId,
      patientId,
      sequence: existingVisits.length + 1,
      plannedStart: start,
      plannedEnd: end,
      leistungen: ['GRUNDPFLEGE'],
      status: 'GEPLANT'
    };

    this._visits.update((list) => [...list, newVisit]);
    this._tours.update((list) => list.map((t) => (t.id === tourId ? { ...t, visitIds: [...t.visitIds, newVisit.id] } : t)));
  }

  /** Entfernt einen Besuch aus einer Tour und nummeriert die verbleibenden Besuche neu. */
  removeVisit(visitId: string): void {
    const visit = this._visits().find((v) => v.id === visitId);
    if (!visit) return;

    this._visits.update((list) => list.filter((v) => v.id !== visitId));
    this._tours.update((list) =>
      list.map((t) => (t.id === visit.tourId ? { ...t, visitIds: t.visitIds.filter((id) => id !== visitId) } : t))
    );

    // Verbleibende Besuche der Tour neu durchnummerieren (fortlaufende Reihenfolge).
    const remaining = this.visitsForTour(visit.tourId);
    this._visits.update((list) =>
      list.map((v) => {
        const idx = remaining.findIndex((r) => r.id === v.id);
        return idx >= 0 ? { ...v, sequence: idx + 1 } : v;
      })
    );
  }
}
