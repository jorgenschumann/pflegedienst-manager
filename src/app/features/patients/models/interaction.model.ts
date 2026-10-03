import { Medication } from './medication.model';

export type InteractionSeverity = 'HOCH' | 'MITTEL' | 'NIEDRIG';

export const INTERACTION_SEVERITY_LABELS: Record<InteractionSeverity, string> = {
  HOCH: 'Hohes Risiko',
  MITTEL: 'Mittleres Risiko',
  NIEDRIG: 'Geringes Risiko'
};

/** Statische Wechselwirkungs-Regel, Abgleich erfolgt über Teilstring-Treffer im Medikamentennamen (Demo-Wissensbasis). */
export interface InteractionRule {
  substanceA: string;
  substanceB: string;
  severity: InteractionSeverity;
  description: string;
}

/**
 * Vereinfachte Wechselwirkungs-Wissensbasis für die Demo (keine Ersatz für eine zertifizierte
 * AMTS-/Interaktionsdatenbank). Deckt die im Medikamentenkatalog vorkommenden Wirkstoffe ab.
 */
export const INTERACTION_RULES: InteractionRule[] = [
  {
    substanceA: 'marcumar',
    substanceB: 'ass',
    severity: 'HOCH',
    description: 'Erhöhtes Blutungsrisiko durch doppelte Hemmung der Blutgerinnung (Phenprocoumon + ASS).'
  },
  {
    substanceA: 'marcumar',
    substanceB: 'novaminsulfon',
    severity: 'HOCH',
    description: 'Metamizol kann die gerinnungshemmende Wirkung von Phenprocoumon verstärken – erhöhtes Blutungsrisiko.'
  },
  {
    substanceA: 'marcumar',
    substanceB: 'pantoprazol',
    severity: 'MITTEL',
    description: 'Protonenpumpenhemmer können die Wirkung von Phenprocoumon verstärken – engmaschige INR-Kontrolle empfohlen.'
  },
  {
    substanceA: 'ass',
    substanceB: 'novaminsulfon',
    severity: 'MITTEL',
    description: 'Metamizol kann die thrombozytenaggregationshemmende Wirkung von ASS abschwächen.'
  },
  {
    substanceA: 'torasemid',
    substanceB: 'bisoprolol',
    severity: 'NIEDRIG',
    description: 'Kombination von Diuretikum und Betablocker kann Blutdruck und Puls zusätzlich senken – Kontrolle empfohlen.'
  },
  {
    substanceA: 'oxycodon',
    substanceB: 'novaminsulfon',
    severity: 'MITTEL',
    description: 'Verstärkte sedierende/atemdepressive Wirkung bei Kombination von Opioid und Metamizol möglich.'
  },
  {
    substanceA: 'simvastatin',
    substanceB: 'pantoprazol',
    severity: 'NIEDRIG',
    description: 'Möglicherweise leicht erhöhte Statin-Plasmaspiegel durch CYP-Interaktion – meist unkritisch, Beobachtung empfohlen.'
  }
];

export interface InteractionWarning {
  medicationAId: string;
  medicationAName: string;
  medicationBId: string;
  medicationBName: string;
  severity: InteractionSeverity;
  description: string;
}

/** Prüft alle aktiven Medikamente eines Patienten paarweise gegen die Wechselwirkungs-Wissensbasis. */
export function checkInteractions(medications: Medication[]): InteractionWarning[] {
  const active = medications.filter((m) => m.active);
  const warnings: InteractionWarning[] = [];

  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      for (const rule of INTERACTION_RULES) {
        const forward = nameA.includes(rule.substanceA) && nameB.includes(rule.substanceB);
        const backward = nameA.includes(rule.substanceB) && nameB.includes(rule.substanceA);
        if (forward || backward) {
          warnings.push({
            medicationAId: a.id,
            medicationAName: a.name,
            medicationBId: b.id,
            medicationBName: b.name,
            severity: rule.severity,
            description: rule.description
          });
        }
      }
    }
  }

  return warnings;
}
