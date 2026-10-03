import { Component, computed, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { HrStateService } from '../../services/hr-state.service';

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

/**
 * Soll-Ist-Stundenabgleich: vergleicht je aktivem Mitarbeiter die vertragliche Soll-Arbeitszeit
 * mit den tatsächlich geplanten/bestätigten Diensten im gewählten Monat und zeigt den
 * resultierenden (hochgerechneten) Saldo des Arbeitszeitkontos.
 */
@Component({
  selector: 'app-stundenkonto',
  standalone: true,
  imports: [ButtonModule, TableModule, ToolbarModule],
  templateUrl: './stundenkonto.component.html',
  styleUrl: './stundenkonto.component.scss'
})
export class StundenkontoComponent {
  private readonly hrState = inject(HrStateService);

  private readonly monthOffset = signal(0);

  readonly periodLabel = computed(() => {
    const { year, month } = this.monthBounds();
    return `${MONTH_NAMES[month]} ${year}`;
  });

  readonly rows = computed(() => {
    const { startIso, endIso } = this.isoBounds();
    return this.hrState
      .timeAccountSummary(startIso, endIso)
      .sort((a, b) => a.employee.lastName.localeCompare(b.employee.lastName));
  });

  private monthBounds(): { year: number; month: number } {
    const base = new Date();
    base.setDate(1);
    base.setMonth(base.getMonth() + this.monthOffset());
    return { year: base.getFullYear(), month: base.getMonth() };
  }

  private isoBounds(): { startIso: string; endIso: string } {
    const { year, month } = this.monthBounds();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    return { startIso: start.toISOString().slice(0, 10), endIso: end.toISOString().slice(0, 10) };
  }

  previousMonth(): void {
    this.monthOffset.update((v) => v - 1);
  }

  nextMonth(): void {
    this.monthOffset.update((v) => v + 1);
  }

  resetMonth(): void {
    this.monthOffset.set(0);
  }
}
