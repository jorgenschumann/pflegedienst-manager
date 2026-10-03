import { Component, computed, inject, signal } from '@angular/core';
import { CalendarOptions, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import deLocale from '@fullcalendar/core/locales/de';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { FullCalendarModule } from '@fullcalendar/angular';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { HrStateService } from '../../services/hr-state.service';
import { Shift } from '../../models';
import { ShiftFormComponent, ShiftFormValue } from '../shift-form/shift-form.component';
import { DayResourceViewComponent, SlotClickEvent } from '../day-resource-view/day-resource-view.component';

type ViewMode = 'calendar' | 'day';

/** Farbcodierung nach Schichttyp, erleichtert die Übersicht im Kalender. */
const SHIFT_COLORS: Record<Shift['type'], string> = {
  FRUEHDIENST: '#2563eb',
  SPAETDIENST: '#d97706',
  NACHTDIENST: '#4338ca',
  BEREITSCHAFT: '#64748b'
};

@Component({
  selector: 'app-shift-calendar',
  standalone: true,
  imports: [FullCalendarModule, DialogModule, ButtonModule, ShiftFormComponent, DayResourceViewComponent],
  templateUrl: './shift-calendar.component.html',
  styleUrl: './shift-calendar.component.scss'
})
export class ShiftCalendarComponent {
  private readonly hrState = inject(HrStateService);

  readonly employees = this.hrState.activeEmployees;

  readonly viewMode = signal<ViewMode>('day');
  readonly selectedDay = signal<Date>(new Date());

  readonly dialogVisible = signal(false);
  readonly editingShift = signal<Shift | null>(null);
  readonly prefilledDate = signal<string | null>(null);
  readonly prefilledEmployeeId = signal<string | null>(null);
  readonly prefilledStartTime = signal<string | null>(null);

  private readonly employeeNameById = computed(() => {
    const map = new Map<string, string>();
    for (const e of this.employees()) {
      map.set(e.id, `${e.firstName} ${e.lastName}`);
    }
    return map;
  });

  private readonly selectedDayIso = computed(() => this.selectedDay().toISOString().slice(0, 10));

  readonly dayShifts = computed(() => {
    const day = this.selectedDayIso();
    return this.hrState.shifts().filter((s) => s.date === day);
  });

  readonly selectedDayLabel = computed(() =>
    this.selectedDay().toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
  );

  private readonly events = computed(() =>
    this.hrState.shifts().map((shift) => ({
      id: shift.id,
      title: `${this.employeeNameById().get(shift.employeeId) ?? 'Unbekannt'} – ${this.shiftTypeLabel(shift.type)}`,
      start: `${shift.date}T${shift.startTime}`,
      end: `${shift.date}T${shift.endTime}`,
      backgroundColor: SHIFT_COLORS[shift.type],
      borderColor: SHIFT_COLORS[shift.type],
      extendedProps: { shift }
    }))
  );

  readonly calendarOptions = computed<CalendarOptions>(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: 'timeGridWeek',
    locale: deLocale,
    firstDay: 1,
    height: 'auto',
    selectable: true,
    editable: false,
    nowIndicator: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    buttonText: {
      today: 'Heute',
      month: 'Monat',
      week: 'Woche',
      day: 'Tag',
      list: 'Liste'
    },
    events: this.events(),
    select: (info: DateSelectArg) => this.onDateSelect(info),
    eventClick: (info: EventClickArg) => this.onEventClick(info)
  }));

  showDayView(): void {
    this.viewMode.set('day');
  }

  showCalendarView(): void {
    this.viewMode.set('calendar');
  }

  goToPreviousDay(): void {
    this.shiftSelectedDay(-1);
  }

  goToNextDay(): void {
    this.shiftSelectedDay(1);
  }

  goToToday(): void {
    this.selectedDay.set(new Date());
  }

  private shiftSelectedDay(deltaDays: number): void {
    const next = new Date(this.selectedDay());
    next.setDate(next.getDate() + deltaDays);
    this.selectedDay.set(next);
  }

  openNewShift(): void {
    this.editingShift.set(null);
    this.prefilledDate.set(null);
    this.prefilledEmployeeId.set(null);
    this.prefilledStartTime.set(null);
    this.dialogVisible.set(true);
  }

  onDaySlotClick(event: SlotClickEvent): void {
    this.editingShift.set(null);
    this.prefilledDate.set(this.selectedDayIso());
    this.prefilledEmployeeId.set(event.employeeId);
    this.prefilledStartTime.set(event.time);
    this.dialogVisible.set(true);
  }

  onDayShiftClick(shift: Shift): void {
    this.editingShift.set(shift);
    this.prefilledDate.set(null);
    this.prefilledEmployeeId.set(null);
    this.prefilledStartTime.set(null);
    this.dialogVisible.set(true);
  }

  private onDateSelect(info: DateSelectArg): void {
    this.editingShift.set(null);
    this.prefilledDate.set(info.startStr);
    this.prefilledEmployeeId.set(null);
    this.prefilledStartTime.set(null);
    this.dialogVisible.set(true);
  }

  private onEventClick(info: EventClickArg): void {
    const shift = info.event.extendedProps['shift'] as Shift;
    this.editingShift.set(shift);
    this.prefilledDate.set(null);
    this.prefilledEmployeeId.set(null);
    this.prefilledStartTime.set(null);
    this.dialogVisible.set(true);
  }

  onSave(value: ShiftFormValue): void {
    const existing = this.editingShift();
    if (existing) {
      this.hrState.updateShift(existing.id, value);
    } else {
      this.hrState.addShift({ id: crypto.randomUUID(), status: 'GEPLANT', ...value });
    }
    this.dialogVisible.set(false);
  }

  onDelete(): void {
    const existing = this.editingShift();
    if (existing) {
      this.hrState.removeShift(existing.id);
    }
    this.dialogVisible.set(false);
  }

  private shiftTypeLabel(type: Shift['type']): string {
    switch (type) {
      case 'FRUEHDIENST':
        return 'Früh';
      case 'SPAETDIENST':
        return 'Spät';
      case 'NACHTDIENST':
        return 'Nacht';
      default:
        return 'Bereitschaft';
    }
  }
}

