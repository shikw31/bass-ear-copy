import { describe, expect, it } from "vitest";
import { UserStore } from "../../src/stores/userStore";
import { createFakeRedis } from "./fakeRedis";

describe("UserStore", () => {
  it("returns null when no user exists for the email", async () => {
    const store = new UserStore(createFakeRedis());
    expect(await store.findByEmail("nobody@example.com")).toBeNull();
  });

  it("round-trips a created user", async () => {
    const store = new UserStore(createFakeRedis());
    const user = { userId: "u1", email: "a@example.com", passwordHash: "hash", createdAt: 1 };
    await store.create(user);
    expect(await store.findByEmail("a@example.com")).toEqual(user);
  });
});
