import { Component, computed, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { HrStateService } from '../../services/hr-state.service';
import { ALL_QUALIFICATION_CODES, Employee, QUALIFICATION_LABELS, QualificationCode } from '../../models';

interface MatrixRow {
  employee: Employee;
  roleLabel: string;
  has: Record<QualificationCode, boolean>;
}

/**
 * Qualifikationsmatrix: zeigt je aktivem Mitarbeiter, welche Qualifikationen vorliegen, und
 * errechnet die Fachkraftquote nach § 71 SGB XI sowie Tage ohne Fachkraft-Abdeckung im
 * Dienstplan (vereinfachte Demo-Kennzahlen, keine Rechtsberatung).
 */
@Component({
  selector: 'app-qualifikationsmatrix',
  standalone: true,
  imports: [CardModule, TableModule, TagModule],
  templateUrl: './qualifikationsmatrix.component.html',
  styleUrl: './qualifikationsmatrix.component.scss'
})
export class QualifikationsmatrixComponent {
  private readonly hrState = inject(HrStateService);

  readonly columns = ALL_QUALIFICATION_CODES;
  readonly qualificationLabels = QUALIFICATION_LABELS;
  readonly fachkraftquote = this.hrState.fachkraftquote;

  readonly coverageGaps = computed(() => this.hrState.daysWithoutFachkraftCoverage(14));

  private readonly roleLabels: Record<Employee['role'], string> = {
    PFLEGEFACHKRAFT: 'Pflegefachkraft',
    PFLEGEHELFER: 'Pflegehelfer',
    ERGAENZENDE_HILFE: 'Ergänzende Hilfe',
    TEAMLEITUNG: 'Teamleitung',
    VERWALTUNG: 'Verwaltung'
  };

  readonly rows = computed<MatrixRow[]>(() =>
    this.hrState
      .activeEmployees()
      .filter((e) => e.role === 'PFLEGEFACHKRAFT' || e.role === 'PFLEGEHELFER' || e.role === 'ERGAENZENDE_HILFE')
      .map((employee) => {
        const codes = new Set(employee.qualifications.map((q) => q.code));
        const has = {} as Record<QualificationCode, boolean>;
        for (const code of this.columns) has[code] = codes.has(code);
        return { employee, roleLabel: this.roleLabels[employee.role], has };
      })
      .sort((a, b) => a.employee.lastName.localeCompare(b.employee.lastName))
  );

  quotePercent(): string {
    return (this.fachkraftquote().quote * 100).toFixed(0);
  }
}
