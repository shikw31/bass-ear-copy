import type { PitchResult } from "../domain/types";

// Debounces the live pitch-detector stream (ticking ~15Hz) into "note changed and held" events,
// so a transcript entry is logged once per played note instead of once per detection tick.
// Requires the same note to repeat STABILITY_TICKS times (~200ms at 15Hz) before logging it,
// and won't log the same note twice in a row (sustained notes don't spam the log).
const STABILITY_TICKS = 3;

export class NoteTranscriptLogger {
  private lastLoggedNote: string | null = null;
  private pendingNote: string | null = null;
  private pendingTicks = 0;

  constructor(private readonly onNoteHeld: (noteName: string, frequencyHz: number) => void) {}

  observe(pitch: PitchResult): void {
    if (!pitch.detected || !pitch.noteName || pitch.frequencyHz === null) {
      this.pendingNote = null;
      this.pendingTicks = 0;
      return;
    }

    if (pitch.noteName === this.pendingNote) {
      this.pendingTicks += 1;
    } else {
      this.pendingNote = pitch.noteName;
      this.pendingTicks = 1;
    }

    if (this.pendingTicks === STABILITY_TICKS && pitch.noteName !== this.lastLoggedNote) {
      this.lastLoggedNote = pitch.noteName;
      this.onNoteHeld(pitch.noteName, pitch.frequencyHz);
    }
  }

  reset(): void {
    this.lastLoggedNote = null;
    this.pendingNote = null;
    this.pendingTicks = 0;
  }
}
