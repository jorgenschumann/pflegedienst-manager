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

/** Entfernung zwischen zwei Koordinaten in km (Haversine-Formel). */
function haversineDistanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371; // Erdradius in km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Geschätzte Fahrzeit in Minuten für eine Distanz (Annahme: ø 25 km/h im Stadtverkehr, mind. 5 Min). */
function travelMinutesForDistance(km: number): number {
  return Math.max(5, Math.round((km / 25) * 60));
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

  // Patienten zunächst nach Stadt gruppieren (für sinnvolle, geografisch kompakte Stammtouren und
  // eine aussagekräftige Routenoptimierung), danach innerhalb der Stadt in Gruppen von ca. 3 einteilen.
  const byCity = new Map<string, Patient[]>();
  for (const patient of activePatients) {
    const key = patient.address.city;
    const list = byCity.get(key) ?? [];
    list.push(patient);
    byCity.set(key, list);
  }
  const patientGroups = [...byCity.values()].flatMap((cityPatients) => chunk(cityPatients, 3));
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

  /**
   * Gesamtfahrstrecke einer Tour in km, berechnet aus den Patientenkoordinaten in der
   * aktuellen Besuchsreihenfolge (Luftlinie zwischen den Stopps). Liefert `undefined`,
   * wenn für mindestens einen Stopp keine Koordinaten vorliegen.
   */
  routeDistanceKm(tourId: string): number | undefined {
    const stops = this.visitsForTour(tourId)
      .map((v) => this.getPatient(v.patientId)?.address.location)
      .filter((loc): loc is NonNullable<typeof loc> => !!loc);
    if (stops.length !== this.visitsForTour(tourId).length || stops.length < 2) return stops.length < 2 ? 0 : undefined;

    let total = 0;
    for (let i = 1; i < stops.length; i++) {
      total += haversineDistanceKm(stops[i - 1], stops[i]);
    }
    return Math.round(total * 10) / 10;
  }

  /**
   * Optimiert die Reihenfolge der Besuche einer Tour nach dem Nearest-Neighbor-Verfahren
   * (ausgehend vom ersten Stopp), um die Gesamtfahrstrecke zu minimieren, und berechnet
   * die geplanten Zeitfenster anhand der geschätzten Fahrzeiten neu. Besuche ohne
   * Standortdaten werden unverändert an das Ende angehängt.
   */
  optimizeRoute(tourId: string): void {
    const visits = this.visitsForTour(tourId);
    if (visits.length < 2) return;

    const withLocation = visits.filter((v) => this.getPatient(v.patientId)?.address.location);
    const withoutLocation = visits.filter((v) => !this.getPatient(v.patientId)?.address.location);
    if (withLocation.length < 2) return;

    // Nearest-Neighbor-Heuristik: ausgehend vom bisher ersten Stopp jeweils den nächstgelegenen
    // noch offenen Stopp anhängen.
    const remaining = [...withLocation];
    const ordered: Visit[] = [remaining.shift()!];
    while (remaining.length > 0) {
      const current = this.getPatient(ordered[ordered.length - 1].patientId)!.address.location!;
      let bestIdx = 0;
      let bestDist = Infinity;
      remaining.forEach((v, idx) => {
        const loc = this.getPatient(v.patientId)!.address.location!;
        const dist = haversineDistanceKm(current, loc);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = idx;
        }
      });
      ordered.push(remaining.splice(bestIdx, 1)[0]);
    }

    // 2-opt-Verbesserung: Nearest-Neighbor kann einzelne Stopps "abhängen", die dann einen
    // teuren Umweg am Ende erfordern. Kantenpaare vertauschen, solange sich die Gesamtstrecke
    // dadurch verkürzt.
    const locOf = (v: Visit) => this.getPatient(v.patientId)!.address.location!;
    const routeLength = (route: Visit[]) => {
      let sum = 0;
      for (let i = 1; i < route.length; i++) sum += haversineDistanceKm(locOf(route[i - 1]), locOf(route[i]));
      return sum;
    };
    let improved = true;
    while (improved) {
      improved = false;
      for (let i = 0; i < ordered.length - 1; i++) {
        for (let j = i + 1; j < ordered.length; j++) {
          const candidate = [...ordered.slice(0, i), ...ordered.slice(i, j + 1).reverse(), ...ordered.slice(j + 1)];
          if (routeLength(candidate) < routeLength(ordered) - 0.001) {
            ordered.splice(0, ordered.length, ...candidate);
            improved = true;
          }
        }
      }
    }

    // Sicherheitsnetz: Falls die bisherige Reihenfolge (z. B. bei sehr kleinen Touren) bereits
    // kürzer ist, diese beibehalten statt zu verschlechtern.
    if (routeLength(withLocation) <= routeLength(ordered) + 0.001) {
      ordered.splice(0, ordered.length, ...withLocation);
    }

    const finalOrder = [...ordered, ...withoutLocation];

    // Die Tour startet weiterhin zur ursprünglich frühesten geplanten Zeit, unabhängig davon,
    // welcher Besuch nach der Optimierung an erster Stelle steht.
    const originalStart = visits.reduce(
      (earliest, v) => (v.plannedStart < earliest ? v.plannedStart : earliest),
      visits[0].plannedStart,
    );
    let cursor = originalStart;
    const updates = new Map<string, { sequence: number; plannedStart: string; plannedEnd: string }>();
    finalOrder.forEach((visit, idx) => {
      const prev = idx > 0 ? finalOrder[idx - 1] : undefined;
      const prevLoc = prev ? this.getPatient(prev.patientId)?.address.location : undefined;
      const currLoc = this.getPatient(visit.patientId)?.address.location;
      if (idx > 0) {
        const travelMin = prevLoc && currLoc ? travelMinutesForDistance(haversineDistanceKm(prevLoc, currLoc)) : 12;
        cursor = addMinutes(cursor, travelMin);
      }
      const duration = this.minutesBetween(visit.plannedStart, visit.plannedEnd);
      const start = cursor;
      const end = addMinutes(start, duration);
      cursor = end;
      updates.set(visit.id, { sequence: idx + 1, plannedStart: start, plannedEnd: end });
    });

    this._visits.update((list) =>
      list.map((v) => {
        const update = updates.get(v.id);
        return update ? { ...v, ...update } : v;
      })
    );
  }

  private minutesBetween(start: string, end: string): number {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return eh * 60 + em - (sh * 60 + sm);
  }

  /**
   * Betroffene, noch nicht umgeplante Touren für eine genehmigte Abwesenheit:
   * Touren der abwesenden Person, deren Datum im Abwesenheitszeitraum liegt und
   * die noch nicht abgeschlossen sind. Sobald eine Tour umverteilt wurde, verschwindet
   * sie automatisch aus dieser Liste (employeeId stimmt dann nicht mehr überein).
   */
  affectedToursForAbsence(absence: { employeeId: string; startDate: string; endDate: string }): Tour[] {
    return this._tours().filter(
      (t) =>
        t.employeeId === absence.employeeId &&
        t.date >= absence.startDate &&
        t.date <= absence.endDate &&
        t.status !== 'ABGESCHLOSSEN'
    );
  }

  /**
   * Schlägt eine Vertretung für eine Tour vor: aktives Personal mit passender Rolle,
   * das am Tourtag weder abwesend noch bereits mit einer eigenen Tour verplant ist.
   * Bevorzugt dieselbe Rolle wie die ursprünglich eingeteilte Person.
   */
  suggestReplacement(tourId: string): Employee | undefined {
    const tour = this.getTour(tourId);
    if (!tour) return undefined;
    const originalEmployee = this.getEmployee(tour.employeeId);

    const busyEmployeeIds = new Set(
      this._tours()
        .filter((t) => t.date === tour.date && t.id !== tourId)
        .map((t) => t.employeeId)
    );
    const absentEmployeeIds = new Set(
      this.hrState
        .absences()
        .filter((a) => a.status === 'GENEHMIGT' && tour.date >= a.startDate && tour.date <= a.endDate)
        .map((a) => a.employeeId)
    );

    const candidates = this.tourPersonal().filter(
      (e) => e.id !== tour.employeeId && !busyEmployeeIds.has(e.id) && !absentEmployeeIds.has(e.id)
    );

    const sameRole = candidates.filter((e) => e.role === originalEmployee?.role);
    return sameRole[0] ?? candidates[0];
  }

  /** Weist die Vertretung zu und übernimmt sie als neue/n verantwortliche/n Mitarbeiter/-in der Tour. */
  applySubstitution(tourId: string, employeeId: string): void {
    this.reassignTourEmployee(tourId, employeeId);
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
