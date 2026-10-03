export type BtmMovementType = 'ZUGANG' | 'ABGANG' | 'VERNICHTUNG' | 'KORREKTUR';

export const BTM_MOVEMENT_LABELS: Record<BtmMovementType, string> = {
  ZUGANG: 'Zugang (Lieferung)',
  ABGANG: 'Abgang (Gabe an Patient)',
  VERNICHTUNG: 'Vernichtung',
  KORREKTUR: 'Bestandskorrektur'
};

/**
 * Lückenlose Bestandsbuch-Zeile für Betäubungsmittel gemäß § 13 BtMVV. Jede Bestandsänderung
 * (Zugang, Abgang durch Gabe, Vernichtung, Korrektur) wird mit fortlaufendem Bestand sowie
 * durchführender und – bei Abgang/Vernichtung – bezeugender Person (Vier-Augen-Prinzip) dokumentiert.
 */
export interface BtmLedgerEntry {
  id: string;
  medicationId: string;
  patientId: string;
  date: string; // ISO-Timestamp
  type: BtmMovementType;
  /** Menge der Bewegung (immer positiv angegeben – die Richtung ergibt sich aus "type"). */
  quantity: number;
  unit: string;
  /** Bestand nach Verbuchung dieses Eintrags. */
  resultingStock: number;
  performedBy: string;
  /** Zweite Person zur Bezeugung (Vier-Augen-Prinzip), insbesondere bei Abgang und Vernichtung. */
  witnessedBy?: string;
  /** Verknüpfung zur protokollierten Gabe, falls der Abgang aus einer Medikamentengabe stammt. */
  administrationId?: string;
  note?: string;
}
