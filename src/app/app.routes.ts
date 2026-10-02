import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'hr/mitarbeiter',
    loadComponent: () =>
      import('./features/hr/pages/employee-list/employee-list.component').then((m) => m.EmployeeListComponent)
  },
  {
    path: 'hr/dienstplan',
    loadComponent: () =>
      import('./features/hr/pages/shift-calendar/shift-calendar.component').then((m) => m.ShiftCalendarComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
