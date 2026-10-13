import { describe, expect, it } from "vitest";
import {
  CONFIDENCE_THRESHOLD,
  frequencyToNoteName,
  MAX_DETECTABLE_HZ,
  MIN_DETECTABLE_HZ,
  toPitchResult,
} from "../../src/logic/pitchMapping";

describe("frequencyToNoteName (Oracle: equal-temperament reference table)", () => {
  it.each([
    [440, "A4"],
    [82.41, "E2"], // 4-string bass open E string
    [110.0, "A2"],
    [146.83, "D3"],
    [196.0, "G3"],
  ])("maps %fHz to %s", (freq, expected) => {
    expect(frequencyToNoteName(freq)).toBe(expected);
  });
});

describe("toPitchResult (business-rules.md: band gating + confidence threshold)", () => {
  it("detects a bass-range frequency with sufficient confidence", () => {
    const result = toPitchResult(82.41, 0.9);
    expect(result.detected).toBe(true);
    expect(result.noteName).toBe("E2");
  });

  it("rejects frequencies below the bass band", () => {
    expect(toPitchResult(MIN_DETECTABLE_HZ - 1, 0.95).detected).toBe(false);
  });

  it("rejects frequencies above the bass band", () => {
    expect(toPitchResult(MAX_DETECTABLE_HZ + 1, 0.95).detected).toBe(false);
  });

  it("rejects low-confidence detections even within band", () => {
    expect(toPitchResult(110, CONFIDENCE_THRESHOLD - 0.01).detected).toBe(false);
  });

  it("returns detected:false with null fields when frequency is null", () => {
    expect(toPitchResult(null, 0)).toEqual({
      noteName: null,
      frequencyHz: null,
      confidence: 0,
      detected: false,
    });
  });
});
