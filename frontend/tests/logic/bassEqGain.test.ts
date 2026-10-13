import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { clampGainDb, EQ_MAX_GAIN_DB, EQ_MIN_GAIN_DB, gainDbToLinearGain } from "../../src/logic/bassEqGain";

describe("gainDbToLinearGain (PBT-03 invariants: identity at 0dB, monotonic)", () => {
  it("gain=0dB is the identity (bypass, linear gain 1)", () => {
    expect(gainDbToLinearGain(0)).toBeCloseTo(1, 10);
  });

  it("is monotonically increasing in gainDb", () => {
    fc.assert(
      fc.property(
        fc.float({ min: EQ_MIN_GAIN_DB, max: EQ_MAX_GAIN_DB, noNaN: true }),
        fc.float({ min: EQ_MIN_GAIN_DB, max: EQ_MAX_GAIN_DB, noNaN: true }),
        (a, b) => {
          if (a < b) {
            expect(gainDbToLinearGain(a)).toBeLessThanOrEqual(gainDbToLinearGain(b));
          }
        },
      ),
      { numRuns: 200 },
    );
  });

  it("clamps out-of-range input to [-12, 12]", () => {
    fc.assert(
      fc.property(fc.float({ min: -1000, max: 1000, noNaN: true }), (gainDb) => {
        const clamped = clampGainDb(gainDb);
        expect(clamped).toBeGreaterThanOrEqual(EQ_MIN_GAIN_DB);
        expect(clamped).toBeLessThanOrEqual(EQ_MAX_GAIN_DB);
      }),
      { numRuns: 200 },
    );
  });
});
