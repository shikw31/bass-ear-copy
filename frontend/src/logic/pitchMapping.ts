import type { PitchResult } from "../domain/types";

// Frequency -> note name mapping and detection gating (see business-logic-model.md section 6,
// business-rules.md: bass-range detection ~41Hz-400Hz, Q2 answer).

export const MIN_DETECTABLE_HZ = 41;
export const MAX_DETECTABLE_HZ = 400;
// 0.8 was too strict for real mixed audio (post-filtering clarity realistically lands lower
// than for a clean isolated tone); lowered to stay responsive, trading a bit of certainty.
export const CONFIDENCE_THRESHOLD = 0.6;

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const A4_FREQUENCY_HZ = 440;
const A4_MIDI_NUMBER = 69;

export function frequencyToNoteName(frequencyHz: number): string {
  const midiNumber = Math.round(12 * Math.log2(frequencyHz / A4_FREQUENCY_HZ) + A4_MIDI_NUMBER);
  const noteName = NOTE_NAMES[((midiNumber % 12) + 12) % 12];
  const octave = Math.floor(midiNumber / 12) - 1;
  return `${noteName}${octave}`;
}

export function toPitchResult(frequencyHz: number | null, confidence: number): PitchResult {
  const inBand =
    frequencyHz !== null && frequencyHz >= MIN_DETECTABLE_HZ && frequencyHz <= MAX_DETECTABLE_HZ;
  const detected = inBand && confidence >= CONFIDENCE_THRESHOLD;

  if (!detected || frequencyHz === null) {
    return { noteName: null, frequencyHz: null, confidence, detected: false };
  }
  return {
    noteName: frequencyToNoteName(frequencyHz),
    frequencyHz,
    confidence,
    detected: true,
  };
}
