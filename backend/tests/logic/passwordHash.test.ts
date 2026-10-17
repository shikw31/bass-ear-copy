import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { hashPassword, verifyPassword } from "../../src/logic/passwordHash";

describe("passwordHash (PBT-02: round-trip verification)", () => {
  it("verifies successfully against its own hash", async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 8, maxLength: 30 }), async (password) => {
        const hash = await hashPassword(password);
        expect(await verifyPassword(password, hash)).toBe(true);
      }),
      { numRuns: 5 }, // bcrypt is intentionally slow; keep PBT runs small
    );
  });

  it("fails verification against a different password", async () => {
    const hash = await hashPassword("correct-password-123");
    expect(await verifyPassword("wrong-password-456", hash)).toBe(false);
  });
});
