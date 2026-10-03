import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { FleetStateService } from '../../services/fleet-state.service';
import { HrStateService } from '../../../hr/services/hr-state.service';
import { VEHICLE_STATUS_LABELS, VEHICLE_TYPE_LABELS, Vehicle, VehicleStatus, VehicleType } from '../../models';

interface SelectOption<T> {
  label: string;
  value: T;
}

/**
 * Fuhrpark-Übersicht: Fahrzeuge mit Status, Zuordnung zu Mitarbeiter/-innen, TÜV-/Wartungsfälligkeiten
 * und monatlicher Kilometerleistung. Verlinkt auf das Fahrtenbuch je Fahrzeug.
 */
@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    ToolbarModule,
    DialogModule,
    SelectModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    TooltipModule,
    CardModule
  ],
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.scss'
})
export class VehicleListComponent {
  private readonly fleetState = inject(FleetStateService);
  private readonly hrState = inject(HrStateService);

  readonly vehicles = this.fleetState.vehicles;
  readonly vehiclesNeedingAttention = this.fleetState.vehiclesNeedingAttention;
  readonly typeLabels = VEHICLE_TYPE_LABELS;

  readonly typeFilter = signal<VehicleType | 'ALLE'>('ALLE');
  readonly statusFilter = signal<VehicleStatus | 'ALLE'>('ALLE');

  readonly typeOptions: SelectOption<VehicleType | 'ALLE'>[] = [
    { label: 'Alle Typen', value: 'ALLE' },
    ...(Object.entries(VEHICLE_TYPE_LABELS) as [VehicleType, string][]).map(([value, label]) => ({ label, value }))
  ];

  readonly statusOptions: SelectOption<VehicleStatus | 'ALLE'>[] = [
    { label: 'Alle Status', value: 'ALLE' },
    ...(Object.entries(VEHICLE_STATUS_LABELS) as [VehicleStatus, string][]).map(([value, label]) => ({ label, value }))
  ];

  readonly employeeOptions = computed<SelectOption<string | null>[]>(() => [
    { label: 'Nicht zugeordnet (Pool)', value: null },
    ...this.hrState
      .activeEmployees()
      .map((e) => ({ label: `${e.firstName} ${e.lastName}`, value: e.id }))
  ]);

  readonly rows = computed(() => {
    const type = this.typeFilter();
    const status = this.statusFilter();
    return this.vehicles()
      .filter((v) => type === 'ALLE' || v.type === type)
      .filter((v) => status === 'ALLE' || v.status === status)
      .sort((a, b) => a.kennzeichen.localeCompare(b.kennzeichen));
  });

  readonly assignDialogVisible = signal(false);
  readonly assignTargetId = signal<string | null>(null);
  readonly assignSelection = signal<string | null>(null);

  readonly mileageDialogVisible = signal(false);
  readonly mileageVehicleId = signal<string | null>(null);

  typeLabel(type: VehicleType): string {
    return VEHICLE_TYPE_LABELS[type];
  }

  statusLabel(status: VehicleStatus): string {
    return VEHICLE_STATUS_LABELS[status];
  }

  statusSeverity(status: VehicleStatus): 'success' | 'info' | 'warn' | 'danger' {
    switch (status) {
      case 'VERFUEGBAR':
        return 'success';
      case 'IM_EINSATZ':
        return 'info';
      case 'WARTUNG':
        return 'warn';
      default:
        return 'danger';
    }
  }

  employeeName(employeeId?: string): string {
    if (!employeeId) return '—';
    const e = this.fleetState.getEmployee(employeeId);
    return e ? `${e.firstName} ${e.lastName}` : 'Unbekannt';
  }

  isTuevDue(vehicle: Vehicle): boolean {
    if (!vehicle.tuevFaelligkeit) return false;
    const warnDate = new Date();
    warnDate.setDate(warnDate.getDate() + 60);
    return vehicle.tuevFaelligkeit < warnDate.toISOString().slice(0, 10);
  }

  monthlyKm(vehicleId: string): number {
    return this.fleetState.monthlyKm(vehicleId);
  }

  openAssign(vehicle: Vehicle): void {
    this.assignTargetId.set(vehicle.id);
    this.assignSelection.set(vehicle.assignedEmployeeId ?? null);
    this.assignDialogVisible.set(true);
  }

  confirmAssign(): void {
    const id = this.assignTargetId();
    if (!id) return;
    this.fleetState.assignVehicle(id, this.assignSelection() ?? undefined);
    this.assignDialogVisible.set(false);
  }

  setStatus(vehicle: Vehicle, status: VehicleStatus): void {
    this.fleetState.setStatus(vehicle.id, status);
  }

  openMileage(vehicle: Vehicle): void {
    this.mileageVehicleId.set(vehicle.id);
    this.mileageDialogVisible.set(true);
  }

  mileageEntries() {
    const id = this.mileageVehicleId();
    return id ? this.fleetState.mileageForVehicle(id) : [];
  }
}
