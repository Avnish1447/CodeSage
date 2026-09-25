/**
 * CodeSage Studio - Pitch Deck Dual Exporter
 * Provides high-fidelity PDF and editable PPTX export utilities.
 */

import { exportPitchDeckPPTX } from './pitchDeckPPTX';

export { exportPitchDeckPPTX };

export function exportPitchDeckPDF(): void {
  const originalTitle = document.title;
  document.title = 'CodeSage-Pitch-Deck';
  
  // Brief delay to allow DOM/focus settle
  window.print();
  
  setTimeout(() => {
    document.title = originalTitle;
  }, 1200);
}
