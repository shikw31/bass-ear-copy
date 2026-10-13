import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { clampPlaybackRate, MAX_PLAYBACK_RATE, MIN_PLAYBACK_RATE } from "../../src/logic/timeStretchRate";

describe("clampPlaybackRate (PBT-03 range constraint)", () => {
  it("always returns a value within [0.25, 1.0]", () => {
    fc.assert(
      fc.property(fc.float({ min: -10, max: 10, noNaN: true }), (rate) => {
        const clamped = clampPlaybackRate(rate);
        expect(clamped).toBeGreaterThanOrEqual(MIN_PLAYBACK_RATE);
        expect(clamped).toBeLessThanOrEqual(MAX_PLAYBACK_RATE);
      }),
      { numRuns: 200 },
    );
  });

  it("passes through values already within range (example-based)", () => {
    expect(clampPlaybackRate(0.5)).toBe(0.5);
  });
});
