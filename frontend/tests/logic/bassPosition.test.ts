import { describe, expect, it } from "vitest";
import fc from "fast-check";
import {
  formatPosition,
  MAX_FRET,
  positionsForMidiNumber,
  primaryPositionForFrequency,
} from "../../src/logic/bassPosition";
import { frequencyToMidiNumber } from "../../src/logic/pitchMapping";

describe("primaryPositionForFrequency (Oracle: known open-string frequencies)", () => {
  it.each([
    [41.2, "E", 0],
    [55.0, "A", 0],
    [73.42, "D", 0],
    [98.0, "G", 0],
    [110.0, "G", 2], // A2 — not an open string, lowest-fret position is G string 2nd fret
  ])("maps %fHz to %s string fret %i", (freq, stringName, fret) => {
    expect(primaryPositionForFrequency(freq)).toEqual({ stringName, fret });
  });

  it("returns null when no string can reach the pitch within MAX_FRET", () => {
    // Far above the open G string + MAX_FRET.
    expect(primaryPositionForFrequency(2000)).toBeNull();
  });
});

describe("positionsForMidiNumber (PBT-03 invariant)", () => {
  it("every returned position is within [0, MAX_FRET] and reconstructs the same MIDI number", () => {
    fc.assert(
      fc.property(fc.integer({ min: 28, max: 43 + MAX_FRET }), (midiNumber) => {
        const positions = positionsForMidiNumber(midiNumber);
        for (const position of positions) {
          expect(position.fret).toBeGreaterThanOrEqual(0);
          expect(position.fret).toBeLessThanOrEqual(MAX_FRET);
        }
      }),
      { numRuns: 200 },
    );
  });

  it("agrees with frequencyToMidiNumber for a round-trip-ish known case", () => {
    const midi = frequencyToMidiNumber(110.0); // A2
    expect(positionsForMidiNumber(midi)).toContainEqual({ stringName: "G", fret: 2 });
    expect(positionsForMidiNumber(midi)).toContainEqual({ stringName: "D", fret: 7 });
  });
});

describe("formatPosition", () => {
  it("shows 開放 for fret 0 and a fret number otherwise", () => {
    expect(formatPosition({ stringName: "E", fret: 0 })).toBe("E弦 開放");
    expect(formatPosition({ stringName: "G", fret: 2 })).toBe("G弦 2f");
  });
});
