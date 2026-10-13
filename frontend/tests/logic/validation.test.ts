import { describe, expect, it } from "vitest";
import fc from "fast-check";
import {
  MAX_MEMO_LENGTH,
  MIN_LOOP_LENGTH_SEC,
  validateLoopPoints,
  validateMemoText,
  validateYouTubeUrl,
} from "../../src/logic/validation";

describe("validateLoopPoints (PBT-03 invariant, PBT-04 idempotence)", () => {
  it("accepts only points satisfying 0<=a<b<=duration and b-a>=min length", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1000, noNaN: true }),
        fc.float({ min: 0, max: 1000, noNaN: true }),
        fc.float({ min: 1, max: 2000, noNaN: true }),
        (a, b, duration) => {
          const result = validateLoopPoints(a, b, duration);
          const shouldBeValid = a >= 0 && a < b && b <= duration && b - a >= MIN_LOOP_LENGTH_SEC;
          expect(result.valid).toBe(shouldBeValid);
        },
      ),
      { numRuns: 200 },
    );
  });

  it("rejecting the same invalid input twice is idempotent", () => {
    const first = validateLoopPoints(10, 10.1, 100);
    const second = validateLoopPoints(10, 10.1, 100);
    expect(first).toEqual(second);
    expect(first.valid).toBe(false);
  });
});

describe("validateMemoText", () => {
  it(`rejects text longer than ${MAX_MEMO_LENGTH} characters`, () => {
    expect(validateMemoText("a".repeat(MAX_MEMO_LENGTH)).valid).toBe(true);
    expect(validateMemoText("a".repeat(MAX_MEMO_LENGTH + 1)).valid).toBe(false);
  });
});

describe("validateYouTubeUrl", () => {
  it("accepts standard watch and short URLs", () => {
    expect(validateYouTubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ").valid).toBe(true);
    expect(validateYouTubeUrl("https://youtu.be/dQw4w9WgXcQ").valid).toBe(true);
  });

  it("rejects non-YouTube URLs", () => {
    expect(validateYouTubeUrl("https://example.com/watch?v=dQw4w9WgXcQ").valid).toBe(false);
  });
});
