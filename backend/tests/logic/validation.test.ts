import { describe, expect, it } from "vitest";
import { loginSchema, MAX_MEMO_LENGTH, memoSchema, songDataPutSchema, songKeySchema } from "../../src/logic/validation";

describe("songKeySchema", () => {
  it("accepts a local sha-256 key and a youtube key", () => {
    expect(songKeySchema.safeParse(`local:${"a".repeat(64)}`).success).toBe(true);
    expect(songKeySchema.safeParse("yt:dQw4w9WgXcQ").success).toBe(true);
  });

  it("rejects malformed keys", () => {
    expect(songKeySchema.safeParse("local:too-short").success).toBe(false);
    expect(songKeySchema.safeParse("yt:short").success).toBe(false);
    expect(songKeySchema.safeParse("other:abc").success).toBe(false);
  });
});

describe("memoSchema", () => {
  it(`accepts text up to ${MAX_MEMO_LENGTH} characters and rejects longer`, () => {
    expect(memoSchema.safeParse({ text: "a".repeat(MAX_MEMO_LENGTH), updatedAt: 1 }).success).toBe(true);
    expect(memoSchema.safeParse({ text: "a".repeat(MAX_MEMO_LENGTH + 1), updatedAt: 1 }).success).toBe(
      false,
    );
    expect(memoSchema.safeParse(null).success).toBe(true);
  });
});

describe("songDataPutSchema", () => {
  it("accepts a full valid payload", () => {
    const result = songDataPutSchema.safeParse({
      songKey: `local:${"a".repeat(64)}`,
      loopPoints: { a: 1, b: 2, enabled: true },
      memo: { text: "note", updatedAt: 1 },
      updatedAt: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects loop points where a is not before b", () => {
    const result = songDataPutSchema.safeParse({
      songKey: `local:${"a".repeat(64)}`,
      loopPoints: { a: 10, b: 5, enabled: true },
      memo: null,
      updatedAt: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires a valid email and a password of at least 8 characters", () => {
    expect(loginSchema.safeParse({ email: "a@example.com", password: "longenough" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "not-an-email", password: "longenough" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@example.com", password: "short" }).success).toBe(false);
  });
});
