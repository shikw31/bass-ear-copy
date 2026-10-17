import { describe, expect, it } from "vitest";
import { SessionStore } from "../../src/stores/sessionStore";
import { createFakeRedis } from "./fakeRedis";

describe("SessionStore", () => {
  it("round-trips a created session", async () => {
    const store = new SessionStore(createFakeRedis());
    const session = { sessionId: "s1", userId: "u1", createdAt: 1, expiresAt: Date.now() + 10_000 };
    await store.create(session);
    expect(await store.find("s1")).toEqual(session);
  });

  it("returns null after delete", async () => {
    const store = new SessionStore(createFakeRedis());
    const session = { sessionId: "s1", userId: "u1", createdAt: 1, expiresAt: Date.now() + 10_000 };
    await store.create(session);
    await store.delete("s1");
    expect(await store.find("s1")).toBeNull();
  });

  it("extend persists the updated expiresAt", async () => {
    const store = new SessionStore(createFakeRedis());
    const session = { sessionId: "s1", userId: "u1", createdAt: 1, expiresAt: Date.now() + 10_000 };
    await store.create(session);
    const extended = { ...session, expiresAt: session.expiresAt + 10_000 };
    await store.extend(extended, Date.now());
    expect((await store.find("s1"))?.expiresAt).toBe(extended.expiresAt);
  });
});
