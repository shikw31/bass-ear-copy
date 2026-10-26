import { describe, expect, it } from "vitest";
import {
  chromaFromFrequencyMagnitudes,
  formatChord,
  guessChordFromChroma,
} from "../../src/logic/chordDetection";

function chromaWithPitchClasses(pitchClasses: number[]): number[] {
  const chroma = new Array(12).fill(0);
  for (const pc of pitchClasses) chroma[pc] = 1;
  return chroma;
}

describe("guessChordFromChroma (Oracle: known triads)", () => {
  it("recognizes a C major triad (C=0, E=4, G=7)", () => {
    const guess = guessChordFromChroma(chromaWithPitchClasses([0, 4, 7]));
    expect(guess.detected).toBe(true);
    expect(guess.root).toBe("C");
    expect(guess.quality).toBe("major");
  });

  it("recognizes an A minor triad (A=9, C=0, E=4)", () => {
    const guess = guessChordFromChroma(chromaWithPitchClasses([9, 0, 4]));
    expect(guess.detected).toBe(true);
    expect(guess.root).toBe("A");
    expect(guess.quality).toBe("minor");
  });

  it("reports undetected for silence (all-zero chroma)", () => {
    const guess = guessChordFromChroma(new Array(12).fill(0));
    expect(guess.detected).toBe(false);
    expect(guess.root).toBeNull();
  });
});

describe("chromaFromFrequencyMagnitudes", () => {
  it("places energy at the correct pitch class for a known frequency", () => {
    const sampleRate = 44100;
    const fftSize = 2048;
    const hzPerBin = sampleRate / fftSize;
    const magnitudes = new Array(fftSize / 2).fill(0);
    // A4 = 440Hz -> pitch class 9 (A).
    const binForA4 = Math.round(440 / hzPerBin);
    magnitudes[binForA4] = 1;

    const chroma = chromaFromFrequencyMagnitudes(magnitudes, sampleRate, fftSize);
    const maxIndex = chroma.indexOf(Math.max(...chroma));
    expect(maxIndex).toBe(9);
  });

  it("ignores bins outside the [minHz, maxHz] window", () => {
    const sampleRate = 44100;
    const fftSize = 2048;
    const magnitudes = new Array(fftSize / 2).fill(0);
    magnitudes[1] = 5; // a very low bin, well below the default 80Hz floor

    const chroma = chromaFromFrequencyMagnitudes(magnitudes, sampleRate, fftSize, 80, 2000);
    expect(chroma.every((v) => v === 0)).toBe(true);
  });
});

describe("formatChord", () => {
  it("formats major as the bare root and minor with a trailing m", () => {
    expect(formatChord({ root: "C", quality: "major", confidence: 1, detected: true })).toBe("C");
    expect(formatChord({ root: "A", quality: "minor", confidence: 1, detected: true })).toBe("Am");
  });

  it("formats an undetected guess as --", () => {
    expect(formatChord({ root: null, quality: null, confidence: 0, detected: false })).toBe("--");
  });
});
