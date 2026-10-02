import { Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { HrStateService } from '../../services/hr-state.service';
import { Employee } from '../../models';
import { EmployeeFormComponent } from '../employee-form/employee-form.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [ButtonModule, TableModule, TagModule, ToolbarModule, DialogModule, EmployeeFormComponent],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss'
})
export class EmployeeListComponent {
  private readonly hrState = inject(HrStateService);

  readonly employees = this.hrState.employees;

  readonly dialogVisible = signal(false);
  readonly editingEmployee = signal<Employee | null>(null);

  openNew(): void {
    this.editingEmployee.set(null);
    this.dialogVisible.set(true);
  }

  edit(employee: Employee): void {
    this.editingEmployee.set(employee);
    this.dialogVisible.set(true);
  }

  deactivate(employee: Employee): void {
    this.hrState.deactivateEmployee(employee.id);
  }

  onSaved(employee: Employee): void {
    if (this.editingEmployee()) {
      this.hrState.updateEmployee(employee.id, employee);
    } else {
      this.hrState.addEmployee(employee);
    }
    this.dialogVisible.set(false);
  }

  private readonly roleLabels: Record<Employee['role'], string> = {
    PFLEGEFACHKRAFT: 'Pflegefachkraft',
    PFLEGEHELFER: 'Pflegehelfer',
    ERGAENZENDE_HILFE: 'Ergänzende Hilfe',
    TEAMLEITUNG: 'Teamleitung',
    VERWALTUNG: 'Verwaltung'
  };

  roleLabel(role: Employee['role']): string {
    return this.roleLabels[role];
  }

  employmentTypeSeverity(type: string): 'success' | 'info' | 'warn' {
    switch (type) {
      case 'VOLLZEIT':
        return 'success';
      case 'TEILZEIT':
        return 'info';
      default:
        return 'warn';
    }
  }
}
