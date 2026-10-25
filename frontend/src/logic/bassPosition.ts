import { frequencyToMidiNumber } from "./pitchMapping";

// Maps a detected pitch to playable position(s) on a standard 4-string bass (E-A-D-G).
// Pure music theory (semitone arithmetic against each string's open-string pitch) — no
// inference/guessing involved, unlike chord detection.

export interface StringPosition {
  stringName: "E" | "A" | "D" | "G";
  fret: number;
}

// Open-string MIDI numbers (equal temperament, A4=440Hz — same reference as pitchMapping.ts).
// E1≈41.20Hz, A1≈55.00Hz, D2≈73.42Hz, G2≈98.00Hz — a perfect fourth (5 semitones) apart.
const OPEN_STRINGS: StringPosition["stringName"][] = ["E", "A", "D", "G"];
const OPEN_STRING_MIDI: Record<StringPosition["stringName"], number> = {
  E: 28,
  A: 33,
  D: 38,
  G: 43,
};

export const MAX_FRET = 12;

export function positionsForMidiNumber(midiNumber: number): StringPosition[] {
  return OPEN_STRINGS.map((stringName) => ({
    stringName,
    fret: midiNumber - OPEN_STRING_MIDI[stringName],
  })).filter((position) => position.fret >= 0 && position.fret <= MAX_FRET);
}

// The lowest-fret candidate is used as the default suggestion — the idiomatic, easiest-to-read
// position when a note is playable on more than one string.
export function primaryPositionForFrequency(frequencyHz: number): StringPosition | null {
  const positions = positionsForMidiNumber(frequencyToMidiNumber(frequencyHz));
  if (positions.length === 0) return null;
  return positions.reduce((best, p) => (p.fret < best.fret ? p : best));
}

export function formatPosition(position: StringPosition): string {
  return position.fret === 0 ? `${position.stringName}弦 開放` : `${position.stringName}弦 ${position.fret}f`;
}
