import { Injectable, computed, inject, signal } from '@angular/core';
import { HrStateService } from '../../hr/services/hr-state.service';
import { TourStateService } from '../../touren/services/tour-state.service';
import { Employee } from '../../hr/models';
import { MileageEntry, Vehicle, VehicleStatus, VehicleType } from '../models';

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

const rng = createRng(77);

const PKW_MODELS = ['VW Caddy', 'Dacia Jogger', 'Opel Combo', 'Skoda Fabia', 'VW up!'];
const KENNZEICHEN_PREFIXES = ['S', 'KA', 'FR', 'MA', 'TÜ', 'UL'];

/** Anzahl Fahrzeuge je Typ im Demo-Fuhrpark. */
const FLEET_SPEC: { type: VehicleType; count: number }[] = [
  { type: 'PKW', count: 8 },
  { type: 'E_BIKE', count: 4 },
  { type: 'FAHRRAD', count: 3 }
];

const today = new Date();
const isoOffset = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

function generateVehicles(employees: Employee[]): Vehicle[] {
  const pkwDrivers = employees.filter(
    (e) => e.active && e.qualifications.some((q) => q.code === 'FAHRERLAUBNIS_PKW') && (e.role === 'PFLEGEHELFER' || e.role === 'ERGAENZENDE_HILFE')
  );
  const fachkraftPool = employees.filter((e) => e.active && e.role === 'PFLEGEFACHKRAFT');

  const vehicles: Vehicle[] = [];
  let counter = 0;

  for (const spec of FLEET_SPEC) {
    for (let i = 0; i < spec.count; i++) {
      counter++;
      const isPkw = spec.type === 'PKW';
      const driverPool = isPkw ? [...fachkraftPool, ...pkwDrivers] : employees.filter((e) => e.active);
      const assigned = driverPool.length > 0 ? driverPool[counter % driverPool.length] : undefined;
      // Jedes 5. Fahrzeug bleibt als Pool-Fahrzeug unzugeordnet (Mitarbeiter buchen es bei Bedarf).
      const assignedEmployeeId = counter % 5 === 0 ? undefined : assigned?.id;

      let status: VehicleStatus = 'VERFUEGBAR';
      if (counter % 11 === 0) status = 'WARTUNG';
      else if (assignedEmployeeId) status = 'IM_EINSATZ';

      vehicles.push({
        id: `veh-${counter}`,
        kennzeichen: `${pick(KENNZEICHEN_PREFIXES)}-PD ${100 + counter}`,
        type: spec.type,
        model: isPkw ? pick(PKW_MODELS) : spec.type === 'E_BIKE' ? 'E-Bike Pflegedienst' : 'Stadtrad',
        status,
        kilometerstand: isPkw ? 15000 + Math.floor(rng() * 70000) : Math.floor(rng() * 4000),
        tuevFaelligkeit: isPkw ? isoOffset(-120 + Math.floor(rng() * 500)) : undefined,
        naechsteWartung: isoOffset(Math.floor(rng() * 90)),
        assignedEmployeeId
      });
    }
  }

  return vehicles;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Anzahl vergangener Tage, für die Fahrtenbuch-Demoeinträge erzeugt werden. */
const MILEAGE_HISTORY_DAYS = 14;

function generateMileageEntries(
  vehicles: Vehicle[],
  tours: { id: string; date: string; employeeId: string; name: string }[],
  routeDistanceKm: (tourId: string) => number | undefined
): MileageEntry[] {
  const entries: MileageEntry[] = [];
  const todayIso = isoOffset(0);
  const historyStartIso = isoOffset(-MILEAGE_HISTORY_DAYS);

  // Laufender Kilometerstand je Fahrzeug, rückwärts vom aktuellen Stand aus aufgebaut.
  const runningKm = new Map<string, number>(vehicles.map((v) => [v.id, v.kilometerstand]));

  for (const vehicle of vehicles) {
    if (!vehicle.assignedEmployeeId || vehicle.type !== 'PKW') continue;

    const relevantTours = tours
      .filter((t) => t.employeeId === vehicle.assignedEmployeeId && t.date >= historyStartIso && t.date < todayIso)
      .sort((a, b) => b.date.localeCompare(a.date));

    for (const tour of relevantTours) {
      const distance = routeDistanceKm(tour.id) ?? 8 + Math.floor(rng() * 15);
      const km = Math.max(5, Math.round(distance + 3 + rng() * 5)); // + Anfahrt/Rückfahrt zur Zentrale
      const endKm = runningKm.get(vehicle.id)!;
      const startKm = endKm - km;
      runningKm.set(vehicle.id, startKm);

      entries.push({
        id: `mil-${vehicle.id}-${tour.date}`,
        vehicleId: vehicle.id,
        employeeId: vehicle.assignedEmployeeId,
        tourId: tour.id,
        date: tour.date,
        startKm,
        endKm,
        purpose: tour.name
      });
    }
  }

  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Zentraler Fuhrpark-State-Service: verwaltet Fahrzeuge und das Fahrtenbuch (Kilometerverwaltung).
 * Verwendet Angular Signals als Single Source of Truth; aktuell mit In-Memory-Demodaten,
 * später austauschbar gegen einen HttpClient-Backend-Call.
 */
@Injectable({ providedIn: 'root' })
export class FleetStateService {
  private readonly hrState = inject(HrStateService);
  private readonly tourState = inject(TourStateService);

  private readonly _vehicles = signal<Vehicle[]>(generateVehicles(this.hrState.employees()));
  private readonly _mileageEntries = signal<MileageEntry[]>(
    generateMileageEntries(this._vehicles(), this.tourState.tours(), (tourId) => this.tourState.routeDistanceKm(tourId))
  );

  readonly vehicles = this._vehicles.asReadonly();
  readonly mileageEntries = this._mileageEntries.asReadonly();

  readonly vehiclesNeedingAttention = computed(() => {
    const warnThreshold = isoOffset(60);
    return this._vehicles().filter(
      (v) => v.status === 'WARTUNG' || (v.tuevFaelligkeit && v.tuevFaelligkeit < warnThreshold)
    );
  });

  getVehicle(id: string): Vehicle | undefined {
    return this._vehicles().find((v) => v.id === id);
  }

  getEmployee(employeeId?: string): Employee | undefined {
    if (!employeeId) return undefined;
    return this.hrState.employees().find((e) => e.id === employeeId);
  }

  /** Fahrzeuge, die aktuell keiner/m Mitarbeiter/-in fest zugeordnet sind (Pool-Fahrzeuge). */
  readonly poolVehicles = computed(() => this._vehicles().filter((v) => !v.assignedEmployeeId));

  mileageForVehicle(vehicleId: string): MileageEntry[] {
    return this._mileageEntries()
      .filter((m) => m.vehicleId === vehicleId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  /** Gesamtkilometer eines Fahrzeugs im aktuellen Kalendermonat (Fahrtenbuch-Summe). */
  monthlyKm(vehicleId: string): number {
    const monthPrefix = todayIsoMonth();
    return this._mileageEntries()
      .filter((m) => m.vehicleId === vehicleId && m.date.startsWith(monthPrefix))
      .reduce((sum, m) => sum + (m.endKm - m.startKm), 0);
  }

  addVehicle(vehicle: Vehicle): void {
    this._vehicles.update((list) => [...list, vehicle]);
  }

  updateVehicle(id: string, changes: Partial<Vehicle>): void {
    this._vehicles.update((list) => list.map((v) => (v.id === id ? { ...v, ...changes } : v)));
  }

  assignVehicle(id: string, employeeId: string | undefined): void {
    this.updateVehicle(id, { assignedEmployeeId: employeeId, status: employeeId ? 'IM_EINSATZ' : 'VERFUEGBAR' });
  }

  setStatus(id: string, status: VehicleStatus): void {
    this.updateVehicle(id, { status });
  }

  /** Erfasst eine manuelle Fahrtenbuch-Fahrt und aktualisiert den Kilometerstand des Fahrzeugs. */
  addMileageEntry(entry: Omit<MileageEntry, 'id'>): void {
    const id = `mil-manual-${Date.now()}`;
    this._mileageEntries.update((list) => [{ ...entry, id }, ...list]);
    this.updateVehicle(entry.vehicleId, { kilometerstand: Math.max(this.getVehicle(entry.vehicleId)?.kilometerstand ?? 0, entry.endKm) });
  }
}

function todayIsoMonth(): string {
  return isoOffset(0).slice(0, 7);
}
