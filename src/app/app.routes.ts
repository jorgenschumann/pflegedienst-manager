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
  {
    path: 'patienten',
    loadComponent: () =>
      import('./features/patients/pages/patient-list/patient-list.component').then((m) => m.PatientListComponent)
  },
  {
    path: 'patienten/:id',
    loadComponent: () =>
      import('./features/patients/pages/patient-detail/patient-detail.component').then((m) => m.PatientDetailComponent)
  },
  {
    path: 'touren',
    loadComponent: () =>
      import('./features/touren/pages/touren-plan/touren-plan.component').then((m) => m.TourenPlanComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
