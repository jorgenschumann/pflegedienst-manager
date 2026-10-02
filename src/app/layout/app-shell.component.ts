import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { HrStateService } from '../features/hr/services/hr-state.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonModule],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss'
})
export class AppShellComponent {
  private readonly hrState = inject(HrStateService);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
    { label: 'Mitarbeiter', icon: 'pi pi-users', route: '/hr/mitarbeiter' },
    { label: 'Dienstplan', icon: 'pi pi-calendar', route: '/hr/dienstplan' },
    { label: 'Abwesenheiten', icon: 'pi pi-briefcase', route: '/hr/abwesenheiten' }
  ];

  readonly pendingAbsenceCount = this.hrState.pendingAbsenceRequests;
}
