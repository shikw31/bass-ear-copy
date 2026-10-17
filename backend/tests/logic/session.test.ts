import { describe, expect, it } from "vitest";
import fc from "fast-check";
import type { Session } from "../../src/domain/types";
import { isExpired, newExpiresAt, SESSION_DURATION_MS, withSlidingExtension } from "../../src/logic/session";

function sessionExpiringAt(expiresAt: number): Session {
  return { sessionId: "s1", userId: "u1", createdAt: 0, expiresAt };
}

describe("isExpired (PBT-03 invariant)", () => {
  it("is always true once past expiresAt, regardless of how far past", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1_000_000_000 }),
        fc.integer({ min: 0, max: 1_000_000_000 }),
        (expiresAt, elapsedPastExpiry) => {
          const now = expiresAt + elapsedPastExpiry;
          expect(isExpired(sessionExpiringAt(expiresAt), now)).toBe(true);
        },
      ),
      { numRuns: 200 },
    );
  });

  it("is false strictly before expiresAt", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1_000_000_000 }), (expiresAt) => {
        expect(isExpired(sessionExpiringAt(expiresAt), expiresAt - 1)).toBe(false);
      }),
      { numRuns: 200 },
    );
  });
});

describe("withSlidingExtension (PBT-03 invariant, PBT-04 idempotence)", () => {
  it("always extends expiresAt to now + SESSION_DURATION_MS", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1_000_000_000 }), (now) => {
        const extended = withSlidingExtension(sessionExpiringAt(0), now);
        expect(extended.expiresAt).toBe(newExpiresAt(now));
        expect(extended.expiresAt - now).toBe(SESSION_DURATION_MS);
      }),
      { numRuns: 200 },
    );
  });

  it("extending twice at the same instant yields the same expiresAt", () => {
    const now = 1000;
    const once = withSlidingExtension(sessionExpiringAt(0), now);
    const twice = withSlidingExtension(once, now);
    expect(once.expiresAt).toBe(twice.expiresAt);
  });
});
