import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { HrStateService } from '../features/hr/services/hr-state.service';
import { UiScaleService } from './services/ui-scale.service';

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
  readonly uiScale = inject(UiScaleService);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
    { label: 'Mitarbeiter', icon: 'pi pi-users', route: '/hr/mitarbeiter' },
    { label: 'Dienstplan', icon: 'pi pi-calendar', route: '/hr/dienstplan' },
    { label: 'Qualifikationen', icon: 'pi pi-verified', route: '/hr/qualifikationen' },
    { label: 'Stundenkonto', icon: 'pi pi-clock', route: '/hr/stundenkonto' },
    { label: 'Regelprüfung', icon: 'pi pi-exclamation-triangle', route: '/hr/regelpruefung' },
    { label: 'Patienten', icon: 'pi pi-heart', route: '/patienten' },
    { label: 'Touren', icon: 'pi pi-map', route: '/touren' },
    { label: 'Vertretungen', icon: 'pi pi-user-edit', route: '/touren/vertretungen' },
    { label: 'Fuhrpark', icon: 'pi pi-car', route: '/fuhrpark' },
    { label: 'Reporting', icon: 'pi pi-chart-bar', route: '/reporting' },
    { label: 'Abwesenheiten', icon: 'pi pi-briefcase', route: '/hr/abwesenheiten' },
    { label: 'Abrechnung', icon: 'pi pi-euro', route: '/abrechnung' },
    { label: 'TI', icon: 'pi pi-shield', route: '/ti' },
    { label: 'BTM-Bestandsbuch', icon: 'pi pi-lock', route: '/medikamente/btm-buch' },
    { label: 'Nachbestellung', icon: 'pi pi-shopping-cart', route: '/medikamente/nachbestellung' }
  ];

  readonly pendingAbsenceCount = this.hrState.pendingAbsenceRequests;
}
