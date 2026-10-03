import { Injectable, signal, effect } from '@angular/core';

const STORAGE_KEY = 'pflegedienst-font-size';
const BASE_FONT_SIZE = 15;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 20;
const STEP = 1;

/**
 * Verwaltet die global einstellbare Basis-Schriftgröße der Anwendung.
 * Der Wert wird direkt auf das Wurzelelement geschrieben und skaliert
 * dadurch alle rem-basierten Schriftgrößen/Abstände der App.
 */
@Injectable({ providedIn: 'root' })
export class UiScaleService {
  readonly fontSize = signal(this.readInitialFontSize());

  readonly canDecrease = signal(true);
  readonly canIncrease = signal(true);

  constructor() {
    effect(() => {
      const size = this.fontSize();
      document.documentElement.style.setProperty('font-size', `${size}px`);
      localStorage.setItem(STORAGE_KEY, String(size));
      this.canDecrease.set(size > MIN_FONT_SIZE);
      this.canIncrease.set(size < MAX_FONT_SIZE);
    });
  }

  increase(): void {
    this.fontSize.update((size) => Math.min(MAX_FONT_SIZE, size + STEP));
  }

  decrease(): void {
    this.fontSize.update((size) => Math.max(MIN_FONT_SIZE, size - STEP));
  }

  reset(): void {
    this.fontSize.set(BASE_FONT_SIZE);
  }

  private readInitialFontSize(): number {
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    if (Number.isFinite(stored) && stored >= MIN_FONT_SIZE && stored <= MAX_FONT_SIZE) {
      return stored;
    }
    return BASE_FONT_SIZE;
  }
}
