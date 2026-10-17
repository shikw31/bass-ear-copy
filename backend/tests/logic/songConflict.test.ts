import { describe, expect, it } from "vitest";
import fc from "fast-check";
import type { SongRecord } from "../../src/domain/types";
import { shouldAcceptWrite } from "../../src/logic/songConflict";

function recordAt(updatedAt: number): SongRecord {
  return { userId: "u1", songKey: "local:abc", loopPoints: null, memo: null, updatedAt };
}

describe("shouldAcceptWrite (PBT-03 invariant, PBT-04 idempotence)", () => {
  it("accepts iff there is no existing record, or incoming.updatedAt >= existing.updatedAt", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000 }),
        fc.integer({ min: 0, max: 1_000_000 }),
        (existingTime, incomingTime) => {
          const accepted = shouldAcceptWrite(recordAt(existingTime), recordAt(incomingTime));
          expect(accepted).toBe(incomingTime >= existingTime);
        },
      ),
      { numRuns: 200 },
    );
  });

  it("always accepts when there is no existing record", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1_000_000 }), (incomingTime) => {
        expect(shouldAcceptWrite(null, recordAt(incomingTime))).toBe(true);
      }),
      { numRuns: 50 },
    );
  });

  it("accepting the same resubmission twice is idempotent (both succeed)", () => {
    const existing = recordAt(100);
    const incoming = recordAt(100);
    expect(shouldAcceptWrite(existing, incoming)).toBe(true);
    expect(shouldAcceptWrite(existing, incoming)).toBe(true);
  });
});
