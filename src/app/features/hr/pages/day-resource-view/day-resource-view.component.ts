import { AfterViewInit, Component, ElementRef, computed, input, output, viewChild } from '@angular/core';
import { Employee, Shift } from '../../models';

export interface SlotClickEvent {
  employeeId: string;
  time: string; // HH:mm, gerundet auf 30 Minuten
}

const HOUR_WIDTH_PX = 80;
const START_HOUR = 0;
const END_HOUR = 24;

const SHIFT_COLORS: Record<Shift['type'], string> = {
  FRUEHDIENST: '#2563eb',
  SPAETDIENST: '#d97706',
  NACHTDIENST: '#4338ca',
  BEREITSCHAFT: '#64748b'
};

interface PositionedShift {
  shift: Shift;
  left: number;
  width: number;
  color: string;
}

/**
 * Tagesansicht mit Mitarbeitern als Zeilen (vertikal) und Uhrzeiten als Spalten
 * (horizontal). FullCalendars Resource-Plugins sind kommerziell lizenzpflichtig,
 * daher eine schlanke Eigenimplementierung auf CSS-Grid-Basis.
 */
@Component({
  selector: 'app-day-resource-view',
  standalone: true,
  templateUrl: './day-resource-view.component.html',
  styleUrl: './day-resource-view.component.scss'
})
export class DayResourceViewComponent implements AfterViewInit {
  readonly employees = input<Employee[]>([]);
  readonly shifts = input<Shift[]>([]);

  readonly shiftClick = output<Shift>();
  readonly slotClick = output<SlotClickEvent>();

  private readonly scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  readonly hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
  readonly hourWidth = HOUR_WIDTH_PX;
  readonly totalWidth = (END_HOUR - START_HOUR) * HOUR_WIDTH_PX;

  readonly rows = computed(() =>
    this.employees().map((employee) => ({
      employee,
      shifts: this.positionShiftsForEmployee(employee.id)
    }))
  );

  ngAfterViewInit(): void {
    // Standardmäßig auf die üblichen Arbeitszeiten (ab 6 Uhr) scrollen statt auf Mitternacht.
    const el = this.scrollContainer()?.nativeElement;
    if (el) {
      el.scrollLeft = 6 * HOUR_WIDTH_PX;
    }
  }

  private positionShiftsForEmployee(employeeId: string): PositionedShift[] {
    return this.shifts()
      .filter((s) => s.employeeId === employeeId)
      .map((shift) => {
        const startMinutes = this.toMinutes(shift.startTime);
        let endMinutes = this.toMinutes(shift.endTime);
        // Nachtschichten, die über Mitternacht gehen, werden am Tagesende gekappt.
        if (endMinutes <= startMinutes) {
          endMinutes = END_HOUR * 60;
        }
        const left = (startMinutes / 60) * HOUR_WIDTH_PX;
        const width = Math.max(((endMinutes - startMinutes) / 60) * HOUR_WIDTH_PX, 24);
        return { shift, left, width, color: SHIFT_COLORS[shift.type] };
      });
  }

  private toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  onRowClick(event: MouseEvent, employeeId: string): void {
    const target = event.target as HTMLElement;
    if (target.closest('.shift-block')) {
      return; // Klick ging auf eine bestehende Schicht, wird separat behandelt.
    }
    const rowEl = event.currentTarget as HTMLElement;
    const offsetX = event.clientX - rowEl.getBoundingClientRect().left + rowEl.scrollLeft;
    const totalMinutes = (offsetX / HOUR_WIDTH_PX) * 60;
    const roundedMinutes = Math.round(totalMinutes / 30) * 30;
    const hours = Math.floor(roundedMinutes / 60)
      .toString()
      .padStart(2, '0');
    const minutes = (roundedMinutes % 60).toString().padStart(2, '0');
    this.slotClick.emit({ employeeId, time: `${hours}:${minutes}` });
  }
}
