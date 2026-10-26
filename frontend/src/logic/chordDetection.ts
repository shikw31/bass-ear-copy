// Chord detection via chroma template matching. Explicitly "reference only" — see
// requirements.md Change Log: accuracy on a full mix (drums/vocals on top of harmony
// instruments) is much lower than the monophonic bass-note detection pitchy gives us, since
// this has to guess which of many simultaneous frequencies are "the chord" from a plain FFT
// magnitude spectrum rather than a trained model.

export interface ChordGuess {
  root: string | null;
  quality: "major" | "minor" | null;
  confidence: number;
  detected: boolean;
}

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const MAJOR_INTERVALS = [0, 4, 7];
const MINOR_INTERVALS = [0, 3, 7];
const A4_FREQUENCY_HZ = 440;
const A4_MIDI_NUMBER = 69;

// Loosely tuned: chord detection is inherently approximate, so this is a soft floor rather than
// a rule derived from measurement (unlike CONFIDENCE_THRESHOLD in pitchMapping.ts).
export const CHORD_CONFIDENCE_THRESHOLD = 0.55;
export const DEFAULT_MIN_HZ = 80;
export const DEFAULT_MAX_HZ = 2000;

function frequencyToPitchClass(frequencyHz: number): number {
  const midi = Math.round(12 * Math.log2(frequencyHz / A4_FREQUENCY_HZ) + A4_MIDI_NUMBER);
  return ((midi % 12) + 12) % 12;
}

// Builds a 12-bin pitch-class energy profile ("chroma") from linear-magnitude FFT bins,
// normalized by its own peak so loudness doesn't affect template matching.
export function chromaFromFrequencyMagnitudes(
  magnitudes: ArrayLike<number>,
  sampleRate: number,
  fftSize: number,
  minHz: number = DEFAULT_MIN_HZ,
  maxHz: number = DEFAULT_MAX_HZ,
): number[] {
  const chroma = new Array(12).fill(0);
  const hzPerBin = sampleRate / fftSize;
  for (let i = 0; i < magnitudes.length; i++) {
    const freq = i * hzPerBin;
    if (freq < minHz || freq > maxHz) continue;
    chroma[frequencyToPitchClass(freq)] += magnitudes[i];
  }
  const peak = Math.max(...chroma, 1e-9);
  return chroma.map((v) => v / peak);
}

function triadTemplate(root: number, intervals: number[]): number[] {
  const template = new Array(12).fill(0);
  for (const interval of intervals) template[(root + interval) % 12] = 1;
  return template;
}

function dot(a: number[], b: number[]): number {
  return a.reduce((sum, v, i) => sum + v * b[i], 0);
}

function magnitude(a: number[]): number {
  return Math.sqrt(dot(a, a));
}

// Cosine similarity against every major/minor triad template (24 candidates); the best match
// above CHORD_CONFIDENCE_THRESHOLD wins, otherwise "no clear chord" (detected: false).
export function guessChordFromChroma(chroma: number[]): ChordGuess {
  let best: { root: number; quality: "major" | "minor"; score: number } | null = null;

  for (let root = 0; root < 12; root++) {
    for (const [quality, intervals] of [
      ["major", MAJOR_INTERVALS],
      ["minor", MINOR_INTERVALS],
    ] as const) {
      const template = triadTemplate(root, intervals);
      const denom = magnitude(chroma) * magnitude(template);
      const score = denom > 0 ? dot(chroma, template) / denom : 0;
      if (!best || score > best.score) best = { root, quality, score };
    }
  }

  if (!best || best.score < CHORD_CONFIDENCE_THRESHOLD) {
    return { root: null, quality: null, confidence: best?.score ?? 0, detected: false };
  }
  return { root: NOTE_NAMES[best.root], quality: best.quality, confidence: best.score, detected: true };
}

export function formatChord(guess: ChordGuess): string {
  if (!guess.detected || !guess.root) return "--";
  return guess.quality === "minor" ? `${guess.root}m` : guess.root;
}
