import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

import { routes } from './app.routes';

// Kompakteres Theme: reduziert die Standard-Innenabstände/Schriftgrößen von PrimeNG-Komponenten,
// damit Tabellen, Formulare, Karten und Dialoge weniger Platz einnehmen.
const CompactAura = definePreset(Aura, {
  semantic: {
    formField: {
      paddingX: '0.55rem',
      paddingY: '0.3rem'
    },
    list: {
      padding: '0.2rem',
      option: {
        padding: '0.35rem 0.55rem'
      }
    },
    overlay: {
      popover: { padding: '0.6rem' },
      modal: { padding: '1rem' }
    }
  },
  components: {
    card: {
      body: { padding: '0.85rem', gap: '0.35rem' },
      title: { fontSize: '1.05rem' }
    },
    datatable: {
      headerCell: { padding: '0.5rem 0.65rem' },
      bodyCell: { padding: '0.4rem 0.65rem' },
      footerCell: { padding: '0.5rem 0.65rem' },
      header: { padding: '0.5rem 0.65rem' },
      footer: { padding: '0.5rem 0.65rem' }
    },
    button: {
      paddingX: '0.6rem',
      paddingY: '0.35rem'
    },
    toolbar: {
      padding: '0.6rem 0.85rem'
    },
    panel: {
      header: { padding: '0.5rem 0.85rem' },
      content: { padding: '0.65rem 0.85rem' }
    },
    tabview: {
      nav: { padding: '0' },
      tabpanel: { padding: '0.75rem 0' }
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: CompactAura,
        options: { darkModeSelector: '.dark' }
      }
    })
  ]
};
