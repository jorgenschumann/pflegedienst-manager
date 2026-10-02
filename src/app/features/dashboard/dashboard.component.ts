import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { HrStateService } from '../hr/services/hr-state.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CardModule, TagModule, DecimalPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private readonly hrState = inject(HrStateService);

  readonly activeEmployees = this.hrState.activeEmployees;
  readonly todaysShifts = this.hrState.todaysShifts;
  readonly pendingAbsenceRequests = this.hrState.pendingAbsenceRequests;
  readonly totalTimeAccountBalance = this.hrState.totalTimeAccountBalance;

  shiftStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (status) {
      case 'BESTAETIGT':
        return 'success';
      case 'ENTFALLEN':
        return 'danger';
      case 'VERTRETUNG':
        return 'warn';
      default:
        return 'info';
    }
  }
}
